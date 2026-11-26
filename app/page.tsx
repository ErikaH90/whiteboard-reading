"use client";

import Image from "next/image";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Check, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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
import { criteriaFor } from "./lesson/criteria";
import {
  CHOICE_LEVEL,
  EMPTY_MAP,
  countsOnMap,
  defaultTip,
  earnedLevel,
  levelOf,
  record,
  type Quality,
} from "./lesson/progress";
import { LevelWedge, ReadingMapChart, ReadingMapLegend } from "./lesson/ui/ReadingMapChart";
import { ReadingSettings, readingStyle, useReadingPrefs } from "./lesson/ui/ReadingSettings";
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
  /** Det korta som står på tavlan (eller det eleven skrev). Det Edda säger högt står aldrig här. */
  text: string;
  tone?: "feedback" | "hint" | "note";
  ok?: boolean;
  /** Edda säger något högt till detta. Tavlan visar prickarna tills hon har tystnat. */
  spoken?: boolean;
  /** Nivån AI-Edda satte på svaret. Visas som en tårtbit i pratbubblan. */
  quality?: Quality;
  /** Bocklistan: vad som finns i svaret och vad som saknas. */
  checks?: { label: string; met: boolean }[];
  /** Stödord i en omvisning, med stället i texten som Edda pekar på. */
  points?: { label: string; highlight?: string }[];
};

/** Det Edda pekar på i lästexten: grönt för det eleven träffade, gult för det hon visar. */
type Marks = { phrases: string[]; good: boolean; paragraph?: number };

/** Ordet eleven har klickat på, och Eddas förklaring av det. */
type WordNote = {
  paragraph: number;
  start: number;
  end: number;
  word: string;
  status: "loading" | "speaking" | "done" | "error";
  meaning: string;
};

type WordClick = (start: number, end: number, word: string) => void;

