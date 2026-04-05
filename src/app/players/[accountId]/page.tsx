import {
  getPlayer,
  getPlayerWinLoss,
  getPlayerHeroes,
  getPlayerRecentMatches,
  getPlayerTotals,
  getPlayerRankings,
  getHeroStats,
  getRankTierName,
  getHeroImageUrl,
  formatDuration,
} from "@/lib/opendota";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { User, Swords, Target, BarChart3 } from "lucide-react";
import { PlayerAiInsight } from "./player-ai";

export const revalidate = 300;

interface Props {
  params: Promise<{ accountId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { accountId } = await params;
  try {
    const player = await getPlayer(Number(accountId));
    return {
      title: `${player.profile?.personaname || "Player"} - Iqbal Kay Sexy`,
      description: `Dota 2 stats for ${player.profile?.personaname}`,
    };
  } catch {
    return { title: "Player - Iqbal Kay Sexy" };
  }
}

export default async function PlayerPage({ params }: Props) {
  const { accountId } = await params;
  const id = Number(accountId);

  const [player, wl, heroesPlayed, recentMatches, totals, rankings, allHeroes] =
    await Promise.all([
      getPlayer(id),
      getPlayerWinLoss(id),
      getPlayerHeroes(id),
      getPlayerRecentMatches(id),
      getPlayerTotals(id),
      getPlayerRankings(id).catch(() => []),
      getHeroStats(),
    ]);

  const profile = player.profile;
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Player not found.</p>
      </div>
    );
  }

  const winRate =
    wl.win + wl.lose > 0
      ? ((wl.win / (wl.win + wl.lose)) * 100).toFixed(1)
      : "0";

  const topHeroes = [...heroesPlayed]
    .sort((a, b) => b.games - a.games)
    .slice(0, 10);

  const getHeroName = (heroId: number) => {
    const h = allHeroes.find((x) => x.id === heroId);
    return h?.localized_name || `Hero ${heroId}`;
  };

  const getHeroSlug = (heroId: number) => {
    const h = allHeroes.find((x) => x.id === heroId);
    return h?.name || "";
  };

  // Key stats from totals
  const statMap: Record<string, PlayerTotal | undefined> = {};
  totals.forEach((t) => (statMap[t.field] = t));

  const avgKills = statMap.kills?.n ? (statMap.kills.sum / statMap.kills.n).toFixed(1) : "—";
  const avgDeaths = statMap.deaths?.n ? (statMap.deaths.sum / statMap.deaths.n).toFixed(1) : "—";
  const avgAssists = statMap.assists?.n ? (statMap.assists.sum / statMap.assists.n).toFixed(1) : "—";
  const avgGpm = statMap.gold_per_min?.n ? (statMap.gold_per_min.sum / statMap.gold_per_min.n).toFixed(0) : "—";
  const avgXpm = statMap.xp_per_min?.n ? (statMap.xp_per_min.sum / statMap.xp_per_min.n).toFixed(0) : "—";

  const aiData = JSON.stringify({
    name: profile.personaname,
    rank: getRankTierName(player.rank_tier),
    mmr: player.computed_mmr,
    winLoss: wl,
    winRate,
    topHeroes: topHeroes.slice(0, 5).map((h) => ({
      hero: getHeroName(h.hero_id),
      games: h.games,
      wins: h.win,
      wr: h.games > 0 ? ((h.win / h.games) * 100).toFixed(1) : "0",
    })),
    avgStats: { kills: avgKills, deaths: avgDeaths, assists: avgAssists, gpm: avgGpm, xpm: avgXpm },
    recentResults: recentMatches.slice(0, 10).map((m) => ({
      hero: getHeroName(m.hero_id),
      kda: `${m.kills}/${m.deaths}/${m.assists}`,
      win: m.player_slot < 128 ? m.radiant_win : !m.radiant_win,
    })),
  });

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Image
          src={profile.avatarfull}
          alt={profile.personaname}
          width={96}
          height={96}
          className="rounded-lg border border-border"
        />
        <div className="flex-1 space-y-2">
          <div>
            <h1 className="text-2xl font-bold">{profile.personaname}</h1>
            {profile.name && (
              <p className="text-sm text-muted-foreground">{profile.name}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge>{getRankTierName(player.rank_tier)}</Badge>
            {player.leaderboard_rank && (
              <Badge variant="secondary">
                Leaderboard #{player.leaderboard_rank}
              </Badge>
            )}
            {player.computed_mmr && (
              <Badge variant="outline">{player.computed_mmr} MMR</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2">
            <StatBox label="Wins" value={String(wl.win)} className="text-green-400" />
            <StatBox label="Losses" value={String(wl.lose)} className="text-red-400" />
            <StatBox label="Win Rate" value={`${winRate}%`} />
            <StatBox label="Avg GPM" value={avgGpm} />
            <StatBox label="Avg XPM" value={avgXpm} />
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <PlayerAiInsight playerDataJson={aiData} playerName={profile.personaname} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Signature Heroes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Swords className="h-4 w-4 text-primary" />
              Signature Heroes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topHeroes.map((h) => {
                const wr = h.games > 0 ? ((h.win / h.games) * 100).toFixed(1) : "0";
                const slug = getHeroSlug(h.hero_id);
                return (
                  <Link
                    key={h.hero_id}
                    href={`/heroes/${h.hero_id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {slug && (
                        <Image
                          src={getHeroImageUrl(slug)}
                          alt={getHeroName(h.hero_id)}
                          width={48}
                          height={27}
                          className="rounded"
                        />
                      )}
                      <span className="text-sm font-medium">
                        {getHeroName(h.hero_id)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        {h.games} games
                      </span>
                      <span
                        className={
                          Number(wr) >= 55
                            ? "text-green-400 font-semibold"
                            : Number(wr) <= 45
                              ? "text-red-400 font-semibold"
                              : "font-medium"
                        }
                      >
                        {wr}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Recent Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentMatches.slice(0, 15).map((m) => {
                const won =
                  m.player_slot < 128 ? m.radiant_win : !m.radiant_win;
                const slug = getHeroSlug(m.hero_id);
                return (
                  <Link
                    key={m.match_id}
                    href={`/matches/${m.match_id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {slug && (
                        <Image
                          src={getHeroImageUrl(slug)}
                          alt={getHeroName(m.hero_id)}
                          width={40}
                          height={22}
                          className="rounded"
                        />
                      )}
                      <div>
                        <span className="text-sm font-medium">
                          {getHeroName(m.hero_id)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {m.kills}/{m.deaths}/{m.assists} &middot;{" "}
                          {formatDuration(m.duration)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={won ? "default" : "destructive"} className="text-xs">
                      {won ? "Won" : "Lost"}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Average Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatBox label="Kills" value={avgKills} />
            <StatBox label="Deaths" value={avgDeaths} />
            <StatBox label="Assists" value={avgAssists} />
            <StatBox label="GPM" value={avgGpm} />
            <StatBox label="XPM" value={avgXpm} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="bg-secondary/50 rounded-md p-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-sm font-semibold mt-0.5 ${className || ""}`}>
        {value}
      </p>
    </div>
  );
}

interface PlayerTotal {
  field: string;
  n: number;
  sum: number;
}
