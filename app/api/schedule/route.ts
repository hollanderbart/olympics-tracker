import { NextResponse } from "next/server";
import { getDutchEvents } from "@/lib/olympics";

export const runtime = "edge";

export async function GET() {
  const events = getDutchEvents();
  return NextResponse.json(
    { events, lastUpdated: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
