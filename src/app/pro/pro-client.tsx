"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProPlayer } from "@/types/opendota";

interface ProPlayersClientProps {
  players: ProPlayer[];
}

export function ProPlayersClient({ players }: ProPlayersClientProps) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string | null>(null);

  const teams = useMemo(() => {
    const t = new Map<string, number>();
    players.forEach((p) => {
      if (p.team_name) t.set(p.team_name, (t.get(p.team_name) || 0) + 1);
    });
    return Array.from(t.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [players]);

  const filtered = useMemo(() => {
    let result = players;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.personaname?.toLowerCase().includes(q) ||
          p.team_name?.toLowerCase().includes(q)
      );
    }
    if (teamFilter) {
      result = result.filter((p) => p.team_name === teamFilter);
    }
    return result;
  }, [players, search, teamFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players or teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <Badge
          variant={teamFilter === null ? "default" : "secondary"}
          className="cursor-pointer text-xs"
          onClick={() => setTeamFilter(null)}
        >
          All Teams
        </Badge>
        {teams.map(([name, count]) => (
          <Badge
            key={name}
            variant={teamFilter === name ? "default" : "secondary"}
            className="cursor-pointer text-xs"
            onClick={() => setTeamFilter(teamFilter === name ? null : name)}
          >
            {name} ({count})
          </Badge>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.slice(0, 60).map((player) => (
          <Link key={player.account_id} href={`/players/${player.account_id}`}>
            <Card className="transition-all hover:ring-1 hover:ring-primary/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {player.avatarmedium && (
                    <Image
                      src={player.avatarmedium}
                      alt={player.name || player.personaname}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {player.name || player.personaname}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {player.team_name}
                      </Badge>
                      {player.country_code && (
                        <span className="text-xs text-muted-foreground">
                          {player.country_code}
                        </span>
                      )}
                    </div>
                  </div>
                  {player.is_pro && (
                    <Badge className="text-[10px]">PRO</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No players match your search.
        </p>
      )}
    </div>
  );
}
