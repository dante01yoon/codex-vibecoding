<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template Principle 1 -> I. Beginner-Readable Structure
- Template Principle 2 -> II. Transparent Recommendation Results
- Template Principle 3 -> III. Responsive UI Baseline
- Template Principle 4 -> IV. Browser-Verified Delivery
- Template Principle 5 -> V. Minimal Dependencies
Added sections:
- Technology and Scope Constraints
- Development Workflow and Quality Gates
Removed sections:
- Placeholder sample comments from the generated constitution template
Templates requiring updates:
- Updated: .specify/templates/plan-template.md
- Updated: .specify/templates/spec-template.md
- Updated: .specify/templates/tasks-template.md
- Updated: AGENTS.md
- Not present: .specify/templates/commands/*.md (no update required)
Follow-up TODOs: None
-->
# Weekend Quest Planner Constitution

## Core Principles

### I. Beginner-Readable Structure
The project MUST keep a small React file structure that a first-time learner can
scan without architectural detours. The input form, mock quest data,
recommendation logic, result display, and localStorage helper MUST live in
clearly named files under a shallow `src/` tree. New folders or abstractions MUST
be added only when they make a beginner-facing explanation shorter and clearer.

Rationale: This repository is a teaching project. The structure is part of the
lesson, not just a place to put code.

### II. Transparent Recommendation Results
Every recommended mini course MUST show its estimated time and estimated cost in
the result UI. Recommendation rules MUST respect the user's mood, available
time, budget, and companion selection, and the chosen result MUST be explainable
from local mock data. Empty or no-match states MUST tell the user why a result
cannot be shown without hiding time or cost constraints.

Rationale: The value of the app is the user's ability to decide quickly whether
the recommendation fits today's real limits.

### III. Responsive UI Baseline
The app MUST remain usable on both mobile and desktop layouts. Forms, controls,
recommendation cards, and saved-result views MUST not overflow, overlap, or
depend on fixed desktop-only widths. Plans and tasks MUST include explicit
mobile and desktop checks before implementation is considered complete.

Rationale: Beginner projects still need trustworthy UI behavior, especially when
the main flow is short enough to verify directly in a browser.

### IV. Browser-Verified Delivery
Implementation work is complete only after the app is run locally and checked in
a browser for the primary recommendation flow. Verification MUST cover a mobile
viewport, a desktop viewport, visible time and cost output, and any localStorage
persistence introduced by the feature. If browser verification cannot run, the
reason MUST be recorded with the exact command or environment blocker.

Rationale: The project is UI-led. Passing code review without seeing the app
would miss the most important failure modes for learners.

### V. Minimal Dependencies
The first version MUST use React, local mock data, browser APIs, CSS, and
localStorage before adding new libraries. A new runtime dependency MAY be added
only when the plan documents the user-facing need, the rejected simpler option,
and the teaching cost. External APIs, login, and server-side features are out of
scope for v1 unless this constitution is amended first.

Rationale: Every extra package becomes part of the lesson. Dependencies must
earn their place by making the app clearer or materially better.

## Technology and Scope Constraints

- The v1 app MUST be client-only React with no external API calls, login flow, or
  server-owned state.
- Recommendation data MUST come from local mock data that can be opened and read
  by a beginner.
- localStorage MAY be used for lightweight preferences or saved results, but the
  app MUST still render a useful first-run state when storage is empty.
- Recommendation logic MUST be deterministic enough to test manually from known
  inputs.
- Styling MUST use the project's existing CSS approach unless a plan justifies a
  new UI dependency under Principle V.

## Development Workflow and Quality Gates

- Specs MUST describe the target user flow, accepted inputs, visible outputs,
  and the time/cost display requirements before planning implementation.
- Plans MUST include the shallow React file layout, local data/storage approach,
  responsive strategy, browser verification command, and dependency rationale.
- Tasks MUST be grouped so the primary recommendation flow can be completed and
  demonstrated before optional polish.
- Any implementation summary MUST state whether browser verification passed on
  mobile and desktop, or name the blocker that prevented it.
- Changes that make the file structure harder to explain MUST include a written
  justification in the plan before implementation proceeds.

## Governance

This constitution supersedes conflicting local habits, generated templates, and
ad hoc implementation choices for Weekend Quest Planner. Amendments MUST include
the proposed text change, rationale, affected templates or docs, and a semantic
version decision.

Versioning policy:
- MAJOR: Removes or redefines a core principle, or allows a previously forbidden
  v1 category such as server APIs or authentication.
- MINOR: Adds a principle, adds a governance section, or materially expands a
  quality gate.
- PATCH: Clarifies wording, fixes examples, or updates non-semantic guidance.

Compliance review:
- `/speckit-plan` output MUST pass the Constitution Check before Phase 0
  research and again after Phase 1 design.
- `/speckit-tasks` output MUST include browser verification and responsive UI
  tasks whenever implementation work touches user-visible UI.
- Reviewers and future agents MUST treat unexplained dependency additions,
  missing time/cost display, skipped browser checks, and server/API scope creep
  as constitution violations.

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-05-17
