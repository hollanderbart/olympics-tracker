import {
  OLYMPICS_MEDALS_URL,
  OLYMPICS_MEDALS_PAGE,
  NED_NOC,
  REVALIDATE_INTERVAL,
} from "../../lib/constants";
import { CountryMedals, NOC_FLAGS } from "../../lib/types";

interface Env {
  ASSETS: { fetch: typeof fetch };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const now = new Date().toISOString();

  try {
    const res = await fetch(OLYMPICS_MEDALS_URL, {
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

        return new Response(
          JSON.stringify({ medals: parsed, nedMedals, lastUpdated: now }),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            },
          }
        );
      }
    }
  } catch (e) {
    console.warn("JSON endpoint failed, trying fallback:", e);
  }

  try {
    const res = await fetch(OLYMPICS_MEDALS_PAGE, {
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

        return new Response(
          JSON.stringify({ medals: parsed, nedMedals, lastUpdated: now }),
          {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            },
          }
        );
      }
    }
  } catch (e) {
    console.warn("HTML fallback failed:", e);
  }

  return new Response(
    JSON.stringify({
      medals: [],
      nedMedals: createEmptyNED(),
      lastUpdated: now,
      error: "Could not fetch medal data. Will retry shortly.",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=10",
      },
    }
  );
};

function parseOlympicsJSON(data: any): CountryMedals[] {
  try {
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

function parseMedalsHTML(html: string): CountryMedals[] {
  try {
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

function createEmptyNED(): CountryMedals {
  return {
    noc: NED_NOC,
    name: "Netherlands",
    flag: "🇳🇱",
    rank: 0,
    medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
  };
}
