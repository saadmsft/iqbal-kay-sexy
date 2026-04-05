import {
  getHeroStats,
  getHeroMatchups,
  getHeroItemPopularity,
  getHeroDurations,
  getHeroBenchmarks,
  getHeroRankings,
  getHeroMatches,
  getHeroImageUrl,
  getItemImageUrl,
  getItemsMap,
  formatDuration,
} from "@/lib/opendota";
import { BRACKET_NAMES, ATTR_MAP } from "@/types/opendota";
import type { HeroStats } from "@/types/opendota";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { WinRateByBracketChart, DurationWinRateChart } from "@/components/stat-chart";
import { HeroAiAnalysis } from "./hero-ai";
import { Swords, Target, Clock, BarChart3, Crown, Gamepad2, Shield } from "lucide-react";

export const revalidate = 600;

interface Props {
  params: Promise<{ heroId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { heroId } = await params;
  const heroes = await getHeroStats();
  const hero = heroes.find((h) => h.id === Number(heroId));
  return {
    title: hero ? `${hero.localized_name} - Iqbal Kay Sexy` : "Hero - Iqbal Kay Sexy",
    description: hero
      ? `${hero.localized_name} stats, builds, matchups, and analysis.`
      : "Hero analysis",
  };
}

export default async function HeroDetailPage({ params }: Props) {
  const { heroId } = await params;
  const id = Number(heroId);

  const [heroes, matchups, items, durations, benchmarks, rankings, recentMatches, itemsMap] =
    await Promise.all([
      getHeroStats(),
      getHeroMatchups(id),
      getHeroItemPopularity(id).catch(() => null),
      getHeroDurations(id),
      getHeroBenchmarks(id).catch(() => null),
      getHeroRankings(id).catch(() => null),
      getHeroMatches(id).catch(() => []),
      getItemsMap(),
    ]);

  const hero = heroes.find((h) => h.id === id);
  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Hero not found.</p>
      </div>
    );
  }

  // Win rate by bracket
  const bracketData = Object.entries(BRACKET_NAMES).map(([key, name]) => {
    const picks = (hero[`${key}_pick` as keyof HeroStats] as number) || 0;
    const wins = (hero[`${key}_win` as keyof HeroStats] as number) || 0;
    return {
      bracket: name,
      winRate: picks > 0 ? (wins / picks) * 100 : 0,
      picks,
    };
  });

  // Duration win rates
  const durationData = durations
    .filter((d) => d.games_played >= 10)
    .map((d) => ({
      duration: `${Math.floor(Number(d.duration_bin) / 60)}m`,
      winRate: d.games_played > 0 ? (d.wins / d.games_played) * 100 : 0,
      games: d.games_played,
    }));

  // Best & worst matchups
  const sortedMatchups = [...matchups]
    .filter((m) => m.games_played >= 50)
    .sort((a, b) => {
      const wrA = a.games_played > 0 ? a.wins / a.games_played : 0;
      const wrB = b.games_played > 0 ? b.wins / b.games_played : 0;
      return wrB - wrA;
    });
  const bestMatchups = sortedMatchups.slice(0, 8);
  const worstMatchups = sortedMatchups.slice(-8).reverse();

  // Item build sections
  const itemSections = items
    ? [
        { title: "Starting Items", data: items.start_game_items },
        { title: "Early Game", data: items.early_game_items },
        { title: "Mid Game", data: items.mid_game_items },
        { title: "Late Game", data: items.late_game_items },
      ]
    : [];

  // Pro stats
  const proWinRate =
    hero.pro_pick > 0 ? ((hero.pro_win / hero.pro_pick) * 100).toFixed(1) : "N/A";

  // Prepare AI data
  const aiData = JSON.stringify({
    name: hero.localized_name,
    attribute: ATTR_MAP[hero.primary_attr],
    roles: hero.roles,
    attack_type: hero.attack_type,
    bracketWinRates: bracketData,
    proStats: { picks: hero.pro_pick, wins: hero.pro_win, bans: hero.pro_ban },
    bestMatchups: bestMatchups.slice(0, 5).map((m) => {
      const h = heroes.find((x) => x.id === m.hero_id);
      return {
        hero: h?.localized_name || `Hero ${m.hero_id}`,
        wr: ((m.wins / m.games_played) * 100).toFixed(1),
        games: m.games_played,
      };
    }),
    worstMatchups: worstMatchups.slice(0, 5).map((m) => {
      const h = heroes.find((x) => x.id === m.hero_id);
      return {
        hero: h?.localized_name || `Hero ${m.hero_id}`,
        wr: ((m.wins / m.games_played) * 100).toFixed(1),
        games: m.games_played,
      };
    }),
  });

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="relative w-full sm:w-64 aspect-[16/9] rounded-lg overflow-hidden border border-border">
          <Image
            src={getHeroImageUrl(hero.name)}
            alt={hero.localized_name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{hero.localized_name}</h1>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <Badge>{ATTR_MAP[hero.primary_attr] || hero.primary_attr}</Badge>
              <Badge variant="outline">{hero.attack_type}</Badge>
              {hero.roles?.map((r) => (
                <Badge key={r} variant="secondary" className="text-xs">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Base STR" value={`${hero.base_str} +${hero.str_gain}`} />
            <StatBox label="Base AGI" value={`${hero.base_agi} +${hero.agi_gain}`} />
            <StatBox label="Base INT" value={`${hero.base_int} +${hero.int_gain}`} />
            <StatBox label="Move Speed" value={String(hero.move_speed)} />
            <StatBox label="Attack Range" value={String(hero.attack_range)} />
            <StatBox label="Base Armor" value={hero.base_armor.toFixed(1)} />
            <StatBox label="Pro Pick" value={String(hero.pro_pick)} />
            <StatBox label="Pro Win Rate" value={`${proWinRate}%`} />
          </div>
          <Link
            href={`/heroes/${hero.id}/counters`}
            className="inline-flex items-center gap-2 mt-2 rounded-md bg-red-500/15 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/25 transition-colors"
          >
            <Shield className="h-4 w-4" />
            How to Counter {hero.localized_name}
          </Link>
        </div>
      </div>

      {/* AI Analysis */}
      <HeroAiAnalysis heroDataJson={aiData} heroName={hero.localized_name} />

      {/* Win Rate by Bracket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Win Rate by Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WinRateByBracketChart data={bracketData} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Best Matchups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-green-400">
              <Target className="h-4 w-4" />
              Best Against
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bestMatchups.map((m) => {
                const h = heroes.find((x) => x.id === m.hero_id);
                const wr = ((m.wins / m.games_played) * 100).toFixed(1);
                return (
                  <Link
                    key={m.hero_id}
                    href={`/heroes/${m.hero_id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {h && (
                        <Image
                          src={getHeroImageUrl(h.name)}
                          alt={h.localized_name}
                          width={48}
                          height={27}
                          className="rounded"
                        />
                      )}
                      <span className="text-sm font-medium">
                        {h?.localized_name || `Hero ${m.hero_id}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-green-400">
                        {wr}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {m.games_played} games
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Worst Matchups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-400">
              <Swords className="h-4 w-4" />
              Worst Against
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {worstMatchups.map((m) => {
                const h = heroes.find((x) => x.id === m.hero_id);
                const wr = ((m.wins / m.games_played) * 100).toFixed(1);
                return (
                  <Link
                    key={m.hero_id}
                    href={`/heroes/${m.hero_id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {h && (
                        <Image
                          src={getHeroImageUrl(h.name)}
                          alt={h.localized_name}
                          width={48}
                          height={27}
                          className="rounded"
                        />
                      )}
                      <span className="text-sm font-medium">
                        {h?.localized_name || `Hero ${m.hero_id}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-red-400">
                        {wr}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {m.games_played} games
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Builds */}
      {itemSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gamepad2 className="h-4 w-4 text-primary" />
              Popular Item Builds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {itemSections.map((section) => {
                const sorted = Object.entries(section.data || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6);
                return (
                  <div key={section.title}>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                      {section.title}
                    </h4>
                    <div className="space-y-1.5">
                      {sorted.map(([itemId, count]) => {
                        const item = itemsMap.get(Number(itemId));
                        const imgUrl = item
                          ? getItemImageUrl(item.name)
                          : "";
                        const displayName = item
                          ? item.dname
                          : itemId;
                        return (
                          <div
                            key={itemId}
                            className="flex items-center gap-2 text-xs"
                          >
                            {item && (
                              <Image
                                src={imgUrl}
                                alt={displayName}
                                width={28}
                                height={21}
                                className="rounded border border-border/50"
                              />
                            )}
                            <span className="truncate">
                              {displayName}
                            </span>
                            <span className="ml-auto text-muted-foreground">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duration Win Rate */}
      {durationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Win Rate by Game Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DurationWinRateChart data={durationData} />
          </CardContent>
        </Card>
      )}

      {/* Top Players */}
      {rankings && rankings.rankings && rankings.rankings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-4 w-4 text-primary" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rankings.rankings.slice(0, 10).map((player, i) => (
                <Link
                  key={player.account_id}
                  href={`/players/${player.account_id}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground w-6">
                      #{i + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {player.name || player.personaname}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Score: {player.score.toFixed(0)}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/50 rounded-md p-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
