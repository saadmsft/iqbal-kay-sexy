export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
}

export interface HeroStats extends Hero {
  img: string;
  icon: string;
  base_health: number;
  base_health_regen: number;
  base_mana: number;
  base_mana_regen: number;
  base_armor: number;
  base_mr: number;
  base_attack_min: number;
  base_attack_max: number;
  base_str: number;
  base_agi: number;
  base_int: number;
  str_gain: number;
  agi_gain: number;
  int_gain: number;
  attack_range: number;
  projectile_speed: number;
  attack_rate: number;
  base_attack_time: number;
  attack_point: number;
  move_speed: number;
  turn_rate: number | null;
  cm_enabled: boolean;
  legs: number;
  day_vision: number;
  night_vision: number;
  hero_id: number;
  turbo_picks: number;
  turbo_wins: number;
  pro_ban: number;
  pro_win: number;
  pro_pick: number;
  // Bracket picks/wins: 1=Herald, 2=Guardian, ..., 8=Immortal
  "1_pick": number;
  "1_win": number;
  "2_pick": number;
  "2_win": number;
  "3_pick": number;
  "3_win": number;
  "4_pick": number;
  "4_win": number;
  "5_pick": number;
  "5_win": number;
  "6_pick": number;
  "6_win": number;
  "7_pick": number;
  "7_win": number;
  "8_pick": number;
  "8_win": number;
}

export interface PlayerProfile {
  account_id: number;
  personaname: string;
  name: string | null;
  plus: boolean;
  cheese: number;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
  last_login: string | null;
  loccountrycode: string | null;
  is_contributor: boolean;
  is_subscriber: boolean;
}

export interface Player {
  rank_tier: number | null;
  leaderboard_rank: number | null;
  computed_mmr: number | null;
  profile: PlayerProfile;
}

export interface ProPlayer {
  account_id: number;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
  personaname: string;
  last_login: string | null;
  full_history_time: string | null;
  cheese: number;
  fh_unavailable: boolean;
  loccountrycode: string | null;
  name: string | null;
  country_code: string | null;
  fantasy_role: number;
  team_id: number;
  team_name: string;
  team_tag: string;
  is_locked: boolean;
  is_pro: boolean;
  locked_until: number;
  computed_mmr: number | null;
}

export interface TopPlayer extends ProPlayer {}

export interface PlayerMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  lobby_type: number;
  hero_id: number;
  start_time: number;
  version: number | null;
  kills: number;
  deaths: number;
  assists: number;
  skill: number | null;
  average_rank: number | null;
  leaver_status: number;
  party_size: number | null;
  hero_variant: number;
}

export interface PlayerHeroStats {
  hero_id: number;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
}

export interface WinLoss {
  win: number;
  lose: number;
}

export interface PlayerTotal {
  field: string;
  n: number;
  sum: number;
}

export interface PlayerRanking {
  hero_id: number;
  score: number;
  percent_rank: number;
  card: number;
}

export interface ProMatch {
  match_id: number;
  duration: number;
  start_time: number;
  radiant_team_id: number;
  radiant_name: string;
  dire_team_id: number;
  dire_name: string;
  leagueid: number;
  league_name: string;
  series_id: number;
  series_type: number;
  radiant_score: number;
  dire_score: number;
  radiant_win: boolean;
  radiant: boolean;
}

export interface PublicMatch {
  match_id: number;
  match_seq_num: number;
  radiant_win: boolean;
  start_time: number;
  duration: number;
  lobby_type: number;
  game_mode: number;
  avg_rank_tier: number;
  num_rank_tier: number;
  cluster: number;
  radiant_team: number[];
  dire_team: number[];
}

export interface MatchPlayer {
  account_id: number;
  player_slot: number;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  gold_per_min: number;
  xp_per_min: number;
  level: number;
  net_worth: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  backpack_0: number;
  backpack_1: number;
  backpack_2: number;
  item_neutral: number;
  personaname: string;
  name: string | null;
  radiant_win: boolean;
  isRadiant: boolean;
  win: number;
  lose: number;
  total_gold: number;
  total_xp: number;
  benchmarks: Record<string, { raw: number; pct: number }>;
}

