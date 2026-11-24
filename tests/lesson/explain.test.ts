import { describe, expect, it } from "vitest";
import { alignIndex, tidyMeaning } from "../../app/ai/explain";

describe("alignIndex", () => {
  it("låter ett utpekat stycke gå före modellens val", () => {
    expect(alignIndex(1, 3, 2)).toBe(2);
  });
  it("godtar modellens val när inget stycke är utpekat", () => {
    expect(alignIndex(3, 3)).toBe(3);
  });
  it("avvisar stycken som inte finns", () => {
    expect(alignIndex(4, 3)).toBeNull();
    expect(alignIndex(0, 3)).toBeNull();
    expect(alignIndex("2", 3)).toBeNull();
    expect(alignIndex(2, 3, 9)).toBe(2);
  });
});

describe("tidyMeaning", () => {
  it("tar bort punkt och blanksteg på slutet", () => {
    expect(tidyMeaning("  att satsa på bara en sak. ")).toBe("att satsa på bara en sak");
  });
});
