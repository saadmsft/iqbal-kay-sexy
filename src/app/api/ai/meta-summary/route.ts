import { NextRequest, NextResponse } from "next/server";
import { generateMetaSummary } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const heroStats = body.heroStats;
    if (typeof heroStats !== "string" || heroStats.length > 50000) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }
    const summary = await generateMetaSummary(heroStats);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}
