import { NextResponse } from "next/server";
import { getPlayerDashboard } from "@/lib/db/dashboard";
import { cached } from "@/lib/cache/dashboard";
import { demoDashboard } from "@/lib/demo/player-demo";
import { errorMessage, isDemoUser } from "@/lib/api/errors";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const normalized = username.trim();

  if (!normalized) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  if (isDemoUser(normalized)) {
    return NextResponse.json(demoDashboard);
  }

  try {
    const data = await cached(
      `dashboard:${normalized.toLowerCase()}`,
      30_000,
      () => getPlayerDashboard(normalized)
    );

    if (!data) {
      return NextResponse.json(
        { error: "Player not found", code: "PLAYER_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Dashboard data is temporarily unavailable", detail: errorMessage(error) },
      { status: 503 }
    );
  }
}
