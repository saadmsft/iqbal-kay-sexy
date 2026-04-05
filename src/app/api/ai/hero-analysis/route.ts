import { NextRequest, NextResponse } from "next/server";
import { generateHeroAnalysis } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const heroData = body.heroData;
    if (typeof heroData !== "string" || heroData.length > 50000) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const analysis = await generateHeroAnalysis(heroData);
    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
