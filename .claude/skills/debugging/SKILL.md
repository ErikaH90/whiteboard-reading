---
name: debugging
description: Find the root cause of a bug in this reading-comprehension app before fixing it – e.g. audio not playing, AI feedback missing or wrong, level not adapting, steps skipping or repeating, text not highlighting, build or type errors. Use when something "doesn't work", behaves unexpectedly, or throws an error. Explains the proposed fix before implementing it.
---

# Debugging

Identify the root cause with evidence, explain it, then fix it with the smallest change.

## Workflow

### 1. Reproduce and describe

- Restate the symptom precisely: what was expected, what happens, where (which step/phase/interest/level).
- Collect evidence: error messages, browser console, server logs, failing command output. Run the failing command yourself when possible.

### 2. Locate

- Trace the path from user action to symptom: UI handler → state → learning logic → API route → external service → back to the UI.
- Common places to look in this app:
  - **Audio:** client playback ↔ TTS route ↔ provider; autoplay policies; cancelled/stale playback tokens.
  - **AI evaluation:** request payload, model response shape, fallback path when the call fails (a silent fallback can look like "the AI always says it's fine").
  - **Step flow / levels:** step building, entering a step, locking the text level, when outcomes are recorded.
  - **React:** stale closures in callbacks, effects with missing dependencies, state read immediately after being set.
- Test endpoints directly (e.g. `curl` the API route) to separate client from server problems.
- Never print secret values while debugging; checking whether a variable is set is enough.

### 3. Confirm the root cause

- Form a hypothesis and prove it (log, curl, minimal reproduction, reading the exact line). Distinguish the root cause from symptoms.
- If several causes are plausible, rank them and test the most likely first. Don't fix on a guess.

### 4. Explain before fixing

Tell the user:

- **Root cause:** what is wrong and where ([file:line](path#Lline))
- **Evidence:** what proves it
- **Proposed fix:** what you will change and why it is the smallest correct fix
- **Risk:** what else it could affect

For small, low-risk fixes in an obviously scoped area you may proceed immediately after explaining. For anything larger, or anything touching the pedagogical flow or architecture, wait for approval.

### 5. Fix and verify

- Implement the fix without unrelated changes.
- Re-run the reproduction and the project's existing checks (type check, lint, tests if any). Report actual results.
- If you could not verify in the real app (e.g. browser audio), say so explicitly.

## Output

Respond in the user's language: root cause → evidence → fix → verification (commands + actual results) → anything still unverified.

## Quality checks

- [ ] Root cause identified with evidence, not guessed.
- [ ] Fix explained before implementation.
- [ ] Minimal change; existing behaviour preserved.
- [ ] Verification results are real.
