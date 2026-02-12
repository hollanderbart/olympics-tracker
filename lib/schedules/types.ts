export interface StaticCountryEvent {
  id: string;
  sport: string;
  sportIcon: string;
  event: string;
  date: string;
  time: string;
  venue: string;
  athletes: string[];
}

export interface CountrySchedule {
  noc: string;
  name: string;
  events: StaticCountryEvent[];
}
