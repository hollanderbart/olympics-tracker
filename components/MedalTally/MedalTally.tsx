"use client";

import { useMemo } from "react";
import { List, type RowComponentProps } from "react-window";
import { CountryMedals, MedalWinner } from "@/lib/types";

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

export default function MedalTally({
  medals,
  highlightedNoc = "NED",
  winners = [],
  showWinnersList = false,
  onToggleWinnersList,
}: {
  medals: CountryMedals[];
  highlightedNoc?: string;
  winners?: MedalWinner[];
  showWinnersList?: boolean;
  onToggleWinnersList?: () => void;
}) {
  // Sort: gold desc, then silver, then bronze
  const sorted = useMemo(
    () =>
      [...medals]
        .filter((m) => m.medals.total > 0 || m.noc === highlightedNoc)
        .sort(
          (a, b) =>
            b.medals.gold - a.medals.gold ||
            b.medals.silver - a.medals.silver ||
            b.medals.bronze - a.medals.bronze
        ),
    [medals, highlightedNoc]
  );
  const hasEmbeddedWinnersControls = Boolean(onToggleWinnersList);
  const shouldVirtualize =
    sorted.length > VIRTUALIZATION_THRESHOLD && !hasEmbeddedWinnersControls;

  const VirtualRow = ({ index, style, items }: RowComponentProps<VirtualRowProps>) => {
    const entry = items[index];
    if (!entry) return null;
    return (
      <div style={style}>
        <TallyRow
          entry={entry}
          rank={index + 1}
          isNED={entry.noc === highlightedNoc}
        />
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
            <div key={entry.noc}>
              <TallyRow
                entry={entry}
                rank={i + 1}
                isNED={entry.noc === highlightedNoc}
              />
              {entry.noc === highlightedNoc && hasEmbeddedWinnersControls && (
                <div className="px-3 py-3 border-b border-white/[0.04] bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={onToggleWinnersList}
                    className="text-xs text-white/60 font-medium underline decoration-white/20 underline-offset-[3px] hover:text-oranje transition-colors"
                  >
                    {showWinnersList ? "Verberg winnaarslijst ↑" : "Bekijk winnaarslijst ↓"}
                  </button>

                  {showWinnersList && (
                    <div className="mt-3">
                      {winners.length === 0 ? (
                        <div className="text-xs text-white/45">
                          Geen medaillewinnaars beschikbaar voor deze selectie.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5 border border-white/[0.06] rounded-lg overflow-hidden">
                          {winners.map((winner) => (
                            <div key={winner.id} className="p-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-sm text-white font-semibold truncate flex items-center gap-1.5">
                                    <span aria-hidden="true">
                                      {(winner.medalType === "gold" && "🥇") ||
                                        (winner.medalType === "silver" && "🥈") ||
                                        "🥉"}
                                    </span>
                                    <span>{winner.competitorDisplayName}</span>
                                  </div>
                                  <div className="text-xs text-white/60 mt-0.5">
                                    {winner.eventDescription}
                                    {winner.date ? ` · ${winner.date}` : ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
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
