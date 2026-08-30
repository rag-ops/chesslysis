import { db } from "@/lib/db/prisma";
import { classifyEvaluationLoss } from "@/lib/analysis/classifier";
import { evaluationFromPlayerPerspective, evaluationLoss } from "@/lib/chess/evaluation";
import { createStockfishEngine, type ChessEngine } from "@/lib/stockfish/engine";

export type AnalysisProgress = {
  gameId: string;
  totalMoves: number;
  analyzedMoves: number;
  status: "ANALYZING" | "COMPLETED" | "FAILED";
};

export type AnalyzeGameOptions = {
  depth?: number;
  onProgress?: (progress: AnalysisProgress) => void;
};

function accuracyFromLoss(loss: number): number {
  // Chesslysis v1 accuracy is intentionally transparent and is NOT claimed to
  // reproduce Chess.com's proprietary accuracy formula.
  return 100 * Math.exp(-loss / 1.5);
}

export async function analyzeGame(
  gameId: string,
  options: AnalyzeGameOptions = {},
): Promise<AnalysisProgress> {
  const depth = options.depth ?? 18;
  if (depth < 8 || depth > 30) throw new Error("Analysis depth must be between 8 and 30.");

  const game = await db.game.findUnique({
    where: { id: gameId },
    include: { moves: { orderBy: { ply: "asc" } } },
  });

  if (!game) throw new Error("Game not found.");
  if (game.moves.length === 0) throw new Error("Game has no moves to analyze.");

  await db.game.update({ where: { id: gameId }, data: { analysisStatus: "ANALYZING" } });

  let engine: ChessEngine | null = null;
  const totals = {
    white: { losses: [] as number[], best: 0, inaccuracies: 0, mistakes: 0, blunders: 0 },
    black: { losses: [] as number[], best: 0, inaccuracies: 0, mistakes: 0, blunders: 0 },
  };

  try {
    engine = createStockfishEngine();

    for (let index = 0; index < game.moves.length; index++) {
      const move = game.moves[index];
      const playerColor = move.color as "white" | "black";

      // Analyze the position before the played move to obtain the objective best move.
      const before = await engine.analyze(move.fenBefore, depth);
      // Analyze the resulting position to measure the quality of the move actually played.
      const after = await engine.analyze(move.fenAfter, depth);

      const bestForPlayer = evaluationFromPlayerPerspective(before.evaluation, playerColor);
      const afterForPlayer = evaluationFromPlayerPerspective(after.evaluation, playerColor);
      const loss = evaluationLoss(bestForPlayer, afterForPlayer);
      const classification = classifyEvaluationLoss(loss);

      const bucket = totals[playerColor];
      bucket.losses.push(loss);
      if (classification === "BEST") bucket.best++;
      if (classification === "INACCURACY") bucket.inaccuracies++;
      if (classification === "MISTAKE") bucket.mistakes++;
      if (classification === "BLUNDER") bucket.blunders++;

      await db.engineAnalysis.upsert({
        where: { moveId: move.id },
        create: {
          moveId: move.id,
          depth: Math.min(before.depth, after.depth),
          evaluation: before.evaluation,
          mate: before.mate,
          bestMove: before.bestMove,
          principalVariation: before.principalVariation.join(" "),
          evaluationAfter: after.evaluation,
          evaluationLoss: loss,
          engineVersion: process.env.STOCKFISH_VERSION ?? "Stockfish (configured binary)",
        },
        update: {
          depth: Math.min(before.depth, after.depth),
          evaluation: before.evaluation,
          mate: before.mate,
          bestMove: before.bestMove,
          principalVariation: before.principalVariation.join(" "),
          evaluationAfter: after.evaluation,
          evaluationLoss: loss,
          engineVersion: process.env.STOCKFISH_VERSION ?? "Stockfish (configured binary)",
          analyzedAt: new Date(),
        },
      });

      await db.moveClassification.upsert({
        where: { moveId: move.id },
        create: {
          moveId: move.id,
          classification,
          severity: loss,
          reason: `${move.san} lost approximately ${loss.toFixed(2)} pawns from the player's perspective.`,
        },
        update: {
          classification,
          severity: loss,
          reason: `${move.san} lost approximately ${loss.toFixed(2)} pawns from the player's perspective.`,
          createdAt: new Date(),
        },
      });

      options.onProgress?.({
        gameId,
        totalMoves: game.moves.length,
        analyzedMoves: index + 1,
        status: "ANALYZING",
      });
    }

    const whiteLosses = totals.white.losses;
    const blackLosses = totals.black.losses;
    const whiteACPL = whiteLosses.length ? whiteLosses.reduce((a, b) => a + b, 0) * 100 / whiteLosses.length : 0;
    const blackACPL = blackLosses.length ? blackLosses.reduce((a, b) => a + b, 0) * 100 / blackLosses.length : 0;
    const whiteAccuracy = whiteLosses.length ? whiteLosses.reduce((sum, loss) => sum + accuracyFromLoss(loss), 0) / whiteLosses.length : 0;
    const blackAccuracy = blackLosses.length ? blackLosses.reduce((sum, loss) => sum + accuracyFromLoss(loss), 0) / blackLosses.length : 0;

    await db.gameStatistics.upsert({
      where: { gameId },
      create: {
        gameId,
        whiteAccuracy,
        blackAccuracy,
        whiteACPL,
        blackACPL,
        whiteBestMoves: totals.white.best,
        blackBestMoves: totals.black.best,
        whiteInaccuracies: totals.white.inaccuracies,
        blackInaccuracies: totals.black.inaccuracies,
        whiteMistakes: totals.white.mistakes,
        blackMistakes: totals.black.mistakes,
        whiteBlunders: totals.white.blunders,
        blackBlunders: totals.black.blunders,
      },
      update: {
        whiteAccuracy,
        blackAccuracy,
        whiteACPL,
        blackACPL,
        whiteBestMoves: totals.white.best,
        blackBestMoves: totals.black.best,
        whiteInaccuracies: totals.white.inaccuracies,
        blackInaccuracies: totals.black.inaccuracies,
        whiteMistakes: totals.white.mistakes,
        blackMistakes: totals.black.mistakes,
        whiteBlunders: totals.white.blunders,
        blackBlunders: totals.black.blunders,
      },
    });

    await db.game.update({ where: { id: gameId }, data: { analysisStatus: "COMPLETED", analyzedAt: new Date() } });

    return { gameId, totalMoves: game.moves.length, analyzedMoves: game.moves.length, status: "COMPLETED" };
  } catch (error) {
    await db.game.update({ where: { id: gameId }, data: { analysisStatus: "FAILED" } }).catch(() => undefined);
    throw error;
  } finally {
    const maybeClose = engine as (ChessEngine & { close?: () => Promise<void> }) | null;
    await maybeClose?.close?.();
  }
}
