---
name: project-analysis
description: Map the current state of this reading-comprehension app before planning or changing anything – stack, architecture, data flow, lesson content, verification tooling and gaps against CLAUDE.md. Use when starting a new session or task, when asked "how does X work", "where is Y", "what's the state of the project", or before create-feature, refactoring or a large debugging task. Read-only.
---

# Project analysis

Build an accurate, current picture of the project. This skill is **read-only**: it never modifies files.

The product vision, pedagogy and target state live in `CLAUDE.md`. Do not restate them; compare the code against them.

## Workflow

1. **Discover the stack – don't assume it.**
   - Read `package.json` (scripts, dependencies, versions), lockfile type, `tsconfig.json`, lint config, framework config files.
   - If the project uses Next.js, note the exact version and read the relevant guide in `node_modules/next/dist/docs/` before drawing conclusions about APIs (see `AGENTS.md`).
   - List the verification commands that actually exist (type check, lint, build, tests). Do not invent scripts.

2. **Map the structure.**
   - List source directories and the role of each file. Separate: UI, pedagogical/learning logic, content/text bank, AI integrations, API routes, persistence.
   - Identify external services, which env variables they need (names only – never print values) and where they are called from (server vs client).

3. **Trace the core flow end-to-end.**
   - How a lesson is built, how a step is entered, how an answer is evaluated, how the level adapts, how results are shown.
   - Note where state lives and whether anything persists.

4. **Inventory the content.**
   - Number of parts, phases per part, interests, text levels, questions per type, diagnosis questions, word counts.
   - Prefer a quick script over manual counting when the content is code/data.

5. **Compare with CLAUDE.md.**
   - Update or confirm the gap table in the "Nuläge" section. Mark each spec item as present, partial or missing.
   - Flag anything that violates the core progression (modelling → guided → independent → recall without support → consolidate).

6. **Check health.** Run the existing non-destructive checks (e.g. type check, lint). Report exact results.

## Output

Respond in the user's language (Swedish in this project). Structure:

- **Stack:** framework + versions, AI/TTS providers, tooling
- **Architecture:** short file map with one line per important file (use clickable markdown links)
- **Core flow:** 5–10 numbered steps
- **Content inventory:** counts in a small table
- **Gaps vs CLAUDE.md:** present / partial / missing
- **Health:** commands run and their actual results
- **Risks & open questions:** max 5, most important first

## Quality checks

- [ ] Every claim is backed by a file you actually read or a command you actually ran.
- [ ] No secrets printed (show variable names only).
- [ ] No files modified.
- [ ] Stated "not verified" where you didn't check something.
