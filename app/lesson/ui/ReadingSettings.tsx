"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Lexend } from "next/font/google";

// ============================================================================
// Läsinställningar: eleven anpassar hur lästexten ser ut och hur fort Edda
// pratar. Valen sparas i webbläsaren och gäller tills eleven ändrar dem.
// ============================================================================

/** Typsnitt med breda, tydliga bokstäver, gjort för att underlätta läsning. */
const lexend = Lexend({ subsets: ["latin"] });

export type ReadingPrefs = {
  /** Textstorlek, 0–3. */
  size: number;
  /** Radavstånd, 0–2. */
  leading: number;
  /** Avstånd mellan bokstäver och ord, 0–2. */
  spacing: number;
  font: "serif" | "sans" | "lexend";
  background: "white" | "cream" | "blue";
  /** Tonar ner alla stycken utom det eleven läser. */
  focus: boolean;
  /** Edda pratar och läser långsammare. */
  slow: boolean;
};

export const DEFAULT_PREFS: ReadingPrefs = {
  size: 1,
  leading: 1,
  spacing: 0,
  font: "serif",
  background: "white",
  focus: false,
  slow: false,
};

const SIZES = [17, 19, 22, 26];
const LEADINGS = [1.55, 1.8, 2.15];
const LETTER = ["0", "0.04em", "0.08em"];
const WORD = ["0", "0.14em", "0.28em"];
const FONTS: Record<ReadingPrefs["font"], string> = {
  serif: "font-serif",
  sans: "font-sans",
  lexend: lexend.className,
};
const BACKGROUNDS: Record<ReadingPrefs["background"], string> = {
  white: "#FFFFFF",
  cream: "#FBF5E6",
  blue: "#EEF4FB",
};

const between = (value: unknown, max: number, fallback: number) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max
    ? value
    : fallback;

/** Tål trasiga eller gamla sparade värden: allt okänt blir standardvalet. */
export function parsePrefs(raw: string | null): ReadingPrefs {
  let v: Record<string, unknown> = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") v = parsed as Record<string, unknown>;
  } catch {
    // standardvalen gäller
  }
  const d = DEFAULT_PREFS;
  return {
    size: between(v.size, SIZES.length - 1, d.size),
    leading: between(v.leading, LEADINGS.length - 1, d.leading),
    spacing: between(v.spacing, LETTER.length - 1, d.spacing),
    font: typeof v.font === "string" && v.font in FONTS ? (v.font as ReadingPrefs["font"]) : d.font,
    background:
      typeof v.background === "string" && v.background in BACKGROUNDS
        ? (v.background as ReadingPrefs["background"])
        : d.background,
    focus: v.focus === true,
    slow: v.slow === true,
  };
}

/** Utseendet som inställningarna ger lästexten. */
export function readingStyle(prefs: ReadingPrefs) {
  return {
    fontClass: FONTS[prefs.font],
    background: BACKGROUNDS[prefs.background],
    /** Hur fort Edda pratar. */
    rate: prefs.slow ? 0.8 : 1,
    /** Eddas rutor växer med texten, så att även frågorna blir lättare att läsa. */
    zoom: [1, 1, 1.1, 1.2][prefs.size],
    text: {
      fontSize: `${SIZES[prefs.size]}px`,
      lineHeight: LEADINGS[prefs.leading],
      letterSpacing: LETTER[prefs.spacing],
      wordSpacing: WORD[prefs.spacing],
    } as React.CSSProperties,
  };
}

const KEY = "lasinstallningar";
const CHANGED = "lasinstallningar-andrade";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Elevens sparade läsinställningar. */
export function useReadingPrefs(): [ReadingPrefs, (next: ReadingPrefs) => void] {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const prefs = useMemo(() => parsePrefs(raw), [raw]);
  const save = (next: ReadingPrefs) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // utan lagring gäller valet inte, men sidan fungerar
    }
    window.dispatchEvent(new Event(CHANGED));
  };
  return [prefs, save];
}

// ============================================================================
// Knappen i sidhuvudet och rutan med valen
// ============================================================================

const CHOICE =
  "flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-semibold transition";
const ON = "border-[#3B62E3] bg-[#EEF1FB] text-[#3B62E3]";
const OFF = "border-zinc-200 text-zinc-700 hover:border-zinc-400";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-zinc-700">{label}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <span>
        <span className="block text-sm font-semibold text-zinc-700">{label}</span>
        <span className="block text-xs text-zinc-500">{hint}</span>
      </span>
      <span
        aria-hidden
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
          on ? "bg-[#3B62E3]" : "bg-zinc-300"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white transition ${on ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  );
}