const WORD = /[\p{L}\p{N}]+(?:[-'’:][\p{L}\p{N}]+)*/gu;

/** Meningen som ordet står i, så att Edda kan förklara ordet i sitt sammanhang. */
function sentenceAround(text: string, start: number, end: number): string {
  const before = text.slice(0, start);
  const from = Math.max(before.lastIndexOf(". "), before.lastIndexOf("! "), before.lastIndexOf("? ")) + 1;
  const rest = text.slice(end).search(/[.!?](\s|$)/);
  return text.slice(from, rest === -1 ? text.length : end + rest + 1).trim();
}
const NO_MARKS: Marks = { phrases: [], good: false };

/** Mellan försöken rensas tavlan: bara själva frågan står kvar. */
function promptOnly(history: BoardEntry[]): BoardEntry[] {
  return history.filter((e) => e.sender === "teacher" && !e.tone);
}

type Evaluation = {
  passed: boolean;
  /** Saknas om AI-bedömningen inte gick att genomföra. */
  quality?: Quality | null;
  checks?: boolean[];
  quote?: string;
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
 * är starkt gul, tidigare fraser är nedtonade så att blicken dras rätt. Det eleven
 * själv träffade i sitt svar (`good`) är grönt.
 */
function Highlighted({
  text,
  earlier,
  current,
  good,
  picked,
  onWord,
}: {
  text: string;
  earlier: string[];
  current: string[];
  good: string[];
  picked?: { start: number; end: number } | null;
  onWord?: WordClick;
}) {
  /** Varje ord går att klicka på när Edda får förklara. */
  const words = (chunk: string, offset: number): React.ReactNode => {
    if (!onWord) return chunk;
    const parts: React.ReactNode[] = [];
    let last = 0;
    for (const m of chunk.matchAll(WORD)) {
      const at = m.index;
      if (at > last) parts.push(chunk.slice(last, at));
      parts.push(
        <span
          key={at}
          onClick={() => onWord(offset + at, offset + at + m[0].length, m[0])}
          className="cursor-pointer rounded-sm hover:bg-[#FEF9C3]"
        >
          {m[0]}
        </span>,
      );
      last = at + m[0].length;
    }
    if (last < chunk.length) parts.push(chunk.slice(last));
    return parts;
  };

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
  paint(good, 3);
  if (picked) levels.fill(2, picked.start, picked.end);

  const out: React.ReactNode[] = [];
  for (let start = 0; start < text.length; ) {
    let end = start + 1;
    while (end < text.length && levels[end] === levels[start]) end++;
    const chunk = text.slice(start, end);
    out.push(
      levels[start] === 0 ? (
        <Fragment key={start}>{words(chunk, start)}</Fragment>
      ) : (
        <mark
          key={start}
          data-current={levels[start] >= 2 ? "" : undefined}
          className={
            levels[start] === 3
              ? "bg-[#BFE3C4] px-0.5 rounded-sm font-medium text-zinc-950"
              : levels[start] === 2
                ? "bg-[#FDE047] px-0.5 rounded-sm font-medium text-zinc-950"
                : "bg-[#FEF9C3] rounded-sm text-inherit"
          }
        >
          {words(chunk, start)}
        </mark>
      ),
    );
    start = end;
  }
  return out;
}

/** Kort rad på tavlan när en ny fas börjar. */
function phaseIntro(step: LessonStep): string | null {
  switch (step.phase) {
    case "traning":
      return "Din tur. Försök själv först.";
    case "aterkallning":
      return step.text ? "Ny text. Nu svarar du helt själv." : null;
    case "diagnos":
      return "Lång text, fem frågor, inget stöd.";
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
  // I träningen kommer hjälpen av sig själv efter ett fel
  const helpAllowed = step.phase === "traning";
  // Edda förklarar ord så länge eleven får ha stöd
  const wordHelp = step.phase === "modellering" || step.phase === "traning";

  // Adaptiv textnivå
  const [adaptState, setAdaptState] = useState<AdaptState>(START_ADAPT);
  const [textLevels, setTextLevels] = useState<Record<string, Level>>({});
  const lastLeveledLevelRef = useRef<Level | null>(null);
  const stepLevel: Level =
    step.leveled && step.textKey ? (textLevels[step.textKey] ?? adaptState.level) : 1;
  const paragraphs = step.text ? paragraphsFor(step.text, stepLevel) : [];

  // Elevens egna läsinställningar: storlek, radavstånd, typsnitt, bakgrund, tempo
  const [prefs, setPrefs] = useReadingPrefs();
  const look = readingStyle(prefs);

  // Rutans tillstånd
  const [boardStage, setBoardStage] = useState<
    "listening_blank" | "active_task" | "showing_feedback"
  >("active_task");
  const [boardHistory, setBoardHistory] = useState<BoardEntry[]>(() =>
    step.task.kind === "interest" ? [{ sender: "teacher", text: step.task.prompt }] : [],
  );
  const popupRef = useRef<HTMLElement | null>(null);

  // Per-steg-tillstånd
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null);
  const [freeText, setFreeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marks, setMarks] = useState<Marks>(NO_MARKS);
  const [attempts, setAttempts] = useState(0);
  // Ordet som Edda förklarar just nu, mitt i lästexten
  const [wordNote, setWordNote] = useState<WordNote | null>(null);
  const wordTokenRef = useRef(0);
  const wordCacheRef = useRef(new Map<string, string>());
  // Alternativ som eleven redan har provat i träningen
  const [triedOptions, setTriedOptions] = useState<OptionId[]>([]);
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

  // Läskartan: högsta visade nivå per förmåga, och Eddas senaste nästa steg
  const [readingMap, setReadingMap] = useState(EMPTY_MAP);
  const [mapTips, setMapTips] = useState<Partial<Record<QuestionCategory, string>>>({});
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);

  /** För in ett AI-bedömt svar på läskartan. */
  function recordOnMap(category: QuestionCategory, ev: Evaluation | null, supported: boolean) {
    if (!ev?.quality) return;
    const level = earnedLevel(ev.quality, supported);
    setReadingMap((m) => record(m, category, level));
    if (ev.nextStep) setMapTips((t) => ({ ...t, [category]: ev.nextStep }));
  }


  // ==========================================================================
  // Ljud: ElevenLabs med webbläsarens röst som reserv
  // ==========================================================================
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const playTokenRef = useRef(0);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

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

  /**
   * Reservröst när ElevenLabs inte svarar. Texten läses mening för mening, och en
   * vakt avslutar uppläsningen om webbläsaren tystnar utan att säga till – annars
   * blir eleven stående på en sida som väntar på ett slut som aldrig kommer.
   */
  function playWithBrowserVoice(text: string, onDone: () => void) {
    const token = playTokenRef.current;
    let finished = false;
    const watch: { id?: ReturnType<typeof setInterval> } = {};
    const finish = () => {
      if (finished) return;
      finished = true;
      if (watch.id) clearInterval(watch.id);
      utterancesRef.current = [];
      if (token !== playTokenRef.current) return; // avbruten: någon annan har tagit över
      setIsPlayingAudio(false);
      onDone();
    };
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      finish();
      return;
    }
    const synth = window.speechSynthesis;
    const parts = text.match(/[^.!?…]+[.!?…]*\s*/g)?.map((p) => p.trim()).filter(Boolean) ?? [];
    if (parts.length === 0) {
      finish();
      return;
    }
    // Webbläsaren kan tappa bort upplästa meningar som ingen håller i
    utterancesRef.current = parts.map((part, i) => {
      const utterance = new SpeechSynthesisUtterance(part);
      utterance.lang = "sv-SE";
      utterance.rate = 0.95 * look.rate;
      if (i === parts.length - 1) utterance.onend = finish;
      utterance.onerror = finish;
      return utterance;
    });
    utterancesRef.current.forEach((u) => synth.speak(u));

    let silent = 0;
    watch.id = setInterval(() => {
      if (token !== playTokenRef.current) return finish();
      silent = synth.speaking || synth.pending ? 0 : silent + 1;
      if (silent >= 3) finish();
    }, 500);
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
      audio.playbackRate = look.rate;
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

  /** Edda säger något högt. Tavlan visar texten först när hon är klar. */
  function eddaSpeak(text: string) {
    setEddaTalking(true);
    playText(text, () => setEddaTalking(false));
  }

  function speakThought(t: ThinkAloudTask, index: number) {
    eddaSpeak(index < 0 ? t.intro : index < t.thoughts.length ? t.thoughts[index].text : t.summary);
  }

  function toggleSound() {
    if (audioUnlocked) {
      stopAudio();
      setIsPlayingAudio(false);
      setEddaTalking(false);
    }
    setAudioUnlocked(!audioUnlocked);
  }

  useEffect(() => () => stopAudio(), []);

  // Tidtagningen för ett svar börjar när uppgiften visas på tavlan
  useEffect(() => {
    if (boardStage === "active_task") startTimeRef.current = performance.now();
  }, [boardStage, stepIndex]);

  // Håll Eddas ruta, och stället i texten hon pekar på, inom synhåll
  useEffect(() => {
    popupRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [stepIndex, thoughtIndex, marks, boardStage, boardHistory]);

  // ==========================================================================
  // Stegnavigering
  // ==========================================================================

  /** Visar uppgiften på tavlan när texten är läst/uppläst. */
  function activateBoard(s: LessonStep, speak: boolean) {
    setBoardStage("active_task");
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
    setMarks(NO_MARKS);
    setAttempts(0);
    wordTokenRef.current++;
    setWordNote(null);
    setTriedOptions([]);
    setThoughtIndex(-1);
    setSelectedCategory(null);
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
                ? `Längre text den här gången (nivå ${level} av 3).`
                : `Förra texten var svår. Den här är kortare (nivå ${level} av 3).`,
          });
        }
        lastLeveledLevelRef.current = level;
      }
    }

    if (next.task.kind === "think_aloud") {
      entries.push({ sender: "teacher", text: next.task.intro });
    } else if (next.task.kind !== "result" && next.task.kind !== "map") {
      entries.push({ sender: "teacher", text: next.task.prompt });
    }

    setStepIndex(index);
    setBoardHistory(entries);

    const isNewText = !!next.textKey && next.textKey !== prev?.textKey;
    if (isNewText && next.text) {
      setBoardStage("listening_blank");
      // Uppläsningen tonas ut: på nivå 2 och 3 läser eleven själv
      const autoRead =
        audioUnlocked &&
        !isSupportFree(next.phase) &&
        next.phase !== "diktamen" &&
        (!next.leveled || level === 1);
      if (autoRead) playText(plainText(next.text, level), () => activateBoard(next, true));
    } else {
      activateBoard(next, false);
      // Edda säger uppgiften först. Sedan visas bara frågan och svaren.
      if (audioUnlocked && next.task.kind === "choice" && next.task.say) eddaSpeak(next.task.say);
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
    // Valet är ett klick, så ljudet får starta här
    eddaSpeak(
      `Toppen! Jag väljer texter om ${choice.label.toLowerCase()}. Vi börjar med korta texter, och jag gör dem längre i takt med att du blir säkrare. Målet är att du ska klara en lång text som på nationella provet. Klicka på ett ord i texten om du vill att jag förklarar det.`,
    );
    setBoardHistory((prev) => [
      ...prev,
      { sender: "student", text: choice.label },
      {
        sender: "teacher",
        tone: "feedback",
        ok: true,
        spoken: true,
        text: "Korta texter först, längre sedan.",
      },
    ]);
    setBoardStage("showing_feedback");
  }

  /**
   * Sluten loop i träningen: eleven försöker själv först. Efter ett fel
   * kommer ledtråden av sig själv. Efter två fel visar Edda just den här
   * luckan igen, på elevens egen text.
   */

  /**
   * Edda säger `say` högt om ljudet är på. Tavlan visar prickarna medan hon
   * pratar, och sedan bara det korta i `entry` för den som missade.
   */
  function eddaReply(entry: Omit<BoardEntry, "sender" | "spoken">, say?: string): BoardEntry {
    const speak = audioUnlocked && !!say;
    if (speak) eddaSpeak(say);
    return { sender: "teacher", spoken: speak, ...entry };
  }

  /**
   * Eleven klickar på ett ord: det blir gult, Edda säger vad det betyder
   * och förklaringen står sedan kvar under stycket.
   */
  async function handleWordClick(paragraph: number, start: number, end: number, word: string) {
    if (!wordHelp || !step.text || isPlayingAudio || isSubmitting) return;
    const token = ++wordTokenRef.current;
    const note = { paragraph, start, end, word };
    const sentence = sentenceAround(paragraphs[paragraph] ?? "", start, end);
    const key = `${word.toLowerCase()}|${sentence}`;

    const lower = word.toLowerCase();
    let meaning =
      step.text.glossary?.find((g) => lower.startsWith(g.term.toLowerCase()))?.meaning ??
      wordCacheRef.current.get(key);

    if (!meaning) {
      setWordNote({ ...note, status: "loading", meaning: "" });
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "word", word, sentence }),
        });
        const data = await res.json();
        if (typeof data.meaning === "string" && data.meaning) meaning = data.meaning as string;
      } catch {
        // visas som fel nedan
      }
      if (token !== wordTokenRef.current) return; // eleven har klickat på något annat
      if (!meaning) {
        setWordNote({ ...note, status: "error", meaning: "" });
        return;
      }
      wordCacheRef.current.set(key, meaning);
    }

    const done: WordNote = { ...note, status: "done", meaning };
    if (!audioUnlocked) {
      setWordNote(done);
      return;
    }
    // Edda säger förklaringen först. Sedan står den i text.
    setEddaTalking(false);
    setWordNote({ ...done, status: "speaking" });
    playText(`${word}. Det betyder ${meaning}.`, () => {
      if (token === wordTokenRef.current) setWordNote(done);
    });
  }

  /** Edda tolkar ett stycke åt en elev som har fastnat i sitt resonemang. */
  async function explainParagraph(
    question: string,
    answer: string,
    highlight?: string,
  ): Promise<{ index: number; say: string; short: string } | null> {
    const body = paragraphs.filter((p) => p !== step.text?.signature);
    const at = highlight ? body.findIndex((p) => p.includes(highlight)) : -1;
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "paragraph",
          paragraphs: body,
          question,
          studentAnswer: answer,
          index: at === -1 ? undefined : at,
        }),
      });
      const data = await res.json();
      if (typeof data.index !== "number" || !data.say || !data.short) return null;
      return data;
    } catch {
      return null;
    }
  }

  /** Omvisning: Edda säger hur hon tänker och pekar ut ställena i texten. */
  function remodelReply(say: string, points: NonNullable<BoardEntry["points"]>): BoardEntry {
    setMarks({
      phrases: points.flatMap((p) => (p.highlight ? [p.highlight] : [])),
      good: false,
    });
    return eddaReply(
      { tone: "feedback", ok: false, points, text: "" },
      `Den här var svår, och det är okej. Jag visar hur jag tänker. ${say}`,
    );
  }

  function handleOptionSelect(opt: ChoiceTask["options"][number]) {
    if (task.kind !== "choice") return;
    if (selectedOption !== null || isSubmitting || boardStage !== "active_task") return;
    if (triedOptions.includes(opt.id)) return;
    const answer: BoardEntry = { sender: "student", text: `${opt.id}: ${opt.text}` };
    const evidence = helpAllowed && task.hint?.highlight ? [task.hint.highlight] : [];

    // Första felet i träningen: Edda ger en ledtråd och pekar i texten,
    // sedan får eleven ett försök till. Det valda alternativet stryks.
    if (!opt.isCorrect && helpAllowed && attempts === 0 && task.hint) {
      setAttempts(1);
      setTriedOptions([opt.id]);
      setMarks({ phrases: evidence, good: false });
      const hint = eddaReply(
        { tone: "hint", text: evidence.length ? "Titta på det gula i texten." : task.hint.text },
        `Inte riktigt än. ${task.hint.text}`,
      );
      setBoardHistory((prev) => [...promptOnly(prev), hint]);
      return;
    }

    setSelectedOption(opt.id);
    registerOutcome(
      task.category,
      opt.isCorrect ? (attempts > 0 ? "correct_with_support" : "correct") : "wrong",
    );
    if (opt.isCorrect && countsOnMap(step.phase)) {
      setReadingMap((m) => record(m, task.category, CHOICE_LEVEL));
    }

    const correct = task.options.find((o) => o.isCorrect)!;
    let reply: BoardEntry;
    if (opt.isCorrect) {
      setMarks({ phrases: evidence, good: true });
      reply = eddaReply({ tone: "feedback", ok: true, text: "Rätt!" }, task.correctFeedback);
    } else if (helpAllowed) {
      reply = remodelReply(task.incorrectFeedback, [
        { label: `Rätt svar: ${correct.id}`, highlight: evidence[0] },
      ]);
    } else {
      reply = eddaReply(
        { tone: "feedback", ok: false, text: `Rätt svar: ${correct.id}` },
        task.incorrectFeedback,
      );
    }
    setBoardHistory((prev) => [...promptOnly(prev), answer, reply]);
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
          // Bedömningen känner bara till träning, återkallning och diagnos
          phase: s.phase === "repetition" ? "aterkallning" : s.phase,
          level,
          question: s.task.prompt,
          studentAnswer: answer,
          rubricTarget: s.task.rubric,
          criteria: criteriaFor(s.task),
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

    const answer: BoardEntry = { sender: "student", text: val };

    // Slutdiagnos: spara svaret, rätta i bakgrunden, visa allt på slutet
    if (step.phase === "diagnos") {
      const diagStep = step;
      setDiagResults((prev) => ({ ...prev, [diagStep.id]: "pending" }));
      evaluate(diagStep, val, stepLevel).then((r) => {
        setDiagResults((prev) => ({ ...prev, [diagStep.id]: r ?? "error" }));
        recordOnMap(task.category, r, false);
      });
      setFreeText("");
      setBoardHistory((prev) => [
        ...promptOnly(prev),
        answer,
        {
          sender: "teacher",
          tone: "note",
          text: "Svaret är sparat.",
        },
      ]);
      setBoardStage("showing_feedback");
      return;
    }

    setIsSubmitting(true);
    wordTokenRef.current++;
    setWordNote(null);
    // Styckestolkningen hämtas samtidigt som bedömningen, men används bara
    // om eleven har fastnat: första försöket att resonera räckte inte.
    const mayExplain =
      helpAllowed && attempts === 0 && task.category === "resonera" && !!step.text;
    const [ev, interpretation] = await Promise.all([
      evaluate(step, val, stepLevel),
      mayExplain ? explainParagraph(task.prompt, val, task.hint?.highlight) : null,
    ]);
    const passed = ev?.passed ?? true;

    const labels = criteriaFor(task);
    const checks =
      ev?.checks?.length === labels.length
        ? labels.map((label, i) => ({ label, met: ev.checks![i] }))
        : undefined;
    // Edda säger sin kommentar. På tavlan står bara bocklistan.
    const say = ev?.boardFeedback || task.fallbackFeedback;
    const feedback: Omit<BoardEntry, "sender" | "spoken"> = {
      tone: "feedback",
      ok: passed,
      text: checks ? "" : say,
      quality: ev?.quality || undefined,
      checks,
    };
    // Edda pekar i texten: grönt på det eleven träffade, gult på det som saknas
    const pointAt: Marks = {
      phrases: ev?.quote
        ? [ev.quote]
        : !passed && helpAllowed && task.hint?.highlight
          ? [task.hint.highlight]
          : [],
      good: passed,
    };

    // Ett svar efter ledtråd och ett nytt försök räknas som svar med stöd
    if (countsOnMap(step.phase)) recordOnMap(task.category, ev, attempts > 0);
    setIsSubmitting(false);

    // Första försöket i träningen räckte inte: Edda säger vad som saknas,
    // pekar i texten, och eleven förbättrar sitt svar direkt i rutan.
    if (!passed && helpAllowed && attempts === 0) {
      setAttempts(1);
      // Har eleven fastnat i resonemanget tolkar Edda stycket som ger stöd
      const stuck = ev ? interpretation : null;
      setMarks(stuck ? { ...pointAt, paragraph: stuck.index } : pointAt);
      const reply = stuck
        ? eddaReply(
            { ...feedback, text: `Det gula stycket: ${stuck.short}` },
            `${say} Jag förklarar det gula stycket. ${stuck.say}`,
          )
        : eddaReply(feedback, say);
      setBoardHistory((prev) => [...promptOnly(prev), reply]);
      return;
    }

    registerOutcome(
      task.category,
      passed ? (attempts > 0 ? "correct_with_support" : "correct") : "wrong",
    );
    setFreeText("");
    let reply: BoardEntry;
    if (!passed && helpAllowed && task.remodel) {
      reply = remodelReply(task.remodel.say, task.remodel.points);
    } else {
      setMarks(pointAt);
      reply = eddaReply(feedback, say);
    }
    setBoardHistory((prev) => [...promptOnly(prev), answer, reply]);
    setAttempts((a) => a + 1);
    setBoardStage("showing_feedback");
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

    const reply = eddaReply({ tone: "feedback", ok: true, text: "Nu väntar slutdiagnosen." }, report);
    setBoardHistory((prev) => [...prev, reply]);
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
  const goodHighlights: string[] = [];
  if (!supportFree || boardStage === "showing_feedback") {
    (marks.good ? goodHighlights : currentHighlights).push(...marks.phrases);
  }
  const paragraphMark = !supportFree && !marks.good ? marks.paragraph : undefined;
  // Eddas ruta sitter vid stycket hon pekar på. Pekar hon inte på något
  // särskilt står rutan bredvid texten (under den på små skärmar).
  const findParagraph = (phrases: string[]) =>
    paragraphs.findIndex((p) => phrases.some((ph) => ph && p.includes(ph)));
  let anchor = paragraphMark ?? findParagraph(currentHighlights);
  if (anchor < 0) anchor = findParagraph(goodHighlights);
  if (anchor < 0) anchor = findParagraph(earlierHighlights.slice(-1));
  // Under modelleringen berättar Edda själv; rutan visar bara det hon just har sagt.
  const showHistory = task.kind !== "think_aloud";
  const eddaSpeaking = eddaTalking && isPlayingAudio;

  const mapPanel = (
    <div className="flex flex-col items-center gap-4">
      <ReadingMapChart
        map={readingMap}
        selected={selectedCategory}
        onSelect={(c) => setSelectedCategory(c === selectedCategory ? null : c)}
      />
      <ReadingMapLegend />
      <p className="text-lg text-zinc-500 text-center">
        Grön betyder redo. Klicka på en del om du vill ha tips av Edda.
      </p>
      {selectedCategory && (
        <div className="w-full max-w-2xl">
          <EddaSays badge={<LevelWedge level={readingMap[selectedCategory]} />}>
            <p className="font-bold">{CATEGORY_LABELS[selectedCategory]}</p>
            <p>
              {(readingMap[selectedCategory] < 3 && mapTips[selectedCategory]) ||
                defaultTip(readingMap[selectedCategory])}
            </p>
          </EddaSays>
        </div>
      )}
    </div>
  );
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

  // ==========================================================================
  // Rendering
  // ==========================================================================

  // Allt Edda säger och frågar. Visas i en liten ruta intill texten.
  const panel = (
    <>
            {/* Var eleven befinner sig */}
            {!eddaSpeaking && (
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5B46D6]">
                {eyebrow}
              </p>
            )}

            {/* Rutan är nästan tom medan texten läses */}
            {boardStage === "listening_blank" && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-zinc-900">
                  {supportFree || step.phase === "diktamen" || (audioUnlocked && !isPlayingAudio)
                    ? "Läs texten"
                    : "Lyssna nu"}
                </h2>
                {supportFree || step.phase === "diktamen" ? (
                  <>
                    <p className={BODY}>
                      {step.phase === "diktamen"
                        ? "Läs texten tyst först."
                        : "Läs texten själv."}
                    </p>
                    <button onClick={revealBoardNow} className={PRIMARY}>
                      Jag har läst klart
                    </button>
                  </>
                ) : !audioUnlocked ? (
                  <div className="flex flex-col items-start gap-3">
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
            {/* Medan Edda pratar syns bara hon och prickarna. Eleven lyssnar. */}
            {boardStage !== "listening_blank" && eddaSpeaking && <EddaTalking />}

            {boardStage !== "listening_blank" && !eddaSpeaking && (
              <div className="space-y-4">
                {/* Rubrik för steget */}
                {!eddaSpeaking && (
                  <h2 className="text-lg font-bold text-zinc-900">
                    {phaseHeading(step)}
                  </h2>
                )}

                {(showHistory ? boardHistory : []).map((item, idx) => {
                  if (item.sender === "student") {
                    return (
                      <div key={idx} className="space-y-1.5">
                        <p className="text-sm text-zinc-500">Ditt svar</p>
                        <p className="text-[15px] leading-snug text-zinc-700 whitespace-pre-line rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
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
                  // Det Edda säger högt visas först när hon har pratat klart
                  if (item.spoken && idx === boardHistory.length - 1 && eddaSpeaking) {
                    return (
                      <EddaTalking key={idx} />
                    );
                  }
                  // Efter talet står bara bocklistan eller stödorden kvar på tavlan
                  return (
                    <EddaSays
                      key={idx}
                      badge={
                        item.quality && item.quality !== "inte_an" ? (
                          <LevelWedge level={levelOf(item.quality)} />
                        ) : item.tone === "feedback" && item.ok && task.kind === "choice" ? (
                          <CorrectMark />
                        ) : null
                      }
                    >
                      {item.text && <p>{item.text}</p>}
                      {item.checks && (
                        <ul className="space-y-1.5">
                          {item.checks.map((c) => (
                            <li
                              key={c.label}
                              className="flex items-center gap-2.5 text-[15px]"
                            >
                              {c.met ? (
                                <CorrectMark small />
                              ) : (
                                <span
                                  role="img"
                                  aria-label="Saknas"
                                  className="h-6 w-6 shrink-0 rounded-full border-2 border-zinc-400"
                                />
                              )}
                              <span className={c.met ? "text-zinc-500" : "text-zinc-900"}>
                                {c.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.points && (
                        <ol className="space-y-1.5">
                          {item.points.map((point, i) => (
                            <li key={point.label} className="text-[15px]">
                              <span className="font-bold text-[#5B46D6]">{i + 1}.</span>{" "}
                              {point.highlight ? (
                                <mark className="rounded-sm bg-[#FDE047] px-1 text-zinc-950">
                                  {point.label}
                                </mark>
                              ) : (
                                point.label
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </EddaSays>
                  );
                })}

                {/* MODELLERING: Edda berättar, sedan står bara stödordet kvar */}
                {task.kind === "think_aloud" &&
                  (eddaSpeaking ? (
                    <EddaTalking />
                  ) : thoughtIndex < 0 ? (
                    <>
                      {partInfo && (
                        <EddaSays>
                          <p className="font-bold">Målet</p>
                          <p>{partInfo.goal}</p>
                        </EddaSays>
                      )}
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
                      </EddaSays>
                      <button onClick={handleNextThought} className={PRIMARY}>
                        {thoughtIndex === task.thoughts.length - 1
                          ? "Visa slutsatsen"
                          : "Nästa tanke"}
                      </button>
                    </>
                  ) : (
                    <>
                      <EddaSays>
                        <p className="font-bold">Så här gjorde jag</p>
                        <ol>
                          {task.thoughts.map((t, i) => (
                            <li key={i}>
                              <span className="font-bold text-[#5B46D6]">{i + 1}.</span> {t.label}
                            </li>
                          ))}
                        </ol>
                      </EddaSays>
                      <button onClick={handleProceedToNextStep} className={PRIMARY}>
                        Jag hänger med – visa ett bra exempel
                      </button>
                    </>
                  ))}

                {/* START: välj intresse */}
                {task.kind === "interest" && boardStage === "active_task" && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {INTERESTS.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => handleInterestSelect(i.id)}
                        className="group flex items-center gap-3 overflow-hidden rounded-xl border border-zinc-200 text-left transition hover:border-[#3B62E3] hover:shadow-md sm:block"
                      >
                        <span className="relative block aspect-[4/3] w-28 shrink-0 overflow-hidden bg-zinc-100 sm:w-full">
                          <Image
                            src={i.image}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 112px, 180px"
                            className="object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        </span>
                        <span className="block text-[15px] font-medium leading-snug text-zinc-900 sm:px-3 sm:py-2.5">
                          {i.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* FLERVAL A/B/C */}
                {task.kind === "choice" &&
                  selectedOption === null &&
                  boardStage === "active_task" && (
                    <div className="space-y-2">
                      {task.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionSelect(opt)}
                          disabled={triedOptions.includes(opt.id)}
                          className={`${OPTION} disabled:pointer-events-none disabled:opacity-40 disabled:line-through`}
                        >
                          <span className="font-bold text-[#5B46D6]">{opt.id}</span>
                          <span>{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                {/* FRITEXT */}
                {boardStage === "active_task" && task.kind === "free" && (
                  <form onSubmit={handleFreeTextSubmit} className="space-y-3">
                    <label className="block space-y-2">
                      <span className="text-sm text-zinc-500">
                        {supportFree
                          ? "Ditt svar, utan ledtråd"
                          : attempts > 0
                            ? "Förbättra ditt svar"
                            : "Ditt svar"}
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
                        className="block w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-[#3B62E3] select-text"
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

                {/* DIKTAMEN */}
                {task.kind === "dictation" && boardStage === "active_task" && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleDictationToggle}
                      aria-label={isRecording ? "Avsluta högläsning" : "Starta högläsning"}
                      className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-white transition shadow-lg ${
                        isRecording ? "bg-red-600 animate-pulse motion-reduce:animate-none" : "bg-[#3B62E3] hover:bg-[#2F52C9]"
                      }`}
                    >
                      {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>
                    <span className="text-[15px] text-zinc-500">
                      {isRecording
                        ? "Spelar in högläsning... Klicka igen när du är klar."
                        : "Klicka för att starta högläsning"}
                    </span>
                  </div>
                )}

                {/* RESULTAT: läsprofil efter slutdiagnosen */}
                {/* LÄSKARTAN: så här långt har du kommit */}
                {task.kind === "map" && (
                  <>
                    {mapPanel}
                    <div className="flex justify-end border-t border-zinc-200 pt-5">
                      <button onClick={handleProceedToNextStep} className={PRIMARY}>
                        {step.part < PARTS.length ? "Nästa del" : "Gå vidare"}
                      </button>
                    </div>
                  </>
                )}

                {task.kind === "result" &&
                  (diagPending ? (
                    <p className={`${BODY} animate-pulse motion-reduce:animate-none`}>Edda rättar din slutdiagnos...</p>
                  ) : (
                    <div className="space-y-4">
                      {mapPanel}
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
                              className={`text-base font-semibold ${
                                ev?.passed ? "text-emerald-800" : "text-amber-800"
                              }`}
                            >
                              {ev ? (ev.passed ? "✓" : "→") : "•"} {CATEGORY_LABELS[cat]}
                            </p>
                            <p className="text-[15px] text-zinc-600">
                              {ev ? ev.boardFeedback : "Kunde inte rättas automatiskt."}
                            </p>
                            {ev && !ev.passed && ev.nextStep && (
                              <p className="text-[15px] text-zinc-600">
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
                            Du klarade {passedCount} av {diagSteps.length} frågor helt utan stöd.
                          </EddaSays>
                        );
                      })()}
                    </div>
                  ))}

                {/* VIDARE EFTER ÅTERKOPPLING */}
                {boardStage === "showing_feedback" && !isLastStep && !eddaSpeaking && (
                  <button onClick={handleProceedToNextStep} className={PRIMARY}>
                    Gå vidare
                  </button>
                )}
                {isLastStep && !diagPending && (
                  <p className="inline-flex items-center gap-2 text-base text-emerald-700">
                    <Check size={18} />
                    <span>Alla steg genomförda!</span>
                  </p>
                )}
              </div>
            )}
    </>
  );

  return (
    <main
      style={{ backgroundColor: look.background }}
      className="min-h-screen flex flex-col select-none antialiased text-zinc-900 transition-colors"
    >

      {/* SIDHUVUD: titel, del och progression */}
      <header className="border-b border-black/5 px-4 sm:px-8 lg:px-12 py-4 flex flex-wrap items-center gap-x-10 gap-y-3">
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
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <ReadingMapChart map={readingMap} mini />
          <ReadingSettings prefs={prefs} onChange={setPrefs} />
          <button
            onClick={toggleSound}
            aria-pressed={audioUnlocked}
            className="rounded-xl border border-[#C5CEF0] bg-[#EEF1FB] px-4 py-2 text-sm font-bold text-[#3B62E3] transition hover:bg-[#E0E6FA]"
          >
            {audioUnlocked ? "Ljud på" : "Ljud av"}
          </button>
        </div>
      </header>

      <div className="flex-1 px-5 pb-24 pt-8 sm:px-8 lg:pt-12">
        {step.text ? (
          <article className="mx-auto max-w-[1060px] lg:grid lg:grid-cols-[640px_380px] lg:items-start lg:gap-x-10">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
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

              <h2 className={`mb-6 text-3xl leading-tight text-zinc-900 sm:text-4xl ${look.fontClass}`}>
                {step.text.title}
              </h2>
              <div
                ref={readingRef}
                style={look.text}
                className={`space-y-5 text-zinc-800 select-text ${look.fontClass} ${
                  prefs.focus
                    ? "[&>div>p]:opacity-35 [&>div>p]:transition-opacity [&>div:hover>p]:opacity-100 [&>div:has([data-current])>p]:opacity-100"
                    : ""
                }`}
              >
                {paragraphs.map((p, i) => (
                  <div key={i} className="relative">
                    <p
                      data-current={paragraphMark === i ? "" : undefined}
                      className={
                        p === step.text?.signature
                          ? "text-right text-base italic"
                          : paragraphMark === i
                            ? "-mx-3 rounded-xl bg-[#FEF9C3] px-3 py-2"
                            : ""
                      }
                    >
                      <Highlighted
                        text={p}
                        earlier={earlierHighlights}
                        current={currentHighlights}
                        good={goodHighlights}
                        picked={wordNote?.paragraph === i ? wordNote : null}
                        onWord={
                          wordHelp
                            ? (start, end, word) => handleWordClick(i, start, end, word)
                            : undefined
                        }
                      />
                    </p>
                    {wordNote?.paragraph === i && (
                      <WordExplanation note={wordNote} onClose={() => setWordNote(null)} />
                    )}
                    {/* Eddas ruta sitter intill det stycke hon pratar om */}
                    {anchor === i && (
                      <aside
                        ref={popupRef}
                        style={{ zoom: look.zoom }}
                        className={`${POPUP} relative mt-4 lg:absolute lg:left-full lg:top-0 lg:ml-10 lg:mt-0 lg:w-[380px]`}
                      >
                        <span
                          aria-hidden
                          className="absolute -left-[9px] top-7 hidden h-4 w-4 rotate-45 border-b border-l border-zinc-200 bg-white lg:block"
                        />
                        {panel}
                      </aside>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {anchor < 0 && (
              <aside ref={popupRef} style={{ zoom: look.zoom }} className={`${POPUP} mt-8 lg:sticky lg:top-6 lg:mt-[88px]`}>
                {panel}
              </aside>
            )}
          </article>
        ) : task.kind === "map" || task.kind === "result" ? (
          <div className="mx-auto max-w-3xl space-y-4">{panel}</div>
        ) : (
          <section ref={popupRef} style={{ zoom: look.zoom }} className={`${POPUP} mx-auto mt-6 max-w-xl`}>
            {panel}
          </section>
        )}
      </div>
    </main>
  );
}

// ============================================================================
// Utseende: delade stilar och Edda
// ============================================================================

/** Del 1–4 plus slutdiagnosen. */
const TOTAL_PARTS = PARTS.length + 1;

const BODY = "text-[17px] font-semibold leading-snug text-zinc-900";
const PRIMARY =
  "inline-flex items-center justify-center rounded-xl bg-[#3B62E3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2F52C9] disabled:opacity-40";
const LINK = "text-sm font-semibold text-[#3B62E3] transition hover:underline";
const OPTION =
  "flex w-full items-start gap-2.5 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-left text-[15px] leading-snug text-zinc-900 transition hover:border-[#3B62E3] hover:bg-[#F5F7FE]";
/** Eddas lilla ruta intill texten. */
const POPUP =
  "space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 font-sans text-base leading-snug tracking-normal [word-spacing:normal] text-zinc-900 shadow-[0_12px_40px_rgba(40,40,80,0.12)] select-none";

function phaseHeading(step: LessonStep): string {
  switch (step.phase) {
    case "intro":
      return "Välkommen!";
    case "repetition":
      return "Börja med att återkalla";
    case "modellering":
      return step.task.kind === "choice" ? "Ett bra exempel" : "Edda visar hur hon tänker";
    case "traning":
      return "Nu är det din tur";
    case "aterkallning":
      return step.text ? "Återkalla utan stöd" : "Återkalla ur minnet";
    case "karta":
      return "Så här långt har du kommit";
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
          className="h-2.5 w-2.5 rounded-full bg-[#8B7ADB] animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** Eddas ordförklaring, direkt under stycket där ordet står. */
function WordExplanation({ note, onClose }: { note: WordNote; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-[#FDE047] bg-white px-4 py-2.5 font-sans leading-snug text-zinc-800">
      {note.status === "loading" || note.status === "speaking" ? (
        <TalkingDots />
      ) : note.status === "error" ? (
        <p className="flex-1">Jag kunde inte förklara ordet just nu. Prova igen.</p>
      ) : (
        <p className="flex-1">
          <span className="font-semibold">{note.word}</span>: {note.meaning}
        </p>
      )}
      {(note.status === "done" || note.status === "error") && (
        <button
          onClick={onClose}
          aria-label="Stäng förklaringen"
          className="shrink-0 rounded-full px-2 text-lg leading-none text-zinc-400 hover:text-zinc-700"
        >
          ×
        </button>
      )}
    </div>
  );
}

/** Eddas figur i litet format. */
function EddaFace() {
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-[#7B66DC] to-[#5B46C8]"
    >
      <span className="h-2 w-1 rounded-full bg-white" />
      <span className="h-2 w-1 rounded-full bg-white" />
    </span>
  );
}

/** Edda pratar och eleven lyssnar: bara figuren och tre pulserande prickar. */
function EddaTalking() {
  return (
    <div className="flex items-center gap-3">
      <EddaFace />
      <TalkingDots />
    </div>
  );
}

/** Det Edda säger till eleven: figuren och en kort text. */
function EddaSays({
  children,
  badge = null,
}: {
  children: React.ReactNode;
  /** Tårtbit eller bock som visas efter ett svar. */
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <EddaFace />
      <div className="flex min-w-0 flex-1 items-center gap-3 pt-1.5 text-[15px] leading-snug text-zinc-800">
        {badge}
        <div className="min-w-0 flex-1 space-y-1.5 whitespace-pre-line">{children}</div>
      </div>
    </div>
  );
}

/** Grön bock för ett rätt flervalssvar. */
function CorrectMark({ small = false }: { small?: boolean }) {
  return (
    <span
      role="img"
      aria-label={small ? "Finns med" : "Rätt svar"}
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#6FB076] text-white ${
        small ? "h-6 w-6" : "h-8 w-8"
      }`}
    >
      <Check size={small ? 15 : 20} strokeWidth={3} />
    </span>
  );
}
