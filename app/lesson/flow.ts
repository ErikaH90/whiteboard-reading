import { DEL1 } from "./content/del1-texttyper";
import { DEL2 } from "./content/del2-lasteknik";
import { DEL3 } from "./content/del3-sammanfatta";
import { DEL4 } from "./content/del4-resonera";
import { DIAGNOS_TASKS, DIAGNOS_TEXT, DIKTAMEN_TEXT } from "./content/diagnos";
import type {
  Interest,
  LessonStep,
  Level,
  PartDefinition,
  Phase,
  QuestionCategory,
  ReadingText,
} from "./types";

export const PARTS: PartDefinition[] = [DEL1, DEL2, DEL3, DEL4];

export const INTERESTS: { id: Interest; label: string; emoji: string }[] = [
  { id: "sport", label: "Sport & träning", emoji: "⚽" },
  { id: "gaming", label: "Gaming & teknik", emoji: "🎮" },
  { id: "natur", label: "Djur & natur", emoji: "🌿" },
];

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  texttyp: "Texttypers särdrag",
  pa_raderna: "Läsa på raderna",
  mellan_raderna: "Läsa mellan raderna",
  sammanfatta: "Sammanfatta",
  resonera: "Resonera med textstöd",
};

export const PHASE_LABELS: Record<Phase, string> = {
  intro: "Start",
  repetition: "Repetition",
  modellering: "Modellering",
  traning: "Träna själv",
  aterkallning: "Återkalla utan stöd",
  karta: "Min läskarta",
  diktamen: "Högläsning",
  diagnos: "Slutdiagnos",
  resultat: "Resultat",
};

/** Faser där eleven arbetar helt utan stöd: ingen ledtråd, markering, ordlista, uppläsning eller meningsstartare. */
export function isSupportFree(phase: Phase): boolean {
  return phase === "aterkallning" || phase === "repetition" || phase === "diagnos";
}

/** Faser vars resultat påverkar textnivån. */
export function affectsLevel(phase: Phase): boolean {
  return phase === "traning" || phase === "aterkallning";
}

/** Grundtext + de extra stycken som hör till nivån. */
export function paragraphsFor(text: ReadingText, level: Level): string[] {
  const paragraphs = [...text.paragraphs];
  if (level >= 2 && text.level2) paragraphs.push(...text.level2);
  if (level >= 3 && text.level3) paragraphs.push(...text.level3);
  if (text.signature) paragraphs.push(text.signature);
  return paragraphs;
}

export function plainText(text: ReadingText, level: Level): string {
  return [text.title, ...paragraphsFor(text, level)].join("\n\n");
}

// ----------------------------------------------------------------------------
// Adaptiv nivå: börja lågt för att sänka tröskeln, höj när eleven klarar sig
// utan stöd, sänk när eleven får fel.
// ----------------------------------------------------------------------------

export type Outcome = "correct" | "correct_with_support" | "wrong";

export type AdaptState = { level: Level; streak: number };

export const START_ADAPT: AdaptState = { level: 1, streak: 0 };

/** Antal rätt i rad utan stöd som krävs för att höja nivån. */
const STREAK_TO_LEVEL_UP = 2;

export function adapt(state: AdaptState, outcome: Outcome): AdaptState {
  if (outcome === "wrong") {
    return { level: Math.max(1, state.level - 1) as Level, streak: 0 };
  }
  if (outcome === "correct_with_support") {
    return { ...state, streak: 0 };
  }
  const streak = state.streak + 1;
  if (streak >= STREAK_TO_LEVEL_UP && state.level < 3) {
    return { level: (state.level + 1) as Level, streak: 0 };
  }
  return { level: state.level, streak };
}

// ----------------------------------------------------------------------------
// Flödet: Start → (Del 1–4: modellering → träna → återkalla) → högläsning
//         → slutdiagnos → resultat
// ----------------------------------------------------------------------------

/** Så många delar bakåt hämtas repetitionsfrågan. */
export const REPETITION_GAP = 2;

