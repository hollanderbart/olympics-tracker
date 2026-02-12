// Netherlands NOC code
export const NED_NOC = "NED";

// Olympics.com data endpoints (pattern from Paris 2024)
// The actual URL may need adjustment once we verify the 2026 endpoint format
export const OLYMPICS_MEDALS_URL =
  "https://olympics.com/OG2026/data/CIS_MedalNOCs~lang=ENG~comp=OG2026.json";

export const OLYMPICS_SCHEDULE_URL =
  "https://olympics.com/OG2026/data/CIS_Schedule~lang=ENG~comp=OG2026~noc=NED.json";

// Fallback: scrape the medal tally page
export const OLYMPICS_MEDALS_PAGE =
  "https://www.olympics.com/en/milano-cortina-2026/medals";

export const OLYMPICS_NED_SCHEDULE_PAGE =
  "https://www.olympics.com/en/milano-cortina-2026/schedule/ned";

// Medal chance data source
export const MEDAL_CHANCES_API_URL =
  "https://winter-olympics-2026.datasportiq.com/api/data";

// Revalidation interval in seconds (how often to re-fetch data)
export const REVALIDATE_INTERVAL = 60; // 1 minute

// Games info
export const GAMES_INFO = {
  name: "Olympische Winterspelen 2026",
  nameEn: "2026 Winter Olympics",
  location: "Milano Cortina",
  startDate: "2026-02-06",
  endDate: "2026-02-22",
  totalMedalEvents: 116,
};

