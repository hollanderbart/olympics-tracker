import {
  OLYMPICS_MEDALS_URL,
  OLYMPICS_MEDALS_PAGE,
  NED_NOC,
} from "../constants";
import { CountryMedals, DutchEvent, MedalType, MedalWinner, NOC_FLAGS } from "../types";
import { logTelemetry } from "../telemetry/logger";
import { getStaticScheduleByNoc } from "../schedules";

function createLiveMedalsUrl(): string {
  // Add cache-buster so browser/CDN layers do not serve stale medal data.
  const url = new URL(OLYMPICS_MEDALS_URL);
  url.searchParams.set("_ts", Date.now().toString());
  return url.toString();
}

function createProxyUrl(sourceUrl: string): string {
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`;
}

function createProxyCandidates(sourceUrl: string): string[] {
  return [
    sourceUrl,
    createProxyUrl(sourceUrl),
    `https://r.jina.ai/http://${sourceUrl.replace(/^https?:\/\//, "")}`,
    `https://cors.isomorphic-git.org/${sourceUrl}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(sourceUrl)}`,
  ];
}

const WIKIPEDIA_MEDAL_TABLE_URL =
  "https://en.wikipedia.org/wiki/2026_Winter_Olympics_medal_table";

function parseJsonLoose(text: string): any | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Direct JSON body.
  try {
    return JSON.parse(trimmed);
  } catch {
    // Keep trying.
  }

  // Some proxies prepend metadata; extract first JSON object/array.
  const objectStart = trimmed.indexOf("{");
  const arrayStart = trimmed.indexOf("[");
  const startCandidates = [objectStart, arrayStart].filter((n) => n >= 0);
  if (startCandidates.length === 0) return null;
  const start = Math.min(...startCandidates);

  const objectEnd = trimmed.lastIndexOf("}");
  const arrayEnd = trimmed.lastIndexOf("]");
  const end = Math.max(objectEnd, arrayEnd);
  if (end <= start) return null;

  try {
    return JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeSerializedHtml(html: string): string {
  return html
    .replace(/\\u0022/g, '"')
    .replace(/\\x22/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

async function fetchJSONWithFallback(url: string): Promise<any | null> {
  const candidates = createProxyCandidates(url);

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { cache: "no-store" });
      if (!res.ok) continue;
      const body = await res.text();
      const parsed = parseJsonLoose(body);
      if (parsed) return parsed;
    } catch {
      // Try next source.
    }
  }

  return null;
}

async function fetchTextWithFallback(url: string): Promise<string | null> {
  const candidates = createProxyCandidates(url);

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.text();
    } catch {
      // Try next source.
    }
  }

  return null;
}

/**
 * Fetches medal tally data from olympics.com
 *
 * Strategy:
 * 1. Try scraping the official medals webpage
 * 2. If that fails, try the official JSON data endpoint
 * 3. If all fails, return empty data with error flag
 */
