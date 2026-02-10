"use client";

import { CountryMedals } from "@/lib/types";

function MedalRing({
  type,
  count,
}: {
  type: "gold" | "silver" | "bronze";
  count: number;
}) {
  const styles = {
    gold: {
      bg: "linear-gradient(145deg, #FFD700, #FFA500)",
      shadow: "0 4px 20px rgba(255,215,0,0.35)",
      text: "#1a1200",
    },
    silver: {
      bg: "linear-gradient(145deg, #E8E8E8, #A8A8A8)",
      shadow: "0 4px 20px rgba(200,200,200,0.3)",
      text: "#1a1a1a",
    },
    bronze: {
      bg: "linear-gradient(145deg, #CD7F32, #8B5A2B)",
      shadow: "0 4px 20px rgba(205,127,50,0.3)",
      text: "#fff",
    },
  };
  const s = styles[type];
  const label = type === "gold" ? "Goud" : type === "silver" ? "Zilver" : "Brons";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="medal-ring w-20 h-20 rounded-full flex items-center justify-center text-[32px] font-extrabold cursor-default"
        style={{
          background: s.bg,
          boxShadow: s.shadow,
          color: s.text,
          fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
        }}
      >
        {count}
      </div>
      <span className="text-xs font-semibold text-white/50 uppercase tracking-[1.5px]">
        {label}
      </span>
    </div>
  );
}

export default function MedalOverview({
  nedMedals,
  onToggleTally,
  showTally,
}: {
  nedMedals: CountryMedals;
  onToggleTally: () => void;
  showTally: boolean;
}) {
  const total = nedMedals.medals.gold + nedMedals.medals.silver + nedMedals.medals.bronze;

  return (
    <section className="animate-slide-up-1 max-w-[720px] mx-auto mt-7 px-6">
      <div
        className="relative overflow-hidden rounded-2xl p-7"
        style={{
          background: "linear-gradient(135deg, rgba(255,102,0,0.08), rgba(255,60,0,0.03))",
          border: "1px solid rgba(255,102,0,0.15)",
        }}
      >
        {/* Shimmer accent */}
        <div className="shimmer-top absolute top-0 left-0 right-0 h-0.5" />

        <div className="flex items-center justify-between flex-wrap gap-5">
          <div className="flex gap-6">
            <MedalRing type="gold" count={nedMedals.medals.gold} />
            <MedalRing type="silver" count={nedMedals.medals.silver} />
            <MedalRing type="bronze" count={nedMedals.medals.bronze} />
          </div>
          <div className="text-right">
            <div
              className="text-[44px] font-extrabold text-oranje leading-none"
              style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif" }}
            >
              {total}
            </div>
            <div className="text-xs text-white/40 font-semibold uppercase tracking-wider">
              Totaal medailles
            </div>
            <button
              onClick={onToggleTally}
              className="mt-2 text-xs text-white/50 font-medium underline decoration-white/20 underline-offset-[3px] hover:text-oranje transition-colors"
            >
              {showTally ? "Verberg medaillespiegel ↑" : "Bekijk medaillespiegel ↓"}
            </button>
          </div>
        </div>

        {total === 0 && (
          <div
            className="mt-5 p-3 rounded-xl text-[13px] text-white/50 leading-relaxed"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderLeft: "3px solid rgba(255,102,0,0.3)",
            }}
          >
            🏁 De schaatsevementen zijn begonnen — De eerste grote kans voor
            Nederland op medailles! Houd de updates in de gaten.
          </div>
        )}
      </div>
    </section>
  );
}
