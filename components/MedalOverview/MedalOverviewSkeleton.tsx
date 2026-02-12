"use client";

export default function MedalOverviewSkeleton() {
  return (
    <section className="animate-slide-up-1 max-w-[720px] mx-auto mt-7 px-6" aria-label="Medailleoverzicht wordt geladen">
      <div
        className="relative overflow-hidden rounded-2xl p-7 animate-pulse"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-5">
          <div className="flex gap-6">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full bg-white/10" />
                <div className="w-12 h-3 rounded bg-white/10" />
              </div>
            ))}
          </div>
          <div className="text-right">
            <div className="w-16 h-10 rounded bg-white/10 ml-auto" />
            <div className="w-28 h-3 rounded bg-white/10 mt-2 ml-auto" />
            <div className="w-36 h-3 rounded bg-white/10 mt-3 ml-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