export async function fetchMedalTally(): Promise<{
  medals: CountryMedals[];
  nedMedals: CountryMedals | null;
  medalWinners: MedalWinner[];
  lastUpdated: string;
  error?: string;
}> {
  const now = new Date().toISOString();
  const startedAt = Date.now();
  const elapsedMs = () => Date.now() - startedAt;

  // Attempt 1: Scrape from the public medals page.
  logTelemetry(
    {
      event: "medals_fetch_attempt",
      level: "info",
      meta: { source: "page", fallbackLevel: 1 },
    },
    { verbose: true }
  );
  const html = await fetchTextWithFallback(OLYMPICS_MEDALS_PAGE);
  if (html) {
    const parsed = parseMedalsHTML(html);
    if (parsed.length > 0) {
      const nedMedals = findNetherlands(parsed);
      const medalWinners = extractMedalWinnersFromHtml(html, parsed);
      logTelemetry({
        event: "medals_fetch_success",
        level: "info",
        meta: {
          source: "page",
          fallbackLevel: 1,
          rowsParsed: parsed.length,
          elapsedMs: elapsedMs(),
        },
      });
      return { medals: parsed, nedMedals, medalWinners, lastUpdated: now };
    }
    logTelemetry({
      event: "medals_parse_failure",
      level: "warn",
      meta: { source: "page", fallbackLevel: 1, elapsedMs: elapsedMs() },
    });
  } else {
    logTelemetry({
      event: "medals_fetch_failure",
      level: "warn",
      meta: { source: "page", fallbackLevel: 1, elapsedMs: elapsedMs() },
    });
  }

  // Attempt 2: Official JSON endpoint, with CORS-proxy fallback.
  const liveMedalsUrl = createLiveMedalsUrl();
  logTelemetry(
    {
      event: "medals_fetch_attempt",
      level: "info",
      meta: { source: "json", fallbackLevel: 2 },
    },
    { verbose: true }
  );
  const jsonData = await fetchJSONWithFallback(liveMedalsUrl);
  if (jsonData) {
    const parsed = parseOlympicsJSON(jsonData);
    if (parsed.length > 0) {
      const nedMedals = findNetherlands(parsed);
      const medalWinners = extractMedalWinners(jsonData, parsed);
      logTelemetry({
        event: "medals_fetch_success",
        level: "info",
        meta: {
          source: "json",
          fallbackLevel: 2,
          rowsParsed: parsed.length,
          elapsedMs: elapsedMs(),
        },
      });
      return { medals: parsed, nedMedals, medalWinners, lastUpdated: now };
    }
    logTelemetry({
      event: "medals_parse_failure",
      level: "warn",
      meta: { source: "json", fallbackLevel: 2, elapsedMs: elapsedMs() },
    });
  } else {
    logTelemetry({
      event: "medals_fetch_failure",
      level: "warn",
      meta: { source: "json", fallbackLevel: 2, elapsedMs: elapsedMs() },
    });
  }

  // Attempt 3: Public website scrape fallback (Wikipedia medal table).
  logTelemetry(
    {
      event: "medals_fetch_attempt",
      level: "info",
      meta: { source: "wiki", fallbackLevel: 3 },
    },
    { verbose: true }
  );
  const wikiHtml = await fetchTextWithFallback(WIKIPEDIA_MEDAL_TABLE_URL);
  if (wikiHtml) {
    const parsed = parseWikipediaMedalsHTML(wikiHtml);
    if (parsed.length > 0) {
      const nedMedals = findNetherlands(parsed);
      logTelemetry({
        event: "medals_fetch_success",
        level: "info",
        meta: {
          source: "wiki",
          fallbackLevel: 3,
          rowsParsed: parsed.length,
          elapsedMs: elapsedMs(),
        },
      });
      return { medals: parsed, nedMedals, medalWinners: [], lastUpdated: now };
    }
    logTelemetry({
      event: "medals_parse_failure",
      level: "warn",
      meta: { source: "wiki", fallbackLevel: 3, elapsedMs: elapsedMs() },
    });
  } else {
    logTelemetry({
      event: "medals_fetch_failure",
      level: "warn",
      meta: { source: "wiki", fallbackLevel: 3, elapsedMs: elapsedMs() },
    });
  }

  // Return empty data with error
  logTelemetry({
    event: "medals_fetch_failure",
    level: "error",
    meta: { source: "all", fallbackLevel: 4, rowsParsed: 0, elapsedMs: elapsedMs() },
  });
  return {
    medals: [],
    nedMedals: createEmptyCountry(NED_NOC),
    medalWinners: [],
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

    return entries.map((entry: any, index: number) => {
      const noc = entry.n_NOC || entry.organisation || entry.noc || entry.code || "";
      const medals = extractMedalTotals(entry);

      return {
        noc,
        name:
          entry.n_NOCLong ||
          entry.description ||
          entry.longDescription ||
          entry.country ||
          "",
        flag: NOC_FLAGS[noc] || "🏳️",
        rank: parseMedalNumber(entry.n_RankGold || entry.rank || entry.sortRank || index + 1),
        medals,
      };
    });
  } catch {
    return [];
  }
}

