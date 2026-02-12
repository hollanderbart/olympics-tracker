"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import MedalOverview from "@/components/MedalOverview";
import MedalOverviewSkeleton from "@/components/MedalOverview/MedalOverviewSkeleton";
import MedalTally from "@/components/MedalTally";
import NextEventHighlight from "@/components/NextEventHighlight";
import NextEventHighlightSkeleton from "@/components/NextEventHighlightSkeleton";
import EventList from "@/components/EventList";
import EventListSkeleton from "@/components/EventListSkeleton";
import Footer from "@/components/Footer";
import { CountryMedals, DutchEvent, NOC_FLAGS } from "@/lib/types";
import {
  fetchMedalTally,
  findCountryMedals,
  getEventsWithChancesForCountry,
} from "@/lib/olympics";
import {
  DEFAULT_FAVORITE_COUNTRY_NOC,
  GAMES_INFO,
  MEDAL_CHANCES_API_URL,
  NED_NOC,
} from "@/lib/constants";
import { getStaticScheduleByNoc, SCHEDULE_COUNTRIES } from "@/lib/schedules";
import {
  CLIENT_CACHE_KEYS,
  loadClientCache,
  saveClientCache,
} from "@/lib/cache/clientCache";
import {
  getFavoriteCountryNoc,
  setFavoriteCountryNoc,
} from "@/lib/preferences/favoriteCountry";
import {
  getNotificationsEnabled,
  requestNotificationPermission,
  sendNotification,
  sendTestNotification,
  setNotificationsEnabled,
  supportsNotifications,
} from "@/lib/notifications/browserNotifications";

type MedalData = Awaited<ReturnType<typeof fetchMedalTally>> & {
  servedFromCache: boolean;
  cacheSavedAt?: string;
  cacheAgeSeconds?: number;
};

type EventsData = {
  events: DutchEvent[];
  servedFromCache: boolean;
  cacheSavedAt?: string;
  cacheAgeSeconds?: number;
  error?: string;
  emptyStateMessage?: string;
  lastUpdated: string;
};

type MedalChancesFeed = {
  athletes?: Array<Record<string, unknown>>;
  disciplins?: Array<Record<string, unknown>>;
  events?: Array<Record<string, unknown>>;
};

const SPORT_ICON_BY_NAME: Record<string, string> = {
  "Alpine Skiing": "🎿",
  Biathlon: "🎯",
  Bobsleigh: "🛷",
  "Cross-Country Skiing": "🎿",
  Curling: "🥌",
  "Figure Skating": "⛸️",
  "Freestyle Skiing": "🎿",
  "Ice Hockey": "🏒",
  Luge: "🛷",
  "Nordic Combined": "🎿",
  Skeleton: "🛷",
  "Ski Jumping": "🪽",
  Snowboard: "🏂",
  "Speed Skating": "⛸️",
  "Short Track": "⛸️",
};

function mapChanceLabel(rawLabel: string): { label: string; score: number } {
  if (rawLabel === "Big Favourite") return { label: "Hoge kans op goud", score: 5 };
  if (rawLabel === "Favourite") return { label: "Redelijke kans op zilver", score: 4 };
  if (rawLabel === "Challenger") return { label: "Mogelijke kans op brons", score: 3 };
  if (rawLabel === "Outsider") return { label: "Kleine kans", score: 2 };
  if (rawLabel === "Wildcard") return { label: "Zeer kleine kans", score: 1 };
  return { label: "Onbekend", score: 0 };
}

function matchesCountryCode(value: unknown, selectedNoc: string): boolean {
  const normalizedValue = String(value || "").trim().toUpperCase();
  if (!normalizedValue) return false;
  const normalizedSelected = selectedNoc.toUpperCase();
  if (normalizedValue === normalizedSelected) return true;
  if (normalizedSelected === NED_NOC && normalizedValue === "NLD") return true;
  return false;
}

function toOlympicDate(day: unknown): string {
  const dayNum = Number.parseInt(String(day ?? ""), 10);
  if (!Number.isFinite(dayNum) || dayNum < 1 || dayNum > 31) {
    return GAMES_INFO.startDate;
  }
  return `2026-02-${String(dayNum).padStart(2, "0")}`;
}

function normalizeEventTime(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "12:00";
  const parts = raw.split(":");
  if (parts.length < 2) return "12:00";
  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
}

function computeStatus(date: string, time: string): DutchEvent["status"] {
  const now = new Date();
  const eventStart = new Date(`${date}T${time}:00+01:00`);
  const eventEnd = new Date(eventStart.getTime() + 3 * 60 * 60 * 1000);
  if (now >= eventEnd) return "completed";
  if (now >= eventStart && now < eventEnd) return "live";
  return "upcoming";
}

