import { getHeroStats } from "@/lib/opendota";
import { MetaClient } from "./meta-client";
import { TrendingUp } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Meta Analysis - Iqbal Kay Sexy",
  description: "Dota 2 hero tier list, pro meta picks/bans, and bracket-specific win rates.",
};

export default async function MetaPage() {
  const heroes = await getHeroStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Meta Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hero tier lists and pro scene meta. Select a bracket to see tier rankings.
        </p>
      </div>
      <MetaClient heroes={heroes} />
    </div>
  );
}
