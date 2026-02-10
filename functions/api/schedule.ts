import { DUTCH_EVENTS } from "../../lib/constants";
import { DutchEvent } from "../../lib/types";

interface Env {
  ASSETS: { fetch: typeof fetch };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const now = new Date();
  const events = getDutchEvents(now);

  return new Response(
    JSON.stringify({
      events,
      lastUpdated: new Date().toISOString(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
};

function getDutchEvents(now: Date): DutchEvent[] {
  return DUTCH_EVENTS.map((event) => {
    const eventStart = new Date(`${event.date}T${event.time}:00+01:00`);
    const eventEnd = new Date(eventStart.getTime() + 3 * 60 * 60 * 1000);

    let status: DutchEvent["status"] = "upcoming";
    if (now >= eventEnd) {
      status = "completed";
    } else if (now >= eventStart && now < eventEnd) {
      status = "live";
    }

    return {
      ...event,
      status,
    };
  });
}