export interface Match {
  match_id: number;
  barracks_status_dire: number;
  barracks_status_radiant: number;
  cluster: number;
  dire_score: number;
  duration: number;
  engine: number;
  first_blood_time: number;
  game_mode: number;
  human_players: number;
  leagueid: number;
  lobby_type: number;
  match_seq_num: number;
  negative_votes: number;
  positive_votes: number;
  radiant_gold_adv: number[] | null;
  radiant_score: number;
  radiant_win: boolean;
  radiant_xp_adv: number[] | null;
  start_time: number;
  tower_status_dire: number;
  tower_status_radiant: number;
  version: number | null;
  replay_salt: number;
  series_id: number;
  series_type: number;
  radiant_team: { team_id: number; name: string; tag: string; logo_url: string } | null;
  dire_team: { team_id: number; name: string; tag: string; logo_url: string } | null;
  league: { leagueid: number; name: string; tier: string } | null;
  skill: number | null;
  players: MatchPlayer[];
  patch: number;
  region: number;
  picks_bans: PickBan[] | null;
  replay_url: string | null;
}

export interface PickBan {
  is_pick: boolean;
  hero_id: number;
  team: number;
  order: number;
}

export interface HeroMatchup {
  hero_id: number;
  games_played: number;
  wins: number;
}

export interface HeroDuration {
  duration_bin: string;
  games_played: number;
  wins: number;
}

export interface HeroItemPopularity {
  start_game_items: Record<string, number>;
  early_game_items: Record<string, number>;
  mid_game_items: Record<string, number>;
  late_game_items: Record<string, number>;
}

export interface HeroBenchmark {
  hero_id: number;
  result: {
    gold_per_min: { percentile: number; value: number }[];
    xp_per_min: { percentile: number; value: number }[];
    kills_per_min: { percentile: number; value: number }[];
    last_hits_per_min: { percentile: number; value: number }[];
    hero_damage_per_min: { percentile: number; value: number }[];
    hero_healing_per_min: { percentile: number; value: number }[];
    tower_damage: { percentile: number; value: number }[];
  };
}

export interface HeroRanking {
  hero_id: number;
  rankings: {
    account_id: number;
    score: number;
    personaname: string;
    name: string | null;
    avatar: string;
    last_login: string | null;
    rank_tier: number | null;
  }[];
}

export interface ItemTiming {
  hero_id: number;
  item: string;
  time: number;
  games: string;
  wins: string;
}

export interface LaneRole {
  hero_id: number;
  lane_role: number;
  time: number;
  games: string;
  wins: string;
}

export interface LiveGame {
  activate_time: number;
  deactivate_time: number;
  server_steam_id: string;
  lobby_id: string;
  league_id: number;
  lobby_type: number;
  game_time: number;
  delay: number;
  spectators: number;
  game_mode: number;
  average_mmr: number;
  sort_score: number;
  match_id: number;
  radiant_score: number;
  dire_score: number;
  radiant_lead: number;
  team_name_radiant: string | null;
  team_name_dire: string | null;
  players: {
    account_id: number;
    hero_id: number;
    name: string | null;
    country_code: string;
    fantasy_role: number;
    team_id: number;
    team_name: string;
    team_tag: string;
    is_pro: boolean;
    is_radiant?: boolean;
  }[];
  building_state: number;
}

export interface Team {
  team_id: number;
  rating: number;
  wins: number;
  losses: number;
  last_match_time: number;
  name: string;
  tag: string;
}

export interface SearchResult {
  account_id: number;
  avatarfull: string;
  personaname: string;
  last_match_time: string;
  similarity: number;
}

export interface Distribution {
  ranks: {
    rows: { bin: number; bin_name: string; count: number; cumulative_sum: number }[];
    sum: { count: number };
  };
}

export interface League {
  leagueid: number;
  ticket: string;
  banner: string;
  tier: string;
  name: string;
}

// Utility types
export type BracketKey = "1" | "2" | "3" | "4" | "5" | "6" | "7";

export const BRACKET_NAMES: Record<BracketKey, string> = {
  "1": "Herald",
  "2": "Guardian",
  "3": "Crusader",
  "4": "Archon",
  "5": "Legend",
  "6": "Ancient",
  "7": "Divine/Immortal",
};

export const ATTR_MAP: Record<string, string> = {
  agi: "Agility",
  str: "Strength",
  int: "Intelligence",
  all: "Universal",
};
