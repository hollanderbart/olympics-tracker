import { NextResponse } from "next/server";
import { MEDAL_CHANCES_API_URL } from "../../../lib/constants";

export const runtime = "nodejs";

export async function GET() {
  const now = new Date().toISOString();
  try {
    const res = await fetch(MEDAL_CHANCES_API_URL, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-cache",
    });

    if (!res.ok) {
      return NextResponse.json(
        { data: [], lastUpdated: now, error: "Failed to fetch medal chances." },
        { status: 502 }
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
      .filter((item: any) => item.disciplinId && item.chance);

    return NextResponse.json({ data: items, lastUpdated: now });
  } catch (error) {
    return NextResponse.json(
      {
        data: [],
        lastUpdated: now,
        error: "Could not fetch medal chances. Will retry shortly.",
      },
      { status: 500 }
    );
  }
}
