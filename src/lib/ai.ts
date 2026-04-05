import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN || "",
});

async function chat(
  systemPrompt: string,
  userPrompt: string,
  model = "gpt-4o"
): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    return response.choices[0]?.message?.content || "Analysis unavailable.";
  } catch (error) {
    console.error("AI analysis error:", error);
    return "AI analysis temporarily unavailable.";
  }
}

export async function generateMetaSummary(
  heroStatsJson: string
): Promise<string> {
  return chat(
    `You are a Dota 2 analyst. Analyze hero statistics data and produce a concise meta summary.
Focus on:
- Top 5 strongest heroes by win rate at high ranks (bracket 7 = Divine/Immortal)
- Heroes rising/falling in pick rates
- Role balance (are carries/supports/mids dominant?)
- Notable trends
Use Dota terminology. Be specific with hero names. Format with markdown. Keep it to 3-4 paragraphs. Do NOT use emojis.`,
    `Here are the current hero statistics (top heroes by Divine/Immortal win rate):\n${heroStatsJson}`
  );
}

export async function generateHeroAnalysis(
  heroDataJson: string
): Promise<string> {
  return chat(
    `You are an expert Dota 2 coach. Given hero data including stats, matchups, and item builds, provide a strategic analysis.
Include:
- Current meta position (strong/average/weak) and why
- Best lane and role for this hero
- Key power spikes and timing windows
- Top 3 best matchups and worst matchups with brief explanations
- General playstyle tips
Format with markdown headers. Be concise but insightful. Do NOT use emojis.`,
    heroDataJson
  );
}

export async function generateBuildRecommendation(
  heroDataJson: string
): Promise<string> {
  return chat(
    `You are a Dota 2 build optimizer. Given hero item popularity data and benchmarks, recommend optimal item builds.
Provide:
- Starting items
- Early game core (first 10 min)
- Mid game core (10-25 min)
- Late game luxury
- Situational items and when to buy them
- Key item timing benchmarks
Format as clear lists with brief justifications. Do NOT use emojis.`,
    heroDataJson,
    "gpt-4o-mini"
  );
}

export async function generatePlayerInsight(
  playerDataJson: string
): Promise<string> {
  return chat(
    `You are a Dota 2 analyst reviewing a player's profile. Given their hero pool, recent matches, and stats, provide insights.
Include:
- Player's apparent playstyle and preferred roles
- Signature heroes and hero pool depth
- Recent form (winning/losing streaks, performance trends)
- Strengths and areas to improve
Keep it to 2-3 paragraphs. Be analytical but encouraging. Do NOT use emojis.`,
    playerDataJson,
    "gpt-4o-mini"
  );
}

export async function generateCounterItemAnalysis(
  heroDataJson: string
): Promise<string> {
  return chat(
    `You are an expert Dota 2 coach specializing in counter-play and itemization.
Given a hero's data including abilities, stats, and worst matchups, recommend the best items to counter this hero.

Structure your response exactly as:

## Key Threats
Briefly explain what makes this hero dangerous (2-3 sentences about their key abilities/strengths).

## Essential Counter Items
List 4-6 must-buy items that directly counter this hero's kit. For each item:
- **Item Name** (cost) — One sentence explaining WHY it counters this hero specifically.

## Situational Counter Items  
List 3-4 items that are good against this hero in certain situations.
- **Item Name** (cost) — When and why to buy it.

## Counter Strategy Tips
3-4 brief tactical tips for playing against this hero (timing, positioning, drafting).

Be specific to THIS hero. Reference their actual abilities. Do NOT use emojis. Use Dota terminology.`,
    heroDataJson
  );
}
