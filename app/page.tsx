"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Brain, Check, Lightbulb, Mic, MicOff, Star, Volume2, VolumeX } from "lucide-react";
import {
  CATEGORY_LABELS,
  INTERESTS,
  PARTS,
  PHASE_LABELS,
  START_ADAPT,
  adapt,
  affectsLevel,
  buildSteps,
  isSupportFree,
  paragraphsFor,
  plainText,
  type AdaptState,
  type Outcome,
} from "./lesson/flow";
import type {
  ChoiceTask,
  Interest,
  LessonStep,
  Level,
  OptionId,
  Phase,
  QuestionCategory,
  ThinkAloudTask,
} from "./lesson/types";

// ============================================================================
// Hjälptyper
// ============================================================================

type BoardEntry = {
  sender: "teacher" | "student";
  text: string;
  tone?: "feedback" | "hint" | "note";
  ok?: boolean;
  strength?: string;
  nextStep?: string;
};

type Evaluation = {
  passed: boolean;
  strength: string;
  nextStep: string;
  boardFeedback: string;
};

type CategoryStats = { answered: number; correct: number; supported: number; times: number[] };

const CATEGORIES = Object.keys(CATEGORY_LABELS) as QuestionCategory[];

function emptyStats(): Record<QuestionCategory, CategoryStats> {
  return Object.fromEntries(
    CATEGORIES.map((c) => [c, { answered: 0, correct: 0, supported: 0, times: [] }]),
  ) as unknown as Record<QuestionCategory, CategoryStats>;
}

function secondsSince(start: number) {
  return Number(((performance.now() - start) / 1000).toFixed(1));
}

const CYCLE: Phase[] = ["modellering", "traning", "aterkallning"];

/**
 * Markerar fraser i lästexten. Frasen som Edda pratar om just nu (`current`)
 * är starkt gul, tidigare fraser är nedtonade så att blicken dras rätt.
 */
function renderHighlighted(text: string, earlier: string[], current: string[]) {
  const levels = new Array<number>(text.length).fill(0);
  const paint = (phrases: string[], level: number) => {
    for (const phrase of phrases) {
      if (!phrase) continue;
      for (let at = text.indexOf(phrase); at !== -1; at = text.indexOf(phrase, at + 1)) {
        levels.fill(level, at, at + phrase.length);
      }
    }
  };
  paint(earlier, 1);
  paint(current, 2);

  const out: React.ReactNode[] = [];
  for (let start = 0; start < text.length; ) {
    let end = start + 1;
    while (end < text.length && levels[end] === levels[start]) end++;
    const chunk = text.slice(start, end);
    out.push(
      levels[start] === 0 ? (
        <Fragment key={start}>{chunk}</Fragment>
      ) : (
        <mark
          key={start}
          data-current={levels[start] === 2 ? "" : undefined}
          className={
            levels[start] === 2
              ? "bg-[#FDE047] px-0.5 rounded-sm font-medium text-zinc-950"
              : "bg-[#FEF9C3] rounded-sm text-inherit"
          }
        >
          {chunk}
        </mark>
      ),
    );
    start = end;
  }
  return out;
}

function phaseIntro(step: LessonStep): string | null {
  switch (step.phase) {
    case "traning":
      return "Nu är det din tur på en ny text! Behöver du hjälp kan du be om en ledtråd.";
    case "aterkallning":
      return step.text
        ? "Ny text, och nu svarar du helt själv. Inga ledtrådar och ingen uppläsning. Visa vad du kan!"
        : null;
    case "diagnos":
      return "En lång text, som på nationella provet. Du svarar på fem frågor helt utan stöd. Ta den tid du behöver.";
    default:
      return null;
  }
}

// ============================================================================
// Komponent
// ============================================================================

