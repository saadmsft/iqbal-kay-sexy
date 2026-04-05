"use client";

import { useState } from "react";
import { TierList } from "@/components/tier-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRACKET_NAMES, type BracketKey } from "@/types/opendota";
import type { HeroStats } from "@/types/opendota";
import { cn } from "@/lib/utils";

interface MetaClientProps {
  heroes: HeroStats[];
}

export function MetaClient({ heroes }: MetaClientProps) {
  const [bracket, setBracket] = useState<BracketKey>("7");

  return (
    <div className="space-y-6">
      {/* Bracket Selector */}
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(BRACKET_NAMES) as [BracketKey, string][]).map(
          ([key, name]) => (
            <button
              key={key}
              onClick={() => setBracket(key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                bracket === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {name}
            </button>
          )
        )}
      </div>

      {/* Tier List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Hero Tier List — {BRACKET_NAMES[bracket]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TierList heroes={heroes} bracket={bracket} />
        </CardContent>
      </Card>

      {/* Pro Meta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pro Scene Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                Most Picked in Pro
              </h4>
              <div className="space-y-2">
                {[...heroes]
                  .sort((a, b) => (b.pro_pick || 0) - (a.pro_pick || 0))
                  .slice(0, 10)
                  .map((h) => {
                    const wr =
                      h.pro_pick > 0
                        ? ((h.pro_win / h.pro_pick) * 100).toFixed(1)
                        : "0";
                    return (
                      <div
                        key={h.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{h.localized_name}</span>
                        <div className="flex gap-3">
                          <Badge variant="outline" className="text-xs">
                            {h.pro_pick} picks
                          </Badge>
                          <span
                            className={cn(
                              "font-medium",
                              Number(wr) >= 52
                                ? "text-green-400"
                                : Number(wr) <= 48
                                  ? "text-red-400"
                                  : ""
                            )}
                          >
                            {wr}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                Most Banned in Pro
              </h4>
              <div className="space-y-2">
                {[...heroes]
                  .sort((a, b) => (b.pro_ban || 0) - (a.pro_ban || 0))
                  .slice(0, 10)
                  .map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{h.localized_name}</span>
                      <Badge variant="destructive" className="text-xs">
                        {h.pro_ban} bans
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
