"use client";

import { useEffect, useState } from "react";
import { DutchEvent } from "@/lib/types";
import { formatDate, getCountdown } from "@/components/utils";

export default function TodayForNL({
  nextEvent,
  latestMedalUpdate,
  lastUpdated,
}: {
  nextEvent: DutchEvent | null;
  latestMedalUpdate?: string | null;
  lastUpdated?: string;
}) {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!nextEvent || nextEvent.status === "completed") {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      setCountdown(getCountdown(nextEvent.date, nextEvent.time));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  return (
    <section className="max-w-[720px] mx-auto mt-4 px-6">
      <div
        className="rounded-xl p-4"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="text-[11px] font-bold uppercase tracking-[2px] text-oranje mb-2">
          Vandaag voor Team NL
        </div>

        {nextEvent ? (
          <div className="text-sm text-white/85">
            <span className="font-semibold">{nextEvent.event}</span>
            <span className="text-white/55">
              {" "}
              · {formatDate(nextEvent.date)} {nextEvent.time} CET
            </span>
            <span className="ml-2 text-oranje font-semibold">
              {nextEvent.status === "live" ? "Nu live" : countdown ? `over ${countdown}` : ""}
            </span>
          </div>
        ) : (
          <div className="text-sm text-white/55">Geen komende Team NL evenementen gevonden.</div>
        )}

        {latestMedalUpdate && (
          <div className="mt-2 text-xs text-white/70">
            Laatste medaille-update: {latestMedalUpdate}
          </div>
        )}

        {lastUpdated && (
          <div className="mt-2 text-[11px] text-white/45">
            Laatst bijgewerkt: {new Date(lastUpdated).toLocaleString("nl-NL")}
          </div>
        )}
      </div>
    </section>
  );
}
