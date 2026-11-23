import { describe, expect, it } from "vitest";
import { criteriaFor } from "../../app/lesson/criteria";
import { INTERESTS, PARTS, buildSteps, paragraphsFor } from "../../app/lesson/flow";
import { DIAGNOS_TEXT } from "../../app/lesson/content/diagnos";
import type { LessonStep, ReadingText } from "../../app/lesson/types";

// Kvalitetskontroller av lektionsinnehållet. Körs på alla intressen.

const allSteps: LessonStep[] = INTERESTS.flatMap((i) => buildSteps(i.id));
const label = (s: LessonStep) => s.id;

const words = (t: ReadingText, level: 1 | 2 | 3) =>
  paragraphsFor(t, level).join(" ").split(/\s+/).filter(Boolean).length;

/** Fraser som markeras måste finnas ordagrant i grundtexten (nivå 1). */
const inBaseText = (t: ReadingText | null, phrase: string) =>
  !!t && paragraphsFor(t, 1).some((p) => p.includes(phrase));

describe("flervalsfrågor", () => {
  const choices = allSteps.filter((s) => s.task.kind === "choice");

  it.each(choices.map((s) => [label(s), s] as const))("%s har exakt ett rätt svar", (_, s) => {
    if (s.task.kind !== "choice") return;
    expect(s.task.options.filter((o) => o.isCorrect)).toHaveLength(1);
    const ids = s.task.options.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("markeringar och ledtrådar", () => {
  it.each(allSteps.map((s) => [label(s), s] as const))(
    "%s: alla markerade fraser finns i grundtexten",
    (_, s) => {
      const t = s.task;
      const phrases: string[] = [];
      if (t.kind === "think_aloud") t.thoughts.forEach((th) => th.highlight && phrases.push(th.highlight));
      if ((t.kind === "choice" || t.kind === "free") && t.hint?.highlight) phrases.push(t.hint.highlight);
      for (const p of phrases) expect(inBaseText(s.text, p), `"${p}"`).toBe(true);
    },
  );
});

describe("faser utan stöd", () => {
  const supportFree = allSteps.filter((s) => s.phase === "aterkallning" || s.phase === "diagnos");

  it.each(supportFree.map((s) => [label(s), s] as const))(
    "%s har varken ledtråd eller meningsstartare",
    (_, s) => {
      const t = s.task;
      if (t.kind === "choice") expect(t.hint).toBeUndefined();
      if (t.kind === "free") {
        expect(t.hint).toBeUndefined();
        expect(t.placeholder).toBeUndefined();
      }
    },
  );
});

describe("fritextfrågor", () => {
  const free = allSteps.filter((s) => s.task.kind === "free");

  it.each(free.map((s) => [label(s), s] as const))(
    "%s har bedömningskriterium och reservåterkoppling",
    (_, s) => {
      if (s.task.kind !== "free") return;
      expect(s.task.rubric.length).toBeGreaterThan(30);
      expect(s.task.fallbackFeedback.length).toBeGreaterThan(0);
    },
  );
});

describe("nivåtexter", () => {
  const leveledTexts = [
    ...new Map(
      allSteps.filter((s) => s.leveled && s.text).map((s) => [s.textKey, s.text!]),
    ).values(),
  ];

  it.each(leveledTexts.map((t) => [t.title, t] as const))(
    "%s blir längre för varje nivå",
    (_, t) => {
      expect(t.level2?.length).toBeGreaterThan(0);
      expect(t.level3?.length).toBeGreaterThan(0);
      expect(words(t, 2)).toBeGreaterThan(words(t, 1));
      expect(words(t, 3)).toBeGreaterThan(words(t, 2));
    },
  );
});

describe("progression mot nationella provet", () => {
  it("grundtexterna blir i snitt längre del för del", () => {
    const avg = PARTS.map((p) => {
      const lens = Object.values(p.themes).map((th) => words(th.practiceText, 1));
      return lens.reduce((a, b) => a + b, 0) / lens.length;
    });
    for (let i = 1; i < avg.length; i++) expect(avg[i]).toBeGreaterThan(avg[i - 1]);
  });

  it("diagnostexten är längre än alla träningstexter på högsta nivån", () => {
    const longest = Math.max(
      ...PARTS.flatMap((p) =>
        Object.values(p.themes).flatMap((th) => [
          words(th.practiceText, 3),
          words(th.recallText, 3),
        ]),
      ),
    );
    expect(words(DIAGNOS_TEXT, 1)).toBeGreaterThan(longest);
  });
});

describe("modellering: stödord på tavlan", () => {
  it.each(allSteps.filter((s) => s.task.kind === "think_aloud").map((s) => [label(s), s] as const))(
    "%s: varje tanke har ett kort stödord",
    (_, s) => {
      if (s.task.kind !== "think_aloud") return;
      for (const th of s.task.thoughts) {
        expect(th.label.trim().length, th.text).toBeGreaterThan(0);
        expect(th.label.length, th.label).toBeLessThanOrEqual(30);
      }
    },
  );
});

describe("träning: hjälpen kommer utan att eleven ber om den", () => {
  const practice = allSteps.filter((s) => s.phase === "traning");

  it.each(practice.map((s) => [label(s), s] as const))(
    "%s har ledtråd, och fritextfrågor har en omvisning",
    (_, s) => {
      const t = s.task;
      if (t.kind !== "choice" && t.kind !== "free") throw new Error("fel uppgiftstyp");
      expect(t.hint?.text.trim().length).toBeGreaterThan(0);
      if (t.kind === "free") {
        expect(t.remodel?.say.trim().length).toBeGreaterThan(0);
        expect(t.remodel?.points.length).toBeGreaterThanOrEqual(2);
        for (const point of t.remodel?.points ?? []) {
          expect(point.label.length, point.label).toBeLessThanOrEqual(34);
          if (point.highlight) expect(inBaseText(s.text, point.highlight), point.highlight).toBe(true);
        }
      }
    },
  );

  it("ger aldrig omvisning i faser utan stöd", () => {
    for (const s of allSteps) {
      if (s.phase === "traning" || s.task.kind !== "free") continue;
      expect(s.task.remodel, s.id).toBeUndefined();
    }
  });
});

describe("bocklistan", () => {
  const free = allSteps.filter((s) => s.task.kind === "free");

  it.each(free.map((s) => [label(s), s] as const))("%s har en till tre korta krav", (_, s) => {
    if (s.task.kind !== "free") return;
    const criteria = criteriaFor(s.task);
    expect(criteria.length).toBeGreaterThanOrEqual(1);
    expect(criteria.length).toBeLessThanOrEqual(3);
    for (const c of criteria) expect(c.length, c).toBeLessThanOrEqual(30);
  });
});
