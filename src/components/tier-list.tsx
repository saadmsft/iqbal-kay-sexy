import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HeroStats } from "@/types/opendota";
import { getHeroImageUrl } from "@/lib/opendota";
import Image from "next/image";
import Link from "next/link";

type Tier = "S" | "A" | "B" | "C" | "D";

interface TierHero {
  hero: HeroStats;
  winRate: number;
  pickRate: number;
  score: number;
}

interface TierGroup {
  tier: Tier;
  heroes: TierHero[];
}

const tierStyles: Record<Tier, string> = {
  S: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  A: "bg-green-500/20 text-green-400 border-green-500/40",
  B: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  C: "bg-gray-500/20 text-gray-400 border-gray-500/40",
  D: "bg-red-500/20 text-red-400 border-red-500/40",
};

function computeTiers(heroes: TierHero[]): TierGroup[] {
  const sorted = [...heroes].sort((a, b) => b.score - a.score);
  const total = sorted.length;
  const thresholds = [
    Math.ceil(total * 0.08),
    Math.ceil(total * 0.25),
    Math.ceil(total * 0.55),
    Math.ceil(total * 0.80),
  ];

  const tiers: Tier[] = ["S", "A", "B", "C", "D"];
  const groups: TierGroup[] = tiers.map((t) => ({ tier: t, heroes: [] }));

  sorted.forEach((hero, i) => {
    if (i < thresholds[0]) groups[0].heroes.push(hero);
    else if (i < thresholds[1]) groups[1].heroes.push(hero);
    else if (i < thresholds[2]) groups[2].heroes.push(hero);
    else if (i < thresholds[3]) groups[3].heroes.push(hero);
    else groups[4].heroes.push(hero);
  });

  return groups;
}

interface TierListProps {
  heroes: HeroStats[];
  bracket: string;
}

export function TierList({ heroes, bracket }: TierListProps) {
  const pickKey = `${bracket}_pick` as keyof HeroStats;
  const winKey = `${bracket}_win` as keyof HeroStats;

  const totalPicks = heroes.reduce(
    (sum, h) => sum + ((h[pickKey] as number) || 0),
    0
  );

  const tierHeroes: TierHero[] = heroes
    .filter((h) => ((h[pickKey] as number) || 0) > 0)
    .map((h) => {
      const picks = (h[pickKey] as number) || 0;
      const wins = (h[winKey] as number) || 0;
      const winRate = picks > 0 ? (wins / picks) * 100 : 0;
      const pickRate = totalPicks > 0 ? (picks / totalPicks) * 100 : 0;
      const score = winRate * 0.6 + pickRate * 10 * 0.4;
      return { hero: h, winRate, pickRate, score };
    });

  const groups = computeTiers(tierHeroes);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.tier} className="flex gap-3 items-start">
          <Badge
            className={cn(
              "text-lg font-bold w-10 h-10 flex items-center justify-center shrink-0 rounded-md border",
              tierStyles[group.tier]
            )}
          >
            {group.tier}
          </Badge>
          <div className="flex flex-wrap gap-1.5">
            {group.heroes.map(({ hero, winRate }) => (
              <Link key={hero.id} href={`/heroes/${hero.id}`}>
                <div className="relative group" title={`${hero.localized_name} - ${winRate.toFixed(1)}% WR`}>
                  <Image
                    src={getHeroImageUrl(hero.name)}
                    alt={hero.localized_name}
                    width={64}
                    height={36}
                    className="rounded border border-border/50 transition-transform group-hover:scale-110 group-hover:z-10"
                  />
                  <div className="absolute -bottom-0.5 left-0 right-0 text-center">
                    <span
                      className={cn(
                        "text-[9px] font-bold px-0.5 rounded-sm",
                        winRate >= 52
                          ? "bg-green-900/80 text-green-300"
                          : winRate <= 48
                            ? "bg-red-900/80 text-red-300"
                            : "bg-black/60 text-white"
                      )}
                    >
                      {winRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
