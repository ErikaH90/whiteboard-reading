import type { QuestionCategory } from "../types";
import {
  LEVEL_LABELS,
  MAP_CATEGORIES,
  MAP_LABELS,
  readyForDiagnos,
  type MapLevel,
  type ReadingMap,
} from "../progress";

// ============================================================================
// Läskartan: en cirkel med en "tårtbit" per förmåga och tre ringar per bit
// (grundläggande, utvecklad, välutvecklad). Gult = grunden finns, grönt = redo.
// ============================================================================

const YELLOW = "#EDD06A";
const GREEN = "#6FB076";
const EMPTY_STROKE = "#E5E5EC";
const ACTIVE_STROKE = "#C9C9D6";
const PURPLE = "#6248C9";

/** Ringarnas inner- och ytterradie, inifrån och ut. */
const RINGS: [number, number][] = [
  [30, 62],
  [66, 98],
  [102, 134],
];
const SLICE = 360 / (MAP_CATEGORIES.length + 1); // + biten "Redo för slutdiagnos"
const PAD = 2.5;

/** Punkt på cirkeln. Vinkeln räknas i grader medurs från klockan tolv. */
function point(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [r * Math.sin(rad), -r * Math.cos(rad)];
}

function arcPath(r1: number, r2: number, from: number, to: number): string {
  const f = (n: number) => n.toFixed(2);
  const [x1, y1] = point(r2, from);
  const [x2, y2] = point(r2, to);
  const [x3, y3] = point(r1, to);
  const [x4, y4] = point(r1, from);
  const large = to - from > 180 ? 1 : 0;
  return `M${f(x1)} ${f(y1)} A${r2} ${r2} 0 ${large} 1 ${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} A${r1} ${r1} 0 ${large} 0 ${f(x4)} ${f(y4)} Z`;
}

/** Färgen på ring nummer `ring` (0 = innerst) när eleven är på nivån `level`. */
function ringFill(level: MapLevel, ring: number): string {
  if (ring >= level) return "#FFFFFF";
  return level === 1 ? YELLOW : GREEN;
}

function summary(map: ReadingMap): string {
  return MAP_CATEGORIES.map((c) => `${MAP_LABELS[c]}: ${LEVEL_LABELS[map[c]]}`).join(", ");
}

export function ReadingMapChart({
  map,
  mini = false,
  selected = null,
  onSelect,
}: {
  map: ReadingMap;
  /** Liten version utan text, för sidhuvudet. */
  mini?: boolean;
  selected?: QuestionCategory | null;
  onSelect?: (category: QuestionCategory) => void;
}) {
  const ready = readyForDiagnos(map);
  const readyFrom = MAP_CATEGORIES.length * SLICE + PAD;
  const readyTo = 360 - PAD;
  const [readyX, readyY] = point(86, (readyFrom + readyTo) / 2);

  return (
    <svg
      viewBox={mini ? "-140 -140 280 280" : "-270 -165 540 335"}
      className={mini ? "h-11 w-11" : "w-full max-w-[560px]"}
      role="img"
      aria-label={`Min läskarta. ${summary(map)}.`}
    >
      {MAP_CATEGORIES.map((category, i) => {
        const level = map[category];
        const from = i * SLICE + PAD;
        const to = (i + 1) * SLICE - PAD;
        const mid = (from + to) / 2;
        const [lx, ly] = point(152, mid);
        const side = Math.sin((mid * Math.PI) / 180);
        const interactive = !mini && !!onSelect;
        return (
          <g
            key={category}
            {...(interactive && {
              role: "button",
              tabIndex: 0,
              "aria-label": `${MAP_LABELS[category]}: ${LEVEL_LABELS[level]}. Visa tips av Edda.`,
              "aria-pressed": selected === category,
              onClick: () => onSelect(category),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(category);
                }
              },
              className: "cursor-pointer outline-none [&:focus-visible_path]:stroke-[#3B62E3]",
            })}
          >
            {RINGS.map(([r1, r2], ring) => (
              <path
                key={ring}
                d={arcPath(r1, r2, from, to)}
                fill={ringFill(level, ring)}
                stroke={
                  selected === category
                    ? PURPLE
                    : ring < level
                      ? "none"
                      : level > 0
                        ? ACTIVE_STROKE
                        : EMPTY_STROKE
                }
                strokeWidth={mini ? 3 : 1.5}
              />
            ))}
            {!mini && (
              <text
                x={lx}
                y={ly}
                dominantBaseline="middle"
                textAnchor={side > 0.3 ? "start" : side < -0.3 ? "end" : "middle"}
                fontSize={19}
                fill={level > 0 || selected === category ? "#18181B" : "#9CA3AF"}
                className="font-whiteboard"
              >
                {MAP_LABELS[category]}
              </text>
            )}
          </g>
        );
      })}

      {/* Sista biten: redo för slutdiagnosen */}
      <path
        d={arcPath(RINGS[0][0], RINGS[2][1], readyFrom, readyTo)}
        fill={ready ? GREEN : "#F1F2F6"}
        stroke={ready ? "none" : ACTIVE_STROKE}
        strokeWidth={mini ? 3 : 1.5}
        strokeDasharray={ready ? undefined : "5 4"}
      />
      {!mini && (
        <text
          textAnchor="middle"
          fontSize={14}
          fill={ready ? "#FFFFFF" : "#71717A"}
          className="font-whiteboard"
        >
          <tspan x={readyX} y={readyY - 4}>
            Redo för
          </tspan>
          <tspan x={readyX} y={readyY + 13}>
            slutdiagnos
          </tspan>
        </text>
      )}

      {/* Edda i mitten */}
      <circle r={26} fill="#FFFFFF" />
      <circle r={21} fill={PURPLE} />
      <rect x={-8} y={-6} width={4.5} height={11} rx={2.25} fill="#FFFFFF" />
      <rect x={3.5} y={-6} width={4.5} height={11} rx={2.25} fill="#FFFFFF" />
    </svg>
  );
}

/** Förklaringen under kartan. */
export function ReadingMapLegend() {
  const items: { label: string; fill: string; width: string }[] = [
    { label: LEVEL_LABELS[1], fill: YELLOW, width: "34%" },
    { label: LEVEL_LABELS[2], fill: GREEN, width: "67%" },
    { label: LEVEL_LABELS[3], fill: GREEN, width: "100%" },
  ];
  return (
    <ul className="flex flex-wrap justify-center gap-x-7 gap-y-2">
      {items.map((it) => (
        <li key={it.label} className="font-whiteboard flex items-center gap-2.5 text-xl text-zinc-800">
          <span className="block h-4 w-10 overflow-hidden rounded-[5px] bg-[#E9EAEF]">
            <span className="block h-full" style={{ width: it.width, background: it.fill }} />
          </span>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** Den lilla "tårtbiten" som Edda ger efter ett bedömt svar. */
export function LevelWedge({ level }: { level: MapLevel }) {
  const rings: [number, number][] = [
    [14, 26],
    [30, 42],
    [46, 58],
  ];
  return (
    <span className="flex shrink-0 flex-col items-center gap-1">
      <svg viewBox="-34 -61 68 51" className="h-12 w-16" aria-hidden>
        {rings.map(([r1, r2], ring) => (
          <path
            key={ring}
            d={arcPath(r1, r2, -32, 32)}
            fill={ringFill(level, ring)}
            stroke={ring < level ? "none" : ACTIVE_STROKE}
            strokeWidth={2}
          />
        ))}
      </svg>
      <span className="text-xs text-zinc-500">{LEVEL_LABELS[level]}</span>
    </span>
  );
}
