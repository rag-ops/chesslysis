const API_BASE = "https://api.chess.com/pub";

export type ChessComArchive = { url: string; year: number; month: number };

export type ChessComGame = {
  url: string;
  uuid?: string;
  pgn?: string;
  time_control?: string;
  end_time?: number;
  rated?: boolean;
  time_class?: string;
  rules?: string;
  eco?: string;
  white: { username: string; rating?: number; result?: string };
  black: { username: string; rating?: number; result?: string };
};

export type ImportOptions = {
  from?: Date;
  to?: Date;
  timeClasses?: string[];
  maxGames?: number;
};

const userAgent =
  process.env.CHESSCOM_USER_AGENT ||
  "Chesslysis/0.1 (portfolio chess analytics project)";

async function chessComFetch(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    // The PubAPI can cache responses; do not force a fresh request.
    cache: "no-store",
  });

  if (response.status === 404) throw new Error("Chess.com player or archive not found.");
  if (response.status === 429) throw new Error("Chess.com API rate limit reached. Please try again later.");
  if (!response.ok) throw new Error(`Chess.com API returned HTTP ${response.status}.`);

  return response;
}

export async function getArchives(username: string): Promise<ChessComArchive[]> {
  const safeUsername = encodeURIComponent(username.trim());
  const response = await chessComFetch(`${API_BASE}/player/${safeUsername}/games/archives`);
  const data = (await response.json()) as { archives?: string[] };

  return (data.archives ?? []).map((url) => {
    const match = url.match(/games\/(\d{4})\/(\d{2})$/);
    if (!match) throw new Error(`Unexpected Chess.com archive URL: ${url}`);
    return { url, year: Number(match[1]), month: Number(match[2]) };
  });
}

export async function getArchiveGames(archive: ChessComArchive): Promise<ChessComGame[]> {
  const response = await chessComFetch(archive.url);
  const data = (await response.json()) as { games?: ChessComGame[] };
  return data.games ?? [];
}

function inDateRange(game: ChessComGame, from?: Date, to?: Date) {
  if (!game.end_time) return true;
  const playedAt = new Date(game.end_time * 1000);
  if (from && playedAt < from) return false;
  if (to && playedAt > to) return false;
  return true;
}

export async function importGamesFromChessCom(
  username: string,
  options: ImportOptions = {},
): Promise<ChessComGame[]> {
  const normalized = username.trim();
  if (!/^[A-Za-z0-9_-]{3,25}$/.test(normalized)) {
    throw new Error("Invalid Chess.com username format.");
  }

  const maxGames = Math.min(Math.max(options.maxGames ?? 100, 1), 1000);
  const timeClasses = options.timeClasses?.length
    ? new Set(options.timeClasses)
    : undefined;

  const archives = await getArchives(normalized);
  // Newest first so a limited import gives the most recent games.
  archives.sort((a, b) => b.year - a.year || b.month - a.month);

  const games: ChessComGame[] = [];
  for (const archive of archives) {
    if (options.from) {
      const archiveEnd = new Date(archive.year, archive.month, 0, 23, 59, 59, 999);
      if (archiveEnd < options.from) break;
    }
    if (options.to) {
      const archiveStart = new Date(archive.year, archive.month - 1, 1);
      if (archiveStart > options.to) continue;
    }

    const archiveGames = await getArchiveGames(archive);
    for (const game of archiveGames) {
      if (!game.pgn || game.rules !== "chess") continue;
      if (!inDateRange(game, options.from, options.to)) continue;
      if (timeClasses && (!game.time_class || !timeClasses.has(game.time_class))) continue;

      games.push(game);
      if (games.length >= maxGames) return games;
    }
  }

  return games;
}
