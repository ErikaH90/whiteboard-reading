---
name: create-feature
description: Plan and implement a new feature in this reading-comprehension app – e.g. a new lesson phase, question type, interest area, text level, student profile, AI tutor panel or teacher view. Use when the user asks to add, build or extend functionality. Investigates the architecture first, presents a plan and waits for approval before substantial changes.
---

# Create feature

Turn a feature request into a small, well-placed change that fits the existing architecture and the pedagogy in `CLAUDE.md`.

## Workflow

### 1. Investigate (no edits yet)

- Read the parts of `CLAUDE.md` that the feature touches (which moment, which phase, which roadmap phase in §16).
- Map the relevant code: where the UI, learning logic, content and AI calls for this area live. Use the `project-analysis` skill if the area is unfamiliar.
- Find what can be reused: existing types, step builders, content helpers, components, API routes.
- If a framework API is involved, read its docs in `node_modules/` (for Next.js: `node_modules/next/dist/docs/`) rather than relying on memory.

### 2. Clarify

Ask only about decisions that change the design and that you cannot settle from CLAUDE.md or the code (for example: should data persist? which students see it? is it allowed to add a dependency?). Otherwise choose sensible defaults and state them.

### 3. Present a plan and wait for approval

Include:

- **Goal:** one sentence, linked to the CLAUDE.md section
- **Pedagogical fit:** which phase(s) it affects and how support levels are respected
- **Changes:** list of files to create/modify with one line each
- **Data/content changes:** new types or content fields, and how existing content stays valid
- **New dependencies:** none, or each one justified
- **Verification:** which checks/tests you will run, and how you will exercise the flow
- **Out of scope:** what you deliberately won't do

**Stop and wait for approval** if the change touches more than a few files, changes data models or architecture, adds a dependency, or alters the learning progression. Small, obviously scoped changes (e.g. one new question in existing content) can proceed after stating the plan.

### 4. Implement

- Keep layers separate: content in the content/text-bank layer, rules in the learning logic, rendering in the UI, provider calls in server routes.
- Make the smallest change that delivers the feature, and preserve existing behaviour.
- Keep secrets and provider calls server-side.
- For new content, follow the content rules in the `code-review` skill (one correct option, highlights exist verbatim in the level-1 text, answerable from the base text, factual accuracy).

### 5. Verify

- Run the project's existing checks (type check, lint, tests if any). Report actual output.
- Validate new content programmatically where possible.
- If the app can be run, exercise the new flow; otherwise say clearly that it was not tested in the browser.

## Output

Respond in the user's language:

1. What was built (2–4 sentences)
2. Files changed (clickable links)
3. Decisions worth knowing and their reasons
4. Verification: commands run + actual results; anything not verified
5. Follow-ups or limitations

## Quality checks

- [ ] Plan was approved before substantial changes.
- [ ] The progression modelling → guided → independent → recall → consolidate is intact.
- [ ] No unrelated files changed.
- [ ] No new dependency without approval.
- [ ] Results reported truthfully.
