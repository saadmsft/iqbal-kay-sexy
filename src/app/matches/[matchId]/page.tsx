import {
  getMatch,
  getHeroStats,
  getHeroImageUrl,
  getItemImageUrl,
  formatDuration,
} from "@/lib/opendota";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { GoldXpAdvantageChart } from "@/components/stat-chart";
import { Swords, Clock, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 86400;

interface Props {
  params: Promise<{ matchId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { matchId } = await params;
  return {
    title: `Match ${matchId} - Iqbal Kay Sexy`,
    description: `Detailed match analysis for match ${matchId}`,
  };
}

export default async function MatchDetailPage({ params }: Props) {
  const { matchId } = await params;
  const id = Number(matchId);

  const [match, allHeroes] = await Promise.all([
    getMatch(id),
    getHeroStats(),
  ]);

  const getHeroName = (heroId: number) => {
    const h = allHeroes.find((x) => x.id === heroId);
    return h?.localized_name || `Hero ${heroId}`;
  };

  const getHeroSlug = (heroId: number) => {
    const h = allHeroes.find((x) => x.id === heroId);
    return h?.name || "";
  };

  const radiantPlayers = match.players.filter((p) => p.player_slot < 128);
  const direPlayers = match.players.filter((p) => p.player_slot >= 128);

  const timeAgo = formatDistanceToNow(new Date(match.start_time * 1000), {
    addSuffix: true,
  });

  // Item IDs to names - we use the item number directly for image
  const getItemImg = (itemId: number) => {
    if (!itemId) return null;
    return `/api/item-image/${itemId}`;
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p
                  className={`text-lg font-bold ${
                    match.radiant_win ? "text-green-400" : "text-foreground"
                  }`}
                >
                  {match.radiant_team?.name || "Radiant"}
                </p>
                <p className="text-2xl font-bold">{match.radiant_score}</p>
              </div>
              <div className="text-center px-4">
                <Badge variant={match.radiant_win ? "default" : "destructive"}>
                  {match.radiant_win ? "Radiant Victory" : "Dire Victory"}
                </Badge>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(match.duration)}
                </div>
              </div>
              <div className="text-center">
                <p
                  className={`text-lg font-bold ${
                    !match.radiant_win ? "text-green-400" : "text-foreground"
                  }`}
                >
                  {match.dire_team?.name || "Dire"}
                </p>
                <p className="text-2xl font-bold">{match.dire_score}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              <p>Match ID: {match.match_id}</p>
              <p>{timeAgo}</p>
              {match.league && <p>{match.league.name}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Draft */}
      {match.picks_bans && match.picks_bans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2">
                  Radiant
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {match.picks_bans
                    .filter((pb) => pb.team === 0)
                    .map((pb, i) => {
                      const slug = getHeroSlug(pb.hero_id);
                      return (
                        <div key={i} className="relative">
                          {slug && (
                            <Image
                              src={getHeroImageUrl(slug)}
                              alt={getHeroName(pb.hero_id)}
                              width={48}
                              height={27}
                              className={`rounded border ${
                                pb.is_pick
                                  ? "border-green-500/50"
                                  : "border-red-500/50 opacity-50"
                              }`}
                              title={`${pb.is_pick ? "Pick" : "Ban"}: ${getHeroName(pb.hero_id)}`}
                            />
                          )}
                          {!pb.is_pick && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-red-400 text-lg font-bold">✕</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">
                  Dire
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {match.picks_bans
                    .filter((pb) => pb.team === 1)
                    .map((pb, i) => {
                      const slug = getHeroSlug(pb.hero_id);
                      return (
                        <div key={i} className="relative">
                          {slug && (
                            <Image
                              src={getHeroImageUrl(slug)}
                              alt={getHeroName(pb.hero_id)}
                              width={48}
                              height={27}
                              className={`rounded border ${
                                pb.is_pick
                                  ? "border-green-500/50"
                                  : "border-red-500/50 opacity-50"
                              }`}
                              title={`${pb.is_pick ? "Pick" : "Ban"}: ${getHeroName(pb.hero_id)}`}
                            />
                          )}
                          {!pb.is_pick && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-red-400 text-lg font-bold">✕</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scoreboard */}
      {[
        { label: "Radiant", players: radiantPlayers, isRadiant: true },
        { label: "Dire", players: direPlayers, isRadiant: false },
      ].map(({ label, players, isRadiant }) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle
              className={`text-base ${
                (isRadiant && match.radiant_win) ||
                (!isRadiant && !match.radiant_win)
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {label}{" "}
              {((isRadiant && match.radiant_win) ||
                (!isRadiant && !match.radiant_win)) && (
                <Trophy className="inline h-4 w-4 ml-1" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hero</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">K</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">A</TableHead>
                  <TableHead className="text-center">LH/DN</TableHead>
                  <TableHead className="text-center">GPM</TableHead>
                  <TableHead className="text-center">XPM</TableHead>
                  <TableHead className="text-right">Net Worth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((p) => {
                  const slug = getHeroSlug(p.hero_id);
                  return (
                    <TableRow key={p.player_slot}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {slug && (
                            <Image
                              src={getHeroImageUrl(slug)}
                              alt={getHeroName(p.hero_id)}
                              width={40}
                              height={22}
                              className="rounded"
                            />
                          )}
                          <span className="text-xs">{getHeroName(p.hero_id)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/players/${p.account_id}`}
                          className="text-xs hover:text-primary transition-colors"
                        >
                          {p.name || p.personaname || "Anonymous"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-green-400">
                        {p.kills}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-red-400">
                        {p.deaths}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium">
                        {p.assists}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {p.last_hits}/{p.denies}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {p.gold_per_min}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {p.xp_per_min}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium text-primary">
                        {(p.net_worth || p.total_gold || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Gold/XP Advantage */}
      {match.radiant_gold_adv && match.radiant_xp_adv && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Gold & XP Advantage (Radiant)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoldXpAdvantageChart
              goldAdv={match.radiant_gold_adv}
              xpAdv={match.radiant_xp_adv}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
