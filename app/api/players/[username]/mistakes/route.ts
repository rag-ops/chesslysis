import { NextResponse } from "next/server";
import { demoMistakes } from "@/lib/demo/player-demo";
import { getRecurringMistakes } from "@/lib/insights/recurring-mistakes";
import { errorMessage, isDemoUser } from "@/lib/api/errors";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (isDemoUser(username)) return NextResponse.json(demoMistakes);
  try {
    const data = await getRecurringMistakes(username);
    if (!data) return NextResponse.json({ error: "Player not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Recurring mistakes API error", error);
    return NextResponse.json({ error: "Recurring mistake analysis is temporarily unavailable", detail: errorMessage(error) }, { status: 503 });
  }
}
