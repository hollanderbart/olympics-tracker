import {
  OLYMPICS_MEDALS_URL,
  OLYMPICS_MEDALS_PAGE,
  NED_NOC,
  DUTCH_EVENTS,
  REVALIDATE_INTERVAL,
} from "./constants";
import { CountryMedals, DutchEvent, NOC_FLAGS } from "./types";

/**
 * Fetches medal tally data from olympics.com
 *
 * Strategy:
 * 1. Try the official JSON data endpoint (pattern from Paris 2024)
 * 2. If that fails, try scraping the medals page
 * 3. If all fails, return empty data with error flag
 */
export async function fetchMedalTally(): Promise<{
  medals: CountryMedals[];
  nedMedals: CountryMedals | null;
  lastUpdated: string;
  error?: string;
}> {
  const now = new Date().toISOString();

  try {
    // Attempt 1: Try the JSON endpoint
    const res = await fetch(OLYMPICS_MEDALS_URL, {
      next: { revalidate: REVALIDATE_INTERVAL },
      headers: {
        "User-Agent": "DutchOlympicTracker/1.0",
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const parsed = parseOlympicsJSON(data);
      if (parsed.length > 0) {
        const nedMedals =
          parsed.find((m) => m.noc === NED_NOC) || createEmptyNED();
        return { medals: parsed, nedMedals, lastUpdated: now };
      }
    }
  } catch (e) {
    console.warn("JSON endpoint failed, trying fallback:", e);
  }

  try {
    // Attempt 2: Try fetching and parsing the HTML medals page
    const res = await fetch(OLYMPICS_MEDALS_PAGE, {
      next: { revalidate: REVALIDATE_INTERVAL },
      headers: {
        "User-Agent": "DutchOlympicTracker/1.0",
        Accept: "text/html",
      },
    });

    if (res.ok) {
      const html = await res.text();
      const parsed = parseMedalsHTML(html);
      if (parsed.length > 0) {
        const nedMedals =
          parsed.find((m) => m.noc === NED_NOC) || createEmptyNED();
        return { medals: parsed, nedMedals, lastUpdated: now };
      }
    }
  } catch (e) {
    console.warn("HTML fallback failed:", e);
  }

  // Return empty data with error
  return {
    medals: [],
    nedMedals: createEmptyNED(),
    lastUpdated: now,
    error: "Could not fetch medal data. Will retry shortly.",
  };
}

/**
 * Parse the olympics.com JSON data endpoint
 * Format based on Paris 2024: CIS_MedalNOCs~lang=ENG~comp=OG2024.json
 */
function parseOlympicsJSON(data: any): CountryMedals[] {
  try {
    // The structure may vary — try common patterns
    let entries: any[] = [];

    if (data?.medalStandings?.medalsTable) {
      entries = data.medalStandings.medalsTable;
    } else if (data?.props?.pageProps?.initialMedals?.medalStandings?.medalsTable) {
      entries = data.props.pageProps.initialMedals.medalStandings.medalsTable;
    } else if (Array.isArray(data)) {
      entries = data;
    }

    return entries.map((entry: any, index: number) => ({
      noc: entry.n_NOC || entry.noc || entry.code || "",
      name: entry.n_NOCLong || entry.description || entry.longDescription || entry.country || "",
      flag: NOC_FLAGS[entry.n_NOC || entry.noc || entry.code || ""] || "🏳️",
      rank: parseInt(entry.n_RankGold || entry.rank || index + 1),
      medals: {
        gold: parseInt(entry.n_Gold || entry.gold || 0),
        silver: parseInt(entry.n_Silver || entry.silver || 0),
        bronze: parseInt(entry.n_Bronze || entry.bronze || 0),
        total: parseInt(entry.n_Total || entry.total || 0),
      },
    }));
  } catch {
    return [];
  }
}

/**
 * Parse medal tally from the HTML page as a fallback
 * This is a simplified parser that looks for __NEXT_DATA__ or structured medal data
 */
function parseMedalsHTML(html: string): CountryMedals[] {
  try {
    // Try to find __NEXT_DATA__ JSON embedded in the page
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s
    );

    if (nextDataMatch) {
      const nextData = JSON.parse(nextDataMatch[1]);
      const table =
        nextData?.props?.pageProps?.initialMedals?.medalStandings?.medalsTable;
      if (table) {
        return parseOlympicsJSON({ medalStandings: { medalsTable: table } });
      }
    }
  } catch {
    // HTML parsing failed
  }
  return [];
}

/**
 * Get Dutch events with real-time status computed
 */
export function getDutchEvents(): DutchEvent[] {
  const now = new Date();

  return DUTCH_EVENTS.map((event) => {
    const eventStart = new Date(`${event.date}T${event.time}:00+01:00`); // CET
    const eventEnd = new Date(eventStart.getTime() + 3 * 60 * 60 * 1000); // Assume ~3 hour window

    let status: DutchEvent["status"] = "upcoming";
    if (now >= eventEnd) {
      status = "completed";
    } else if (now >= eventStart && now < eventEnd) {
      status = "live";
    }

    return {
      ...event,
      status,
    };
  });
}

function createEmptyNED(): CountryMedals {
  return {
    noc: NED_NOC,
    name: "Netherlands",
    flag: "🇳🇱",
    rank: 0,
    medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
  };
}
