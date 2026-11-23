import { describe, expect, it } from "vitest";
import {
  CHOICE_LEVEL,
  EMPTY_MAP,
  MAP_CATEGORIES,
  earnedLevel,
  readyForDiagnos,
  record,
  type ReadingMap,
} from "../../app/lesson/progress";

describe("läskartan", () => {
  it("ger full nivå för ett självständigt svar", () => {
    expect(earnedLevel("inte_an", false)).toBe(0);
    expect(earnedLevel("grundlaggande", false)).toBe(1);
    expect(earnedLevel("utvecklad", false)).toBe(2);
    expect(earnedLevel("valutvecklad", false)).toBe(3);
  });

  it("räknar ett svar med stöd högst som grundläggande", () => {
    expect(earnedLevel("valutvecklad", true)).toBe(1);
    expect(earnedLevel("utvecklad", true)).toBe(1);
    expect(earnedLevel("inte_an", true)).toBe(0);
  });

  it("låter ett flervalssvar bara visa grunden", () => {
    expect(CHOICE_LEVEL).toBe(1);
  });

  it("höjer nivån men sänker den aldrig", () => {
    let map: ReadingMap = record(EMPTY_MAP, "sammanfatta", 2);
    expect(map.sammanfatta).toBe(2);
    map = record(map, "sammanfatta", 1);
    expect(map.sammanfatta).toBe(2);
    map = record(map, "sammanfatta", 3);
    expect(map.sammanfatta).toBe(3);
    expect(map.texttyp).toBe(0);
  });

  it("ändrar inte den ursprungliga kartan", () => {
    record(EMPTY_MAP, "resonera", 3);
    expect(EMPTY_MAP.resonera).toBe(0);
  });

  it("är redo för slutdiagnos först när alla förmågor är minst utvecklade", () => {
    let map = EMPTY_MAP;
    expect(readyForDiagnos(map)).toBe(false);
    for (const c of MAP_CATEGORIES.slice(0, -1)) map = record(map, c, 3);
    expect(readyForDiagnos(map)).toBe(false);
    map = record(map, "resonera", 1);
    expect(readyForDiagnos(map)).toBe(false);
    map = record(map, "resonera", 2);
    expect(readyForDiagnos(map)).toBe(true);
  });
});
