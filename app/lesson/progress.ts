import type { Phase, QuestionCategory } from "./types";

// ============================================================================
// Läskartan: elevens visade nivå per förmåga.
//
// Nivåerna följer betygsstegen i årskurs 9: grundläggande, utvecklad och
// välutvecklad. AI-Edda bedömer nivån på varje fritextsvar, och kartan visar
// den högsta nivå eleven har visat i varje förmåga.
// ============================================================================

/** Nivån på ett enskilt svar, som AI-bedömningen anger den. */
export type Quality = "inte_an" | "grundlaggande" | "utvecklad" | "valutvecklad";

/** 0 = inte visat än, 1 = grundläggande, 2 = utvecklad, 3 = välutvecklad. */
export type MapLevel = 0 | 1 | 2 | 3;

export type ReadingMap = Record<QuestionCategory, MapLevel>;

export const MAP_CATEGORIES: QuestionCategory[] = [
  "texttyp",
  "pa_raderna",
  "mellan_raderna",
  "sammanfatta",
  "resonera",
];

/** Korta namn som får plats runt kartan. */
export const MAP_LABELS: Record<QuestionCategory, string> = {
  texttyp: "Texttyp",
  pa_raderna: "På raderna",
  mellan_raderna: "Mellan raderna",
  sammanfatta: "Sammanfatta",
  resonera: "Resonera",
};

export const LEVEL_LABELS: Record<MapLevel, string> = {
  0: "inte visat än",
  1: "grundläggande",
  2: "utvecklad",
  3: "välutvecklad",
};

export const EMPTY_MAP: ReadingMap = {
  texttyp: 0,
  pa_raderna: 0,
  mellan_raderna: 0,
  sammanfatta: 0,
  resonera: 0,
};

const QUALITY_LEVEL: Record<Quality, MapLevel> = {
  inte_an: 0,
  grundlaggande: 1,
  utvecklad: 2,
  valutvecklad: 3,
};

export function levelOf(quality: Quality): MapLevel {
  return QUALITY_LEVEL[quality];
}

/**
 * Nivån ett svar ger på kartan. Självständighet väger tungt: ett svar som
 * kom till med ledtråd eller efter ett nytt försök räknas högst som
 * grundläggande, hur bra det än blev.
 */
export function earnedLevel(quality: Quality, supported: boolean): MapLevel {
  const level = levelOf(quality);
  return supported ? (Math.min(level, 1) as MapLevel) : level;
}

/** Faser där elevens svar förs in på kartan. Modelleringens exempel räknas inte. */
export function countsOnMap(phase: Phase): boolean {
  return (
    phase === "traning" || phase === "aterkallning" || phase === "repetition" || phase === "diagnos"
  );
}

/** Ett rätt flervalssvar kan bara visa grunden – det går inte att utveckla. */
export const CHOICE_LEVEL: MapLevel = 1;

/** Kartan visar framsteg: nivån i en förmåga höjs men sänks aldrig. */
export function record(map: ReadingMap, category: QuestionCategory, level: MapLevel): ReadingMap {
  return level > map[category] ? { ...map, [category]: level } : map;
}

/** Grön betyder redo: alla förmågor är minst utvecklade. */
export function readyForDiagnos(map: ReadingMap): boolean {
  return MAP_CATEGORIES.every((c) => map[c] >= 2);
}

/** Edda tips när eleven klickar på en del av kartan och inget eget nästa steg finns sparat. */
export function defaultTip(level: MapLevel): string {
  switch (level) {
    case 0:
      return "Här har du inte hunnit visa vad du kan än. Det kommer längre fram.";
    case 1:
      return "Du har grunden. Nästa steg är att visa det i ett eget svar och peka på var i texten du hittar stödet.";
    case 2:
      return "Det här kan du. För att nå längre: var mer exakt och ta med mer än ett stöd ur texten.";
    case 3:
      return "Det här behärskar du. Fortsätt använda det i längre texter.";
  }
}
