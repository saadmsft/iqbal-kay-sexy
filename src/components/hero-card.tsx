import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getHeroImageUrl } from "@/lib/opendota";
import type { HeroStats } from "@/types/opendota";
import { ATTR_MAP } from "@/types/opendota";

interface HeroCardProps {
  hero: HeroStats;
  winRate?: number;
  pickRate?: number;
  showStats?: boolean;
}

export function HeroCard({
  hero,
  winRate,
  pickRate,
  showStats = true,
}: HeroCardProps) {
  const wr = winRate ?? 0;
  const img = getHeroImageUrl(hero.name);

  return (
    <Link href={`/heroes/${hero.id}`}>
      <Card className="group overflow-hidden transition-all hover:ring-1 hover:ring-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={img}
            alt={hero.localized_name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-sm font-semibold text-white truncate">
              {hero.localized_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {ATTR_MAP[hero.primary_attr] || hero.primary_attr}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-border/50 text-muted-foreground"
              >
                {hero.attack_type}
              </Badge>
            </div>
          </div>
        </div>
        {showStats && (
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Win Rate</span>
              <span
                className={
                  wr >= 52
                    ? "text-green-400 font-semibold"
                    : wr <= 48
                      ? "text-red-400 font-semibold"
                      : "text-foreground font-medium"
                }
              >
                {wr.toFixed(1)}%
              </span>
            </div>
            {pickRate !== undefined && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Pick Rate</span>
                <span className="text-foreground font-medium">
                  {pickRate.toFixed(1)}%
                </span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
