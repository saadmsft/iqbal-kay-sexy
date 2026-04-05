"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, RefreshCw, Users, Clock, Eye, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LiveGame } from "@/types/opendota";

function formatGameTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function WatchButton({ serverSteamId, matchId }: { serverSteamId: string; matchId: number }) {
  const [copied, setCopied] = useState(false);
  const consoleCmd = `watch_server ${serverSteamId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(consoleCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`dota2://matchid=${matchId}`}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        Watch
      </a>
      <button
        onClick={handleCopy}
        title={`Copy console command: ${consoleCmd}`}
        className="inline-flex items-center gap-1 rounded-md bg-accent/50 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied!" : "Console Cmd"}
      </button>
    </div>
  );
}

export default function LivePage() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLive = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.opendota.com/api/live");
      if (res.ok) {
        const data = await res.json();
        setGames(data);
        setLastUpdated(new Date());
      }
    } catch {
      // Silently fail to keep showing stale data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-400 animate-pulse" />
            Live Games
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {games.length} high-MMR games in progress
            {lastUpdated && (
              <> &middot; Updated {lastUpdated.toLocaleTimeString()}</>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLive} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && games.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : games.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No live games available right now. Check back in a few minutes.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {games.map((game, i) => {
            const radiant = game.players?.filter((p) => p.is_radiant) || [];
            const dire = game.players?.filter((p) => !p.is_radiant) || [];
            return (
              <Card key={game.match_id || i} className="transition-all hover:ring-1 hover:ring-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        Avg {game.average_mmr || "?"} MMR
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatGameTime(game.game_time)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {game.spectators} watching
                      </div>
                      {game.server_steam_id && (
                        <WatchButton serverSteamId={game.server_steam_id} matchId={game.match_id} />
                      )}
                    </div>
                  </div>

                  {/* Score display */}
                  <div className="flex items-center justify-center gap-4 mb-3 py-2 rounded-md bg-accent/30">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-green-400 font-medium">
                        {game.team_name_radiant || "Radiant"}
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {game.radiant_score ?? 0}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">vs</span>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-red-400 font-medium">
                        {game.team_name_dire || "Dire"}
                      </p>
                      <p className="text-2xl font-bold text-red-400">
                        {game.dire_score ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-green-400 mb-1">
                        Radiant
                      </p>
                      <div className="space-y-0.5">
                        {radiant.map((p, j) => (
                          <p key={j} className="text-xs truncate">
                            <span className="text-muted-foreground">
                              {p.name || p.team_tag || ""}
                            </span>{" "}
                            {p.name && (
                              <Badge variant="outline" className="text-[9px] ml-1">
                                PRO
                              </Badge>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">
                        Dire
                      </p>
                      <div className="space-y-0.5">
                        {dire.map((p, j) => (
                          <p key={j} className="text-xs truncate">
                            <span className="text-muted-foreground">
                              {p.name || p.team_tag || ""}
                            </span>{" "}
                            {p.name && (
                              <Badge variant="outline" className="text-[9px] ml-1">
                                PRO
                              </Badge>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
