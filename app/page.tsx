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

// Empty fallback for Netherlands when no data available
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
  });

  // Fetch schedule data with TanStack Query
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: getDutchEvents,
    refetchInterval: 30_000, // Refetch every 30 seconds
  });

  // Compute derived data
  const hasError = medalData?.error;
  const medals = medalData?.medals || [];
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

      {hasError && (
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

      <MedalOverview
        nedMedals={nedMedals}
        onToggleTally={() => setShowTally(!showTally)}
        showTally={showTally}
      />
      {showTally && medals.length > 0 && <MedalTally medals={medals} />}
      <NextEventHighlight event={nextEvent} />
      <EventList events={events} nextEventId={nextEvent?.id || null} />
      <Footer />
    </div>
  );
}
