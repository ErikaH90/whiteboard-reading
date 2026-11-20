# Agent Collaboration Workflow

## General principle

The main Claude Code agent acts as project manager and coordinates specialised subagents (`.claude/agents/`). Subagents are used when their expertise is relevant, not by default.

## Responsibilities

| Agent | Defines / delivers | Edits files? |
|---|---|---|
| `pedagogical-architect` | Learning requirements: objectives, phase design, assessment criteria | No |
| `ux-ui-designer` | User experience: flows, screen structure, interactions, accessibility | No |
| `ai-learning-engineer` | AI behaviour: tutoring per phase, hints, adaptivity, evaluation prompts and schemas | No |
| `content-designer` | Educational content: texts, questions, answer keys, rubrics (as structured data) | No |
| `developer` | Implementation of approved designs, plus tests | **Yes, the only one** |
| `qa-tester` | Technical and pedagogical verification with pass/fail evidence | No (runs checks) |

The main agent owns coordination, integration and approvals with the user. It also inserts content from `content-designer` (or delegates that to `developer`).

## Feature development workflow

For every **major** feature:

1. **Research:** Ask the relevant agents to analyse requirements. Run independent analyses in parallel.
2. **Design:**
   - `pedagogical-architect` defines the learning requirements.
   - `ux-ui-designer` proposes the interaction and interface.
   - `ai-learning-engineer` defines the AI behaviour where relevant.
   - The main agent resolves conflicts and **gets the user's approval** for anything marked "Requires approval".
3. **Content:** `content-designer` prepares texts, questions and assessment materials when required.
4. **Implementation:** `developer` implements the approved design.
5. **Quality assurance:** `qa-tester` verifies technical and pedagogical quality, with retrieval phases as the highest priority.
6. **Final review:** The main agent summarises:
   - what was implemented
   - which requirements were fulfilled
   - which tests were actually executed, and their results
   - remaining issues
   - recommended next steps.

Small, well-scoped changes (a bug fix, one new question) skip straight to implementation and a quick check.

## Important rules

- Don't delegate every task. If it takes a handful of tool calls, do it directly.
- Use parallel agents for independent analysis.
- Never let several agents modify the same files at the same time. Only `developer` edits application code.
- Don't implement features before their requirements are clear enough.
- Subagents can't ask the user questions. They mark decisions as "Requires approval", and the main agent takes them to the user.
- Preserve the pedagogical progression in every learning module: **Modelling → Guided practice → Independent practice → Retrieval without support → Knowledge consolidation.**
