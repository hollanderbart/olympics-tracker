import {
  DEFAULT_FAVORITE_COUNTRY_NOC,
  FAVORITE_COUNTRY_STORAGE_KEY,
} from "@/lib/constants";
import { FavoriteCountryNoc, FavoriteCountryPreference } from "@/lib/types";

function normalizeNoc(value: unknown): FavoriteCountryNoc | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) return null;
  return normalized;
}

export function getFavoriteCountryNoc(): FavoriteCountryNoc {
  if (typeof window === "undefined") return DEFAULT_FAVORITE_COUNTRY_NOC;

  try {
    const raw = window.localStorage.getItem(FAVORITE_COUNTRY_STORAGE_KEY);
    if (!raw) return DEFAULT_FAVORITE_COUNTRY_NOC;

    const parsed: unknown = JSON.parse(raw);
    const parsedNoc =
      typeof parsed === "string"
        ? normalizeNoc(parsed)
        : normalizeNoc((parsed as FavoriteCountryPreference | null)?.noc);
    return parsedNoc ?? DEFAULT_FAVORITE_COUNTRY_NOC;
  } catch {
    return DEFAULT_FAVORITE_COUNTRY_NOC;
  }
}

export function setFavoriteCountryNoc(noc: string): FavoriteCountryNoc {
  const normalized = normalizeNoc(noc) ?? DEFAULT_FAVORITE_COUNTRY_NOC;
  if (typeof window === "undefined") return normalized;

  const payload: FavoriteCountryPreference = {
    noc: normalized,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(
    FAVORITE_COUNTRY_STORAGE_KEY,
    JSON.stringify(payload)
  );
  return normalized;
}

export function isFavoriteCountryNoc(value: unknown): boolean {
  return normalizeNoc(value) !== null;
}
