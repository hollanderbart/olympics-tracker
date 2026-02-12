"use client";

import { useState, useEffect, useMemo } from "react";
import { List, type RowComponentProps } from "react-window";
import { DutchEvent } from "@/lib/types";
import { formatDate, getCountdown, isToday } from "./utils";

const FAVORITES_STORAGE_KEY = "favorite_event_ids_v1";
const VIRTUALIZATION_THRESHOLD = 30;
const EVENT_ROW_HEIGHT = 112;
const DATE_HEADER_HEIGHT = 38;
const VIRTUAL_LIST_HEIGHT = 620;
type VirtualItem =
  | { kind: "date"; date: string; today: boolean }
  | { kind: "event"; event: DutchEvent };
type VirtualRowProps = {
  items: VirtualItem[];
  nextEventId: string | null;
  favoriteIds: Set<string>;
  onToggleFavorite: (eventId: string) => void;
};

function VirtualRow({
  index,
  style,
  items,
  nextEventId,
  favoriteIds,
  onToggleFavorite,
}: RowComponentProps<VirtualRowProps>) {
  const item = items[index];
  if (!item) return null;

  if (item.kind === "date") {
    return (
      <div style={style}>
        <div
          className="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.06]"
          style={{
            background: item.today ? "rgba(255,102,0,0.06)" : "rgba(255,255,255,0.03)",
          }}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              item.today ? "text-oranje" : "text-white/50"
            }`}
          >
            {formatDate(item.date)}
          </span>
          {item.today && (
            <span className="text-[10px] font-bold text-oranje bg-oranje/15 px-2 py-0.5 rounded">
              VANDAAG
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={style}>
      <EventRow
        event={item.event}
        isNext={item.event.id === nextEventId && item.event.status !== "live"}
        isFavorite={favoriteIds.has(item.event.id)}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}

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
  isFavorite,
  onToggleFavorite,
}: {
  event: DutchEvent;
  isNext: boolean;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
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
          <button
            type="button"
            onClick={() => onToggleFavorite(event.id)}
            aria-label={
              isFavorite ? "Verwijder uit favorieten" : "Toevoegen aan favorieten"
            }
            className={`text-base transition-colors ${
              isFavorite ? "text-[#ffd44d]" : "text-white/35 hover:text-white/70"
            }`}
            title={isFavorite ? "Favoriet" : "Markeer als favoriet"}
          >
            {isFavorite ? "★" : "☆"}
          </button>
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
  emptyStateMessage,
}: {
  events: DutchEvent[];
  nextEventId: string | null;
  emptyStateMessage?: string;
}) {
  const [selectedSport, setSelectedSport] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "live" | "upcoming" | "completed"
  >("upcoming");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(new Set(parsed.filter((id) => typeof id === "string")));
      }
    } catch {
      // Ignore malformed local storage payload.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favoriteIds)));
  }, [favoriteIds]);

  const sports = useMemo(() => [...new Set(events.map((e) => e.sport))], [events]);

  const toggleFavorite = (eventId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (statusFilter === "live" && e.status !== "live") return false;
        if (statusFilter === "upcoming" && e.status !== "upcoming" && e.status !== "live") {
          return false;
        }
        if (statusFilter === "completed" && e.status !== "completed") return false;
        if (selectedSport !== "all" && e.sport !== selectedSport) return false;
        if (favoritesOnly && !favoriteIds.has(e.id)) return false;
        return true;
      }),
    [events, statusFilter, selectedSport, favoritesOnly, favoriteIds]
  );

  const groupedEntries = useMemo(() => {
    const grouped: Record<string, DutchEvent[]> = {};
    filtered.forEach((e) => {
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push(e);
    });
    return Object.entries(grouped);
  }, [filtered]);

  const virtualItems = useMemo<VirtualItem[]>(
    () =>
      groupedEntries.flatMap(([date, dateEvents]) => [
        { kind: "date" as const, date, today: isToday(date) },
        ...dateEvents.map((event) => ({ kind: "event" as const, event })),
      ]),
    [groupedEntries]
  );

  const shouldVirtualize = filtered.length > VIRTUALIZATION_THRESHOLD;
  const getItemSize = (index: number) =>
    virtualItems[index]?.kind === "date" ? DATE_HEADER_HEIGHT : EVENT_ROW_HEIGHT;

  return (
    <>
      {/* Filter Bar */}
      <section className="animate-slide-up-3 max-w-[720px] mx-auto mt-6 px-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base font-bold text-white/90">Programma</h2>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "upcoming", "live", "completed"].map((f) => {
              const label =
                f === "all"
                  ? "Alle statussen"
                  : f === "upcoming"
                  ? "Komend"
                  : f === "live"
                  ? "Live"
                  : f === "completed"
                  ? "Afgelopen"
                  : f;
              return (
                <button
                  key={f}
                  onClick={() =>
                    setStatusFilter(f as "all" | "live" | "upcoming" | "completed")
                  }
                  className={`filter-btn px-3 py-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer ${
                    statusFilter === f ? "active" : "bg-white/[0.04] text-white/45"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {["all", ...sports].map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`filter-btn px-3 py-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer ${
                selectedSport === sport ? "active" : "bg-white/[0.04] text-white/45"
              }`}
            >
              {sport === "all" ? "Alle sporten" : sport}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFavoritesOnly((prev) => !prev)}
            className={`filter-btn px-3 py-1.5 rounded-lg border-none text-xs font-semibold cursor-pointer ${
              favoritesOnly ? "active" : "bg-white/[0.04] text-white/45"
            }`}
          >
            {favoritesOnly ? "★ Alleen favorieten" : "☆ Alleen favorieten"}
          </button>
        </div>
      </section>

      {/* Events */}
      <section className="max-w-[720px] mx-auto px-6 pb-20">
        <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
          {shouldVirtualize ? (
            <List
              style={{
                height: Math.min(
                VIRTUAL_LIST_HEIGHT,
                virtualItems.reduce((total, _item, index) => total + getItemSize(index), 0)
                ),
              }}
              rowCount={virtualItems.length}
              rowHeight={(index) => getItemSize(index)}
              rowComponent={VirtualRow}
              rowProps={{
                items: virtualItems,
                nextEventId,
                favoriteIds,
                onToggleFavorite: toggleFavorite,
              }}
            >
              {null}
            </List>
          ) : (
            groupedEntries.map(([date, dateEvents]) => {
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
                      isFavorite={favoriteIds.has(event.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              );
            })
          )}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-white/30 text-sm">
              {events.length === 0
                ? (emptyStateMessage ?? "Geen evenementen gevonden voor dit land.")
                : "Geen evenementen gevonden voor dit filter."}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
