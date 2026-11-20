---
name: refactoring
description: Restructure code in this reading-comprehension app without changing behaviour – e.g. splitting the large page component into components, extracting learning logic into testable modules, moving content into a data format, removing duplication. Use when asked to clean up, restructure, split, extract or simplify code. Preserves existing functionality and asks before architectural changes.
---

# Refactoring

Improve structure while keeping behaviour identical. A refactor that changes what the student experiences is a feature or a bug fix, not a refactor.

## Workflow

### 1. Analyse

- Read the code to be refactored and everything that depends on it.
- Name the concrete problem (e.g. "UI, audio and learning logic are mixed in one component", "content and rules are coupled"). Link it to a principle in CLAUDE.md §11 where relevant.
- Record the current behaviour you must preserve: the step sequence, what is shown in each phase, audio behaviour, adaptation rules, API contracts.

### 2. Establish a safety net

- Run the existing checks/tests and note the baseline results.
- If behaviour isn't covered by tests, add a lightweight check first (for example, a script that snapshots the built step list per interest), or agree with the user on a manual verification path. Don't add dependencies without approval.

### 3. Plan

- List the moves (extract, rename, split, inline) in small, independently verifiable steps.
- **Ask for approval before** changing folder structure, data models, public APIs/route contracts, state management approach, or anything touching more than a handful of files.

### 4. Refactor in small steps

- One kind of change at a time; re-run checks after each step.
- Keep the layers separate: UI ↔ learning engine ↔ content ↔ AI/server.
- Don't mix in feature changes or "while I'm here" fixes. If you find a bug, report it separately and ask.

### 5. Verify equivalence

- Re-run the baseline checks and compare results.
- Compare behaviour snapshots (e.g. step IDs and order per interest before/after).
- State clearly what was and wasn't verified in the running app.

## Output

Respond in the user's language: problem → what changed (files, moves) → why it's better → evidence that behaviour is unchanged (actual results) → follow-ups.

## Quality checks

- [ ] Behaviour unchanged, with evidence.
- [ ] Approval obtained for architectural changes.
- [ ] No new dependencies without approval.
- [ ] No unrelated changes mixed in.
