"use client";

import { useMemo } from "react";
import { List, type RowComponentProps } from "react-window";
import { CountryMedals } from "@/lib/types";

const VIRTUALIZATION_THRESHOLD = 30;
const TALLY_ROW_HEIGHT = 42;
const VIRTUAL_LIST_HEIGHT = 520;
type VirtualRowProps = {
  items: CountryMedals[];
};

function TallyRow({
  entry,
  rank,
  isNED,
}: {
  entry: CountryMedals;
  rank: number;
  isNED: boolean;
}) {
  return (
    <div
      className={`tally-row grid items-center py-2 px-3 gap-2 text-[13px] border-b border-white/[0.04] ${
        isNED ? "is-ned" : ""
      }`}
      style={{ gridTemplateColumns: "28px 24px 1fr 40px 40px 40px 44px" }}
    >
      <span className="text-white/35 font-semibold text-center tabular-nums">
        {rank}
      </span>
      <span className="text-base">{entry.flag}</span>
      <span
        className={`${isNED ? "text-oranje font-bold" : "text-white/85 font-medium"}`}
      >
        {entry.name}
      </span>
      <span className="text-[#FFD700] font-bold text-center tabular-nums">
        {entry.medals.gold}
      </span>
      <span className="text-[#C0C0C0] font-semibold text-center tabular-nums">
        {entry.medals.silver}
      </span>
      <span className="text-[#CD7F32] font-semibold text-center tabular-nums">
        {entry.medals.bronze}
      </span>
      <span className="text-white/70 font-bold text-center tabular-nums">
        {entry.medals.total}
      </span>
    </div>
  );
}

export default function MedalTally({ medals }: { medals: CountryMedals[] }) {
  // Sort: gold desc, then silver, then bronze
  const sorted = useMemo(
    () =>
      [...medals]
        .filter((m) => m.medals.total > 0 || m.noc === "NED")
        .sort(
          (a, b) =>
            b.medals.gold - a.medals.gold ||
            b.medals.silver - a.medals.silver ||
            b.medals.bronze - a.medals.bronze
        ),
    [medals]
  );
  const shouldVirtualize = sorted.length > VIRTUALIZATION_THRESHOLD;

  const VirtualRow = ({ index, style, items }: RowComponentProps<VirtualRowProps>) => {
    const entry = items[index];
    if (!entry) return null;
    return (
      <div style={style}>
        <TallyRow entry={entry} rank={index + 1} isNED={entry.noc === "NED"} />
      </div>
    );
  };

  return (
    <section className="max-w-[720px] mx-auto mt-3 px-6 animate-slide-up">
      <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.02]">
        {/* Header */}
        <div
          className="grid items-center py-2 px-3 gap-2 border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-white/30"
          style={{ gridTemplateColumns: "28px 24px 1fr 40px 40px 40px 44px" }}
        >
          <span className="text-center">#</span>
          <span />
          <span>Land</span>
          <span className="text-center text-[#FFD700]">🥇</span>
          <span className="text-center text-[#C0C0C0]">🥈</span>
          <span className="text-center text-[#CD7F32]">🥉</span>
          <span className="text-center">Tot</span>
        </div>
        {shouldVirtualize ? (
          <List
            style={{ height: Math.min(VIRTUAL_LIST_HEIGHT, sorted.length * TALLY_ROW_HEIGHT) }}
            rowCount={sorted.length}
            rowHeight={TALLY_ROW_HEIGHT}
            rowComponent={VirtualRow}
            rowProps={{ items: sorted }}
          >
            {null}
          </List>
        ) : (
          sorted.map((entry, i) => (
            <TallyRow
              key={entry.noc}
              entry={entry}
              rank={i + 1}
              isNED={entry.noc === "NED"}
            />
          ))
        )}
        {sorted.length === 0 && (
          <div className="p-8 text-center text-white/30 text-sm">
            Nog geen medailles uitgereikt.
          </div>
        )}
      </div>
    </section>
  );
}
