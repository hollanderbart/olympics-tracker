"use client";

export default function NextEventHighlightSkeleton() {
  return (
    <section className="animate-slide-up-2 max-w-[720px] mx-auto mt-5 px-6" aria-label="Volgende wedstrijd wordt geladen">
      <div
        className="rounded-xl p-4 animate-pulse"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="w-32 h-3 rounded bg-white/10" />
          <div className="w-20 h-3 rounded bg-white/10" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/10" />
          <div className="flex-1">
            <div className="w-48 h-4 rounded bg-white/10" />
            <div className="w-56 h-3 rounded bg-white/10 mt-2" />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="w-20 h-6 rounded bg-white/10" />
          <div className="w-24 h-6 rounded bg-white/10" />
          <div className="w-16 h-6 rounded bg-white/10" />
        </div>
      </div>
    </section>
  );
}
