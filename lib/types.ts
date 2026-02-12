// Medal data types
export interface MedalCount {
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export interface CountryMedals {
  noc: string;
  name: string;
  flag: string;
  rank: number;
  medals: MedalCount;
}

export interface MedalChance {
  label: string;
  score: number;
}

// Event/schedule types
export interface DutchEvent {
  id: string;
  sport: string;
  sportIcon: string;
  event: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (CET)
  venue: string;
  athletes: string[];
  status: "upcoming" | "live" | "completed";
  result?: string;
  medalChance?: MedalChance;
  source?: "live" | "fallback";
}

// Olympics.com API response types (based on Paris 2024 format)
export interface OlympicsNOCMedal {
  n_NOC: string;
  n_NOCLong: string;
  n_Gold: string;
  n_Silver: string;
  n_Bronze: string;
  n_Total: string;
  n_RankGold: string;
  n_RankTotal: string;
}

export interface OlympicsMedalResponse {
  props: {
    pageProps: {
      initialMedals: {
        medalStandings: {
          medalsTable: OlympicsNOCMedal[];
        };
      };
    };
  };
}

// NOC flag mapping
export const NOC_FLAGS: Record<string, string> = {
  NED: "🇳🇱",
  NOR: "🇳🇴",
  GER: "🇩🇪",
  USA: "🇺🇸",
  CAN: "🇨🇦",
  SWE: "🇸🇪",
  SUI: "🇨🇭",
  AUT: "🇦🇹",
  JPN: "🇯🇵",
  KOR: "🇰🇷",
  CHN: "🇨🇳",
  ITA: "🇮🇹",
  FRA: "🇫🇷",
  GBR: "🇬🇧",
  AUS: "🇦🇺",
  FIN: "🇫🇮",
  SLO: "🇸🇮",
  CZE: "🇨🇿",
  POL: "🇵🇱",
  RUS: "🇷🇺",
  BEL: "🇧🇪",
  ESP: "🇪🇸",
  NZL: "🇳🇿",
  ROC: "🏳️",
  AIN: "🏳️",
};