// Complete Dutch event schedule for Milano Cortina 2026
// Sources: olympics.com, Wikipedia "Netherlands at the 2026 Winter Olympics"
export const DUTCH_EVENTS = [
  // ===== SPEED SKATING =====
  {
    id: "ssk-w3000",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Vrouwen 3000m",
    date: "2026-02-07",
    time: "16:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Joy Beune", "Marijke Groenewoud", "Merel Conijn"],
  },
  {
    id: "ssk-m5000",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Mannen 5000m",
    date: "2026-02-08",
    time: "16:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Patrick Roest", "Stijn van de Bunt", "Beau Snellink"],
  },
  {
    id: "ssk-w1000",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Vrouwen 1000m",
    date: "2026-02-09",
    time: "17:30",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Jutta Leerdam", "Femke Kok", "Suzanne Schulting"],
  },
  {
    id: "ssk-m1500",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Mannen 1500m",
    date: "2026-02-11",
    time: "16:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Joep Wennemars", "Kjeld Nuis", "Jenning de Boo"],
  },
  {
    id: "ssk-w1500",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Vrouwen 1500m",
    date: "2026-02-13",
    time: "16:30",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Antoinette Rijpma-de Jong", "Jutta Leerdam", "Marijke Groenewoud"],
  },
  {
    id: "ssk-m1000",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Mannen 1000m",
    date: "2026-02-14",
    time: "16:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Jenning de Boo", "Kjeld Nuis", "Joep Wennemars"],
  },
  {
    id: "ssk-w500",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Vrouwen 500m",
    date: "2026-02-15",
    time: "17:03",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Femke Kok", "Jutta Leerdam", "Anna Boersma"],
  },
  {
    id: "ssk-m500",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Mannen 500m",
    date: "2026-02-16",
    time: "16:30",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Jenning de Boo", "Hein Otterspeer", "Merijn Scheperkamp"],
  },
  {
    id: "ssk-wtp",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Vrouwen Team Pursuit",
    date: "2026-02-17",
    time: "16:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Joy Beune", "Marijke Groenewoud", "Antoinette Rijpma-de Jong"],
  },
  {
    id: "ssk-mtp",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Mannen Team Pursuit",
    date: "2026-02-17",
    time: "17:30",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Patrick Roest", "Joep Wennemars", "Stijn van de Bunt"],
  },
  {
    id: "ssk-w5000",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Vrouwen 5000m",
    date: "2026-02-19",
    time: "16:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Joy Beune", "Merel Conijn"],
  },
  {
    id: "ssk-m10000",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Mannen 10.000m",
    date: "2026-02-19",
    time: "18:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Stijn van de Bunt", "Beau Snellink"],
  },
  {
    id: "ssk-wms",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Vrouwen Mass Start",
    date: "2026-02-21",
    time: "16:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Marijke Groenewoud"],
  },
  {
    id: "ssk-mms",
    sport: "Speed Skating",
    sportIcon: "⛸️",
    event: "Mannen Mass Start",
    date: "2026-02-21",
    time: "17:00",
    venue: "Milano Speed Skating Stadium",
    athletes: ["Jorrit Bergsma"],
  },

  // ===== SHORT TRACK =====
  {
    id: "stk-mixed",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Mixed Team Relay",
    date: "2026-02-08",
    time: "18:00",
    venue: "Milano Ice Skating Arena",
    athletes: [
      "Suzanne Schulting",
      "Xandra Velzeboer",
      "Sjinkie Knegt",
      "Jens van 't Wout",
    ],
  },
  {
    id: "stk-w500",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Vrouwen 500m",
    date: "2026-02-12",
    time: "18:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Xandra Velzeboer", "Selma Poutsma"],
  },
  {
    id: "stk-m1000",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Mannen 1000m",
    date: "2026-02-13",
    time: "18:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Sjinkie Knegt", "Jens van 't Wout", "Ithak de Laat"],
  },
  {
    id: "stk-w1000",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Vrouwen 1000m",
    date: "2026-02-15",
    time: "18:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Suzanne Schulting", "Xandra Velzeboer"],
  },
  {
    id: "stk-m1500",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Mannen 1500m",
    date: "2026-02-16",
    time: "18:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Sjinkie Knegt", "Jens van 't Wout"],
  },
  {
    id: "stk-w1500",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Vrouwen 1500m",
    date: "2026-02-19",
    time: "18:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Suzanne Schulting", "Selma Poutsma"],
  },
  {
    id: "stk-m500",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Mannen 500m",
    date: "2026-02-20",
    time: "18:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Sjinkie Knegt", "Jens van 't Wout"],
  },
  {
    id: "stk-w3000relay",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Vrouwen 3000m Relay",
    date: "2026-02-21",
    time: "18:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Suzanne Schulting", "Xandra Velzeboer", "Selma Poutsma"],
  },
  {
    id: "stk-m5000relay",
    sport: "Short Track",
    sportIcon: "⛸️",
    event: "Mannen 5000m Relay",
    date: "2026-02-22",
    time: "18:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Sjinkie Knegt", "Jens van 't Wout", "Ithak de Laat"],
  },

  // ===== BOBSLEIGH =====
  {
    id: "bob-2man",
    sport: "Bobsleigh",
    sportIcon: "🛷",
    event: "Tweemansbob",
    date: "2026-02-15",
    time: "20:00",
    venue: "Cortina Sliding Centre",
    athletes: ["Ivo de Bruin"],
  },
  {
    id: "bob-4man",
    sport: "Bobsleigh",
    sportIcon: "🛷",
    event: "Viererbob",
    date: "2026-02-22",
    time: "10:00",
    venue: "Cortina Sliding Centre",
    athletes: ["Ivo de Bruin"],
  },

  // ===== SKELETON =====
  {
    id: "skl-women",
    sport: "Skeleton",
    sportIcon: "💀",
    event: "Vrouwen Individueel",
    date: "2026-02-14",
    time: "10:00",
    venue: "Cortina Sliding Centre",
    athletes: ["Kimberley Bos"],
  },

  // ===== FIGURE SKATING =====
  {
    id: "fsk-pairs",
    sport: "Figure Skating",
    sportIcon: "💃",
    event: "Paarrijden",
    date: "2026-02-19",
    time: "10:30",
    venue: "Milano Ice Skating Arena",
    athletes: ["Daria Danilova & Michel Tsiba"],
  },
];
