import {
  DEFAULT_FAVORITE_COUNTRY_NOC,
  FAVORITE_COUNTRY_STORAGE_KEY,
} from "@/lib/constants";
import {
  getFavoriteCountryNoc,
  isFavoriteCountryNoc,
  setFavoriteCountryNoc,
} from "./favoriteCountry";

describe("favoriteCountry preference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default NED when storage is empty", () => {
    expect(getFavoriteCountryNoc()).toBe(DEFAULT_FAVORITE_COUNTRY_NOC);
  });

  it("persists and returns selected NOC", () => {
    const saved = setFavoriteCountryNoc("usa");
    expect(saved).toBe("USA");
    expect(getFavoriteCountryNoc()).toBe("USA");
  });

  it("falls back to default for invalid payload", () => {
    localStorage.setItem(FAVORITE_COUNTRY_STORAGE_KEY, JSON.stringify({ noc: "@@@" }));
    expect(getFavoriteCountryNoc()).toBe(DEFAULT_FAVORITE_COUNTRY_NOC);
  });

  it("supports legacy string storage payload", () => {
    localStorage.setItem(FAVORITE_COUNTRY_STORAGE_KEY, JSON.stringify("ita"));
    expect(getFavoriteCountryNoc()).toBe("ITA");
  });

  it("validates NOC shape correctly", () => {
    expect(isFavoriteCountryNoc("NED")).toBe(true);
    expect(isFavoriteCountryNoc("ned")).toBe(true);
    expect(isFavoriteCountryNoc("TOO-LONG")).toBe(false);
    expect(isFavoriteCountryNoc("@@@")).toBe(false);
  });
});
