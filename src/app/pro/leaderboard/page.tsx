import { getTopPlayers, getRankTierName } from "@/lib/opendota";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Leaderboard - Iqbal Kay Sexy",
  description: "Top ranked Dota 2 players by MMR.",
};

export default async function LeaderboardPage() {
  const topPlayers = await getTopPlayers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top ranked players by estimated MMR
        </p>
      </div>

      <div className="space-y-2">
        {topPlayers.slice(0, 100).map((player, i) => (
          <Link key={player.account_id} href={`/players/${player.account_id}`}>
            <Card className="transition-all hover:ring-1 hover:ring-primary/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-muted-foreground w-8 text-right">
                    #{i + 1}
                  </span>
                  {player.avatarmedium && (
                    <Image
                      src={player.avatarmedium}
                      alt={player.name || player.personaname}
                      width={36}
                      height={36}
                      className="rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {player.name || player.personaname}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {player.team_name && (
                        <Badge variant="secondary" className="text-[10px]">
                          {player.team_name}
                        </Badge>
                      )}
                      {player.country_code && (
                        <span className="text-xs text-muted-foreground">
                          {player.country_code}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {player.computed_mmr || "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">MMR</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
