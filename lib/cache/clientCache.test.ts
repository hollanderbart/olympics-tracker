import {
  clearClientCache,
  CLIENT_CACHE_KEYS,
  loadClientCache,
  saveClientCache,
} from "./clientCache";

describe("clientCache", () => {
  afterEach(() => {
    clearClientCache(CLIENT_CACHE_KEYS.medals);
    clearClientCache(CLIENT_CACHE_KEYS.events);
  });

  it("should save and load cache payload", () => {
    saveClientCache(CLIENT_CACHE_KEYS.medals, { hello: "world" }, "test");
    const loaded = loadClientCache<{ hello: string }>(CLIENT_CACHE_KEYS.medals);

    expect(loaded).toBeTruthy();
    expect(loaded?.data).toEqual({ hello: "world" });
    expect(loaded?.source).toBe("test");
    expect(typeof loaded?.cacheAgeSeconds).toBe("number");
  });

  it("should return null for invalid schema version", () => {
    localStorage.setItem(
      CLIENT_CACHE_KEYS.medals,
      JSON.stringify({
        data: { a: 1 },
        savedAt: new Date().toISOString(),
        source: "test",
        schemaVersion: 999,
      })
    );

    const loaded = loadClientCache(CLIENT_CACHE_KEYS.medals);
    expect(loaded).toBeNull();
  });

  it("should clear cache entry", () => {
    saveClientCache(CLIENT_CACHE_KEYS.events, { x: 1 }, "test");
    clearClientCache(CLIENT_CACHE_KEYS.events);
    expect(loadClientCache(CLIENT_CACHE_KEYS.events)).toBeNull();
  });
});