export function buildSteps(interest: Interest): LessonStep[] {
  const steps: LessonStep[] = [
    {
      id: "start_intresse",
      part: 0,
      partTitle: "Start",
      phase: "intro",
      text: null,
      textKey: null,
      leveled: false,
      task: {
        kind: "interest",
        prompt:
          "Hej! Jag heter Edda. Vad är du mest intresserad av?",
      },
    },
  ];

  for (const part of PARTS) {
    const p = part.part;
    const partTitle = `Del ${p}: ${part.title}`;
    const theme = part.themes[interest];
    const modelKey = `del${p}_modell`;
    const practiceKey = `del${p}_${interest}_trana`;
    const recallKey = `del${p}_${interest}_aterkalla`;

    // Utspridd repetition: börja med en fråga ur minnet från en tidigare del.
    // Två delar bakåt, så att det har hunnit gå tid sedan eleven svarade sist.
    const earlier = PARTS.find((x) => x.part === p - REPETITION_GAP);
    if (earlier) {
      steps.push({
        id: `del${p}_repetition`,
        part: p,
        partTitle,
        phase: "repetition",
        text: null,
        textKey: null,
        leveled: false,
        task: earlier.strategyRecall,
      });
    }

    steps.push(
      {
        id: `${modelKey}_tanka_hogt`,
        part: p,
        partTitle,
        phase: "modellering",
        text: part.model.text,
        textKey: modelKey,
        leveled: false,
        // Edda börjar med syftet och kopplingen till det eleven redan kan
        task: {
          ...part.model.thinkAloud,
          intro: `${part.bridge}\n\n${part.model.thinkAloud.intro}`,
        },
      },
      {
        id: `${modelKey}_exempel`,
        part: p,
        partTitle,
        phase: "modellering",
        text: part.model.text,
        textKey: modelKey,
        leveled: false,
        task: part.model.example,
      },
    );

    theme.practice.forEach((task, i) =>
      steps.push({
        id: `${practiceKey}_${i + 1}`,
        part: p,
        partTitle,
        phase: "traning",
        text: theme.practiceText,
        textKey: practiceKey,
        leveled: true,
        task,
      }),
    );

    theme.recall.forEach((task, i) =>
      steps.push({
        id: `${recallKey}_${i + 1}`,
        part: p,
        partTitle,
        phase: "aterkallning",
        text: theme.recallText,
        textKey: recallKey,
        leveled: true,
        task,
      }),
    );

    steps.push({
      id: `del${p}_strategi`,
      part: p,
      partTitle,
      phase: "aterkallning",
      text: null,
      textKey: null,
      leveled: false,
      task: part.strategyRecall,
    });

    // Varje del avslutas med läskartan: så här långt har du kommit
    steps.push({
      id: `del${p}_karta`,
      part: p,
      partTitle,
      phase: "karta",
      text: null,
      textKey: null,
      leveled: false,
      task: { kind: "map" },
    });
  }

  steps.push({
    id: "diktamen",
    part: 5,
    partTitle: "Högläsning & läsflyt",
    phase: "diktamen",
    text: DIKTAMEN_TEXT,
    textKey: "diktamen",
    leveled: false,
    task: {
      kind: "dictation",
      prompt:
        "Tryck på mikrofonen och läs texten till höger högt.",
    },
  });

  DIAGNOS_TASKS.forEach((task, i) =>
    steps.push({
      id: `diagnos_${i + 1}`,
      part: 5,
      partTitle: "Slutdiagnos: lång text utan stöd",
      phase: "diagnos",
      text: DIAGNOS_TEXT,
      textKey: "diagnos",
      leveled: false,
      task,
    }),
  );

  steps.push({
    id: "resultat",
    part: 5,
    partTitle: "Din läsprofil",
    phase: "resultat",
    text: null,
    textKey: null,
    leveled: false,
    task: { kind: "result" },
  });

  return steps;
}
