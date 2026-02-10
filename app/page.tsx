"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import MedalOverview from "@/components/MedalOverview";
import MedalTally from "@/components/MedalTally";
import NextEventHighlight from "@/components/NextEventHighlight";
import EventList from "@/components/EventList";
import Footer from "@/components/Footer";
import { CountryMedals, DutchEvent } from "@/lib/types";
import { fetchMedalTally, getDutchEvents } from "@/lib/olympics";
import { NED_NOC } from "@/lib/constants";

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
  noc: NED_NOC, name: "Netherlands", flag: "🇳🇱", rank: 0,
  medals: { gold: 0, silver: 0, bronze: 0, total: 0 },
};

export default function HomePage() {
  const [showTally, setShowTally] = useState(false);

  // Fetch medal data with TanStack Query
  const { data: medalData } = useQuery({
    queryKey: ["medals"],
    queryFn: fetchMedalTally,
    refetchInterval: 60_000, // Refetch every 60 seconds
    placeholderData: {
      medals: FALLBACK_TALLY,
      nedMedals: FALLBACK_NED,
      lastUpdated: new Date().toISOString(),
    },
  });

  // Fetch schedule data with TanStack Query
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: getDutchEvents,
    refetchInterval: 30_000, // Refetch every 30 seconds
    placeholderData: [],
  });

  // Compute derived data
  const medals = medalData?.medals || FALLBACK_TALLY;
  const nedMedals = medalData?.nedMedals || FALLBACK_NED;
  const completedEvents = useMemo(
    () => events.filter((e) => e.status === "completed").length,
    [events]
  );

  // Find next upcoming or live event
  const nextEvent = useMemo(
    () =>
      events.find((e) => e.status === "live") ||
      events.find((e) => e.status === "upcoming") ||
      null,
    [events]
  );

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
