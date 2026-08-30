import { db } from "@/lib/db/prisma";

type GameWithStats = Awaited<ReturnType<typeof getPlayerGames>>[number];

async function getPlayerGames(playerId: string) {
  return db.game.findMany({
    where: { playerId, analysisStatus: "COMPLETED" },
    orderBy: { playedAt: "desc" },
    include: { statistics: true },
  });
}

export async function getPlayerDashboard(username: string) {
  const normalized = username.trim();
  const player = await db.player.findFirst({
    where: { platform: "chess.com", username: { equals: normalized, mode: "insensitive" } },
  });
  if (!player) return null;

  const games = await getPlayerGames(player.id);
  const wins = games.filter((g) => isWin(g, normalized)).length;
  const draws = games.filter((g) => g.result === "1/2-1/2").length;

  const accuracy = games.map((g) => playerAccuracy(g, normalized)).filter(isNumber);
  const acpl = games.map((g) => playerACPL(g, normalized)).filter(isNumber);
  const blunders = games.map((g) => playerBlunders(g, normalized)).filter(isNumber);

  return {
    username: player.username,
    stats: {
      gamesAnalyzed: games.length,
      winRate: games.length ? (wins / games.length) * 100 : 0,
      averageAccuracy: mean(accuracy),
      averageACPL: mean(acpl),
      blundersPerGame: mean(blunders),
    },
    resultSeries: [...games].reverse().map((g) => ({
      result: isWin(g, normalized) ? "win" as const : g.result === "1/2-1/2" ? "draw" as const : "loss" as const,
      date: dateString(g.playedAt),
    })),
    accuracyTrend: [...games].reverse()
      .map((g) => ({ date: dateString(g.playedAt), accuracy: playerAccuracy(g, normalized) }))
      .filter((p): p is { date: string; accuracy: number } => isNumber(p.accuracy)),
    recentGames: games.slice(0, 20).map((g) => ({
      id: g.id,
      date: dateString(g.playedAt),
      opponent: g.whiteUsername.toLowerCase() === normalized.toLowerCase() ? g.blackUsername : g.whiteUsername,
      color: g.whiteUsername.toLowerCase() === normalized.toLowerCase() ? "White" as const : "Black" as const,
      result: isWin(g, normalized) ? "Win" as const : g.result === "1/2-1/2" ? "Draw" as const : "Loss" as const,
      accuracy: playerAccuracy(g, normalized),
      timeControl: g.timeControl ?? "Unknown",
    })),
  };
}

function dateString(value: Date | null) {
  return value ? value.toISOString() : "Unknown";
}
function isNumber(value: number | null): value is number { return typeof value === "number" && Number.isFinite(value); }
function isWin(game: GameWithStats, username: string) {
  const white = game.whiteUsername.toLowerCase() === username.toLowerCase();
  return (white && game.result === "1-0") || (!white && game.result === "0-1");
}
function playerAccuracy(game: GameWithStats, username: string): number | null {
  if (!game.statistics) return null;
  return game.whiteUsername.toLowerCase() === username.toLowerCase() ? game.statistics.whiteAccuracy : game.statistics.blackAccuracy;
}
function playerACPL(game: GameWithStats, username: string): number | null {
  if (!game.statistics) return null;
  return game.whiteUsername.toLowerCase() === username.toLowerCase() ? game.statistics.whiteACPL : game.statistics.blackACPL;
}
function playerBlunders(game: GameWithStats, username: string): number | null {
  if (!game.statistics) return null;
  return game.whiteUsername.toLowerCase() === username.toLowerCase() ? game.statistics.whiteBlunders : game.statistics.blackBlunders;
}
function mean(values: number[]) { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; }