function extractMedalWinners(data: any, medals: CountryMedals[]): MedalWinner[] {
  const entries = Array.isArray(data?.medalStandings?.medalsTable)
    ? data.medalStandings.medalsTable
    : [];
  if (entries.length === 0) return [];

  const countryNameByNoc = new Map(
    medals.map((country) => [country.noc.toUpperCase(), country.name])
  );
  const seen = new Set<string>();
  const winners: MedalWinner[] = [];

  entries.forEach((entry: any) => {
    const noc = String(entry?.organisation || entry?.n_NOC || "").toUpperCase();
    if (!noc) return;

    const countryName =
      String(entry?.longDescription || entry?.description || "").trim() ||
      countryNameByNoc.get(noc) ||
      noc;
    const disciplines = Array.isArray(entry?.disciplines) ? entry.disciplines : [];

    disciplines.forEach((discipline: any) => {
      const disciplineCode = String(discipline?.code || "");
      const disciplineName = String(discipline?.name || disciplineCode || "Onbekend");
      const medalWinners = Array.isArray(discipline?.medalWinners)
        ? discipline.medalWinners
        : [];

      medalWinners.forEach((medalWinner: any, index: number) => {
        const medalType = normalizeMedalType(medalWinner?.medalType);
        if (!medalType) return;

        const eventCode = String(medalWinner?.eventCode || "");
        const competitorCode = String(
          medalWinner?.competitorCode || medalWinner?.competitorDisplayName || ""
        );
        const id = `${noc}:${eventCode}:${medalType}:${competitorCode}:${index}`;
        if (seen.has(id)) return;
        seen.add(id);

        winners.push({
          id,
          noc,
          countryName,
          disciplineCode,
          disciplineName,
          eventCode,
          eventDescription: String(medalWinner?.eventDescription || "Onbekend evenement"),
          eventCategory: String(medalWinner?.eventCategory || "").trim() || undefined,
          medalType,
          competitorDisplayName: String(
            medalWinner?.competitorDisplayName || countryName
          ).trim(),
          competitorType: String(medalWinner?.competitorType || ""),
          date: String(medalWinner?.date || ""),
        });
      });
    });
  });

  return winners.sort((a, b) => b.date.localeCompare(a.date));
}

function extractMedalWinnersFromHtml(html: string, medals: CountryMedals[]): MedalWinner[] {
  try {
    const variants = [html, normalizeSerializedHtml(html)];
    for (const variant of variants) {
      const payloads = extractScriptJsonPayloads(variant);
      for (const payload of payloads) {
        const table = findMedalsTable(payload);
        if (!table || table.length === 0) continue;
        const winners = extractMedalWinners({ medalStandings: { medalsTable: table } }, medals);
        if (winners.length > 0) return winners;
      }
    }
  } catch {
    // Ignore HTML winners parsing failures.
  }
  return [];
}

function normalizeMedalType(rawType: unknown): MedalType | null {
  const value = String(rawType || "").toUpperCase();
  if (value.includes("GOLD")) return "gold";
  if (value.includes("SILVER")) return "silver";
  if (value.includes("BRONZE")) return "bronze";
  return null;
}

function extractMedalTotals(entry: any): CountryMedals["medals"] {
  const totalsByType = Array.isArray(entry?.medalsNumber)
    ? entry.medalsNumber.find(
        (m: any) => String(m?.type ?? "").toLowerCase() === "total"
      )
    : null;

  const gold = parseMedalNumber(
    totalsByType?.gold ?? entry?.n_Gold ?? entry?.gold ?? 0
  );
  const silver = parseMedalNumber(
    totalsByType?.silver ?? entry?.n_Silver ?? entry?.silver ?? 0
  );
  const bronze = parseMedalNumber(
    totalsByType?.bronze ?? entry?.n_Bronze ?? entry?.bronze ?? 0
  );

  let total = parseMedalNumber(
    totalsByType?.total ?? entry?.n_Total ?? entry?.total ?? gold + silver + bronze
  );
  if (total === 0 && Array.isArray(entry?.disciplines)) {
    total = entry.disciplines.reduce(
      (acc: number, d: any) => acc + parseMedalNumber(d?.total),
      0
    );
  }

  return {
    gold,
    silver,
    bronze,
    total: total || gold + silver + bronze,
  };
}

