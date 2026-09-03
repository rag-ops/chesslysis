import { notFound } from "next/navigation";
import GameReviewBoard from "@/components/chessboard/GameReviewBoard";
import EvaluationGraph from "@/components/evaluation/EvaluationGraph";
import { getGameReview } from "@/lib/db/review";

export const dynamic = "force-dynamic";

export default async function GameReviewPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = await getGameReview(gameId);
  if (!game) notFound();

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
    <header>
      <p className="text-sm text-slate-500">Chesslysis · Game Review</p>
      <h1 className="text-2xl font-bold">{game.white} vs {game.black}</h1>
      <p className="text-sm text-slate-500">{game.result} · {game.timeControl} · {game.date}</p>
    </header>
    <GameReviewBoard moves={game.moves} analyses={game.analyses} />
    <EvaluationGraph points={game.moves.map((m) => ({ ply: m.ply, evaluation: game.analyses[m.ply]?.evaluationAfter ?? null }))} />
  </main>;
}
