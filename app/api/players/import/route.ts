import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/prisma";
import { generatePositions } from "@/lib/chess/positions";
import { importGamesFromChessCom } from "@/lib/chesscom/client";

const schema = z.object({
  username: z.string().trim().min(3).max(25),
  maxGames: z.number().int().min(1).max(1000).optional().default(100),
  timeClasses: z.array(z.enum(["bullet", "blitz", "rapid", "daily", "chess960", "kingofthehill", "threecheck", "antichess", "crazyhouse", "other"])).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const games = await importGamesFromChessCom(body.username, body);

    const player = await db.player.upsert({
      where: { platform_username: { platform: "chess.com", username: body.username } },
      update: {},
      create: { username: body.username, platform: "chess.com" },
    });

    let imported = 0;
    let skipped = 0;

    for (const game of games) {
      const externalId = game.uuid ?? game.url;
      const playedAt = game.end_time ? new Date(game.end_time * 1000) : null;

      const existing = await db.game.findUnique({
        where: { playerId_externalId: { playerId: player.id, externalId } },
        select: { id: true },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const moves = generatePositions(game.pgn!);

      await db.game.create({
        data: {
          playerId: player.id,
          externalId,
          whiteUsername: game.white.username,
          blackUsername: game.black.username,
          whiteRating: game.white.rating,
          blackRating: game.black.rating,
          result: game.white.result === "win" ? "1-0" : game.black.result === "win" ? "0-1" : "1/2-1/2",
          timeControl: game.time_control,
          playedAt,
          pgn: game.pgn!,
          eco: game.eco,
          analysisStatus: "NOT_ANALYZED",
          moves: { create: moves },
        },
      });

      imported++;
    }

    return NextResponse.json({
      username: body.username,
      found: games.length,
      imported,
      skipped,
      message: `Imported ${imported} new game${imported === 1 ? "" : "s"}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to import games.";
    const status = message.includes("Invalid Chess.com username") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
