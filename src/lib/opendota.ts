import type {
  Hero,
  HeroStats,
  HeroMatchup,
  HeroDuration,
  HeroItemPopularity,
  HeroBenchmark,
  HeroRanking,
  Player,
  ProPlayer,
  TopPlayer,
  PlayerMatch,
  PlayerHeroStats,
  WinLoss,
  PlayerTotal,
  PlayerRanking,
  ProMatch,
  PublicMatch,
  Match,
  LiveGame,
  Team,
  SearchResult,
  Distribution,
  League,
  ItemTiming,
  LaneRole,
} from "@/types/opendota";

const BASE_URL = "https://api.opendota.com/api";

async function fetchApi<T>(endpoint: string, revalidate = 600): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  const apiKey = process.env.OPENDOTA_API_KEY;
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate },
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    throw new Error(
      `OpenDota rate limit exceeded. Retry after ${retryAfter || "unknown"} seconds.`
    );
  }

  if (!res.ok) {
    throw new Error(`OpenDota API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Heroes
export function getHeroes() {
  return fetchApi<Hero[]>("/heroes", 3600);
}

export function getHeroStats() {
  return fetchApi<HeroStats[]>("/heroStats", 600);
}

export function getHeroMatchups(heroId: number) {
  return fetchApi<HeroMatchup[]>(`/heroes/${heroId}/matchups`, 1800);
}

export function getHeroDurations(heroId: number) {
  return fetchApi<HeroDuration[]>(`/heroes/${heroId}/durations`, 1800);
}

export function getHeroItemPopularity(heroId: number) {
  return fetchApi<HeroItemPopularity>(
    `/heroes/${heroId}/itemPopularity`,
    1800
  );
}

export function getHeroPlayers(heroId: number) {
  return fetchApi<Record<string, unknown>[][]>(
    `/heroes/${heroId}/players`,
    1800
  );
}

export function getHeroMatches(heroId: number) {
  return fetchApi<ProMatch[]>(`/heroes/${heroId}/matches`, 600);
}

// Rankings & Benchmarks
export function getHeroRankings(heroId: number) {
  return fetchApi<HeroRanking>(`/rankings?hero_id=${heroId}`, 1800);
}

export function getHeroBenchmarks(heroId: number) {
  return fetchApi<HeroBenchmark>(`/benchmarks?hero_id=${heroId}`, 1800);
}

// Players
export function getPlayer(accountId: number) {
  return fetchApi<Player>(`/players/${accountId}`, 300);
}

export function getPlayerWinLoss(accountId: number) {
  return fetchApi<WinLoss>(`/players/${accountId}/wl`, 300);
}

export function getPlayerRecentMatches(accountId: number) {
  return fetchApi<PlayerMatch[]>(`/players/${accountId}/recentMatches`, 300);
}

export function getPlayerMatches(
  accountId: number,
  limit = 20
) {
  return fetchApi<PlayerMatch[]>(
    `/players/${accountId}/matches?limit=${limit}`,
    300
  );
}

export function getPlayerHeroes(accountId: number) {
  return fetchApi<PlayerHeroStats[]>(`/players/${accountId}/heroes`, 600);
}

export function getPlayerTotals(accountId: number) {
  return fetchApi<PlayerTotal[]>(`/players/${accountId}/totals`, 600);
}

export function getPlayerRankings(accountId: number) {
  return fetchApi<PlayerRanking[]>(`/players/${accountId}/rankings`, 600);
}

// Pro Players & Top Players
export function getProPlayers() {
  return fetchApi<ProPlayer[]>("/proPlayers", 1800);
}

export function getTopPlayers() {
  return fetchApi<TopPlayer[]>("/topPlayers", 1800);
}

// Matches
export function getMatch(matchId: number) {
  return fetchApi<Match>(`/matches/${matchId}`, 86400);
}

export function getProMatches() {
  return fetchApi<ProMatch[]>("/proMatches", 300);
}

export function getPublicMatches(minRank?: number, maxRank?: number) {
  const params = new URLSearchParams();
  if (minRank) params.set("min_rank", String(minRank));
  if (maxRank) params.set("max_rank", String(maxRank));
  const qs = params.toString();
  return fetchApi<PublicMatch[]>(
    `/publicMatches${qs ? `?${qs}` : ""}`,
    300
  );
}

// Live
export function getLiveGames() {
  return fetchApi<LiveGame[]>("/live", 60);
}

// Search
export function searchPlayers(query: string) {
  return fetchApi<SearchResult[]>(
    `/search?q=${encodeURIComponent(query)}`,
    60
  );
}

// Scenarios
export function getItemTimings(heroId?: number, item?: string) {
  const params = new URLSearchParams();
  if (heroId) params.set("hero_id", String(heroId));
  if (item) params.set("item", item);
  const qs = params.toString();
  return fetchApi<ItemTiming[]>(
    `/scenarios/itemTimings${qs ? `?${qs}` : ""}`,
    1800
  );
}

export function getLaneRoles(heroId?: number, laneRole?: number) {
  const params = new URLSearchParams();
  if (heroId) params.set("hero_id", String(heroId));
  if (laneRole) params.set("lane_role", String(laneRole));
  const qs = params.toString();
  return fetchApi<LaneRole[]>(
    `/scenarios/laneRoles${qs ? `?${qs}` : ""}`,
    1800
  );
}

// Misc
export function getDistributions() {
  return fetchApi<Distribution>("/distributions", 3600);
}

export function getTeams() {
  return fetchApi<Team[]>("/teams", 1800);
}

export function getLeagues() {
  return fetchApi<League[]>("/leagues", 3600);
}

export function getConstants(resource: string) {
  return fetchApi<Record<string, unknown>>(
    `/constants/${encodeURIComponent(resource)}`,
    86400
  );
}

export interface ItemInfo {
  id: number;
  name: string;
  dname: string;
  img: string;
  cost: number;
  lore: string;
  attrib: { key: string; display: string; value: string }[];
  components: string[] | null;
}

/** Fetch item constants and build an id→item lookup map */
export async function getItemsMap(): Promise<Map<number, ItemInfo>> {
  const raw = await fetchApi<
    Record<string, {
      id: number;
      dname?: string;
      img?: string;
      cost?: number;
      lore?: string;
      attrib?: { key: string; display: string; value: string }[];
      components?: string[] | null;
    }>
  >("/constants/items", 86400);

  const map = new Map<number, ItemInfo>();
  for (const [name, item] of Object.entries(raw)) {
    if (item.id != null) {
      map.set(item.id, {
        id: item.id,
        name,
        dname: item.dname || name.replace(/_/g, " "),
        img: item.img || "",
        cost: item.cost || 0,
        lore: item.lore || "",
        attrib: item.attrib || [],
        components: item.components || null,
      });
    }
  }
  return map;
}

// Utility: get hero image URL from the hero name field (e.g., "npc_dota_hero_antimage")
export function getHeroImageUrl(heroName: string): string {
  const slug = heroName.replace("npc_dota_hero_", "");
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;
}

export function getHeroIconUrl(heroIcon: string): string {
  return `https://cdn.cloudflare.steamstatic.com${heroIcon}`;
}

export function getItemImageUrl(itemName: string): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemName}.png`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getRankTierName(tier: number | null): string {
  if (!tier) return "Unknown";
  const medals: Record<number, string> = {
    1: "Herald",
    2: "Guardian",
    3: "Crusader",
    4: "Archon",
    5: "Legend",
    6: "Ancient",
    7: "Divine",
    8: "Immortal",
  };
  const medal = Math.floor(tier / 10);
  const star = tier % 10;
  return `${medals[medal] || "Unknown"}${star > 0 ? ` ${star}` : ""}`;
}
