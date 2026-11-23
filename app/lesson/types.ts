// ============================================================================
// Typer för läsförståelseflödet
// ============================================================================

export type QuestionCategory =
  | "texttyp"
  | "pa_raderna"
  | "mellan_raderna"
  | "sammanfatta"
  | "resonera";

/** Elevens valda intresse – styr vilka texter som används i del 1–4. */
export type Interest = "sport" | "gaming" | "natur";

/**
 * Textnivå. Nivå 1 = kort grundtext med ordförklaringar.
 * Nivå 2 och 3 lägger till fler stycken (mer information att sålla i)
 * med svårare ord. Frågorna går alltid att besvara utifrån grundtexten.
 */
export type Level = 1 | 2 | 3;

/** Progressionen inom varje del: modellering → träna själv → återkalla utan stöd. */
export type Phase =
  | "intro"
  | "repetition"
  | "modellering"
  | "traning"
  | "aterkallning"
  | "karta"
  | "diktamen"
  | "diagnos"
  | "resultat";

export type ReadingText = {
  title: string;
  /** Texttyp/källa som visas ovanför rubriken, t.ex. "Insändare". */
  source?: string;
  /** Grundtexten – visas alltid. */
  paragraphs: string[];
  /** Extra stycken som läggs till på nivå 2 och uppåt. */
  level2?: string[];
  /** Extra stycken som läggs till på nivå 3. */
  level3?: string[];
  /** Undertecknare e.d. som alltid ska stå sist. */
  signature?: string;
  /** Ordförklaringar – visas bara på nivå 1 när stöd är tillåtet. */
  glossary?: { term: string; meaning: string }[];
};

/** En liten AI-stöttning: tips på tavlan + markering i texten. */
export type Hint = {
  text: string;
  highlight?: string;
};

export type OptionId = "A" | "B" | "C";

export type ChoiceTask = {
  kind: "choice";
  category: QuestionCategory;
  prompt: string;
  options: { id: OptionId; text: string; isCorrect: boolean }[];
  correctFeedback: string;
  incorrectFeedback: string;
  hint?: Hint;
};

export type FreeTask = {
  kind: "free";
  category: QuestionCategory;
  prompt: string;
  /** Meningsstartare – visas bara när stöd är tillåtet. */
  placeholder?: string;
  /** Bedömningsmål som skickas till AI:n. */
  rubric: string;
  /**
   * Omvisning: hur Edda själv tänker fram svaret. Används bara i träningen,
   * när eleven har försökt två gånger utan att komma fram.
   */
  remodel?: string;
  hint?: Hint;
  /** Används om AI-bedömningen inte svarar. */
  fallbackFeedback: string;
};

export type ThinkAloudTask = {
  kind: "think_aloud";
  category: QuestionCategory;
  intro: string;
  /**
   * En tanke i taget. `label` är stödordet som står på tavlan medan Edda
   * säger `text` – eleven ska inte behöva läsa och lyssna på samma mening.
   */
  thoughts: { label: string; text: string; highlight?: string }[];
  summary: string;
};

export type InterestTask = { kind: "interest"; prompt: string };
export type DictationTask = { kind: "dictation"; prompt: string };
export type ResultTask = { kind: "result" };
/** Läskartan som visas när en del är klar. */
export type MapTask = { kind: "map" };

export type Task =
  | ChoiceTask
  | FreeTask
  | ThinkAloudTask
  | InterestTask
  | DictationTask
  | MapTask
  | ResultTask;

/** Innehåll som är specifikt för ett intresse inom en del. */
export type ThemeContent = {
  practiceText: ReadingText;
  practice: (ChoiceTask | FreeTask)[];
  recallText: ReadingText;
  recall: (ChoiceTask | FreeTask)[];
};

export type PartDefinition = {
  part: 1 | 2 | 3 | 4;
  title: string;
  /** Kursmålet för delen – visas för eleven. */
  goal: string;
  /** Edda säger syftet med delen och knyter an till det eleven redan kan. */
  bridge: string;
  model: {
    text: ReadingText;
    thinkAloud: ThinkAloudTask;
    example: ChoiceTask;
  };
  themes: Record<Interest, ThemeContent>;
  /** Återkalla strategin helt ur minnet, utan text. */
  strategyRecall: FreeTask;
};

export type LessonStep = {
  id: string;
  part: 0 | 1 | 2 | 3 | 4 | 5;
  partTitle: string;
  phase: Phase;
  text: ReadingText | null;
  /** Steg med samma textKey delar text – texten läses bara upp en gång. */
  textKey: string | null;
  /** true om texten finns i flera nivåer och ska anpassas. */
  leveled: boolean;
  task: Task;
};
