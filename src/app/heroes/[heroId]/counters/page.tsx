import {
  getHeroStats,
  getHeroMatchups,
  getHeroItemPopularity,
  getHeroImageUrl,
  getItemImageUrl,
  getItemsMap,
} from "@/lib/opendota";
import type { HeroStats } from "@/types/opendota";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Shield, Swords, ArrowLeft, ShoppingBag, Target } from "lucide-react";
import { CounterAiAnalysis } from "./counter-ai";

export const revalidate = 600;

interface Props {
  params: Promise<{ heroId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { heroId } = await params;
  const heroes = await getHeroStats();
  const hero = heroes.find((h) => h.id === Number(heroId));
  return {
    title: hero
      ? `Counter ${hero.localized_name} - Iqbal Kay Sexy`
      : "Counter Hero - Iqbal Kay Sexy",
  };
}

export default async function CounterHeroPage({ params }: Props) {
  const { heroId } = await params;
  const id = Number(heroId);

  const [heroes, matchups, itemsMap] = await Promise.all([
    getHeroStats(),
    getHeroMatchups(id),
    getItemsMap(),
  ]);

  const hero = heroes.find((h) => h.id === id);
  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Hero not found.</p>
      </div>
    );
  }

  // Heroes that COUNTER this hero (heroes with highest win rate against it)
  const counterHeroes = [...matchups]
    .filter((m) => m.games_played >= 30)
    .map((m) => {
      const counterHero = heroes.find((h) => h.id === m.hero_id);
      // Win rate here is from the perspective of the current hero,
      // so LOW win rate = the other hero counters this one
      const wrAgainst = m.games_played > 0 ? (m.wins / m.games_played) * 100 : 50;
      return {
        ...m,
        heroData: counterHero,
        wrAgainst, // Current hero's WR against this hero
      };
    })
    .sort((a, b) => a.wrAgainst - b.wrAgainst) // Lowest WR first = strongest counters
    .slice(0, 15);

  // Fetch item builds for the top counter heroes to find common items
  const counterItemCounts = new Map<number, number>();

  // For each top counter hero, get their item popularity
  const topCounterIds = counterHeroes.slice(0, 8).map((c) => c.hero_id);
  const counterItemBuilds = await Promise.all(
    topCounterIds.map((cid) =>
      getHeroItemPopularity(cid).catch(() => null)
    )
  );

  for (const build of counterItemBuilds) {
    if (!build) continue;
    const phases = [build.mid_game_items, build.late_game_items];
    for (const phase of phases) {
      if (!phase) continue;
      for (const [itemId, count] of Object.entries(phase)) {
        const numId = Number(itemId);
        const item = itemsMap.get(numId);
        // Only count real items with cost > 1000 (skip consumables/components)
        if (item && item.cost >= 1000) {
          counterItemCounts.set(numId, (counterItemCounts.get(numId) || 0) + count);
        }
      }
    }
  }

  // Sort items by total frequency across counter heroes
  const popularCounterItems = [...counterItemCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([itemId, count]) => ({
      item: itemsMap.get(itemId)!,
      count,
    }))
    .filter((x) => x.item);

  // Well-known counter item categories
  const counterCategories = categorizeCounterItems(hero, itemsMap);

  // AI data
  const aiData = JSON.stringify({
    name: hero.localized_name,
    attribute: hero.primary_attr,
    attack_type: hero.attack_type,
    roles: hero.roles,
    base_armor: hero.base_armor,
    move_speed: hero.move_speed,
    topCounters: counterHeroes.slice(0, 5).map((c) => ({
      hero: c.heroData?.localized_name || `Hero ${c.hero_id}`,
      wr_against: c.wrAgainst.toFixed(1),
      games: c.games_played,
    })),
    popularCounterItems: popularCounterItems.slice(0, 10).map((x) => x.item.dname),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Link
          href={`/heroes/${heroId}`}
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {hero.localized_name}
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-[45px] rounded-md overflow-hidden border border-border">
          <Image
            src={getHeroImageUrl(hero.name)}
            alt={hero.localized_name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            How to Counter {hero.localized_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Items, heroes, and strategies to shut down {hero.localized_name}
          </p>
        </div>
      </div>

      {/* AI Counter Analysis */}
      <CounterAiAnalysis heroDataJson={aiData} heroName={hero.localized_name} />

      {/* Counter Items by Category */}
      {counterCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Recommended Counter Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {counterCategories.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <h4 className="text-sm font-semibold text-primary">
                    {cat.category}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {cat.reason}
                  </p>
                  <div className="space-y-1.5">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-1.5 rounded-md bg-accent/30"
                      >
                        <Image
                          src={getItemImageUrl(item.name)}
                          alt={item.dname}
                          width={32}
                          height={24}
                          className="rounded border border-border/50"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {item.dname}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.cost > 0 ? `${item.cost} gold` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Items Among Counter Heroes */}
      {popularCounterItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Popular Items Built by Counter Heroes
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Most frequently built items by the heroes that counter {hero.localized_name}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {popularCounterItems.map(({ item, count }) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-accent/20 hover:bg-accent/40 transition-colors"
                >
                  <Image
                    src={getItemImageUrl(item.name)}
                    alt={item.dname}
                    width={36}
                    height={27}
                    className="rounded border border-border/50"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{item.dname}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.cost} gold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Counter Heroes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Swords className="h-4 w-4 text-red-400" />
            Heroes That Counter {hero.localized_name}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Heroes with the highest win rate against {hero.localized_name} (min 30 games)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {counterHeroes.map((c) => {
              const advantagePercent = (50 - c.wrAgainst).toFixed(1);
              return (
                <Link
                  key={c.hero_id}
                  href={`/heroes/${c.hero_id}`}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {c.heroData && (
                      <Image
                        src={getHeroImageUrl(c.heroData.name)}
                        alt={c.heroData.localized_name}
                        width={56}
                        height={32}
                        className="rounded border border-border/50"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {c.heroData?.localized_name || `Hero ${c.hero_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.games_played} games
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-400">
                      +{advantagePercent}% advantage
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.wrAgainst.toFixed(1)}% WR for {hero.localized_name}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CounterCategory {
  category: string;
  reason: string;
  items: { id: number; name: string; dname: string; cost: number }[];
}

function categorizeCounterItems(
  hero: HeroStats,
  itemsMap: Map<number, { id: number; name: string; dname: string; cost: number }>
): CounterCategory[] {
  const categories: CounterCategory[] = [];

  const findItem = (name: string) => {
    for (const item of itemsMap.values()) {
      if (item.name === name) return item;
    }
    return null;
  };

  const roles = hero.roles || [];
  const attr = hero.primary_attr;

  // Anti-magic items for spell-heavy heroes
  if (
    roles.includes("Nuker") ||
    roles.includes("Disabler") ||
    attr === "int"
  ) {
    const items = [
      findItem("black_king_bar"),
      findItem("pipe"),
      findItem("eternal_shroud"),
      findItem("glimmer_cape"),
      findItem("lotus_orb"),
      findItem("mage_slayer"),
    ].filter(Boolean) as CounterCategory["items"];
    if (items.length > 0) {
      categories.push({
        category: "Magic Resistance",
        reason: `${hero.localized_name} deals heavy magic damage. Reduce their impact with magic resistance.`,
        items,
      });
    }
  }

  // Anti-physical for right-clickers
  if (
    roles.includes("Carry") ||
    hero.attack_type === "Melee" && roles.includes("Initiator") ||
    attr === "agi"
  ) {
    const items = [
      findItem("ghost"),
      findItem("blade_mail"),
      findItem("shivas_guard"),
      findItem("assault"),
      findItem("heavens_halberd"),
      findItem("solar_crest"),
    ].filter(Boolean) as CounterCategory["items"];
    if (items.length > 0) {
      categories.push({
        category: "Physical Defense",
        reason: `${hero.localized_name} relies on physical damage. Armor and evasion reduce their output.`,
        items,
      });
    }
  }

  // Disable/lockdown for mobile or elusive heroes
  if (
    roles.includes("Escape") ||
    roles.includes("Carry") ||
    hero.move_speed >= 310
  ) {
    const items = [
      findItem("orchid"),
      findItem("bloodthorn"),
      findItem("sheepstick"),
      findItem("abyssal_blade"),
      findItem("rod_of_atos"),
      findItem("nullifier"),
    ].filter(Boolean) as CounterCategory["items"];
    if (items.length > 0) {
      categories.push({
        category: "Lockdown & Silence",
        reason: `${hero.localized_name} is mobile or elusive. Lock them down to prevent escape.`,
        items,
      });
    }
  }

  // Anti-heal for sustain heroes
  if (roles.includes("Durable") || roles.includes("Support")) {
    const items = [
      findItem("spirit_vessel"),
      findItem("shivas_guard"),
      findItem("skadi"),
    ].filter(Boolean) as CounterCategory["items"];
    if (items.length > 0) {
      categories.push({
        category: "Anti-Heal / Break",
        reason: `${hero.localized_name} benefits from sustain. Reduce healing and break passives.`,
        items,
      });
    }
  }

  // Detection for invis heroes
  if (roles.includes("Escape")) {
    const items = [
      findItem("dust"),
      findItem("gem"),
      findItem("ward_sentry"),
    ].filter(Boolean) as CounterCategory["items"];
    if (items.length > 0) {
      categories.push({
        category: "Detection",
        reason: `Ensure you can always spot ${hero.localized_name} if they go invisible.`,
        items,
      });
    }
  }

  // Dispel items for heroes with strong debuffs
  if (roles.includes("Disabler") || roles.includes("Nuker")) {
    const items = [
      findItem("lotus_orb"),
      findItem("manta"),
      findItem("satanic"),
      findItem("aeon_disk"),
    ].filter(Boolean) as CounterCategory["items"];
    if (items.length > 0) {
      categories.push({
        category: "Dispel & Save",
        reason: `Remove debuffs and survive ${hero.localized_name}'s burst.`,
        items,
      });
    }
  }

  return categories;
}
