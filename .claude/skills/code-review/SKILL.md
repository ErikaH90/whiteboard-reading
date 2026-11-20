---
name: code-review
description: Review code changes in this reading-comprehension app for correctness bugs, pedagogical-flow regressions, content errors and maintainability, and report findings with severity levels. Use when asked to review a diff, a branch, a file, uncommitted changes or a PR, or "granska koden". Read-only unless the user explicitly asks for fixes.
---

# Code review

Find real problems in the changed code and explain them. **Do not modify files** unless the user explicitly asks you to apply fixes.

## Workflow

1. **Establish the scope.**
   - Default: uncommitted changes (`git diff` + `git diff --staged` + untracked files). Otherwise the branch, files or PR the user named.
   - Read every changed file in full, plus the callers/callees you need to judge correctness.

2. **Understand intent.** Read the relevant section of `CLAUDE.md` for the feature you are reviewing. Ask yourself what the change is supposed to do before judging how it does it.

3. **Review along these dimensions**, in order of importance:
   1. **Correctness:** logic errors, wrong state transitions, stale closures in React handlers/effects, race conditions with async calls (audio, AI evaluation), unhandled errors, off-by-one in step navigation.
   2. **Pedagogical integrity:** does the change preserve the progression in CLAUDE.md §2? In support-free phases (recall, diagnosis) there must be no hints, highlights, glossary, sentence starters, model answers or auto read-aloud, and evaluation must come *after* submission. Does independence still weigh more than answers given with support?
   3. **Content correctness** (if lesson data changed): exactly one correct option per choice question; hint/think-aloud highlight phrases exist verbatim in the base (level 1) text; every question is answerable from the base text; no invented statistics attributed to real organisations; age-appropriate language.
   4. **AI integration:** prompts get the question, rubric, phase and level; structured output is validated; graceful fallback when the API fails; no secret or API call exposed to the client.
   5. **Maintainability:** separation of UI / learning logic / content (CLAUDE.md §11), duplication, naming, dead code.
   6. **Framework usage:** if Next.js APIs are involved, check them against `node_modules/next/dist/docs/` rather than memory.

4. **Verify before reporting.** For each candidate finding, re-read the code path and construct a concrete failure scenario. Drop anything you cannot substantiate or mark it as a question.

5. **Run existing checks** (type check, lint) if they are cheap, and include the actual results.

## Severity levels

| Level | Meaning |
|---|---|
| **Critical** | Data/secret leak, crash of the core flow, or the pedagogical progression is broken for all students |
| **High** | Wrong behaviour in a common path (e.g. wrong answer marked correct, level never adapts) |
| **Medium** | Wrong behaviour in an edge case, or a clear maintainability problem that will cause bugs |
| **Low** | Minor issue, readability, small inconsistency |
| **Question** | Unclear intent – needs the author's answer |

## Output

Respond in the user's language. For each finding, most severe first:

- **[Severity] Short title:** [file:line](path#Lline)
  - *What:* one sentence describing the defect
  - *Why it matters:* the concrete failure scenario (input/state → wrong result)
  - *Suggestion:* a concrete fix (a short snippet if helpful)

End with: checks run + actual results, and a one-line overall verdict. If nothing survives verification, say so plainly.

## Quality checks

- [ ] Every finding has a file/line, a failure scenario and a suggestion.
- [ ] No style nitpicks that a linter would catch, unless they hide a bug.
- [ ] No files modified (unless explicitly requested).
- [ ] Did not claim checks passed without running them.
