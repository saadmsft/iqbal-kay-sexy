import { getHeroStats } from "@/lib/opendota";
import { HeroesGrid } from "@/components/heroes-grid";
import { Shield } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Heroes - Iqbal Kay Sexy",
  description: "Browse all Dota 2 heroes with win rates, pick rates, and filters by attribute and role.",
};

export default async function HeroesPage() {
  const heroes = await getHeroStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Heroes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse all {heroes.length} heroes. Win rates shown for Divine/Immortal bracket.
        </p>
      </div>
      <HeroesGrid heroes={heroes} />
    </div>
  );
}