export function ReadingSettings({
  prefs,
  onChange,
}: {
  prefs: ReadingPrefs;
  onChange: (next: ReadingPrefs) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const set = (patch: Partial<ReadingPrefs>) => onChange({ ...prefs, ...patch });

  // Stäng med Escape eller ett klick utanför
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const levels = (
    key: "size" | "leading" | "spacing",
    labels: React.ReactNode[],
    names: string[],
  ) =>
    labels.map((label, i) => (
      <button
        key={i}
        aria-label={names[i]}
        aria-pressed={prefs[key] === i}
        onClick={() => set({ [key]: i })}
        className={`${CHOICE} ${prefs[key] === i ? ON : OFF}`}
      >
        {label}
      </button>
    ));

  return (
    <div ref={boxRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="rounded-xl border border-[#C5CEF0] bg-[#EEF1FB] px-4 py-2 text-sm font-bold text-[#3B62E3] transition hover:bg-[#E0E6FA]"
      >
        <span aria-hidden className="mr-1.5 font-serif">
          Aa
        </span>
        Anpassa
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Anpassa läsningen"
          className="absolute right-0 top-full z-20 mt-2 w-[min(340px,calc(100vw-2rem))] space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-[0_12px_40px_rgba(40,40,80,0.16)]"
        >
          <Row label="Textstorlek">
            {levels(
              "size",
              [14, 17, 20, 24].map((px) => (
                <span key={px} style={{ fontSize: px }}>
                  A
                </span>
              )),
              ["Liten text", "Normal text", "Stor text", "Mycket stor text"],
            )}
          </Row>

          <Row label="Radavstånd">
            {levels(
              "leading",
              [3, 5, 8].map((gap) => (
                <span key={gap} aria-hidden className="flex flex-col" style={{ gap }}>
                  <span className="h-0.5 w-5 rounded bg-current" />
                  <span className="h-0.5 w-5 rounded bg-current" />
                  <span className="h-0.5 w-5 rounded bg-current" />
                </span>
              )),
              ["Tätt radavstånd", "Normalt radavstånd", "Glest radavstånd"],
            )}
          </Row>

          <Row label="Luft mellan bokstäver och ord">
            {levels(
              "spacing",
              ["0", "0.1em", "0.22em"].map((ls) => (
                <span key={ls} style={{ letterSpacing: ls }}>
                  abc
                </span>
              )),
              ["Normal luft", "Mer luft", "Mest luft"],
            )}
          </Row>

          <Row label="Typsnitt">
            {(
              [
                ["serif", "Bok", "font-serif"],
                ["sans", "Rak", "font-sans"],
                ["lexend", "Lättläst", lexend.className],
              ] as const
            ).map(([id, label, cls]) => (
              <button
                key={id}
                aria-pressed={prefs.font === id}
                onClick={() => set({ font: id })}
                className={`${CHOICE} ${cls} ${prefs.font === id ? ON : OFF}`}
              >
                {label}
              </button>
            ))}
          </Row>

          <Row label="Bakgrund">
            {(
              [
                ["white", "Vit"],
                ["cream", "Gulvit"],
                ["blue", "Ljusblå"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                aria-pressed={prefs.background === id}
                onClick={() => set({ background: id })}
                style={{ backgroundColor: BACKGROUNDS[id] }}
                className={`${CHOICE} ${
                  prefs.background === id
                    ? "border-[#3B62E3] text-[#3B62E3] ring-1 ring-[#3B62E3]"
                    : OFF
                }`}
              >
                {label}
              </button>
            ))}
          </Row>

          <div className="space-y-3 border-t border-zinc-100 pt-4">
            <Toggle
              label="Ett stycke i taget"
              hint="Tonar ner resten av texten."
              on={prefs.focus}
              onChange={(focus) => set({ focus })}
            />
            <Toggle
              label="Långsammare röst"
              hint="Edda pratar och läser lugnare."
              on={prefs.slow}
              onChange={(slow) => set({ slow })}
            />
          </div>

          <button
            onClick={() => onChange(DEFAULT_PREFS)}
            className="text-sm font-semibold text-[#3B62E3] hover:underline"
          >
            Återställ
          </button>
        </div>
      )}
    </div>
  );
}