function parseMedalNumber(value: unknown): number {
  const n = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
}

const COUNTRY_NAME_TO_NOC: Record<string, string> = {
  netherlands: "NED",
  norway: "NOR",
  italy: "ITA",
  "united states": "USA",
  usa: "USA",
  germany: "GER",
  sweden: "SWE",
  switzerland: "SUI",
  austria: "AUT",
  france: "FRA",
  canada: "CAN",
  japan: "JPN",
  china: "CHN",
  "south korea": "KOR",
  czechia: "CZE",
  slovenia: "SLO",
  poland: "POL",
  belgium: "BEL",
  bulgaria: "BUL",
  latvia: "LAT",
};

const COUNTRY_NOC_TO_NAME: Record<string, string> = {
  NED: "Netherlands",
  NOR: "Norway",
  ITA: "Italy",
  USA: "United States",
  GER: "Germany",
  SWE: "Sweden",
  SUI: "Switzerland",
  AUT: "Austria",
  FRA: "France",
  CAN: "Canada",
  JPN: "Japan",
  CHN: "China",
  KOR: "Republic of Korea",
  CZE: "Czechia",
  SLO: "Slovenia",
  POL: "Poland",
  BEL: "Belgium",
  BUL: "Bulgaria",
  LAT: "Latvia",
};

function parseMedalsFromText(raw: string): CountryMedals[] {
  const text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const matches = text.matchAll(
    /(?:^|\s)(\d{1,2})\s+([A-Za-z][A-Za-z .'-]{2,40}?)\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,3})(?=\s|$)/g
  );

  const rows: CountryMedals[] = [];
  for (const m of matches) {
    const rank = parseMedalNumber(m[1]);
    const name = m[2].trim();
    const gold = parseMedalNumber(m[3]);
    const silver = parseMedalNumber(m[4]);
    const bronze = parseMedalNumber(m[5]);
    const total = parseMedalNumber(m[6]);

    if (gold + silver + bronze !== total) continue;
    if (rank <= 0) continue;

    const noc =
      COUNTRY_NAME_TO_NOC[name.toLowerCase()] || name.slice(0, 3).toUpperCase();
    rows.push({
      noc,
      name,
      flag: NOC_FLAGS[noc] || "🏳️",
      rank,
      medals: { gold, silver, bronze, total },
    });
  }

  const unique = new Map<string, CountryMedals>();
  for (const row of rows) {
    if (!unique.has(row.noc)) unique.set(row.noc, row);
  }
  return Array.from(unique.values());
}

function findMedalsTable(value: any): any[] | null {
  if (!value || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findMedalsTable(item);
      if (found && found.length > 0) return found;
    }
    return null;
  }

  const direct = (value as { medalsTable?: any[] }).medalsTable;
  if (Array.isArray(direct) && direct.length > 0) return direct;

  for (const child of Object.values(value)) {
    const found = findMedalsTable(child);
    if (found && found.length > 0) return found;
  }

  return null;
}

function extractScriptJsonPayloads(html: string): any[] {
  const payloads: any[] = [];
  const matches = html.matchAll(
    /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g
  );

  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      payloads.push(JSON.parse(raw));
    } catch {
      // Ignore non-JSON payloads.
    }
  }

  const genericScriptMatches = html.matchAll(
    /<script[^>]*>([\s\S]*?)<\/script>/g
  );
  for (const match of genericScriptMatches) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    if (!/(medal|n_NOC|medalsTable|Netherlands)/i.test(raw)) continue;

    const parsed = parseJsonLoose(raw);
    if (parsed) payloads.push(parsed);
  }

  return payloads;
}

