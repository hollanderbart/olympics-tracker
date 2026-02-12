"use client";

import { GAMES_INFO } from "@/lib/constants";

export default function Header({
  completedEvents,
  totalEvents,
}: {
  completedEvents: number;
  totalEvents: number;
}) {
  return (
    <header className="animate-slide-up pt-8 px-6 max-w-[720px] mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">🇳🇱</span>
        <div>
          <div className="text-[11px] font-bold tracking-[3px] uppercase text-oranje mb-0.5">
            Nederland
          </div>
          <h1
            className="text-[26px] font-extrabold leading-tight bg-gradient-to-br from-white to-white/70 bg-clip-text"
            style={{
              WebkitTextFillColor: "transparent",
              fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
            }}
          >
            {GAMES_INFO.name}
          </h1>
        </div>
      </div>
      <p className="text-[13px] text-white/35 font-medium mt-1 ml-[42px]">
        {GAMES_INFO.location} · 6–22 februari 2026 · {completedEvents} van{" "}
        {totalEvents} NL-evenementen voltooid
      </p>
    </header>
  );
}
