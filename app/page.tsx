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
import { CountryMedals, DutchEvent } from "@/lib/types";
import { fetchMedalTally, getDutchEventsWithChances } from "@/lib/olympics";
import { MEDAL_CHANCES_API_URL, DUTCH_EVENTS, GAMES_INFO, NED_NOC } from "@/lib/constants";
import {
  CLIENT_CACHE_KEYS,
  loadClientCache,
  saveClientCache,
} from "@/lib/cache/clientCache";
import {
  getNotificationsEnabled,
  requestNotificationPermission,
  sendNotification,
  sendTestNotification,
  setNotificationsEnabled,
  supportsNotifications,
} from "@/lib/notifications/browserNotifications";

// Empty fallback for Netherlands when no data available
const FALLBACK_NED: CountryMedals = {
  noc: NED_NOC, name: "Netherlands", flag: "🇳🇱", rank: 0,
  medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
};

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
  lastUpdated: string;
};

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

async function fetchEventsWithCache(): Promise<EventsData> {
  const constantsFallback = DUTCH_EVENTS.map((event) => {
    const now = new Date();
    const eventStart = new Date(`${event.date}T${event.time}:00+01:00`);
    const eventEnd = new Date(eventStart.getTime() + 3 * 60 * 60 * 1000);

    let status: DutchEvent["status"] = "upcoming";
    if (now >= eventEnd) status = "completed";
    else if (now >= eventStart && now < eventEnd) status = "live";

    return { ...event, status };
  });

  try {
    const res = await fetch(MEDAL_CHANCES_API_URL, { cache: "no-cache" });
    let liveEvents: DutchEvent[];

    if (!res.ok) {
      liveEvents = await getDutchEventsWithChances();
    } else {
      const data = await res.json();
      const athletes = Array.isArray(data?.athletes) ? data.athletes : [];
      const items = athletes
        .filter((athlete: any) => String(athlete?.country || "").toLowerCase() === "ned")
        .map((athlete: any) => ({
          disciplinId: String(athlete?.disciplin_id || ""),
          chance: String(athlete?.chance || "").trim(),
        }))
        .filter((item: any) => item.disciplinId && item.chance);
      const chancesByDisciplin = items.reduce(
        (
          acc: Record<string, { label: string; score: number }>,
          item: {
            chance?: string;
            disciplinId?: string;
          }
        ) => {
          const rawLabel = String(item?.chance || "").trim();
          if (!rawLabel) return acc;

          const mapped =
            rawLabel === "Big Favourite"
              ? { label: "Hoge kans op goud", score: 5 }
              : rawLabel === "Favourite"
                ? { label: "Redelijke kans op zilver", score: 4 }
                : rawLabel === "Challenger"
                  ? { label: "Mogelijke kans op brons", score: 3 }
                  : rawLabel === "Outsider"
                    ? { label: "Kleine kans", score: 2 }
                    : rawLabel === "Wildcard"
                      ? { label: "Zeer kleine kans", score: 1 }
                      : null;

          if (!mapped) return acc;

          const key = String(item?.disciplinId || "");
          if (!key) return acc;

          if (!acc[key] || mapped.score > acc[key].score) {
            acc[key] = mapped;
          }

          return acc;
        },
        {}
      );

      liveEvents = await getDutchEventsWithChances(chancesByDisciplin);
    }

    if (liveEvents.length === 0) {
      return {
        events: constantsFallback,
        servedFromCache: false,
        error: "Live event data unavailable, fallback schedule shown.",
        lastUpdated: new Date().toISOString(),
      };
    }

    const payload: EventsData = {
      events: liveEvents,
      servedFromCache: false,
      lastUpdated: new Date().toISOString(),
    };
    saveClientCache(CLIENT_CACHE_KEYS.events, payload, "live");
    return payload;
  } catch {
    const cached = loadClientCache<EventsData>(CLIENT_CACHE_KEYS.events);
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
      events: constantsFallback,
      servedFromCache: false,
      error: "Could not load event data, fallback schedule shown.",
      lastUpdated: new Date().toISOString(),
    };
  }
}