function extractMedalRowsByRegex(html: string): any[] {
  const rows: any[] = [];
  const rowMatches = html.matchAll(
    /"n_NOC"\s*:\s*"([^"]+)"[\s\S]*?"n_NOCLong"\s*:\s*"([^"]+)"[\s\S]*?"n_Gold"\s*:\s*"?(\d+)"?[\s\S]*?"n_Silver"\s*:\s*"?(\d+)"?[\s\S]*?"n_Bronze"\s*:\s*"?(\d+)"?[\s\S]*?"n_Total"\s*:\s*"?(\d+)"?[\s\S]*?"n_RankGold"\s*:\s*"?(\d+)"?/g
  );

  for (const match of rowMatches) {
    rows.push({
      n_NOC: match[1],
      n_NOCLong: match[2],
      n_Gold: match[3],
      n_Silver: match[4],
      n_Bronze: match[5],
      n_Total: match[6],
      n_RankGold: match[7],
    });
  }

  return rows;
}

/**
 * Parse medal tally from the HTML page as a fallback
 * This is a simplified parser that looks for __NEXT_DATA__ or structured medal data
 */
function parseMedalsHTML(html: string): CountryMedals[] {
  try {
    const variants = [html, normalizeSerializedHtml(html)];

    for (const variant of variants) {
      const payloads = extractScriptJsonPayloads(variant);
      for (const payload of payloads) {
        const table = findMedalsTable(payload);
        if (table && table.length > 0) {
          const parsed = parseOlympicsJSON({ medalStandings: { medalsTable: table } });
          if (parsed.length > 0) return parsed;
        }
      }

      const regexRows = extractMedalRowsByRegex(variant);
      if (regexRows.length > 0) {
        const parsed = parseOlympicsJSON(regexRows);
        if (parsed.length > 0) return parsed;
      }

      const textParsed = parseMedalsFromText(variant);
      if (textParsed.length > 0) {
        return textParsed;
      }
    }
  } catch {
    // HTML parsing failed
  }
  return [];
}

