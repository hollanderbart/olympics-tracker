import { NextResponse } from "next/server";
import { fetchMedalTally } from "@/lib/olympics";

export const runtime = "edge";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function GET() {
  const data = await fetchMedalTally();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
