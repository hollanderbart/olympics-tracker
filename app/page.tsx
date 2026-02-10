"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MedalOverview from "@/components/MedalOverview";
import MedalTally from "@/components/MedalTally";
import NextEventHighlight from "@/components/NextEventHighlight";
import EventList from "@/components/EventList";
import Footer from "@/components/Footer";
import { CountryMedals, DutchEvent, NOC_FLAGS } from "@/lib/types";

// Fallback data (used before API responds or if API is unreachable)
const FALLBACK_TALLY: CountryMedals[] = [
  { noc: "USA", name: "United States", flag: "🇺🇸", rank: 1, medals: { gold: 2, silver: 0, bronze: 0, total: 2 } },
  { noc: "ITA", name: "Italy", flag: "🇮🇹", rank: 2, medals: { gold: 1, silver: 1, bronze: 1, total: 3 } },
  { noc: "JPN", name: "Japan", flag: "🇯🇵", rank: 3, medals: { gold: 1, silver: 1, bronze: 1, total: 3 } },
  { noc: "NOR", name: "Norway", flag: "🇳🇴", rank: 4, medals: { gold: 1, silver: 1, bronze: 1, total: 3 } },
  { noc: "SWE", name: "Sweden", flag: "🇸🇪", rank: 5, medals: { gold: 1, silver: 1, bronze: 0, total: 2 } },
  { noc: "SUI", name: "Switzerland", flag: "🇨🇭", rank: 6, medals: { gold: 1, silver: 0, bronze: 0, total: 1 } },
  { noc: "AUT", name: "Austria", flag: "🇦🇹", rank: 7, medals: { gold: 1, silver: 0, bronze: 0, total: 1 } },
  { noc: "SLO", name: "Slovenia", flag: "🇸🇮", rank: 8, medals: { gold: 0, silver: 1, bronze: 0, total: 1 } },
  { noc: "GER", name: "Germany", flag: "🇩🇪", rank: 9, medals: { gold: 0, silver: 0, bronze: 1, total: 1 } },
  { noc: "CAN", name: "Canada", flag: "🇨🇦", rank: 10, medals: { gold: 0, silver: 0, bronze: 1, total: 1 } },
  { noc: "CHN", name: "China", flag: "🇨🇳", rank: 11, medals: { gold: 0, silver: 0, bronze: 1, total: 1 } },
  { noc: "NED", name: "Netherlands", flag: "🇳🇱", rank: 0, medals: { gold: 0, silver: 0, bronze: 0, total: 0 } },
];

const FALLBACK_NED: CountryMedals = {
  noc: "NED", name: "Netherlands", flag: "🇳🇱", rank: 0,
  medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
};

export default function HomePage() {
  const [medals, setMedals] = useState<CountryMedals[]>(FALLBACK_TALLY);
  const [nedMedals, setNedMedals] = useState<CountryMedals>(FALLBACK_NED);
  const [events, setEvents] = useState<DutchEvent[]>([]);
  const [showTally, setShowTally] = useState(false);
  const [completedEvents, setCompletedEvents] = useState(5);

  // Fetch medal data
  const fetchMedals = useCallback(async () => {
    try {
      const res = await fetch("/api/medals");
      if (res.ok) {
        const data = await res.json();
        if (data.medals?.length > 0) {
          setMedals(data.medals);
        }
        if (data.nedMedals) {
          setNedMedals(data.nedMedals);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch medals:", e);
    }
  }, []);

  // Fetch schedule data
  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/schedule");
      if (res.ok) {
        const data = await res.json();
        if (data.events?.length > 0) {
          setEvents(data.events);
          setCompletedEvents(
            data.events.filter((e: DutchEvent) => e.status === "completed").length
          );
        }
      }
    } catch (e) {
      console.warn("Failed to fetch schedule:", e);
    }
  }, []);

  useEffect(() => {
    fetchMedals();
    fetchSchedule();

    // Refresh medals every 60s, schedule every 30s
    const medalInterval = setInterval(fetchMedals, 60_000);
    const scheduleInterval = setInterval(fetchSchedule, 30_000);

    return () => {
      clearInterval(medalInterval);
      clearInterval(scheduleInterval);
    };
  }, [fetchMedals, fetchSchedule]);

  // Find next upcoming or live event
  const nextEvent =
    events.find((e) => e.status === "live") ||
    events.find((e) => e.status === "upcoming") ||
    null;

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
      <MedalOverview
        nedMedals={nedMedals}
        onToggleTally={() => setShowTally(!showTally)}
        showTally={showTally}
      />
      {showTally && <MedalTally medals={medals} />}
      <NextEventHighlight event={nextEvent} />
      <EventList events={events} nextEventId={nextEvent?.id || null} />
      <Footer />
    </div>
  );
}