function parseWikipediaMedalsHTML(html: string): CountryMedals[] {
  try {
    const rows: CountryMedals[] = [];
    const trMatches = html.matchAll(/<tr[\s\S]*?<\/tr>/g);

    for (const tr of trMatches) {
      const row = tr[0]
        .replace(/<sup[\s\S]*?<\/sup>/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Typical row shape after stripping HTML:
      // "1 Norway 6 3 2 11"
      const m = row.match(
        /^(\d{1,2})\s+([A-Za-z][A-Za-z .,'-]{2,40}?)\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,3})$/
      );
      if (!m) continue;

      const rank = parseMedalNumber(m[1]);
      const name = m[2].trim();
      const gold = parseMedalNumber(m[3]);
      const silver = parseMedalNumber(m[4]);
      const bronze = parseMedalNumber(m[5]);
      const total = parseMedalNumber(m[6]);
      if (rank <= 0) continue;
      if (gold + silver + bronze !== total) continue;

      const noc =
        COUNTRY_NAME_TO_NOC[name.toLowerCase()] || name.slice(0, 3).toUpperCase();
      rows.push({
        noc,
        name,
        flag: NOC_FLAGS[noc] || "🏳️",
        rank,
        medals: { gold, silver, bronze, total },
      });
    }

    if (rows.length === 0) return [];

    const unique = new Map<string, CountryMedals>();
    for (const row of rows) {
      if (!unique.has(row.noc)) unique.set(row.noc, row);
    }
    return Array.from(unique.values());
  } catch {
    return [];
  }
}

/**
 * Get Dutch events with real-time status computed
 */
export async function getDutchEvents(): Promise<DutchEvent[]> {
  return buildEventsForCountry(NED_NOC);
}

export async function getDutchEventsWithChances(
  chancesByDisciplin: Record<string, { label: string; score: number }> = {}
): Promise<DutchEvent[]> {
  return getEventsWithChancesForCountry(NED_NOC, chancesByDisciplin);
}

export async function getEventsWithChancesForCountry(
  noc: string,
  chancesByDisciplin: Record<string, { label: string; score: number }> = {}
): Promise<DutchEvent[]> {
  const events = await buildEventsForCountry(noc);
  return events.map((event) => ({
    ...event,
    medalChance:
      chancesByDisciplin[mapEventIdToDisciplinId(event.id)] ||
      ({ label: "Onbekend", score: 0 } as const),
  }));
}

function mapEventIdToDisciplinId(eventId: string): string {
  const map: Record<string, string> = {
    "ssk-w3000": "speedskating-3000m-women",
    "ssk-m5000": "speedskating-5000m-men",
    "ssk-w1000": "speedskating-1000m-women",
    "ssk-m1500": "speedskating-1500m-men",
    "ssk-w1500": "speedskating-1500m-women",
    "ssk-m1000": "speedskating-1000m-men",
    "ssk-w500": "speedskating-500m-women",
    "ssk-m500": "speedskating-500m-men",
    "ssk-wtp": "speedskating-team-pursuit-women",
    "ssk-mtp": "speedskating-team-pursuit-men",
    "ssk-w5000": "speedskating-5000m-women",
    "ssk-m10000": "speedskating-10000m-men",
    "ssk-wms": "speedskating-mass-start-women",
    "ssk-mms": "speedskating-mass-start-men",
    "stk-mixed": "short-track-mixed-team-relay",
    "stk-w500": "short-track-500m-women",
    "stk-m1000": "short-track-1000m-men",
    "stk-w1000": "short-track-1000m-women",
    "stk-m1500": "short-track-1500m-men",
    "stk-w1500": "short-track-1500m-women",
    "stk-m500": "short-track-500m-men",
    "stk-w3000relay": "short-track-relay-women",
    "stk-m5000relay": "short-track-relay-men",
    "bob-2man": "bobsled-2-men",
    "bob-4man": "bobsled-4-men",
    "skl-women": "skeleton-women",
    "fsk-pairs": "figure-skating-pair",
  };

  return map[eventId] || eventId;
}

function buildEventsForCountry(noc: string): DutchEvent[] {
  const schedule = getStaticScheduleByNoc(noc);
  if (!schedule) {
    return [];
  }

  const source = schedule.events.map((e) => ({ ...e, source: "fallback" as const }));
  const now = new Date();

  return source.map((event) => {
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

function createEmptyCountry(noc: string): CountryMedals {
  const normalizedNoc = String(noc || "").toUpperCase() || NED_NOC;
  return {
    noc: normalizedNoc,
    name: COUNTRY_NOC_TO_NAME[normalizedNoc] || normalizedNoc,
    flag: NOC_FLAGS[normalizedNoc] || "🏳️",
    rank: 0,
    medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
  };
}

export function findCountryMedals(medals: CountryMedals[], noc: string): CountryMedals {
  const normalizedNoc = String(noc || "").toUpperCase() || NED_NOC;
  const byCode = medals.find(
    (m) =>
      m.noc.toUpperCase() === normalizedNoc ||
      (normalizedNoc === NED_NOC && m.noc.toUpperCase() === "NLD")
  );
  if (byCode) return byCode;

  const fallbackName = COUNTRY_NOC_TO_NAME[normalizedNoc];
  const byName = fallbackName
    ? medals.find((m) => m.name.toLowerCase() === fallbackName.toLowerCase())
    : null;
  if (byName) {
    return {
      ...byName,
      noc: normalizedNoc,
      flag: NOC_FLAGS[normalizedNoc] || byName.flag,
    };
  }

  return createEmptyCountry(normalizedNoc);
}

function findNetherlands(medals: CountryMedals[]): CountryMedals {
  return findCountryMedals(medals, NED_NOC);
}
