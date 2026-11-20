---
name: testing
description: Run, write and assess tests for this reading-comprehension app – learning logic (step building, level adaptation, support-free phases), lesson content validity, API routes and UI flows. Use when asked to test something, add tests, check coverage, or verify a change. Reuses the existing test setup and reports actual results only.
---

# Testing

Verify behaviour with the tools the project already has, find missing coverage, and report results exactly as they happened.

## Workflow

### 1. Discover the existing setup

- Check `package.json` scripts and devDependencies, config files (e.g. `vitest.config.*`, `jest.config.*`, `playwright.config.*`) and existing test files (`*.test.*`, `*.spec.*`, `tests/`).
- **If a test framework exists:** use it and follow its conventions.
- **If none exists:** say so. Use the checks that do exist (type check, lint, build) and lightweight validation scripts written to a scratch location outside the repo. Do **not** add a test framework or dependency without the user's approval; propose one with a short justification instead.

### 2. Decide what to test

Prioritise what would hurt students most if it broke:

1. **Learning logic (pure functions, test without AI):** step order per part, level adaptation rules, which phases are support-free, text paragraphs per level.
2. **Content invariants:** one correct option per choice question; hint/think-aloud highlights appear verbatim in the level-1 text; each part has every phase; IDs are unique; diagnosis tasks have rubrics.
3. **API routes:** valid input → structured output; provider failure → safe fallback; missing env → clear error; no secrets in responses.
4. **UI flows:** interest choice → modelling → practice → recall → diagnosis → result; support is hidden in support-free phases.

Keep AI-dependent tests separate from deterministic ones. Mock or stub the provider for deterministic tests; label live-provider tests as such.

### 3. Run

- Run the relevant commands and capture the real output (exit codes, failures, counts).
- If a command cannot run (missing dependency, server not running, no network), report that – don't substitute an assumed result.

### 4. Identify missing coverage

List untested areas, ranked by risk, with a concrete test suggestion for each.

## Output

Respond in the user's language:

- **Setup found:** framework or "none", plus available checks
- **Commands run:** each command with its actual result (pass/fail, counts, key error lines)
- **New/changed tests:** files and what they cover (only if the user asked you to write them)
- **Coverage gaps:** ranked list with suggested tests
- **Not verified:** anything you couldn't run

## Quality checks

- [ ] Never claimed tests passed unless they ran and passed.
- [ ] Reused the existing setup; no new dependency without approval.
- [ ] Deterministic logic tested separately from the AI provider.
- [ ] Application code not modified just to make a test pass, unless a real bug was found and reported.
