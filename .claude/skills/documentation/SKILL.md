---
name: documentation
description: Write or update documentation for this reading-comprehension app – README, docs/ files (pedagogical framework, learning progression, assessment model, architecture), the "Nuläge" section of CLAUDE.md, code comments for non-obvious logic, and content-authoring guides. Use when asked to document something, after a feature changes how the app works, or when docs and code have drifted apart.
---

# Documentation

Keep documentation accurate, short and useful for its reader. Documentation describes what *is*; CLAUDE.md describes what the product *should be*.

## Workflow

1. **Identify the reader and the document.**
   - Developers / Claude Code → `CLAUDE.md` "Nuläge" section, `docs/technical-architecture.md`, code comments.
   - Teachers / content authors → content-authoring guide, `docs/pedagogical-framework.md`, `docs/learning-progression.md`, `docs/assessment-model.md`.
   - New contributors → `README.md` (setup, env variable *names*, how to run and verify).
   Match language and level of detail to that reader. Pedagogical docs are in Swedish.

2. **Read before writing.** Read the code or content being documented and the existing doc. Never document from memory or from the spec alone.

3. **Avoid duplication.** CLAUDE.md is the single source for vision and pedagogy. Other docs link to its sections instead of copying them. If information exists in two places, keep one and link from the other.

4. **Write.**
   - Lead with what the reader needs most; use headings, short paragraphs, tables for comparisons.
   - Use real file paths, commands and names that exist. Show env variable names, never values.
   - Code comments explain *why* (pedagogical rule, non-obvious constraint), not *what* the code obviously does.

5. **Check accuracy.** Verify every command, path and claim against the repository. Update the "Nuläge" gap table in CLAUDE.md if the change closes or opens a gap.

## Output

- The created/updated files (clickable links)
- One line per file on what changed and for whom
- Anything you could not verify

## Quality checks

- [ ] Every path, command and name exists in the repository.
- [ ] No secrets or personal data.
- [ ] No large copies of CLAUDE.md content.
- [ ] Docs match the current code, not the intended future state (unless clearly labelled as plan).
