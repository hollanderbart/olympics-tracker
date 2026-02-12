"use client";

export default function EventListSkeleton() {
  return (
    <>
      <section className="animate-slide-up-3 max-w-[720px] mx-auto mt-6 px-6" aria-label="Programmafilters worden geladen">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2 animate-pulse">
          <div className="w-24 h-5 rounded bg-white/10" />
          <div className="flex gap-2">
            <div className="w-14 h-8 rounded-lg bg-white/10" />
            <div className="w-16 h-8 rounded-lg bg-white/10" />
            <div className="w-20 h-8 rounded-lg bg-white/10" />
          </div>
        </div>
      </section>

      <section className="max-w-[720px] mx-auto px-6 pb-20" aria-label="Programma wordt geladen">
        <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01] animate-pulse">
          {[0, 1, 2].map((row) => (
            <div key={row} className="px-5 py-4 border-b border-white/[0.05]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-white/10" />
                  <div>
                    <div className="w-44 h-4 rounded bg-white/10" />
                    <div className="w-36 h-3 rounded bg-white/10 mt-2" />
                  </div>
                </div>
                <div className="w-16 h-3 rounded bg-white/10" />
              </div>
              <div className="flex gap-2 mt-3 ml-10">
                <div className="w-24 h-5 rounded bg-white/10" />
                <div className="w-20 h-5 rounded bg-white/10" />
                <div className="w-16 h-5 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
