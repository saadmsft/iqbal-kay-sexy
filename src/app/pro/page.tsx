import { getProPlayers } from "@/lib/opendota";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProPlayersClient } from "./pro-client";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Pro Scene - Iqbal Kay Sexy",
  description: "Browse professional Dota 2 players, teams, and matches.",
};

export default async function ProPage() {
  const proPlayers = await getProPlayers();

  // Filter to only those with team and name
  const withTeams = proPlayers.filter((p) => p.name && p.team_name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Pro Scene
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {withTeams.length} professional players tracked
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pro/leaderboard">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Leaderboard
            </Badge>
          </Link>
          <Link href="/pro/matches">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Pro Matches
            </Badge>
          </Link>
        </div>
      </div>
      <ProPlayersClient players={withTeams} />
    </div>
  );
}
