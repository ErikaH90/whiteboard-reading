import { describe, expect, it } from "vitest";
import { alignChecks, alignQuality, alignQuote } from "../../app/ai/evaluate";

describe("efterbehandling av AI-bedömningen", () => {
  it("håller nivån förenlig med godkännandet", () => {
    expect(alignQuality(true, "inte_an")).toBe("grundlaggande");
    expect(alignQuality(true, "valutvecklad")).toBe("valutvecklad");
    expect(alignQuality(false, "valutvecklad")).toBe("grundlaggande");
    expect(alignQuality(false, "inte_an")).toBe("inte_an");
  });

  it("ger exakt en bock per krav", () => {
    expect(alignChecks([true, false], 2, true)).toEqual([true, false]);
    expect(alignChecks([true, false, true, true], 2, true)).toEqual([true, false]);
    expect(alignChecks([true], 3, false)).toEqual([true, false, false]);
    expect(alignChecks([], 2, true)).toEqual([true, true]);
  });

  it("pekar bara på fraser som står ordagrant i texten", () => {
    const text = "Elin var tretton år. Ett halvår senare var Elin lagkapten.";
    expect(alignQuote(" Elin var tretton år ", text)).toBe("Elin var tretton år");
    expect(alignQuote("Elin var fjorton år", text)).toBe("");
    expect(alignQuote("Elin var tretton år", "")).toBe("");
    expect(alignQuote("", text)).toBe("");
  });
});
