"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  Check,
  Lightbulb,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
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

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Markerar fraser i gult i lästexten. */
function renderHighlighted(text: string, phrases: string[]) {
  const unique = Array.from(new Set(phrases.filter(Boolean)));
  if (unique.length === 0) return text;
  const re = new RegExp(`(${unique.map(escapeRegExp).join("|")})`, "g");
  return text.split(re).map((chunk, i) =>
    unique.includes(chunk) ? (
      <mark key={i} className="bg-[#FEF08A] px-0.5 rounded-sm font-medium text-zinc-950">
        {chunk}
      </mark>
    ) : (
      <Fragment key={i}>{chunk}</Fragment>
    ),
  );
}

function phaseIntro(step: LessonStep): string | null {
  const part = PARTS.find((p) => p.part === step.part);
  switch (step.phase) {
    case "modellering":
      return `${step.partTitle.toUpperCase()}\nMål: ${part?.goal ?? ""}\nFörst visar jag hur jag tänker.`;
    case "traning":
      return "TRÄNA SJÄLV: Nu är det din tur på en ny text! Behöver du hjälp kan du be om en ledtråd.";
    case "aterkallning":
      return step.text
        ? "ÅTERKALLA UTAN STÖD: Ny text, och nu svarar du helt själv. Inga ledtrådar och ingen uppläsning. Visa vad du kan!"
        : null;
    case "diagnos":
      return "SLUTDIAGNOS: En lång text, som på nationella provet. Du svarar på fem frågor helt utan stöd. Ta den tid du behöver.";
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
  const [thoughtIndex, setThoughtIndex] = useState(0);
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
    const text = index < t.thoughts.length ? t.thoughts[index].text : t.summary;
    playText(text, () => {});
  }

  useEffect(() => () => stopAudio(), []);

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
    if (s.task.kind === "think_aloud" && speak) speakThought(s.task, 0);
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
    setThoughtIndex(0);
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

  const progressPercent = Math.round((stepIndex / (steps.length - 1)) * 100);
  const interestInfo = INTERESTS.find((i) => i.id === interest);
  const isLastStep = stepIndex === steps.length - 1;

  const highlights: string[] = [];
  if (task.kind === "think_aloud" && boardStage !== "listening_blank") {
    task.thoughts
      .slice(0, thoughtIndex + 1)
      .forEach((t) => t.highlight && highlights.push(t.highlight));
  }
  if (hintShown && (task.kind === "choice" || task.kind === "free") && task.hint?.highlight) {
    highlights.push(task.hint.highlight);
  }

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

  // ==========================================================================
  // Rendering
  // ==========================================================================

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-3 sm:p-6 lg:p-8 select-none antialiased">
      {/* Handskrivet typsnitt (Patrick Hand) */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap");
        .font-whiteboard {
          font-family: "Patrick Hand", cursive, sans-serif;
        }
      `}</style>

      <div className="w-full max-w-6xl flex flex-col gap-4">
        {/* SIDHUVUD: del, fas-progression och anpassning */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              {step.partTitle}
            </span>
            {step.part >= 1 && step.part <= 4 ? (
              <div className="flex items-center gap-1">
                {CYCLE.map((ph, i) => {
                  const current = CYCLE.indexOf(step.phase);
                  const state = i < current ? "done" : i === current ? "active" : "todo";
                  return (
                    <Fragment key={ph}>
                      {i > 0 && <span className="text-zinc-300 text-xs">→</span>}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          state === "active"
                            ? "bg-zinc-900 text-white"
                            : state === "done"
                              ? "bg-zinc-200 text-zinc-600"
                              : "border border-zinc-200 text-zinc-400"
                        }`}
                      >
                        {state === "done" && "✓ "}
                        {PHASE_LABELS[ph]}
                      </span>
                    </Fragment>
                  );
                })}
              </div>
            ) : (
              step.phase !== "intro" && (
                <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {PHASE_LABELS[step.phase]}
                </span>
              )
            )}
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-400">
            {interestInfo && (
              <span className="text-zinc-500">
                {interestInfo.emoji} {interestInfo.label}
              </span>
            )}
            {step.leveled && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-amber-700">
                Textnivå {stepLevel}/3
              </span>
            )}
            {step.phase === "diagnos" && (
              <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-red-700">
                NP-nivå
              </span>
            )}
            <span>{progressPercent}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ================================================================ */}
          {/* VÄNSTER: WHITEBOARDEN                                             */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 relative bg-white rounded-3xl border-[14px] border-[#374151] shadow-2xl flex flex-col p-6 sm:p-9 min-h-[560px] lg:h-[680px] overflow-hidden">
            <div className="absolute -top-[14px] -left-[14px] w-8 h-8 bg-zinc-950 rounded-tl-2xl pointer-events-none" />
            <div className="absolute -top-[14px] -right-[14px] w-8 h-8 bg-zinc-950 rounded-tr-2xl pointer-events-none" />
            <div className="absolute -bottom-[14px] -left-[14px] w-8 h-8 bg-zinc-950 rounded-bl-2xl pointer-events-none" />
            <div className="absolute -bottom-[14px] -right-[14px] w-8 h-8 bg-zinc-950 rounded-br-2xl pointer-events-none" />

            <div className="w-full mb-5">
              <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#DC2626] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col">
              {/* FAS 1: Tavlan är vit medan texten läses */}
              {boardStage === "listening_blank" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-5">
                  {boardHistory
                    .filter((e) => e.tone === "note")
                    .map((e, i) => (
                      <p
                        key={i}
                        className="font-whiteboard text-lg sm:text-xl text-sky-700 max-w-md whitespace-pre-line"
                      >
                        {e.text}
                      </p>
                    ))}
                  {supportFree || step.phase === "diktamen" ? (
                    <>
                      <p className="font-whiteboard text-2xl sm:text-3xl text-zinc-700 max-w-md">
                        {step.phase === "diktamen"
                          ? "Läs igenom texten till höger tyst först."
                          : "Läs texten till höger själv, utan uppläsning. Klicka när du har läst klart."}
                      </p>
                      <button
                        onClick={revealBoardNow}
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition shadow-md"
                      >
                        <Play size={14} />
                        <span>Jag har läst – visa uppgiften</span>
                      </button>
                    </>
                  ) : !audioUnlocked ? (
                    <>
                      <p className="font-whiteboard text-2xl sm:text-3xl text-zinc-700 max-w-md">
                        Läs eller lyssna på texten till höger innan uppgiften visas på tavlan.
                      </p>
                      <button
                        onClick={handleStartAndListen}
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition shadow-md"
                      >
                        <Volume2 size={16} />
                        <span>Lyssna på texten först</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-whiteboard text-2xl sm:text-3xl text-zinc-500 animate-pulse">
                        {isPlayingAudio
                          ? "Lyssna noga på texten till höger..."
                          : "Läs igenom texten till höger..."}
                      </p>
                      <button
                        onClick={revealBoardNow}
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
                      >
                        <Play size={12} />
                        <span>Jag är redo – visa uppgiften</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* FAS 2 & 3: Uppgift, svar och återkoppling */}
              {boardStage !== "listening_blank" && (
                <div className="space-y-4">
                  {boardHistory.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p
                        className={`font-whiteboard leading-snug tracking-wide whitespace-pre-line ${
                          item.tone === "note"
                            ? "text-lg sm:text-xl text-sky-700"
                            : item.tone === "hint"
                              ? "text-xl sm:text-2xl text-amber-700"
                              : item.tone === "feedback"
                                ? `text-xl sm:text-2xl ${item.ok === false ? "text-amber-800" : "text-emerald-800"}`
                                : item.sender === "student"
                                  ? "text-xl sm:text-2xl text-[#5B46E5]"
                                  : "text-xl sm:text-2xl text-zinc-900"
                        }`}
                      >
                        {item.text}
                      </p>
                      {item.strength && (
                        <p className="font-whiteboard text-lg sm:text-xl text-emerald-800 pt-1">
                          ✓ Styrka: {item.strength}
                        </p>
                      )}
                      {item.nextStep && (
                        <p className="font-whiteboard text-lg sm:text-xl text-amber-800">
                          → Nästa steg: {item.nextStep}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* MODELLERING: Edda tänker högt */}
                  {task.kind === "think_aloud" && (
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                        <Brain size={14} /> Edda tänker högt
                      </p>
                      {task.thoughts.slice(0, thoughtIndex + 1).map((t, i) => (
                        <p
                          key={i}
                          className="font-whiteboard text-xl sm:text-2xl leading-snug text-sky-900 border-l-4 border-sky-200 pl-3"
                        >
                          <span className="font-bold">{i + 1}.</span> {t.text}
                        </p>
                      ))}
                      {thoughtIndex >= task.thoughts.length ? (
                        <>
                          <p className="font-whiteboard text-xl sm:text-2xl leading-snug text-emerald-800 bg-emerald-50 rounded-xl p-3">
                            {task.summary}
                          </p>
                          <button
                            onClick={handleProceedToNextStep}
                            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition shadow-sm"
                          >
                            <span>Jag hänger med – visa ett bra exempel</span>
                            <ArrowRight size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleNextThought}
                          className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-5 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition"
                        >
                          <span>
                            {thoughtIndex === task.thoughts.length - 1
                              ? "Visa slutsatsen"
                              : "Nästa tanke"}
                          </span>
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* START: välj intresse */}
                  {task.kind === "interest" && boardStage === "active_task" && (
                    <div className="space-y-2 pt-2">
                      {INTERESTS.map((i) => (
                        <button
                          key={i.id}
                          onClick={() => handleInterestSelect(i.id)}
                          className="font-whiteboard w-full text-left text-2xl sm:text-3xl text-zinc-900 hover:text-[#5B46E5] transition flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50"
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
                      <div className="space-y-2 pt-2">
                        {task.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt)}
                            className="font-whiteboard w-full text-left text-xl sm:text-2xl text-zinc-900 hover:text-[#5B46E5] transition flex items-start gap-2 p-1.5 rounded-xl hover:bg-zinc-50"
                          >
                            <span className="font-bold underline">{opt.id}:</span>
                            <span>{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* LITEN AI-STÖTTNING: ledtråd */}
                  {showHintButton && (
                    <button
                      onClick={handleHint}
                      className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition"
                    >
                      <Lightbulb size={13} />
                      <span>Jag behöver en ledtråd</span>
                    </button>
                  )}

                  {/* DIKTAMEN */}
                  {task.kind === "dictation" && boardStage === "active_task" && (
                    <div className="pt-4 flex flex-col items-center gap-3">
                      <button
                        onClick={handleDictationToggle}
                        className={`h-16 w-16 rounded-full flex items-center justify-center transition shadow-lg ${
                          isRecording
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-zinc-900 text-white hover:bg-zinc-800"
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
                  {task.kind === "result" && (
                    <div className="space-y-4">
                      <p className="font-whiteboard text-3xl text-zinc-900">Din läsprofil</p>
                      {diagPending ? (
                        <p className="font-whiteboard text-2xl text-zinc-500 animate-pulse">
                          Edda rättar din slutdiagnos...
                        </p>
                      ) : (
                        <>
                          {diagSteps.map((s) => {
                            const r = diagResults[s.id];
                            const ev = r && r !== "pending" && r !== "error" ? r : null;
                            const cat = s.task.kind === "free" ? s.task.category : "resonera";
                            return (
                              <div key={s.id} className="space-y-0.5">
                                <p
                                  className={`font-whiteboard text-xl sm:text-2xl ${
                                    ev?.passed ? "text-emerald-800" : "text-amber-800"
                                  }`}
                                >
                                  {ev ? (ev.passed ? "✓" : "→") : "•"} {CATEGORY_LABELS[cat]}
                                  {ev ? `: ${ev.boardFeedback}` : ": Kunde inte rättas automatiskt."}
                                </p>
                                {ev && !ev.passed && ev.nextStep && (
                                  <p className="font-whiteboard text-lg text-amber-700 pl-6">
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
                              <p className="font-whiteboard text-xl sm:text-2xl text-sky-800 pt-2">
                                Du klarade {passedCount} av {diagSteps.length} frågor helt utan stöd
                                på en lång text. Under lektionen nådde du textnivå{" "}
                                {adaptState.level} av 3.{" "}
                                {passedCount >= 4
                                  ? "Nästa gång börjar vi på en högre nivå!"
                                  : "Nästa gång tränar vi mer på det som står under Nästa steg."}
                              </p>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}

                  {/* KNAPPAR EFTER ÅTERKOPPLING */}
                  {boardStage === "showing_feedback" && (
                    <div className="pt-4 flex flex-wrap gap-2">
                      {canRetry ? (
                        <>
                          <button
                            onClick={handleRetry}
                            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 transition shadow-sm"
                          >
                            <RotateCcw size={14} />
                            <span>Förbättra mitt svar</span>
                          </button>
                          <button
                            onClick={handleProceedToNextStep}
                            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                          >
                            <span>Gå vidare</span>
                            <ArrowRight size={14} />
                          </button>
                        </>
                      ) : !isLastStep ? (
                        <button
                          onClick={handleProceedToNextStep}
                          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition shadow-sm"
                        >
                          <span>Redo för nästa steg</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : null}
                    </div>
                  )}
                  {isLastStep && !diagPending && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-xs font-semibold text-white">
                      <Check size={14} />
                      <span>Alla steg genomförda!</span>
                    </div>
                  )}
                  <div ref={boardEndRef} />
                </div>
              )}
            </div>

            {/* FRITEXT-INMATNING */}
            {boardStage === "active_task" && task.kind === "free" && (
              <form onSubmit={handleFreeTextSubmit} className="mt-4">
                <div className="flex items-end gap-2 rounded-2xl border-2 border-zinc-700 bg-white px-4 py-2.5 shadow-md">
                  <textarea
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleFreeTextSubmit();
                    }}
                    rows={3}
                    placeholder={
                      (!supportFree && task.placeholder) || "Skriv ditt svar här..."
                    }
                    disabled={isSubmitting}
                    className="w-full resize-none bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 select-text"
                  />
                  <button
                    type="submit"
                    disabled={!freeText.trim() || isSubmitting}
                    className="shrink-0 rounded-full bg-zinc-900 px-5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-30"
                  >
                    {isSubmitting ? "Edda läser..." : "Svara"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ================================================================ */}
          {/* HÖGER: LÄSTEXT                                                    */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-white border border-zinc-200/90 p-8 shadow-sm min-h-[560px] lg:h-[680px]">
            {step.text ? (
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {step.text.source || "Lästext"}
                  </span>
                  {!supportFree && (
                    <button
                      onClick={toggleReadAloud}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        isPlayingAudio
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span>{isPlayingAudio ? "Pausa" : "Lyssna"}</span>
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto pr-1 min-h-0">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-3">{step.text.title}</h3>
                  <div className="text-sm sm:text-base leading-relaxed text-zinc-700 font-serif space-y-3 select-text">
                    {paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className={p === step.text?.signature ? "text-right italic text-sm" : ""}
                      >
                        {renderHighlighted(p, highlights)}
                      </p>
                    ))}
                  </div>

                  {showGlossary && (
                    <div className="mt-5 rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
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
              </div>
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

            <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-400">
              {step.phase === "modellering"
                ? "💡 Gula markeringar visar vad Edda lägger märke till när hon tänker högt."
                : step.phase === "traning"
                  ? "💡 Behöver du hjälp? Be om en ledtråd på tavlan, så markerar Edda var du ska titta."
                  : supportFree
                    ? "🎯 Utan stöd: ingen uppläsning, inga markeringar och inga ledtrådar."
                    : "💡 Edda anpassar texterna efter dina intressen och hur det går för dig."}
            </div>
          </div>
        </div>
      </div>
    </main>
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
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-4">
        Så här går lektionen till
      </p>
      <ol className="space-y-3">
        {items.map((it) => (
          <li
            key={it.part}
            className={`flex items-start gap-3 text-sm ${
              it.part < currentPart
                ? "text-zinc-400"
                : it.part === currentPart
                  ? "text-zinc-900 font-semibold"
                  : "text-zinc-600"
            }`}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-bold">
              {it.part < currentPart ? "✓" : it.part}
            </span>
            <span>{it.title}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-zinc-500 leading-relaxed">
        I varje del: <strong>1. Modellering</strong> (Edda tänker högt och visar ett bra
        exempel) → <strong>2. Träna själv</strong> (med ledtrådar om du behöver) →{" "}
        <strong>3. Återkalla utan stöd</strong>. Texterna börjar korta och blir längre ju
        säkrare du blir.
      </p>
    </div>
  );
}
