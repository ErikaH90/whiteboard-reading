import { mkdirSync, writeFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { expect, it } from "vitest";
import { DEFAULT_EVALUATION_MODEL, evaluateAnswer, type Evaluation } from "../../app/ai/evaluate";
import { criteriaFor } from "../../app/lesson/criteria";
import { buildSteps, plainText } from "../../app/lesson/flow";
import { SVARSSAMLING, type EvalItem } from "./svarssamling";

// ============================================================================
// Mäter hur väl AI-bedömningen stämmer med facit i svarssamlingen.
// Anropar den riktiga AI-modellen – kostar pengar. Körs med `npm run eval`.
//
//   EVAL_MODEL=gpt-4o npm run eval     # jämför en annan modell
//   EVAL_MIN_AGREEMENT=0.9 npm run eval
// ============================================================================

try {
  loadEnvFile(".env.local");
} catch {
  // Variablerna kan också komma från miljön
}

const apiKey = process.env.OPENAI_API_KEY?.trim();
const model = process.env.EVAL_MODEL || process.env.OPENAI_MODEL || DEFAULT_EVALUATION_MODEL;
const MIN_AGREEMENT = Number(process.env.EVAL_MIN_AGREEMENT || 0.85);
const CONCURRENCY = 5;

const steps = new Map(
  (["sport", "gaming", "natur"] as const).flatMap((i) => buildSteps(i)).map((s) => [s.id, s]),
);

type Result = EvalItem & {
  category: string;
  got?: boolean;
  feedback?: string;
  analysis?: string;
  manipulation?: boolean;
  error?: string;
};

async function run(item: EvalItem): Promise<Result> {
  const step = steps.get(item.stepId)!;
  if (step.task.kind !== "free") throw new Error(`${item.stepId} är ingen fritextfråga`);
  const base = { ...item, category: step.task.category };
  try {
    const ev: Evaluation = await evaluateAnswer(
      {
        stepId: step.id,
        category: step.task.category,
        phase: step.phase,
        level: item.level,
        question: step.task.prompt,
        studentAnswer: item.answer,
        rubricTarget: step.task.rubric,
        criteria: criteriaFor(step.task),
        sideText: step.text ? plainText(step.text, item.level) : "",
      },
      { apiKey: apiKey!, model },
    );
    return {
      ...base,
      got: ev.passed,
      feedback: ev.boardFeedback,
      analysis: ev.analysis,
      manipulation: ev.manipulation,
    };
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message : String(e) };
  }
}

async function runAll(items: EvalItem[]): Promise<Result[]> {
  const results: Result[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await run(items[i]);
      }
    }),
  );
  return results;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item]);
  return map;
}

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "–");

/** Vitest döljer console-utskrifter efter await i godkända tester – skriv direkt. */
const log = (line = "") => process.stdout.write(`${line}\n`);

function groupAgreement(results: Result[], key: (r: Result) => string): string {
  const lines: string[] = [];
  for (const [k, group] of groupBy(results, key)) {
    const done = group.filter((r) => r.got !== undefined);
    const hits = pct(done.filter((r) => r.got === r.expected).length, done.length);
    lines.push(`  ${k.padEnd(16)} ${hits.padStart(5)}  (${done.length} svar)`);
  }
  return lines.join("\n");
}

it.skipIf(!apiKey)(
  `AI-bedömningen (${model}) stämmer med facit`,
  async () => {
    const results = await runAll(SVARSSAMLING);
    const done = results.filter((r) => r.got !== undefined);
    const errors = results.filter((r) => r.error);
    const agree = done.filter((r) => r.got === r.expected);
    const falsePass = done.filter((r) => r.got && !r.expected);
    const falseFail = done.filter((r) => !r.got && r.expected);
    const cheats = done.filter((r) => r.kind === "fusk" && r.got);
    const flaggedHonest = done.filter((r) => r.kind !== "fusk" && r.manipulation);
    const agreement = done.length ? agree.length / done.length : 0;

    log(`\n=== AI-bedömning: ${model} ===`);
    log(
      `Samstämmighet med facit: ${pct(agree.length, done.length)} (${agree.length}/${done.length})`,
    );
    log(`Falska godkännanden: ${falsePass.length}   Falska underkännanden: ${falseFail.length}   Fel vid anrop: ${errors.length}`);
    log("\nPer förmåga:");
    log(groupAgreement(results, (r) => r.category));
    log("\nPer svarstyp:");
    log(groupAgreement(results, (r) => r.kind));

    const show = (title: string, list: Result[]) => {
      if (!list.length) return;
      log(`\n${title}:`);
      for (const r of list) log(`  • ${r.id} [${r.kind}] – ${r.reason}\n    AI: ${r.feedback}\n    Analys: ${r.analysis}`);
    };
    show("FALSKA GODKÄNNANDEN (allvarligast – eleven tror att hen kan)", falsePass);
    show("Falska underkännanden", falseFail);
    show("Ärliga svar som felaktigt flaggades som manipulation", flaggedHonest);
    for (const r of errors) log(`  ! ${r.id}: ${r.error}`);

    mkdirSync("tests/eval/resultat", { recursive: true });
    const file = `tests/eval/resultat/${model.replace(/[^\w.-]/g, "_")}.json`;
    writeFileSync(
      file,
      JSON.stringify(
        {
          model,
          körd: new Date().toISOString(),
          samstämmighet: agreement,
          falskaGodkännanden: falsePass.map((r) => r.id),
          falskaUnderkännanden: falseFail.map((r) => r.id),
          felVidAnrop: errors.map((r) => r.id),
          felaktigtFlaggade: flaggedHonest.map((r) => r.id),
          resultat: results.map(
            ({ id, kind, category, expected, got, manipulation, feedback, analysis, error }) => ({
              id,
              kind,
              category,
              expected,
              got,
              manipulation,
              feedback,
              analysis,
              error,
            }),
          ),
        },
        null,
        2,
      ),
    );
    log(`\nResultat sparat i ${file}`);

    expect(errors, "anrop som misslyckades").toHaveLength(0);
    expect(cheats.map((r) => r.id), "lyckade fuskförsök").toEqual([]);
    expect(agreement, "samstämmighet med facit").toBeGreaterThanOrEqual(MIN_AGREEMENT);
  },
  600_000,
);
