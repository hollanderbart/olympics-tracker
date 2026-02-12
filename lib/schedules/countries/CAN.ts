import { CountrySchedule } from "@/lib/schedules/types";

export const CAN_SCHEDULE: CountrySchedule = {
  noc: "CAN",
  name: "Canada",
  events: [
    {
      id: "can-frs-mmoguls",
      sport: "Freestyle Skiing",
      sportIcon: "🎿",
      event: "Mannen Moguls",
      date: "2026-02-12",
      time: "12:00",
      venue: "Livigno Snow Park",
      athletes: ["Mikael Kingsbury"],
    },
    {
      id: "can-frs-wslopestyle",
      sport: "Freestyle Skiing",
      sportIcon: "🎿",
      event: "Vrouwen Freeski Slopestyle",
      date: "2026-02-09",
      time: "11:30",
      venue: "Livigno Snow Park",
      athletes: ["Megan Oldham"],
    },
    {
      id: "can-stk-mixed",
      sport: "Short Track",
      sportIcon: "⛸️",
      event: "Mixed Team Relay",
      date: "2026-02-10",
      time: "18:00",
      venue: "Milano Ice Arena",
      athletes: ["Canada"],
    },
    {
      id: "can-fsk-icedance",
      sport: "Figure Skating",
      sportIcon: "⛸️",
      event: "Ice Dance",
      date: "2026-02-11",
      time: "19:00",
      venue: "Milano Ice Arena",
      athletes: ["Piper Gilles", "Paul Poirier"],
    },
  ],
};
