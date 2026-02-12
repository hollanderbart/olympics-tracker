import { MEDAL_CHANCES_API_URL } from "../../lib/constants";

type MedalChanceItem = {
  disciplinId: string;
  chance: string;
  firstname: string;
  lastname: string;
};

type MedalChanceResponse = {
  data: MedalChanceItem[];
  lastUpdated: string;
  error?: string;
};

export const onRequestGet = async () => {
  const now = new Date().toISOString();

  try {
    const res = await fetch(MEDAL_CHANCES_API_URL, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-cache",
    });

    if (!res.ok) {
      return jsonResponse(
        { data: [], lastUpdated: now, error: "Failed to fetch medal chances." },
        502
      );
    }

    const data = await res.json();
    const athletes = Array.isArray(data?.athletes) ? data.athletes : [];

    const items = athletes
      .filter((athlete: any) => (athlete?.country || "").toLowerCase() === "ned")
      .map((athlete: any) => ({
        disciplinId: String(athlete?.disciplin_id || ""),
        chance: String(athlete?.chance || "").trim(),
        firstname: String(athlete?.firstname || "").trim(),
        lastname: String(athlete?.lastname || "").trim(),
      }))
      .filter((item: MedalChanceItem) => item.disciplinId && item.chance);

    return jsonResponse({ data: items, lastUpdated: now }, 200);
  } catch (error) {
    return jsonResponse(
      {
        data: [],
        lastUpdated: now,
        error: "Could not fetch medal chances. Will retry shortly.",
      },
      500
    );
  }
};

function jsonResponse(payload: MedalChanceResponse, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
