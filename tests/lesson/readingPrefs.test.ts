import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({ Lexend: () => ({ className: "lexend" }) }));

const { DEFAULT_PREFS, parsePrefs, readingStyle } = await import(
  "../../app/lesson/ui/ReadingSettings"
);

describe("parsePrefs", () => {
  it("ger standardvalen när inget är sparat eller det sparade är trasigt", () => {
    expect(parsePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(parsePrefs("{inte json")).toEqual(DEFAULT_PREFS);
    expect(parsePrefs("[1,2]")).toEqual(DEFAULT_PREFS);
  });
  it("behåller giltiga val och byter ut ogiltiga", () => {
    const prefs = parsePrefs(
      JSON.stringify({ size: 3, leading: 9, spacing: "2", font: "lexend", background: "svart", focus: true }),
    );
    expect(prefs).toEqual({ ...DEFAULT_PREFS, size: 3, font: "lexend", focus: true });
  });
});

describe("readingStyle", () => {
  it("gör texten större och rösten långsammare när eleven väljer det", () => {
    const base = readingStyle(DEFAULT_PREFS);
    const big = readingStyle({ ...DEFAULT_PREFS, size: 3, slow: true });
    expect(parseInt(String(big.text.fontSize))).toBeGreaterThan(parseInt(String(base.text.fontSize)));
    expect(big.rate).toBeLessThan(base.rate);
    expect(base.rate).toBe(1);
  });
});
