import { CountrySchedule } from "@/lib/schedules/types";

export const JPN_SCHEDULE: CountrySchedule = {
  noc: "JPN",
  name: "Japan",
  events: [
    {
      id: "jpn-sbd-mba",
      sport: "Snowboard",
      sportIcon: "🏂",
      event: "Mannen Snowboard Big Air",
      date: "2026-02-07",
      time: "20:00",
      venue: "Livigno Snow Park",
      athletes: ["Kira Kimura", "Ryoma Kimata"],
    },
    {
      id: "jpn-sbd-wba",
      sport: "Snowboard",
      sportIcon: "🏂",
      event: "Vrouwen Snowboard Big Air",
      date: "2026-02-09",
      time: "20:00",
      venue: "Livigno Snow Park",
      athletes: ["Kokomo Murase"],
    },
    {
      id: "jpn-sjp-wnh",
      sport: "Ski Jumping",
      sportIcon: "🪽",
      event: "Vrouwen NH Individual",
      date: "2026-02-07",
      time: "16:30",
      venue: "Predazzo",
      athletes: ["Nozomi Maruyama"],
    },
    {
      id: "jpn-fsk-team",
      sport: "Figure Skating",
      sportIcon: "⛸️",
      event: "Team Event",
      date: "2026-02-08",
      time: "13:00",
      venue: "Milano Ice Arena",
      athletes: ["Japan"],
    },
  ],
};