function buildDynamicCountryEvents(
  selectedCountryNoc: string,
  feed: MedalChancesFeed
): DutchEvent[] {
  const athletes = Array.isArray(feed?.athletes) ? feed.athletes : [];
  const disciplines = Array.isArray(feed?.disciplins) ? feed.disciplins : [];
  const events = Array.isArray(feed?.events) ? feed.events : [];

  const filteredAthletes = athletes.filter((athlete) =>
    matchesCountryCode(athlete?.country, selectedCountryNoc)
  );
  if (filteredAthletes.length === 0) return [];

  const disciplineMeta = new Map<string, { sport: string; name: string }>();
  disciplines.forEach((discipline) => {
    const key = String(discipline?.disciplin_id || "");
    if (!key) return;
    disciplineMeta.set(key, {
      sport: String(discipline?.sport || "Olympic Event"),
      name: String(discipline?.name || key),
    });
  });

  const eventMeta = new Map<string, { day: string; time: string; desc: string }>();
  events.forEach((event) => {
    const key = String(event?.disciplin_id || "");
    if (!key) return;
    const isMedal = String(event?.is_medal || "") === "1";
    if (!isMedal) return;

    const day = String(event?.day || "");
    const time = normalizeEventTime(event?.time_begin);
    const desc = String(event?.desc || "Final");

    const existing = eventMeta.get(key);
    if (!existing) {
      eventMeta.set(key, { day, time, desc });
      return;
    }

    const existingSort =
      Number.parseInt(existing.day || "99", 10) * 10000 +
      Number.parseInt(existing.time.replace(":", ""), 10);
    const currentSort =
      Number.parseInt(day || "99", 10) * 10000 +
      Number.parseInt(time.replace(":", ""), 10);

    if (currentSort < existingSort) {
      eventMeta.set(key, { day, time, desc });
    }
  });

  const athletesByDiscipline = new Map<string, Array<{ name: string; chance: string }>>();
  filteredAthletes.forEach((athlete) => {
    const disciplineId = String(athlete?.disciplin_id || "");
    if (!disciplineId) return;

    const athleteName = `${String(athlete?.firstname || "").trim()} ${String(
      athlete?.lastname || ""
    ).trim()}`.trim();
    const chance = String(athlete?.chance || "").trim();

    const bucket = athletesByDiscipline.get(disciplineId) || [];
    bucket.push({ name: athleteName || selectedCountryNoc, chance });
    athletesByDiscipline.set(disciplineId, bucket);
  });

  return Array.from(athletesByDiscipline.entries())
    .map(([disciplineId, disciplineAthletes]) => {
      const sortedAthletes = [...disciplineAthletes].sort(
        (a, b) => mapChanceLabel(b.chance).score - mapChanceLabel(a.chance).score
      );
      const bestChance = mapChanceLabel(sortedAthletes[0]?.chance || "");
      const meta = disciplineMeta.get(disciplineId);
      const schedule = eventMeta.get(disciplineId);
      const date = toOlympicDate(schedule?.day);
      const time = schedule?.time || "12:00";
      const sport = meta?.sport || "Olympic Event";
      const eventName = meta?.name || schedule?.desc || disciplineId;

      return {
        id: `${selectedCountryNoc.toLowerCase()}-${disciplineId}`,
        sport,
        sportIcon: SPORT_ICON_BY_NAME[sport] || "🏅",
        event: eventName,
        date,
        time,
        venue: `${sport} Arena`,
        athletes: sortedAthletes.slice(0, 4).map((a) => a.name),
        status: computeStatus(date, time),
        medalChance: bestChance,
        source: "live" as const,
      };
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

async function fetchMedalTallyWithCache(): Promise<MedalData> {
  const live = await fetchMedalTally();
  if (!live.error) {
    saveClientCache(CLIENT_CACHE_KEYS.medals, live, "live");
    return { ...live, servedFromCache: false };
  }

  const cached = loadClientCache<Awaited<ReturnType<typeof fetchMedalTally>>>(
    CLIENT_CACHE_KEYS.medals
  );
  if (cached) {
    return {
      ...cached.data,
      servedFromCache: true,
      cacheSavedAt: cached.savedAt,
      cacheAgeSeconds: cached.cacheAgeSeconds,
      error: live.error,
    };
  }

  return { ...live, servedFromCache: false };
}

async function fetchEventsWithCache(selectedCountryNoc: string): Promise<EventsData> {
  const cacheKey = `${CLIENT_CACHE_KEYS.events}_${selectedCountryNoc}`;

  try {
    const res = await fetch(MEDAL_CHANCES_API_URL, { cache: "no-cache" });
    let liveEvents: DutchEvent[];

    if (!res.ok) {
      liveEvents = await getEventsWithChancesForCountry(selectedCountryNoc);
    } else {
      const data = (await res.json()) as MedalChancesFeed;
      liveEvents = buildDynamicCountryEvents(selectedCountryNoc, data);
      if (liveEvents.length === 0) {
        liveEvents = await getEventsWithChancesForCountry(selectedCountryNoc);
      }
    }

    if (liveEvents.length === 0) {
      return {
        events: [],
        servedFromCache: false,
        emptyStateMessage: "Geen evenementen gevonden voor dit land.",
        lastUpdated: new Date().toISOString(),
      };
    }

    const payload: EventsData = {
      events: liveEvents,
      servedFromCache: false,
      lastUpdated: new Date().toISOString(),
    };
    saveClientCache(cacheKey, payload, "live");
    return payload;
  } catch {
    const cached = loadClientCache<EventsData>(cacheKey);
    if (cached && Array.isArray(cached.data.events) && cached.data.events.length > 0) {
      return {
        ...cached.data,
        servedFromCache: true,
        cacheSavedAt: cached.savedAt,
        cacheAgeSeconds: cached.cacheAgeSeconds,
        error: "Live event data unavailable, cached data shown.",
      };
    }

    return {
      events: [],
      servedFromCache: false,
      emptyStateMessage: "Geen evenementen gevonden voor dit land.",
      lastUpdated: new Date().toISOString(),
    };
  }
}

export default function HomePage() {
  const [showTally, setShowTally] = useState(false);
  const [selectedCountryNoc, setSelectedCountryNoc] = useState(
    DEFAULT_FAVORITE_COUNTRY_NOC
  );
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);
  const previousMedalsRef = useRef<{
    noc: string;
    gold: number;
    silver: number;
    bronze: number;
  } | null>(null);
  const previousStatusesRef = useRef<Record<string, DutchEvent["status"]>>({});

  // Fetch medal data with TanStack Query
  const medalsQuery = useQuery({
    queryKey: ["medals"],
    queryFn: fetchMedalTallyWithCache,
    refetchInterval: 60_000,
  });

  // Fetch schedule data with TanStack Query
  const eventsQuery = useQuery({
    queryKey: ["events", selectedCountryNoc],
    queryFn: () => fetchEventsWithCache(selectedCountryNoc),
    refetchInterval: 30_000,
  });

  // Compute derived data
  const medalData = medalsQuery.data;
  const eventsData = eventsQuery.data;
  const hasError = medalData?.error;
  const medals = medalData?.medals || [];
  const selectedCountryMedals = useMemo(
    () => findCountryMedals(medals, selectedCountryNoc),
    [medals, selectedCountryNoc]
  );
  const selectedCountryName = selectedCountryMedals.name;
  const selectedCountryFlag =
    selectedCountryMedals.flag || NOC_FLAGS[selectedCountryNoc] || "🏳️";
  const events = eventsData?.events || [];
  const isMedalsLoading = medalsQuery.isPending && !medalData;
  const isEventsLoading = eventsQuery.isPending && !eventsData;
  const isOfflineMode = Boolean(medalData?.servedFromCache || eventsData?.servedFromCache);
  const lastUpdated =
    medalData?.cacheSavedAt || eventsData?.cacheSavedAt || medalData?.lastUpdated;
  const gamesStartDate = new Date(`${GAMES_INFO.startDate}T00:00:00+01:00`);
  const gamesNotStarted = new Date() < gamesStartDate && medals.length === 0 && !isOfflineMode;
  const medalsFetchFailed = Boolean(hasError) && !isOfflineMode && !gamesNotStarted;
  const eventsFetchFailed = Boolean(eventsData?.error) && !eventsData?.servedFromCache;
  const completedEvents = useMemo(
    () => events.filter((e: DutchEvent) => e.status === "completed").length,
    [events]
  );
  const staticSchedule = getStaticScheduleByNoc(selectedCountryNoc);
  const totalCountryEvents = staticSchedule?.events.length || events.length;
  const countryOptions = useMemo(() => {
    const byNoc = new Map<string, { noc: string; name: string }>();
    SCHEDULE_COUNTRIES.forEach((entry) => byNoc.set(entry.noc, entry));

    medals.forEach((entry) => {
      if (!entry?.noc) return;
      byNoc.set(entry.noc, {
        noc: entry.noc,
        name: entry.name || entry.noc,
      });
    });

    if (!byNoc.has(selectedCountryNoc)) {
      byNoc.set(selectedCountryNoc, {
        noc: selectedCountryNoc,
        name: selectedCountryName || selectedCountryNoc,
      });
    }

    return Array.from(byNoc.values()).sort((a, b) => a.name.localeCompare(b.name, "en"));
  }, [medals, selectedCountryNoc, selectedCountryName]);

  // Find next upcoming or live event
  const nextEvent = useMemo(
    () =>
      events.find((e: DutchEvent) => e.status === "live") ||
      events.find((e: DutchEvent) => e.status === "upcoming") ||
      null,
    [events]
  );

  useEffect(() => {
    setSelectedCountryNoc(getFavoriteCountryNoc());
    setNotificationsSupported(supportsNotifications());
    setNotificationsEnabledState(getNotificationsEnabled());
  }, []);

  useEffect(() => {
    previousMedalsRef.current = null;
    previousStatusesRef.current = {};
  }, [selectedCountryNoc]);

  useEffect(() => {
    const current = {
      noc: selectedCountryNoc,
      gold: selectedCountryMedals.medals.gold,
      silver: selectedCountryMedals.medals.silver,
      bronze: selectedCountryMedals.medals.bronze,
    };

    const previous = previousMedalsRef.current;
    if (!previous || previous.noc !== selectedCountryNoc) {
      previousMedalsRef.current = current;
      return;
    }

    const medalChanges: Array<{ type: "goud" | "zilver" | "brons"; from: number; to: number }> = [];
    if (current.gold > previous.gold)
      medalChanges.push({ type: "goud", from: previous.gold, to: current.gold });
    if (current.silver > previous.silver)
      medalChanges.push({ type: "zilver", from: previous.silver, to: current.silver });
    if (current.bronze > previous.bronze)
      medalChanges.push({ type: "brons", from: previous.bronze, to: current.bronze });

    if (notificationsEnabled) {
      medalChanges.forEach((change) => {
        const dedupeKey = `notif_medal_${selectedCountryNoc}_${change.type}_${change.to}`;
        sendNotification(
          `${selectedCountryName} medaille-update`,
          {
            body: `${selectedCountryName} heeft een extra ${change.type} medaille (${change.from} -> ${change.to}).`,
          },
          dedupeKey
        );
      });
    }

    previousMedalsRef.current = current;
  }, [
    notificationsEnabled,
    selectedCountryMedals.medals.bronze,
    selectedCountryMedals.medals.gold,
    selectedCountryMedals.medals.silver,
    selectedCountryName,
    selectedCountryNoc,
  ]);

  useEffect(() => {
    const currentStatuses = events.reduce<Record<string, DutchEvent["status"]>>((acc, event) => {
      acc[event.id] = event.status;
      return acc;
    }, {});

    if (!notificationsEnabled) {
      previousStatusesRef.current = currentStatuses;
      return;
    }

    const previousStatuses = previousStatusesRef.current;
    if (Object.keys(previousStatuses).length === 0) {
      previousStatusesRef.current = currentStatuses;
      return;
    }

    events.forEach((event) => {
      const previousStatus = previousStatuses[event.id];
      if (previousStatus && previousStatus !== "live" && event.status === "live") {
        const dedupeKey = `notif_event_live_${selectedCountryNoc}_${event.id}_${event.date}`;
        sendNotification(
          `${selectedCountryName} nu live`,
          {
            body: `${event.event} is live begonnen.`,
          },
          dedupeKey
        );
      }
    });

    previousStatusesRef.current = currentStatuses;
  }, [events, notificationsEnabled, selectedCountryName, selectedCountryNoc]);

  const handleNotificationsToggle = async () => {
    if (!notificationsSupported) return;

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      setNotificationsEnabledState(false);
      return;
    }

    const permission = await requestNotificationPermission();
    const allowed = permission === "granted";
    setNotificationsEnabled(allowed);
    setNotificationsEnabledState(allowed);
  };

  const handleSendTestNotification = async () => {
    if (!notificationsSupported) {
      setTestNotificationFeedback("Browsermeldingen worden niet ondersteund.");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        setTestNotificationFeedback("Meldingen zijn niet toegestaan in deze browser.");
        return;
      }
    }

    // Keep user preference in sync once permission is granted.
    if (!notificationsEnabled) {
      setNotificationsEnabled(true);
      setNotificationsEnabledState(true);
    }

    const sent = sendTestNotification();
    setTestNotificationFeedback(
      sent
        ? "Testmelding verzonden."
        : "Testmelding kon niet worden verzonden. Controleer browser/OS notificatie-instellingen."
    );
  };

  const handleCountryChange = (noc: string) => {
    const normalized = setFavoriteCountryNoc(noc);
    setSelectedCountryNoc(normalized);
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background decoration */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,102,0,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,102,0,0.04) 0%, transparent 70%)",
        }}
      />

      <Header
        selectedCountryName={selectedCountryName}
        selectedCountryFlag={selectedCountryFlag}
        selectedCountryNoc={selectedCountryNoc}
        countryOptions={countryOptions}
        onCountryChange={handleCountryChange}
        completedEvents={completedEvents}
        totalEvents={totalCountryEvents}
      />

      {isOfflineMode && lastUpdated && (
        <section className="max-w-[720px] mx-auto mt-4 px-6">
          <div
            className="rounded-xl p-3 text-xs"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Offline modus · Laatst bijgewerkt: {new Date(lastUpdated).toLocaleString("nl-NL")}
          </div>
        </section>
      )}

      <section className="max-w-[720px] mx-auto mt-4 px-6">
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-white/65">
              Meldingen voor {selectedCountryName} medailles en live-wedstrijden
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendTestNotification}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  notificationsSupported
                    ? "bg-white/10 text-white/75 hover:bg-white/15"
                    : "bg-white/5 text-white/40"
                }`}
              >
                Stuur testmelding
              </button>
              <button
                type="button"
                onClick={handleNotificationsToggle}
                disabled={!notificationsSupported}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  notificationsSupported
                    ? notificationsEnabled
                      ? "bg-oranje text-white"
                      : "bg-white/10 text-white/75 hover:bg-white/15"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                }`}
              >
                {!notificationsSupported
                  ? "Niet ondersteund"
                  : notificationsEnabled
                    ? "Meldingen aan"
                    : "Meldingen uit"}
              </button>
            </div>
          </div>
          {testNotificationFeedback && (
            <div className="text-[11px] text-white/55 mt-2">{testNotificationFeedback}</div>
          )}
        </div>
      </section>

      {gamesNotStarted && (
        <section className="max-w-[720px] mx-auto mt-6 px-6">
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: "rgba(255,102,0,0.08)",
              border: "1px solid rgba(255,102,0,0.2)",
            }}
          >
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-base font-bold text-white mb-2">
              Winterspelen 2026 zijn nog niet begonnen
            </div>
            <div className="text-sm text-white/60">
              De Olympische Winterspelen in Milano Cortina starten op 6 februari 2026.
              Live medailledata wordt beschikbaar zodra de spelen beginnen.
            </div>
          </div>
        </section>
      )}

      {medalsFetchFailed && (
        <section className="max-w-[720px] mx-auto mt-6 px-6">
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-base font-bold text-white mb-2">
              Medailledata kon niet worden geladen
            </div>
            <div className="text-sm text-white/60 mb-4">
              Controleer je verbinding en probeer opnieuw.
            </div>
            <button
              type="button"
              onClick={() => medalsQuery.refetch()}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-oranje text-white hover:opacity-90 transition-opacity"
            >
              Opnieuw proberen
            </button>
          </div>
        </section>
      )}

      {isMedalsLoading ? (
        <MedalOverviewSkeleton />
      ) : (
        <MedalOverview
          selectedCountryMedals={selectedCountryMedals}
          selectedCountryName={selectedCountryName}
          onToggleTally={() => setShowTally(!showTally)}
          showTally={showTally}
        />
      )}
      {showTally && medals.length > 0 && (
        <MedalTally medals={medals} highlightedNoc={selectedCountryNoc} />
      )}
      {isEventsLoading ? (
        <>
          <NextEventHighlightSkeleton />
          <EventListSkeleton />
        </>
      ) : (
        <>
          {eventsFetchFailed && (
            <section className="max-w-[720px] mx-auto mt-5 px-6">
              <div
                className="rounded-xl p-4 text-center"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-sm font-semibold text-white/85 mb-2">
                  Programma-updates zijn tijdelijk niet beschikbaar
                </div>
                <button
                  type="button"
                  onClick={() => eventsQuery.refetch()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
                >
                  Opnieuw laden
                </button>
              </div>
            </section>
          )}
          <NextEventHighlight event={nextEvent} />
          <EventList
            events={events}
            nextEventId={nextEvent?.id || null}
            emptyStateMessage={eventsData?.emptyStateMessage}
          />
        </>
      )}
      <Footer />
    </div>
  );
}
