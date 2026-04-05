import { NextRequest, NextResponse } from "next/server";
import { generatePlayerInsight } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const playerData = body.playerData;
    if (typeof playerData !== "string" || playerData.length > 50000) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const insight = await generatePlayerInsight(playerData);
    return NextResponse.json({ insight });
  } catch {
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
