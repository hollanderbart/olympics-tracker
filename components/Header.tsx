"use client";

import { GAMES_INFO } from "@/lib/constants";

export default function Header({
  selectedCountryName,
  selectedCountryFlag,
  selectedCountryNoc,
  countryOptions,
  onCountryChange,
  completedEvents,
  totalEvents,
}: {
  selectedCountryName: string;
  selectedCountryFlag: string;
  selectedCountryNoc: string;
  countryOptions: Array<{ noc: string; name: string }>;
  onCountryChange: (noc: string) => void;
  completedEvents: number;
  totalEvents: number;
}) {
  return (
    <header className="animate-slide-up pt-8 px-6 max-w-[720px] mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{selectedCountryFlag}</span>
        <div>
          <div className="text-[11px] font-bold tracking-[3px] uppercase text-oranje mb-0.5">
            {selectedCountryName}
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
      <div className="mt-2 ml-[42px] flex items-center gap-3 flex-wrap">
        <p className="text-[13px] text-white/35 font-medium">
          {GAMES_INFO.location} · 6–22 februari 2026 · {completedEvents} van{" "}
          {totalEvents} evenementen voltooid
        </p>
        <label className="text-[11px] text-white/45 font-semibold uppercase tracking-[1.5px]">
          favoriete land
          <select
            aria-label="Kies favoriete land"
            className="ml-2 bg-white/[0.06] border border-white/[0.12] text-white text-xs rounded-md px-2 py-1"
            value={selectedCountryNoc}
            onChange={(event) => onCountryChange(event.target.value)}
          >
            {countryOptions.map((option) => (
              <option key={option.noc} value={option.noc} className="text-black">
                {option.name} ({option.noc})
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
