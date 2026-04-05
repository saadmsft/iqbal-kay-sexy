import { getHeroStats, getProMatches, getLiveGames, formatDuration } from "@/lib/opendota";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroCard } from "@/components/hero-card";
import { MatchSummary } from "@/components/match-summary";
import { BRACKET_NAMES } from "@/types/opendota";
import type { HeroStats } from "@/types/opendota";
import { TrendingUp, Flame, Radio, Trophy } from "lucide-react";
import Link from "next/link";
import { AiSummarySection } from "./ai-summary";

export const revalidate = 300;

function getTopBracketWinRate(hero: HeroStats): number {
  const picks = hero["7_pick"] || 0;
  const wins = hero["7_win"] || 0;
  return picks > 0 ? (wins / picks) * 100 : 0;
}

function getTotalPicks(hero: HeroStats): number {
  let total = 0;
  for (let i = 1; i <= 8; i++) {
    total += (hero[`${i}_pick` as keyof HeroStats] as number) || 0;
  }
  return total;
}

export default async function DashboardPage() {
  const [heroStats, proMatches, liveGames] = await Promise.all([
    getHeroStats(),
    getProMatches(),
    getLiveGames().catch(() => []),
  ]);

  // Top 10 by Divine/Immortal win rate (min 100 picks)
  const trendingHeroes = [...heroStats]
    .filter((h) => (h["7_pick"] || 0) >= 100)
    .sort((a, b) => getTopBracketWinRate(b) - getTopBracketWinRate(a))
    .slice(0, 10);

  // Top 10 by total picks across all brackets
  const totalPicksAll = heroStats.reduce((s, h) => s + getTotalPicks(h), 0);
  const mostPicked = [...heroStats]
    .sort((a, b) => getTotalPicks(b) - getTotalPicks(a))
    .slice(0, 10);

  const recentProMatches = proMatches.slice(0, 8);
  const topLiveGames = liveGames.slice(0, 3);

  // Prepare hero stats summary for AI
  const topForAi = [...heroStats]
    .filter((h) => (h["7_pick"] || 0) >= 50)
    .sort((a, b) => getTopBracketWinRate(b) - getTopBracketWinRate(a))
    .slice(0, 30)
    .map((h) => ({
      name: h.localized_name,
      wr_immortal: getTopBracketWinRate(h).toFixed(1),
      picks_immortal: h["7_pick"],
      pro_picks: h.pro_pick,
      pro_wins: h.pro_win,
      pro_bans: h.pro_ban,
      roles: h.roles,
    }));

  return (
    <div className="space-y-8">
      {/* AI Meta Summary */}
      <AiSummarySection heroStatsJson={JSON.stringify(topForAi)} />

      {/* Trending Heroes at Immortal */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Trending Heroes
            <Badge variant="secondary" className="text-xs">
              {BRACKET_NAMES["7"]}
            </Badge>
          </h2>
          <Link
            href="/heroes"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {trendingHeroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              winRate={getTopBracketWinRate(hero)}
              pickRate={(hero["7_pick"] / totalPicksAll) * 100}
            />
          ))}
        </div>
      </section>

      {/* Most Picked */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-2" />
            Most Picked Heroes
            <Badge variant="secondary" className="text-xs">
              All Brackets
            </Badge>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {mostPicked.map((hero) => {
            const totalP = getTotalPicks(hero);
            let totalW = 0;
            for (let i = 1; i <= 8; i++) {
              totalW += (hero[`${i}_win` as keyof HeroStats] as number) || 0;
            }
            const wr = totalP > 0 ? (totalW / totalP) * 100 : 0;
            return (
              <HeroCard
                key={hero.id}
                hero={hero}
                winRate={wr}
                pickRate={(totalP / totalPicksAll) * 100}
              />
            );
          })}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Pro Matches */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-chart-1" />
              Recent Pro Matches
            </h2>
            <Link
              href="/pro/matches"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentProMatches.map((match) => (
              <MatchSummary key={match.match_id} match={match} compact />
            ))}
          </div>
        </section>

        {/* Live Games */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-400 animate-pulse" />
              Live High-MMR Games
            </h2>
            <Link
              href="/live"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {topLiveGames.length > 0 ? (
              topLiveGames.map((game, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Avg MMR:{" "}
                          <span className="text-primary">
                            {game.average_mmr || "N/A"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {game.spectators} spectators &middot;{" "}
                          {formatDuration(game.game_time)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {game.game_mode === 22 ? "All Pick" : `Mode ${game.game_mode}`}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  No live games available right now
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
