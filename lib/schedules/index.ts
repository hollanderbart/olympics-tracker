import { CountrySchedule } from "@/lib/schedules/types";
import { CAN_SCHEDULE } from "@/lib/schedules/countries/CAN";
import { FRA_SCHEDULE } from "@/lib/schedules/countries/FRA";
import { GER_SCHEDULE } from "@/lib/schedules/countries/GER";
import { ITA_SCHEDULE } from "@/lib/schedules/countries/ITA";
import { JPN_SCHEDULE } from "@/lib/schedules/countries/JPN";
import { NED_SCHEDULE } from "@/lib/schedules/countries/NED";
import { NOR_SCHEDULE } from "@/lib/schedules/countries/NOR";
import { SWE_SCHEDULE } from "@/lib/schedules/countries/SWE";
import { USA_SCHEDULE } from "@/lib/schedules/countries/USA";

const COUNTRY_SCHEDULE_LIST: CountrySchedule[] = [
  NED_SCHEDULE,
  USA_SCHEDULE,
  NOR_SCHEDULE,
  ITA_SCHEDULE,
  GER_SCHEDULE,
  SWE_SCHEDULE,
  FRA_SCHEDULE,
  JPN_SCHEDULE,
  CAN_SCHEDULE,
];

export const COUNTRY_SCHEDULES: Record<string, CountrySchedule> =
  COUNTRY_SCHEDULE_LIST.reduce((acc, schedule) => {
    acc[schedule.noc] = schedule;
    return acc;
  }, {} as Record<string, CountrySchedule>);

export const SCHEDULE_COUNTRIES = COUNTRY_SCHEDULE_LIST.map((schedule) => ({
  noc: schedule.noc,
  name: schedule.name,
}));

export function getStaticScheduleByNoc(noc: string): CountrySchedule | null {
  const normalizedNoc = String(noc || "").toUpperCase();
  return COUNTRY_SCHEDULES[normalizedNoc] || null;
}
