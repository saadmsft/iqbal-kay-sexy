"use client";

import { useState, useMemo } from "react";
import { HeroCard } from "@/components/hero-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HeroStats } from "@/types/opendota";
import { ATTR_MAP } from "@/types/opendota";
import { Search, Filter } from "lucide-react";

interface HeroesGridProps {
  heroes: HeroStats[];
}

type SortOption = "winRate" | "pickRate" | "proRate" | "name";

export function HeroesGrid({ heroes }: HeroesGridProps) {
  const [search, setSearch] = useState("");
  const [attrFilter, setAttrFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("winRate");

  const allRoles = useMemo(() => {
    const roles = new Set<string>();
    heroes.forEach((h) => h.roles?.forEach((r) => roles.add(r)));
    return Array.from(roles).sort();
  }, [heroes]);

  const totalPicks = heroes.reduce((s, h) => {
    let t = 0;
    for (let i = 1; i <= 8; i++) {
      t += (h[`${i}_pick` as keyof HeroStats] as number) || 0;
    }
    return s + t;
  }, 0);

  const filtered = useMemo(() => {
    let result = heroes;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((h) =>
        h.localized_name.toLowerCase().includes(q)
      );
    }
    if (attrFilter) {
      result = result.filter((h) => h.primary_attr === attrFilter);
    }
    if (roleFilter) {
      result = result.filter((h) => h.roles?.includes(roleFilter));
    }

    return result.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.localized_name.localeCompare(b.localized_name);
        case "winRate": {
          const wrA = a["7_pick"] ? (a["7_win"] / a["7_pick"]) * 100 : 0;
          const wrB = b["7_pick"] ? (b["7_win"] / b["7_pick"]) * 100 : 0;
          return wrB - wrA;
        }
        case "pickRate": {
          let pA = 0, pB = 0;
          for (let i = 1; i <= 8; i++) {
            pA += (a[`${i}_pick` as keyof HeroStats] as number) || 0;
            pB += (b[`${i}_pick` as keyof HeroStats] as number) || 0;
          }
          return pB - pA;
        }
        case "proRate":
          return (b.pro_pick || 0) - (a.pro_pick || 0);
        default:
          return 0;
      }
    });
  }, [heroes, search, attrFilter, roleFilter, sort]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search heroes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(ATTR_MAP).map(([key, label]) => (
            <Badge
              key={key}
              variant={attrFilter === key ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setAttrFilter(attrFilter === key ? null : key)}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Role filters */}
      <div className="flex gap-1.5 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground mt-0.5" />
        {allRoles.map((role) => (
          <Badge
            key={role}
            variant={roleFilter === role ? "default" : "secondary"}
            className="cursor-pointer text-xs"
            onClick={() => setRoleFilter(roleFilter === role ? null : role)}
          >
            {role}
          </Badge>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 text-xs">
        <span className="text-muted-foreground">Sort:</span>
        {(
          [
            ["winRate", "Win Rate"],
            ["pickRate", "Pick Rate"],
            ["proRate", "Pro Picks"],
            ["name", "Name"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={cn(
              "px-2 py-0.5 rounded-md transition-colors",
              sort === key
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((hero) => {
          const picks = hero["7_pick"] || 0;
          const wins = hero["7_win"] || 0;
          const wr = picks > 0 ? (wins / picks) * 100 : 0;
          let totalP = 0;
          for (let i = 1; i <= 8; i++) {
            totalP += (hero[`${i}_pick` as keyof HeroStats] as number) || 0;
          }
          return (
            <HeroCard
              key={hero.id}
              hero={hero}
              winRate={wr}
              pickRate={totalPicks > 0 ? (totalP / totalPicks) * 100 : 0}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No heroes match your filters.
        </p>
      )}
    </div>
  );
}
