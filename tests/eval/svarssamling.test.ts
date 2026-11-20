import { describe, expect, it } from "vitest";
import { buildSteps } from "../../app/lesson/flow";
import { SVARSSAMLING } from "./svarssamling";

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item]);
  return map;
}

// Körs i vanliga `npm test` (gratis, ingen AI). Kontrollerar att svarssamlingen
// hänger ihop med lektionsinnehållet, så att `npm run eval` mäter rätt saker.

const steps = new Map(
  (["sport", "gaming", "natur"] as const).flatMap((i) => buildSteps(i)).map((s) => [s.id, s]),
);

describe("svarssamlingen", () => {
  it("har unika id:n", () => {
    const ids = SVARSSAMLING.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(SVARSSAMLING.map((s) => [s.id, s] as const))(
    "%s pekar på en befintlig fritextfråga",
    (_, item) => {
      const step = steps.get(item.stepId);
      expect(step, item.stepId).toBeDefined();
      expect(step!.task.kind).toBe("free");
    },
  );

  it("följer typernas facit (godkända typer → true, övriga → false)", () => {
    const passing = new Set(["stark", "kort_korrekt", "knagglig"]);
    for (const item of SVARSSAMLING) {
      expect(item.expected, item.id).toBe(passing.has(item.kind));
    }
  });

  it("har både godkända och underkända svar för varje fråga", () => {
    const byStep = groupBy(SVARSSAMLING, (s) => s.stepId);
    for (const [stepId, items] of byStep) {
      expect(items.some((i) => i.expected), stepId).toBe(true);
      expect(items.some((i) => !i.expected), stepId).toBe(true);
    }
  });

  it("täcker alla fem förmågor och har fuskförsök och knaggliga svar", () => {
    const categories = new Set(
      SVARSSAMLING.map((s) => {
        const t = steps.get(s.stepId)!.task;
        return t.kind === "free" ? t.category : null;
      }),
    );
    expect(categories).toEqual(
      new Set(["texttyp", "pa_raderna", "mellan_raderna", "sammanfatta", "resonera"]),
    );
    expect(SVARSSAMLING.filter((s) => s.kind === "fusk").length).toBeGreaterThanOrEqual(4);
    expect(SVARSSAMLING.filter((s) => s.kind === "knagglig").length).toBeGreaterThanOrEqual(10);
  });
});
