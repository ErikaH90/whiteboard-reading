import { describe, expect, it } from "vitest";
import {
  INTERESTS,
  PARTS,
  START_ADAPT,
  adapt,
  affectsLevel,
  buildSteps,
  isSupportFree,
  paragraphsFor,
  type AdaptState,
} from "../../app/lesson/flow";
import type { Phase, ReadingText } from "../../app/lesson/types";

const TEXT: ReadingText = {
  title: "Test",
  paragraphs: ["Grund 1.", "Grund 2."],
  level2: ["Nivå 2."],
  level3: ["Nivå 3."],
  signature: "/ Avsändare",
};

describe("paragraphsFor", () => {
  it("visar bara grundtexten på nivå 1", () => {
    expect(paragraphsFor(TEXT, 1)).toEqual(["Grund 1.", "Grund 2.", "/ Avsändare"]);
  });

  it("lägger till stycken per nivå och har alltid avsändaren sist", () => {
    expect(paragraphsFor(TEXT, 2)).toEqual(["Grund 1.", "Grund 2.", "Nivå 2.", "/ Avsändare"]);
    expect(paragraphsFor(TEXT, 3)).toEqual([
      "Grund 1.",
      "Grund 2.",
      "Nivå 2.",
      "Nivå 3.",
      "/ Avsändare",
    ]);
  });

  it("muterar inte texten", () => {
    paragraphsFor(TEXT, 3);
    expect(TEXT.paragraphs).toHaveLength(2);
  });
});

describe("adapt (nivåanpassning)", () => {
  it("börjar på nivå 1 för att sänka tröskeln", () => {
    expect(START_ADAPT).toEqual({ level: 1, streak: 0 });
  });

  it("höjer nivån efter två rätt i rad utan stöd", () => {
    const one = adapt(START_ADAPT, "correct");
    expect(one).toEqual({ level: 1, streak: 1 });
    expect(adapt(one, "correct")).toEqual({ level: 2, streak: 0 });
  });

  it("räknar inte rätt-med-stöd som självständigt – svitet nollställs", () => {
    const s = adapt(START_ADAPT, "correct");
    expect(adapt(s, "correct_with_support")).toEqual({ level: 1, streak: 0 });
  });

  it("sänker nivån vid fel, men aldrig under 1", () => {
    expect(adapt({ level: 3, streak: 1 }, "wrong")).toEqual({ level: 2, streak: 0 });
    expect(adapt({ level: 1, streak: 1 }, "wrong")).toEqual({ level: 1, streak: 0 });
  });

  it("går aldrig över nivå 3", () => {
    let s: AdaptState = { level: 3, streak: 0 };
    s = adapt(adapt(s, "correct"), "correct");
    expect(s.level).toBe(3);
  });
});

describe("fasregler", () => {
  it("återkallning och diagnos är helt utan stöd – inget annat", () => {
    const all: Phase[] = [
      "intro",
      "modellering",
      "traning",
      "aterkallning",
      "diktamen",
      "diagnos",
      "resultat",
    ];
    expect(all.filter(isSupportFree)).toEqual(["aterkallning", "diagnos"]);
  });

  it("bara träning och återkallning påverkar textnivån", () => {
    expect(affectsLevel("traning")).toBe(true);
    expect(affectsLevel("aterkallning")).toBe(true);
    expect(affectsLevel("modellering")).toBe(false);
    expect(affectsLevel("diagnos")).toBe(false);
  });
});

describe.each(INTERESTS.map((i) => i.id))("buildSteps(%s)", (interest) => {
  const steps = buildSteps(interest);

  it("har unika steg-id:n", () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("börjar med intresseval och slutar med resultat", () => {
    expect(steps[0].task.kind).toBe("interest");
    expect(steps.at(-1)?.task.kind).toBe("result");
  });

  it.each([1, 2, 3, 4])("del %i följer modellering → träna → återkalla", (part) => {
    const allPartSteps = steps.filter((s) => s.part === part);
    const partSteps = allPartSteps.filter((s) => s.phase !== "karta" && s.phase !== "repetition");
    const order: Phase[] = ["modellering", "traning", "aterkallning"];

    // Faserna kommer i rätt ordning och ingen saknas
    const phases = partSteps.map((s) => s.phase);
    expect([...new Set(phases)]).toEqual(order);
    const ranks = phases.map((p) => order.indexOf(p));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));

    // Modellering: först tänka högt, sedan ett bra exempel
    expect(partSteps[0].task.kind).toBe("think_aloud");
    expect(partSteps[1].task.kind).toBe("choice");

    // Träning och återkallning sker på olika, anpassade texter
    const practice = partSteps.filter((s) => s.phase === "traning");
    const recallWithText = partSteps.filter((s) => s.phase === "aterkallning" && s.text);
    expect(practice.length).toBeGreaterThanOrEqual(2);
    expect(recallWithText.length).toBeGreaterThanOrEqual(1);
    expect(practice.every((s) => s.leveled)).toBe(true);
    expect(recallWithText.every((s) => s.leveled)).toBe(true);
    expect(practice[0].textKey).not.toBe(recallWithText[0].textKey);

    // Delen avslutas med att strategin återkallas ur minnet, utan text
    const last = partSteps.at(-1)!;
    expect(last.phase).toBe("aterkallning");
    expect(last.text).toBeNull();
    expect(last.task.kind).toBe("free");

    // Sist visas läskartan, en gång per del
    expect(allPartSteps.filter((s) => s.phase === "karta")).toHaveLength(1);
    expect(allPartSteps.at(-1)!.task.kind).toBe("map");
  });

  it("börjar del 3 och 4 med en repetitionsfråga från två delar tidigare", () => {
    const first = (part: number) => steps.find((s) => s.part === part)!;
    expect(first(1).phase).toBe("modellering");
    expect(first(2).phase).toBe("modellering");
    for (const part of [3, 4]) {
      const rep = first(part);
      expect(rep.phase).toBe("repetition");
      expect(rep.text).toBeNull();
      expect(rep.task).toBe(PARTS.find((p) => p.part === part - 2)!.strategyRecall);
    }
  });

  it("låter Edda börja varje modellering med syftet", () => {
    for (const part of PARTS) {
      const model = steps.find((s) => s.part === part.part && s.task.kind === "think_aloud")!;
      if (model.task.kind !== "think_aloud") throw new Error("fel uppgiftstyp");
      expect(model.task.intro.startsWith(part.bridge)).toBe(true);
    }
  });

  it("har högläsning före en slutdiagnos med fem frågor på samma text", () => {
    const dictation = steps.findIndex((s) => s.phase === "diktamen");
    const diag = steps.filter((s) => s.phase === "diagnos");
    expect(dictation).toBeGreaterThan(0);
    expect(diag).toHaveLength(5);
    expect(steps.indexOf(diag[0])).toBeGreaterThan(dictation);
    expect(new Set(diag.map((s) => s.textKey)).size).toBe(1);
    expect(diag.every((s) => !s.leveled)).toBe(true);
  });
});

describe("intresseanpassning", () => {
  it("ger olika träningstexter för olika intressen men samma diagnostext", () => {
    const title = (interest: "sport" | "gaming" | "natur", phase: Phase) =>
      buildSteps(interest)
        .filter((s) => s.phase === phase && s.text)
        .map((s) => s.text!.title);

    expect(title("sport", "traning")).not.toEqual(title("gaming", "traning"));
    expect(title("gaming", "traning")).not.toEqual(title("natur", "traning"));
    expect(title("sport", "diagnos")).toEqual(title("natur", "diagnos"));
  });
});
