"use client";

import { useState, useEffect } from "react";
import { DutchEvent } from "@/lib/types";
import { formatDate, getCountdown, isToday } from "./utils";

function StatusBadge({ status }: { status: DutchEvent["status"] }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide uppercase animate-pulse-live">
        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
        Live
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 bg-white/[0.08] text-white/45 text-[11px] font-semibold px-2.5 py-0.5 rounded-full tracking-wider">
        Afgelopen
      </span>
    );
  }
  return null;
}

function EventRow({
  event,
  isNext,
}: {
  event: DutchEvent;
  isNext: boolean;
}) {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (event.status === "completed") return;
    const update = () => setCountdown(getCountdown(event.date, event.time));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [event.date, event.time, event.status]);

  const isLive = event.status === "live";
  const isCompleted = event.status === "completed";
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

  let rowClass = "event-row";
  if (isLive) rowClass += " is-live";
  else if (isNext) rowClass += " is-next";
  if (isCompleted) rowClass += " is-completed";

  return (
    <div
      className={rowClass}
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        borderLeft: isLive
          ? "3px solid #ff2d2d"
          : isNext
          ? "3px solid #FF6600"
          : "3px solid transparent",
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <span className="text-[22px]">{event.sportIcon}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">{event.event}</span>
              <StatusBadge status={event.status} />
            </div>
            <span className="text-xs text-white/40 font-medium">
              {event.sport} · {event.venue}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-[13px] text-white/50 font-semibold tabular-nums">
            {event.time} CET
          </span>
          {event.medalChance && (
            <span
              className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${chanceStyle}`}
              title={`Medaillekans: ${event.medalChance.label}`}
            >
              {event.medalChance.label}
            </span>
          )}
          {!isCompleted && countdown && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md tabular-nums min-w-[80px] text-center ${
                isLive
                  ? "text-red-400 bg-red-500/10"
                  : "text-oranje bg-oranje/10"
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {countdown}
            </span>
          )}
          {isCompleted && event.result && (
            <span className="text-xs text-white/30 italic">{event.result}</span>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 mt-2 ml-[34px] flex-wrap">
        {event.athletes.map((a, i) => (
          <span
            key={i}
            className="text-[11px] text-white/55 font-medium bg-white/[0.06] px-2 py-0.5 rounded"
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function EventList({
  events,
  nextEventId,
}: {
  events: DutchEvent[];
  nextEventId: string | null;
}) {
  const [filter, setFilter] = useState("upcoming");

  const sports = [...new Set(events.map((e) => e.sport))];

  const filtered = events.filter((e) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return e.status === "upcoming" || e.status === "live";
    if (filter === "completed") return e.status === "completed";
    return e.sport === filter;
  });

  // Group by date
  const grouped: Record<string, DutchEvent[]> = {};
  filtered.forEach((e) => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  return (
    <>
      {/* Filter Bar */}
      <section className="animate-slide-up-3 max-w-[720px] mx-auto mt-6 px-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base font-bold text-white/90">Programma</h2>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "upcoming", "completed", ...sports].map((f) => {
              const label =
                f === "all"
                  ? "Alles"
                  : f === "upcoming"
                  ? "Komend"
                  : f === "completed"
                  ? "Afgelopen"
                  : f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-btn px-3 py-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer ${
                    filter === f ? "active" : "bg-white/[0.04] text-white/45"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="max-w-[720px] mx-auto px-6 pb-20">
        <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
          {Object.entries(grouped).map(([date, dateEvents]) => {
            const today = isToday(date);
            return (
              <div key={date}>
                <div
                  className="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.06]"
                  style={{
                    background: today ? "rgba(255,102,0,0.06)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      today ? "text-oranje" : "text-white/50"
                    }`}
                  >
                    {formatDate(date)}
                  </span>
                  {today && (
                    <span className="text-[10px] font-bold text-oranje bg-oranje/15 px-2 py-0.5 rounded">
                      VANDAAG
                    </span>
                  )}
                </div>
                {dateEvents.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    isNext={event.id === nextEventId && event.status !== "live"}
                  />
                ))}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-white/30 text-sm">
              Geen evenementen gevonden voor dit filter.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
