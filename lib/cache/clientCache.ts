const CACHE_SCHEMA_VERSION = 1;

type CacheEnvelope<T> = {
  data: T;
  savedAt: string;
  source: string;
  schemaVersion: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function saveClientCache<T>(
  key: string,
  data: T,
  source: string
): void {
  if (!isBrowser()) return;
  const payload: CacheEnvelope<T> = {
    data,
    savedAt: new Date().toISOString(),
    source,
    schemaVersion: CACHE_SCHEMA_VERSION,
  };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage errors.
  }
}

export function loadClientCache<T>(
  key: string
): (CacheEnvelope<T> & { cacheAgeSeconds: number }) | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.schemaVersion !== CACHE_SCHEMA_VERSION ||
      !parsed.savedAt
    ) {
      return null;
    }
    const savedAtMs = new Date(parsed.savedAt).getTime();
    if (!Number.isFinite(savedAtMs)) return null;
    const cacheAgeSeconds = Math.max(
      0,
      Math.floor((Date.now() - savedAtMs) / 1000)
    );
    return { ...parsed, cacheAgeSeconds };
  } catch {
    return null;
  }
}

export function clearClientCache(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }
}

export const CLIENT_CACHE_KEYS = {
  medals: "medals_cache_v1",
  events: "events_cache_v1",
} as const;
