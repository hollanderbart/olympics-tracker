"use client";

import { useState, useEffect } from "react";
import { DutchEvent } from "@/lib/types";
import { formatDate, getCountdown } from "./utils";

export default function NextEventHighlight({
  event,
}: {
  event: DutchEvent | null;
}) {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!event || event.status === "completed") return;
    const update = () => setCountdown(getCountdown(event.date, event.time));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) return null;

  const isLive = event.status === "live";
  const chanceScore = event.medalChance?.score;
  const chanceStyle =
    chanceScore === 5
      ? "bg-[#f7d46b]/10 text-[#f7d46b] border-[#f7d46b]/30"
      : chanceScore === 4
      ? "bg-[#cfd6df]/10 text-[#cfd6df] border-[#cfd6df]/30"
      : chanceScore === 3
      ? "bg-[#d4a373]/10 text-[#d4a373] border-[#d4a373]/30"
      : chanceScore === 2
      ? "bg-white/[0.04] text-white/55 border-white/[0.08]"
      : chanceScore === 1
      ? "bg-white/[0.02] text-white/40 border-white/[0.06]"
      : "bg-white/[0.06] text-white/70 border-white/[0.08]";

  return (
    <section className="animate-slide-up-2 max-w-[720px] mx-auto mt-5 px-6">
      <div
        className="rounded-xl p-4"
        style={{
          background: isLive
            ? "linear-gradient(135deg, rgba(255,45,45,0.1), rgba(255,100,0,0.06))"
            : "rgba(255,255,255,0.02)",
          border: isLive
            ? "1px solid rgba(255,45,45,0.2)"
            : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span
            className={`text-[11px] font-bold uppercase tracking-[2px] ${
              isLive ? "text-red-400 animate-pulse-live" : "text-white/35"
            }`}
          >
            {isLive ? "🔴 Nu live" : "⏱ Volgende wedstrijd"}
          </span>
          {isLive ? (
            <span className="text-[13px] font-bold text-red-400 animate-pulse-live">
              ● NU BEZIG
            </span>
          ) : (
            countdown && (
              <span
                className="text-sm font-bold text-oranje tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                over {countdown}
              </span>
            )
          )}
        </div>
        <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
          <span className="text-2xl">{event.sportIcon}</span>
          <div>
            <div className="text-base font-bold">{event.event}</div>
            <div className="text-xs text-white/45">
              {formatDate(event.date)} · {event.time} CET · {event.venue}
            </div>
          </div>
          {event.medalChance && (
            <span
              className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${chanceStyle}`}
              title={`Medaillekans: ${event.medalChance.label}`}
            >
              {event.medalChance.label}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {event.athletes.map((a, i) => (
            <span
              key={i}
              className="text-xs font-semibold text-oranje bg-oranje/10 px-2.5 py-1 rounded-md border border-oranje/20"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
