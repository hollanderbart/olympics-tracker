import { CountrySchedule } from "@/lib/schedules/types";

export const SWE_SCHEDULE: CountrySchedule = {
  noc: "SWE",
  name: "Sweden",
  events: [
    {
      id: "swe-ccs-wskiathlon",
      sport: "Cross-Country Skiing",
      sportIcon: "🎿",
      event: "Vrouwen Skiathlon",
      date: "2026-02-07",
      time: "12:30",
      venue: "Val di Fiemme",
      athletes: ["Frida Karlsson", "Ebba Andersson"],
    },
    {
      id: "swe-ccs-wsprint",
      sport: "Cross-Country Skiing",
      sportIcon: "🎿",
      event: "Vrouwen Sprint Classic",
      date: "2026-02-10",
      time: "15:30",
      venue: "Val di Fiemme",
      athletes: ["Linn Svahn"],
    },
    {
      id: "swe-ccs-w10km",
      sport: "Cross-Country Skiing",
      sportIcon: "🎿",
      event: "Vrouwen 10km Interval Start",
      date: "2026-02-12",
      time: "14:00",
      venue: "Val di Fiemme",
      athletes: ["Frida Karlsson", "Ebba Andersson"],
    },
  ],
};