export default function HomePage() {
  const [showTally, setShowTally] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);
  const previousMedalsRef = useRef<{ gold: number; silver: number; bronze: number } | null>(null);
  const previousStatusesRef = useRef<Record<string, DutchEvent["status"]>>({});

  // Fetch medal data with TanStack Query
  const medalsQuery = useQuery({
    queryKey: ["medals"],
    queryFn: fetchMedalTallyWithCache,
    refetchInterval: 60_000, // Refetch every 60 seconds
  });

  // Fetch schedule data with TanStack Query
  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: fetchEventsWithCache,
    refetchInterval: 30_000, // Refetch every 30 seconds
  });

  // Compute derived data
  const medalData = medalsQuery.data;
  const eventsData = eventsQuery.data;
  const hasError = medalData?.error;
  const medals = medalData?.medals || [];
  const nedMedals = medalData?.nedMedals || FALLBACK_NED;
  const events = eventsData?.events || [];
  const isMedalsLoading = medalsQuery.isPending && !medalData;
  const isEventsLoading = eventsQuery.isPending && !eventsData;
  const isOfflineMode = Boolean(medalData?.servedFromCache || eventsData?.servedFromCache);
  const lastUpdated = medalData?.cacheSavedAt || eventsData?.cacheSavedAt || medalData?.lastUpdated;
  const gamesStartDate = new Date(`${GAMES_INFO.startDate}T00:00:00+01:00`);
  const gamesNotStarted = new Date() < gamesStartDate && medals.length === 0 && !isOfflineMode;
  const medalsFetchFailed = Boolean(hasError) && !isOfflineMode && !gamesNotStarted;
  const eventsFetchFailed = Boolean(eventsData?.error) && !eventsData?.servedFromCache;
  const completedEvents = useMemo(
    () => events.filter((e: DutchEvent) => e.status === "completed").length,
    [events]
  );

  // Find next upcoming or live event
  const nextEvent = useMemo(
    () =>
      events.find((e: DutchEvent) => e.status === "live") ||
      events.find((e: DutchEvent) => e.status === "upcoming") ||
      null,
    [events]
  );

  useEffect(() => {
    setNotificationsSupported(supportsNotifications());
    setNotificationsEnabledState(getNotificationsEnabled());
  }, []);

  useEffect(() => {
    const current = {
      gold: nedMedals.medals.gold,
      silver: nedMedals.medals.silver,
      bronze: nedMedals.medals.bronze,
    };

    const previous = previousMedalsRef.current;
    if (!previous) {
      previousMedalsRef.current = current;
      return;
    }

    const medalChanges: Array<{ type: "goud" | "zilver" | "brons"; from: number; to: number }> = [];
    if (current.gold > previous.gold) medalChanges.push({ type: "goud", from: previous.gold, to: current.gold });
    if (current.silver > previous.silver) medalChanges.push({ type: "zilver", from: previous.silver, to: current.silver });
    if (current.bronze > previous.bronze) medalChanges.push({ type: "brons", from: previous.bronze, to: current.bronze });

    if (notificationsEnabled) {
      medalChanges.forEach((change) => {
        const dedupeKey = `notif_medal_${change.type}_${change.to}`;
        sendNotification(
          "Team NL medaille-update",
          {
            body: `Nederland heeft een extra ${change.type} medaille (${change.from} -> ${change.to}).`,
          },
          dedupeKey
        );
      });
    }

    previousMedalsRef.current = current;
  }, [notificationsEnabled, nedMedals.medals.bronze, nedMedals.medals.gold, nedMedals.medals.silver]);

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
        const dedupeKey = `notif_event_live_${event.id}_${event.date}`;
        sendNotification(
          "Team NL nu live",
          {
            body: `${event.event} is live begonnen.`,
          },
          dedupeKey
        );
      }
    });

    previousStatusesRef.current = currentStatuses;
  }, [events, notificationsEnabled]);

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

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background decoration */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: -200, right: -200, width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,102,0,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: -100, left: -100, width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,102,0,0.04) 0%, transparent 70%)",
        }}
      />

      <Header completedEvents={completedEvents} />

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
              Meldingen voor Team NL medailles en live-wedstrijden
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
          nedMedals={nedMedals}
          onToggleTally={() => setShowTally(!showTally)}
          showTally={showTally}
        />
      )}
      {showTally && medals.length > 0 && <MedalTally medals={medals} />}
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
          <EventList events={events} nextEventId={nextEvent?.id || null} />
        </>
      )}
      <Footer />
    </div>
  );
}