export default function CompleteWhiteboardSystem() {
  const [interest, setInterest] = useState<Interest | null>(null);
  const steps = useMemo(() => buildSteps(interest ?? "sport"), [interest]);

  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const task = step.task;
  const supportFree = isSupportFree(step.phase);

  // Adaptiv textnivå
  const [adaptState, setAdaptState] = useState<AdaptState>(START_ADAPT);
  const [textLevels, setTextLevels] = useState<Record<string, Level>>({});
  const lastLeveledLevelRef = useRef<Level | null>(null);
  const stepLevel: Level =
    step.leveled && step.textKey ? (textLevels[step.textKey] ?? adaptState.level) : 1;

  // Tavlans tillstånd
  const [boardStage, setBoardStage] = useState<
    "listening_blank" | "active_task" | "showing_feedback"
  >("active_task");
  const [boardHistory, setBoardHistory] = useState<BoardEntry[]>(() =>
    step.task.kind === "interest" ? [{ sender: "teacher", text: step.task.prompt }] : [],
  );
  const boardEndRef = useRef<HTMLDivElement | null>(null);

  // Per-steg-tillstånd
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null);
  const [freeText, setFreeText] = useState("");
  const [lastAnswer, setLastAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [canRetry, setCanRetry] = useState(false);
  // -1 = Eddas inledning, 0..n-1 = en tanke i taget, n = slutsatsen
  const [thoughtIndex, setThoughtIndex] = useState(-1);
  // true medan Edda pratar: då är tavlan nästan tom, texten visas först efteråt
  const [eddaTalking, setEddaTalking] = useState(false);
  const readingRef = useRef<HTMLDivElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Statistik & slutdiagnos
  const startTimeRef = useRef<number>(0);
  const [stats, setStats] = useState(emptyStats);
  const [diagResults, setDiagResults] = useState<Record<string, Evaluation | "pending" | "error">>(
    {},
  );

  // ==========================================================================
  // Ljud: ElevenLabs med webbläsarens röst som reserv
  // ==========================================================================
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const playTokenRef = useRef(0);

  function stopAudio() {
    playTokenRef.current++; // ogiltigförklara pågående hämtningar
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function playWithBrowserVoice(text: string, onDone: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlayingAudio(false);
      onDone();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "sv-SE";
    utterance.rate = 0.95;
    utterance.onend = () => {
      setIsPlayingAudio(false);
      onDone();
    };
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  }

  async function playText(text: string, onDone: () => void) {
    stopAudio();
    const token = playTokenRef.current;
    setIsPlayingAudio(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `TTS-fel ${res.status}`);
      }
      const blob = await res.blob();
      if (token !== playTokenRef.current) return; // avbruten under hämtning

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioUrlRef.current = url;
      audioRef.current = audio;
      audio.onended = () => {
        if (token !== playTokenRef.current) return;
        setIsPlayingAudio(false);
        onDone();
      };
      await audio.play();
    } catch (error) {
      if (token !== playTokenRef.current) return;
      console.error("ElevenLabs-uppläsning misslyckades, använder webbläsarens röst:", error);
      playWithBrowserVoice(text, onDone);
    }
  }

  function speakThought(t: ThinkAloudTask, index: number) {
    const text =
      index < 0 ? t.intro : index < t.thoughts.length ? t.thoughts[index].text : t.summary;
    setEddaTalking(true);
    playText(text, () => setEddaTalking(false));
  }

  useEffect(() => () => stopAudio(), []);

  // Håll den aktuella gulmarkeringen synlig i lästexten
  useEffect(() => {
    readingRef.current
      ?.querySelector("mark[data-current]")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [stepIndex, thoughtIndex, hintShown, boardStage]);

  // Scrolla tavlan till senaste raden
  useEffect(() => {
    boardEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [boardHistory, thoughtIndex, boardStage]);

  // ==========================================================================
  // Stegnavigering
  // ==========================================================================

  /** Visar uppgiften på tavlan när texten är läst/uppläst. */
  function activateBoard(s: LessonStep, speak: boolean) {
    setBoardStage("active_task");
    startTimeRef.current = performance.now();
    if (s.task.kind === "think_aloud" && speak) speakThought(s.task, -1);
  }

  function enterStep(index: number) {
    const next = steps[index];
    const prev = steps[index - 1];
    if (!next) return;

    stopAudio();
    setIsPlayingAudio(false);
    setSelectedOption(null);
    setFreeText("");
    setLastAnswer("");
    setHintShown(false);
    setAttempts(0);
    setCanRetry(false);
    setThoughtIndex(-1);
    setIsRecording(false);

    const entries: BoardEntry[] = [];

    // Fasintro när en ny fas eller del börjar
    if (!prev || prev.phase !== next.phase || prev.part !== next.part) {
      const intro = phaseIntro(next);
      if (intro) entries.push({ sender: "teacher", text: intro, tone: "note" });
    }

    // Lås textnivån när en ny anpassad text visas första gången
    let level: Level = 1;
    if (next.leveled && next.textKey) {
      const locked = textLevels[next.textKey];
      level = locked ?? adaptState.level;
      if (!locked) {
        setTextLevels((p) => ({ ...p, [next.textKey as string]: level }));
        const last = lastLeveledLevelRef.current;
        if (last !== null && level !== last) {
          entries.push({
            sender: "teacher",
            tone: "note",
            text:
              level > last
                ? `↑ Du klarar dig bra utan stöd, så jag har gjort texten längre och lite svårare (nivå ${level} av 3).`
                : `↓ Jag har gjort texten lite kortare den här gången (nivå ${level} av 3). Vi bygger upp det igen!`,
          });
        }
        lastLeveledLevelRef.current = level;
      }
    }

    if (next.task.kind === "think_aloud") {
      entries.push({ sender: "teacher", text: next.task.intro });
    } else if (next.task.kind !== "result") {
      entries.push({ sender: "teacher", text: next.task.prompt });
    }

    setStepIndex(index);
    setBoardHistory(entries);

    const isNewText = !!next.textKey && next.textKey !== prev?.textKey;
    if (isNewText && next.text) {
      setBoardStage("listening_blank");
      const autoRead =
        audioUnlocked && !isSupportFree(next.phase) && next.phase !== "diktamen";
      if (autoRead) playText(plainText(next.text, level), () => activateBoard(next, true));
    } else {
      activateBoard(next, false);
    }
  }

  function handleProceedToNextStep() {
    enterStep(stepIndex + 1);
  }

  // ==========================================================================
  // Uppläsningskontroller
  // ==========================================================================

  function handleStartAndListen() {
    if (!step.text) return;
    setAudioUnlocked(true);
    playText(plainText(step.text, stepLevel), () => activateBoard(step, true));
  }

  function toggleReadAloud() {
    setEddaTalking(false);
    if (isPlayingAudio) {
      stopAudio();
      setIsPlayingAudio(false);
      if (boardStage === "listening_blank") activateBoard(step, false);
      return;
    }
    if (!step.text) return;
    setAudioUnlocked(true);
    if (boardStage === "listening_blank") {
      playText(plainText(step.text, stepLevel), () => activateBoard(step, true));
    } else {
      playText(plainText(step.text, stepLevel), () => {});
    }
  }

  function revealBoardNow() {
    stopAudio();
    setIsPlayingAudio(false);
    activateBoard(step, audioUnlocked);
  }

  // ==========================================================================
  // Svar och återkoppling
  // ==========================================================================

  function registerOutcome(category: QuestionCategory, outcome: Outcome) {
    if (!affectsLevel(step.phase)) return;
    const elapsed = secondsSince(startTimeRef.current);
    setAdaptState((s) => adapt(s, outcome));
    setStats((prev) => {
      const c = prev[category];
      return {
        ...prev,
        [category]: {
          answered: c.answered + 1,
          correct: c.correct + (outcome === "wrong" ? 0 : 1),
          supported: c.supported + (outcome === "correct_with_support" ? 1 : 0),
          times: [...c.times, elapsed],
        },
      };
    });
  }

  function handleInterestSelect(id: Interest) {
    if (boardStage !== "active_task") return;
    const choice = INTERESTS.find((i) => i.id === id)!;
    setInterest(id);
    setAudioUnlocked(true);
    setBoardHistory((prev) => [
      ...prev,
      { sender: "student", text: `${choice.emoji} ${choice.label}` },
      {
        sender: "teacher",
        tone: "feedback",
        ok: true,
        text: `Toppen! Jag väljer texter om ${choice.label.toLowerCase()}. Vi börjar med korta texter, och jag gör dem längre i takt med att du blir säkrare. Målet är att du ska klara en lång text som på nationella provet.`,
      },
    ]);
    setBoardStage("showing_feedback");
  }

  function handleHint() {
    if ((task.kind !== "choice" && task.kind !== "free") || !task.hint || hintShown) return;
    setHintShown(true);
    setBoardHistory((prev) => [
      ...prev,
      { sender: "teacher", tone: "hint", text: `💡 ${task.hint!.text}` },
    ]);
  }

  function handleOptionSelect(opt: ChoiceTask["options"][number]) {
    if (task.kind !== "choice") return;
    if (selectedOption !== null || isSubmitting || boardStage !== "active_task") return;

    setSelectedOption(opt.id);
    registerOutcome(
      task.category,
      opt.isCorrect ? (hintShown ? "correct_with_support" : "correct") : "wrong",
    );

    setBoardHistory((prev) => [
      ...prev,
      { sender: "student", text: `${opt.id}: ${opt.text}` },
      {
        sender: "teacher",
        tone: "feedback",
        ok: opt.isCorrect,
        text: opt.isCorrect ? task.correctFeedback : task.incorrectFeedback,
      },
    ]);
    setBoardStage("showing_feedback");
  }

  async function evaluate(s: LessonStep, answer: string, level: Level): Promise<Evaluation | null> {
    if (s.task.kind !== "free") return null;
    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: s.id,
          category: s.task.category,
          phase: s.phase,
          level,
          question: s.task.prompt,
          studentAnswer: answer,
          rubricTarget: s.task.rubric,
          sideText: s.text ? plainText(s.text, level) : "",
        }),
      });
      const data = await response.json();
      if (data.error || typeof data.passed !== "boolean") return null;
      return data as Evaluation;
    } catch {
      return null;
    }
  }

  async function handleFreeTextSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (task.kind !== "free") return;
    const val = freeText.trim();
    if (!val || isSubmitting || boardStage !== "active_task") return;

    setBoardHistory((prev) => [...prev, { sender: "student", text: val }]);
    setFreeText("");
    setLastAnswer(val);

    // Slutdiagnos: spara svaret, rätta i bakgrunden, visa allt på slutet
    if (step.phase === "diagnos") {
      const diagStep = step;
      setDiagResults((prev) => ({ ...prev, [diagStep.id]: "pending" }));
      evaluate(diagStep, val, stepLevel).then((r) =>
        setDiagResults((prev) => ({ ...prev, [diagStep.id]: r ?? "error" })),
      );
      setBoardHistory((prev) => [
        ...prev,
        {
          sender: "teacher",
          tone: "note",
          text: "Svaret är sparat ✓ Jag rättar allt när du är klar med alla frågor.",
        },
      ]);
      setBoardStage("showing_feedback");
      return;
    }

    setIsSubmitting(true);
    const ev = await evaluate(step, val, stepLevel);
    const passed = ev?.passed ?? true;

    setBoardHistory((prev) => [
      ...prev,
      {
        sender: "teacher",
        tone: "feedback",
        ok: passed,
        text: ev?.boardFeedback || task.fallbackFeedback,
        strength: ev?.strength || undefined,
        nextStep: ev?.nextStep || undefined,
      },
    ]);

    if (attempts === 0) {
      registerOutcome(
        task.category,
        passed ? (hintShown ? "correct_with_support" : "correct") : "wrong",
      );
    }
    // Liten AI-stöttning: en chans att förbättra svaret under träningen
    setCanRetry(!passed && step.phase === "traning" && attempts === 0);
    setAttempts((a) => a + 1);
    setIsSubmitting(false);
    setBoardStage("showing_feedback");
  }

  function handleRetry() {
    setCanRetry(false);
    setFreeText(lastAnswer);
    setBoardHistory((prev) => [
      ...prev,
      {
        sender: "teacher",
        tone: "hint",
        text: "Förbättra ditt svar med hjälp av nästa steg ovan. Du kan ändra direkt i din text.",
      },
    ]);
    setBoardStage("active_task");
  }

  function handleNextThought() {
    if (task.kind !== "think_aloud") return;
    const n = thoughtIndex + 1;
    setThoughtIndex(n);
    if (audioUnlocked) speakThought(task, n);
  }

  // Diktamen & högläsning
  function handleDictationToggle() {
    if (boardStage !== "active_task") return;

    if (!isRecording) {
      setIsRecording(true);
      return;
    }
    setIsRecording(false);

    const answered = CATEGORIES.filter((c) => stats[c].answered > 0);
    const weakest = answered.length
      ? answered.reduce((a, b) =>
          stats[a].correct / stats[a].answered <= stats[b].correct / stats[b].answered ? a : b,
        )
      : "resonera";

    const report = `Läshastighet: 138 ord/minut. Intonation och flyt: Mycket god. Under lektionen var du säkrast på det du tränat mest, men '${CATEGORY_LABELS[weakest].toLowerCase()}' behöver mer träning. Nu väntar slutdiagnosen!`;

    setBoardHistory((prev) => [...prev, { sender: "teacher", tone: "feedback", ok: true, text: report }]);
    setBoardStage("showing_feedback");
  }

  // ==========================================================================
  // Härledda värden för rendering
  // ==========================================================================

  const isLastStep = stepIndex === steps.length - 1;

  const earlierHighlights: string[] = [];
  const currentHighlights: string[] = [];
  if (task.kind === "think_aloud" && boardStage !== "listening_blank") {
    task.thoughts.slice(0, thoughtIndex + 1).forEach((t, i) => {
      if (t.highlight) (i === thoughtIndex ? currentHighlights : earlierHighlights).push(t.highlight);
    });
  }
  if (hintShown && (task.kind === "choice" || task.kind === "free") && task.hint?.highlight) {
    currentHighlights.push(task.hint.highlight);
  }
  // Under modelleringen berättar Edda själv; tavlan visar bara det hon just har sagt.
  const showHistory = task.kind !== "think_aloud";
  const eddaSpeaking = eddaTalking && isPlayingAudio;

  const showHintButton =
    boardStage === "active_task" &&
    !supportFree &&
    (task.kind === "choice" || task.kind === "free") &&
    !!task.hint &&
    !hintShown &&
    selectedOption === null;

  const paragraphs = step.text ? paragraphsFor(step.text, stepLevel) : [];
  const showGlossary =
    !!step.text?.glossary && step.leveled && stepLevel === 1 && !supportFree;

  const diagSteps = steps.filter((s) => s.phase === "diagnos");
  const diagPending = diagSteps.some(
    (s) => !diagResults[s.id] || diagResults[s.id] === "pending",
  );

  const partInfo = PARTS.find((p) => p.part === step.part);
  const chapterTitle = partInfo?.title ?? step.partTitle;
  const cycleIndex = CYCLE.indexOf(step.phase);
  const eyebrow =
    cycleIndex >= 0
      ? `${PHASE_LABELS[step.phase]} · steg ${cycleIndex + 1} av ${CYCLE.length}`
      : PHASE_LABELS[step.phase];
  const lastFeedbackIndex = boardHistory.map((e) => e.tone).lastIndexOf("feedback");

  // ==========================================================================
  // Rendering
  // ==========================================================================

  return (
    <main className="min-h-screen lg:h-screen bg-[#F3F4F8] flex flex-col select-none antialiased text-zinc-900">
      {/* Handskrivet typsnitt (Patrick Hand) */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap");
        .font-whiteboard {
          font-family: "Patrick Hand", cursive, sans-serif;
        }
      `}</style>

      {/* SIDHUVUD: titel, del och progression */}
      <header className="bg-white px-4 sm:px-8 lg:px-12 py-4 flex flex-wrap items-center gap-x-10 gap-y-3">
        <div className="shrink-0">
          <h1 className="text-xl font-bold leading-tight text-zinc-900">Läsförståelse</h1>
          <p className="text-sm text-zinc-500">
            {step.part >= 1 ? `Del ${step.part} av ${TOTAL_PARTS} · ${chapterTitle}` : "Start"}
          </p>
        </div>
        <div
          className="flex flex-1 min-w-[200px] items-center gap-2"
          role="progressbar"
          aria-label="Delar i lektionen"
          aria-valuemin={0}
          aria-valuemax={TOTAL_PARTS}
          aria-valuenow={step.part}
        >
          {Array.from({ length: TOTAL_PARTS }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={`h-2 flex-1 rounded-full transition-colors ${
                n < step.part
                  ? "bg-[#3B62E3]"
                  : n === step.part
                    ? "bg-white ring-2 ring-inset ring-[#3B62E3]"
                    : "bg-[#CDD3E0]"
              }`}
            />
          ))}
        </div>
        <span className="shrink-0 text-base text-zinc-500 tabular-nums">
          {step.part}/{TOTAL_PARTS}
        </span>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-6 p-4 sm:p-6 lg:px-12 lg:py-7">
        {/* ================================================================== */}
        {/* VÄNSTER: WHITEBOARDEN                                               */}
        {/* ================================================================== */}
        <section className="relative bg-white rounded-[2.25rem] border-[14px] border-[#373C4B] shadow-xl flex flex-col min-h-[560px] lg:min-h-0 overflow-hidden">
          <div className="absolute -top-px -left-px w-4 h-4 bg-zinc-950 rounded-br-lg pointer-events-none" />
          <div className="absolute -top-px -right-px w-4 h-4 bg-zinc-950 rounded-bl-lg pointer-events-none" />
          <div className="absolute -bottom-px -left-px w-4 h-4 bg-zinc-950 rounded-tr-lg pointer-events-none" />
          <div className="absolute -bottom-px -right-px w-4 h-4 bg-zinc-950 rounded-tl-lg pointer-events-none" />

          <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-9 sm:py-8 space-y-5">
            {/* Var eleven befinner sig */}
            <p className="font-whiteboard text-base uppercase tracking-wide text-[#5B46D6]">
              {eyebrow}
            </p>

            {/* Tavlan är nästan tom medan texten läses */}
            {boardStage === "listening_blank" && (
              <div className="space-y-5">
                <h2 className="font-whiteboard text-4xl text-[#5B46D6]">
                  {supportFree || step.phase === "diktamen" || (audioUnlocked && !isPlayingAudio)
                    ? "Läs texten"
                    : "Lyssna nu"}
                </h2>
                {supportFree || step.phase === "diktamen" ? (
                  <>
                    <p className={BODY}>
                      {step.phase === "diktamen"
                        ? "Läs texten till höger tyst först."
                        : "Läs texten till höger själv."}
                    </p>
                    <button onClick={revealBoardNow} className={PRIMARY}>
                      Jag har läst klart
                    </button>
                  </>
                ) : !audioUnlocked ? (
                  <div className="flex flex-col items-start gap-4">
                    <button onClick={handleStartAndListen} className={PRIMARY}>
                      Lyssna på texten
                    </button>
                    <button onClick={revealBoardNow} className={LINK}>
                      Starta utan att lyssna
                    </button>
                  </div>
                ) : (
                  <button onClick={revealBoardNow} className={LINK}>
                    Jag är redo – gå vidare
                  </button>
                )}
              </div>
            )}

            {/* Uppgift, svar och återkoppling */}
            {boardStage !== "listening_blank" && (
              <div className="space-y-5">
                <h2 className="font-whiteboard text-4xl text-[#5B46D6]">
                  {phaseHeading(step)}
                </h2>

                {(showHistory ? boardHistory : []).map((item, idx) => {
                  if (item.sender === "student") {
                    return (
                      <div key={idx} className="space-y-1.5">
                        <p className="font-whiteboard text-base text-zinc-500">Ditt svar</p>
                        <p className="font-whiteboard text-xl text-zinc-700 whitespace-pre-line rounded-2xl border-2 border-zinc-300 px-5 py-3">
                          {item.text}
                        </p>
                      </div>
                    );
                  }
                  if (!item.tone) {
                    return (
                      <p key={idx} className={`${BODY} whitespace-pre-line`}>
                        {item.text}
                      </p>
                    );
                  }
                  const showRetry =
                    idx === lastFeedbackIndex && canRetry && boardStage === "showing_feedback";
                  return (
                    <div key={idx} className="space-y-4">
                      <EddaSays
                        star={
                          item.tone === "feedback" &&
                          item.ok === true &&
                          (task.kind === "choice" || task.kind === "free")
                        }
                      >
                        {item.text}
                      </EddaSays>
                      {(item.strength || item.nextStep || showRetry) && (
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 space-y-3">
                          {item.strength && (
                            <div>
                              <p className="font-whiteboard text-lg text-zinc-800">
                                Det här gjorde du bra
                              </p>
                              <p className="font-whiteboard text-lg text-zinc-600">
                                {item.strength}
                              </p>
                            </div>
                          )}
                          {item.nextStep && (
                            <div>
                              <p className="font-whiteboard text-lg text-zinc-800">Nästa steg</p>
                              <p className="font-whiteboard text-lg text-zinc-600">
                                {item.nextStep}
                              </p>
                            </div>
                          )}
                          {showRetry && (
                            <div className="flex justify-end">
                              <button onClick={handleRetry} className={SECONDARY}>
                                Försök igen
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* MODELLERING: Edda berättar först, sedan visas det hon sa */}
                {task.kind === "think_aloud" &&
                  (eddaSpeaking ? (
                    <EddaSays label="Edda berättar">
                      <TalkingDots />
                    </EddaSays>
                  ) : thoughtIndex < 0 ? (
                    <>
                      <EddaSays>{task.intro}</EddaSays>
                      <button onClick={handleNextThought} className={PRIMARY}>
                        Visa hur du tänker
                      </button>
                    </>
                  ) : thoughtIndex < task.thoughts.length ? (
                    <>
                      <EddaSays>
                        <p className="font-bold">
                          <span className="text-[#5B46D6]">{thoughtIndex + 1}.</span>{" "}
                          {task.thoughts[thoughtIndex].label}
                        </p>
                        <p>{task.thoughts[thoughtIndex].text}</p>
                      </EddaSays>
                      <button onClick={handleNextThought} className={PRIMARY}>
                        {thoughtIndex === task.thoughts.length - 1
                          ? "Visa slutsatsen"
                          : "Nästa tanke"}
                      </button>
                    </>
                  ) : (
                    <>
                      <ol className="space-y-1">
                        {task.thoughts.map((t, i) => (
                          <li key={i} className="font-whiteboard text-xl text-zinc-500">
                            {i + 1}. {t.label}
                          </li>
                        ))}
                      </ol>
                      <div className="rounded-2xl border-2 border-[#C9C2EE] bg-[#F7F6FD] px-5 py-4 space-y-1">
                        <p className="font-whiteboard text-lg uppercase tracking-wide text-[#5B46D6]">
                          Slutsats
                        </p>
                        <p className={BODY}>{task.summary}</p>
                      </div>
                      <button onClick={handleProceedToNextStep} className={PRIMARY}>
                        Jag hänger med – visa ett bra exempel
                      </button>
                    </>
                  ))}

                {/* START: välj intresse */}
                {task.kind === "interest" && boardStage === "active_task" && (
                  <div className="space-y-3">
                    {INTERESTS.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => handleInterestSelect(i.id)}
                        className={OPTION}
                      >
                        <span>{i.emoji}</span>
                        <span>{i.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* FLERVAL A/B/C */}
                {task.kind === "choice" &&
                  selectedOption === null &&
                  boardStage === "active_task" && (
                    <div className="space-y-3">
                      {task.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionSelect(opt)}
                          className={OPTION}
                        >
                          <span className="font-bold text-[#5B46D6]">{opt.id}</span>
                          <span>{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                {/* FRITEXT */}
                {boardStage === "active_task" && task.kind === "free" && (
                  <form onSubmit={handleFreeTextSubmit} className="space-y-4">
                    <label className="block space-y-2">
                      <span className="font-whiteboard text-base text-zinc-500">
                        {supportFree ? "Ditt svar, utan ledtråd" : "Ditt svar"}
                      </span>
                      <textarea
                        value={freeText}
                        onChange={(e) => setFreeText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleFreeTextSubmit();
                        }}
                        rows={4}
                        placeholder={(!supportFree && task.placeholder) || "Skriv ditt svar här..."}
                        disabled={isSubmitting}
                        className="font-whiteboard block w-full rounded-2xl border-2 border-zinc-600 bg-white px-5 py-3 text-xl text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-[#3B62E3] select-text"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={!freeText.trim() || isSubmitting}
                      className={PRIMARY}
                    >
                      {isSubmitting ? "Edda läser..." : "Svara"}
                    </button>
                  </form>
                )}

                {/* LITEN AI-STÖTTNING: ledtråd */}
                {showHintButton && (
                  <button onClick={handleHint} className={`${LINK} flex items-center gap-1.5`}>
                    <Lightbulb size={15} />
                    <span>Jag behöver en ledtråd</span>
                  </button>
                )}

                {/* DIKTAMEN */}
                {task.kind === "dictation" && boardStage === "active_task" && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleDictationToggle}
                      aria-label={isRecording ? "Avsluta högläsning" : "Starta högläsning"}
                      className={`h-16 w-16 shrink-0 rounded-full flex items-center justify-center text-white transition shadow-lg ${
                        isRecording ? "bg-red-600 animate-pulse" : "bg-[#3B62E3] hover:bg-[#2F52C9]"
                      }`}
                    >
                      {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>
                    <span className="font-whiteboard text-xl text-zinc-500">
                      {isRecording
                        ? "Spelar in högläsning... Klicka igen när du är klar."
                        : "Klicka för att starta högläsning"}
                    </span>
                  </div>
                )}

                {/* RESULTAT: läsprofil efter slutdiagnosen */}
                {task.kind === "result" &&
                  (diagPending ? (
                    <p className={`${BODY} animate-pulse`}>Edda rättar din slutdiagnos...</p>
                  ) : (
                    <div className="space-y-4">
                      {diagSteps.map((s) => {
                        const r = diagResults[s.id];
                        const ev = r && r !== "pending" && r !== "error" ? r : null;
                        const cat = s.task.kind === "free" ? s.task.category : "resonera";
                        return (
                          <div
                            key={s.id}
                            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3"
                          >
                            <p
                              className={`font-whiteboard text-xl ${
                                ev?.passed ? "text-emerald-800" : "text-amber-800"
                              }`}
                            >
                              {ev ? (ev.passed ? "✓" : "→") : "•"} {CATEGORY_LABELS[cat]}
                            </p>
                            <p className="font-whiteboard text-lg text-zinc-600">
                              {ev ? ev.boardFeedback : "Kunde inte rättas automatiskt."}
                            </p>
                            {ev && !ev.passed && ev.nextStep && (
                              <p className="font-whiteboard text-lg text-zinc-600">
                                Nästa steg: {ev.nextStep}
                              </p>
                            )}
                          </div>
                        );
                      })}
                      {(() => {
                        const evs = diagSteps
                          .map((s) => diagResults[s.id])
                          .filter((r): r is Evaluation => !!r && typeof r === "object");
                        const passedCount = evs.filter((e) => e.passed).length;
                        return (
                          <EddaSays>
                            Du klarade {passedCount} av {diagSteps.length} frågor helt utan stöd på
                            en lång text. Under lektionen nådde du textnivå {adaptState.level} av
                            3.{" "}
                            {passedCount >= 4
                              ? "Nästa gång börjar vi på en högre nivå!"
                              : "Nästa gång tränar vi mer på det som står under Nästa steg."}
                          </EddaSays>
                        );
                      })()}
                    </div>
                  ))}

                {/* VIDARE EFTER ÅTERKOPPLING */}
                {boardStage === "showing_feedback" && !isLastStep && (
                  <button onClick={handleProceedToNextStep} className={PRIMARY}>
                    Gå vidare
                  </button>
                )}
                {isLastStep && !diagPending && (
                  <p className="font-whiteboard inline-flex items-center gap-2 text-xl text-emerald-700">
                    <Check size={18} />
                    <span>Alla steg genomförda!</span>
                  </p>
                )}
              </div>
            )}
            <div ref={boardEndRef} />
          </div>
        </section>

        {/* ================================================================== */}
        {/* HÖGER: LÄSTEXT                                                      */}
        {/* ================================================================== */}
        <section className="flex flex-col rounded-[1.75rem] bg-white border border-zinc-200 px-7 py-7 sm:px-10 min-h-[480px] lg:min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            {step.text ? (
              <>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {step.text.source || "Lästext"}
                  </span>
                  {!supportFree && (
                    <button
                      onClick={toggleReadAloud}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        isPlayingAudio
                          ? "bg-red-50 text-red-600"
                          : "bg-[#EEF1FB] text-[#3B62E3] hover:bg-[#E0E6FA]"
                      }`}
                    >
                      {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span>{isPlayingAudio ? "Pausa" : "Lyssna"}</span>
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto pr-1 min-h-0 font-serif">
                  <h3 className="text-2xl text-zinc-800 mb-4">{step.text.title}</h3>
                  <div
                    ref={readingRef}
                    className="text-base sm:text-[17px] leading-[1.75] text-zinc-600 space-y-4 select-text"
                  >
                    {paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className={p === step.text?.signature ? "text-right italic text-sm" : ""}
                      >
                        {renderHighlighted(p, earlierHighlights, currentHighlights)}
                      </p>
                    ))}
                  </div>

                  {showGlossary && (
                    <div className="mt-6 rounded-2xl bg-zinc-50 border border-zinc-200 px-5 py-4 font-sans">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Ord att känna till
                      </p>
                      <ul className="space-y-1 text-sm text-zinc-700">
                        {step.text.glossary!.map((g) => (
                          <li key={g.term}>
                            <span className="font-semibold">{g.term}</span>: {g.meaning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : step.phase === "aterkallning" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-zinc-400">
                <Brain size={36} />
                <p className="text-base font-semibold text-zinc-600">Inget textstöd</p>
                <p className="text-sm max-w-xs">
                  Nu befäster du det du har lärt dig genom att svara helt ur minnet.
                </p>
              </div>
            ) : (
              <LessonOverview currentPart={step.part} />
            )}
          </div>

          <p className="pt-4 text-xs text-zinc-400">
            {step.phase === "modellering"
              ? "Gula markeringar visar vad Edda lägger märke till när hon tänker högt."
              : step.phase === "traning"
                ? "Behöver du hjälp? Be om en ledtråd på tavlan, så markerar Edda var du ska titta."
                : supportFree
                  ? "Utan stöd: ingen uppläsning, inga markeringar och inga ledtrådar."
                  : "Edda anpassar texterna efter dina intressen och hur det går för dig."}
          </p>
        </section>
      </div>
    </main>
  );
}

// ============================================================================
// Utseende: delade stilar och Edda
// ============================================================================

/** Del 1–4 plus slutdiagnosen. */
const TOTAL_PARTS = PARTS.length + 1;

const BODY = "font-whiteboard text-2xl sm:text-[1.7rem] leading-snug text-zinc-900";
const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#3B62E3] px-6 py-3 text-base font-bold text-white transition hover:bg-[#2F52C9] disabled:opacity-40";
const SECONDARY =
  "inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-2.5 text-base font-bold text-zinc-800 transition hover:bg-zinc-50";
const LINK = "font-whiteboard text-lg text-[#3F7FA6] transition hover:text-[#2C5F80]";
const OPTION =
  "font-whiteboard flex w-full items-start gap-3 rounded-2xl border-2 border-zinc-200 px-5 py-3 text-left text-xl sm:text-2xl text-zinc-900 transition hover:border-[#3B62E3] hover:bg-[#F5F7FE]";

function phaseHeading(step: LessonStep): string {
  switch (step.phase) {
    case "intro":
      return "Välkommen!";
    case "modellering":
      return "Edda visar hur hon tänker";
    case "traning":
      return "Nu är det din tur";
    case "aterkallning":
      return step.text ? "Återkalla utan stöd" : "Återkalla ur minnet";
    case "diktamen":
      return "Läs högt";
    case "diagnos":
      return "Slutdiagnos";
    case "resultat":
      return "Din läsprofil";
  }
}

/** Visas i pratbubblan medan Edda pratar, i stället för text. */
function TalkingDots() {
  return (
    <span role="status" aria-label="Edda pratar" className="flex h-7 items-center gap-1.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2.5 w-2.5 rounded-full bg-[#8B7ADB] animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** Edda: lila figur med pratbubbla. Används för allt hon säger till eleven. */
function EddaSays({
  children,
  label = "Edda",
  star = false,
}: {
  children: React.ReactNode;
  label?: string;
  /** Stjärna för ett bra svar. */
  star?: boolean;
}) {
  return (
    <div className="flex items-end gap-3 sm:gap-4">
      <div
        aria-hidden
        className="mb-1 flex h-14 w-14 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#7B66DC] to-[#5B46C8] shadow-[0_8px_18px_rgba(91,70,200,0.3)]"
      >
        <span className="h-3 w-1.5 rounded-full bg-white" />
        <span className="h-3 w-1.5 rounded-full bg-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1.5 pl-5 text-base font-bold text-[#5B46D6]">{label}</p>
        <div
          className={`flex items-center gap-4 rounded-[1.6rem] border-2 bg-white px-5 py-4 text-lg leading-snug text-zinc-800 ${
            star ? "border-[#8B7ADB]" : "border-[#C9C2EE]"
          }`}
        >
          {star && (
            <Star
              role="img"
              aria-label="Stjärna för ett bra svar"
              size={40}
              className="shrink-0 fill-[#F5C84B] text-[#D9A63A]"
            />
          )}
          <div className="min-w-0 flex-1 space-y-2 whitespace-pre-line">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Översikt över lektionen (visas i textkortet när det inte finns någon text)
// ============================================================================

function LessonOverview({ currentPart }: { currentPart: number }) {
  const items = [
    ...PARTS.map((p) => ({ part: p.part, title: p.title })),
    { part: 5, title: "Slutdiagnos: lång text utan stöd" },
  ];
  return (
    <div className="space-y-5">
      <h3 className="font-serif text-2xl text-zinc-800">Så här går lektionen till</h3>
      <ol className="space-y-3">
        {items.map((it) => (
          <li
            key={it.part}
            className={`flex items-start gap-3 text-base ${
              it.part < currentPart
                ? "text-zinc-400"
                : it.part === currentPart
                  ? "text-zinc-900 font-semibold"
                  : "text-zinc-600"
            }`}
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                it.part === currentPart ? "bg-[#3B62E3] text-white" : "bg-zinc-100"
              }`}
            >
              {it.part < currentPart ? "✓" : it.part}
            </span>
            <span>{it.title}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-zinc-500 leading-relaxed">
        I varje del: <strong>1. Modellering</strong> (Edda tänker högt och visar ett bra exempel)
        → <strong>2. Träna själv</strong> (med ledtrådar om du behöver) →{" "}
        <strong>3. Återkalla utan stöd</strong>. Texterna börjar korta och blir längre ju säkrare
        du blir.
      </p>
    </div>
  );
}
