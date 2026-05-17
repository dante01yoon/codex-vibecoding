# Implementation Plan: 미니 코스 추천

**Branch**: `001-mini-course-recommendation` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-mini-course-recommendation/spec.md`

**Note**: This plan is filled in by the `/speckit-plan` workflow and stops before task generation.

## Summary

Build Weekend Quest Planner as a beginner-readable React + Vite single page app. Users choose mood, available time, budget, and companion status; the app recommends one matching mini course from local mock data, shows visible time and cost information, handles no-match states, and stores the most recent recommendation in the same browser.

The active spec requires one recent recommendation. The planning prompt mentioned three recent recommendations, but this plan keeps one item to stay aligned with the clarified spec and v1 scope.

## Technical Context

**Language/Version**: JavaScript with React and Vite

**Primary Dependencies**: React, React DOM, Vite, and Vite's React plugin from the standard Vite React setup. No additional runtime libraries.

**Storage**: Local mock data files for quest/course data and `localStorage` for the most recent recommendation.

**Testing**: Manual browser verification plus `npm run build`. No separate test framework is introduced in v1.

**Target Platform**: Modern mobile and desktop browsers.

**Project Type**: Client-only React single page app.

**Performance Goals**: Primary recommendation flow should feel immediate because all data and recommendation rules are local.

**Constraints**: No external APIs, no login, no server-owned state, no new libraries beyond the Vite React baseline, beginner-readable structure, responsive UI, visible time/cost output.

**Scale/Scope**: Small v1 teaching app with fixed input choices, local mock mini courses, deterministic recommendation, no-match state, and one saved recent recommendation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Beginner-readable structure**: PASS. The plan uses a shallow `src/` tree with clearly named files for the form, mock data, recommendation logic, result UI, recent result UI, and storage.
- **Local-only v1 scope**: PASS. Data comes from local files and the browser stores only the latest recommendation; external APIs, login, and server state are excluded.
- **Transparent recommendation output**: PASS. Recommendation and recent result views must show activity-level and total time/cost.
- **Responsive UI baseline**: PASS. The form, result card, empty state, and recent recommendation section are planned as responsive full-width sections that stack on mobile and fit side-by-side only when width allows.
- **Browser verification**: PASS. The plan names `npm run dev`, `npm run build`, and mobile/desktop browser checks in `quickstart.md`.
- **Minimal dependencies**: PASS. No UI, routing, state, date, testing, or storage libraries are added beyond the React + Vite baseline.

## Project Structure

### Documentation (this feature)

```text
specs/001-mini-course-recommendation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contract.md
└── tasks.md              # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
package.json
index.html
src/
├── main.jsx
├── App.jsx
├── App.css
├── components/
│   ├── EmptyState.jsx
│   ├── QuestForm.jsx
│   ├── RecommendationCard.jsx
│   └── RecentRecommendation.jsx
├── data/
│   └── mockQuests.js
└── lib/
    ├── recommendQuest.js
    └── storage.js
```

**Structure Decision**: Use JavaScript files and one app stylesheet to keep the project easy to explain. `App.jsx` owns the primary screen state and wires together the form, recommendation result, recent recommendation, and empty state. Components stay presentational where possible. Local data, recommendation rules, and storage behavior are separated into small named files so a beginner can inspect each responsibility directly.

## Phase 0: Research Summary

Research is captured in [research.md](./research.md). Key decisions:

- Use the standard Vite React setup and scripts: `dev`, `build`, and `preview`.
- Split React UI into small component files while keeping shared state in `App.jsx`.
- Store exactly one recent recommendation to match the clarified spec.
- Keep recommendation deterministic: match all constraints, pick lowest total cost, then shortest total time.
- Use ordinary CSS for responsive layout; no UI framework.

## Phase 1: Design Summary

Design artifacts:

- [data-model.md](./data-model.md): Defines `UserPreference`, `MiniCourse`, `Activity`, `RecommendationResult`, `RecentRecommendation`, and UI state transitions.
- [contracts/ui-contract.md](./contracts/ui-contract.md): Defines browser-visible UI contracts for input, recommendation, empty state, recent result, and responsive checks.
- [quickstart.md](./quickstart.md): Defines setup, local run, build, and manual browser verification.

## Constitution Check Re-evaluation

*GATE: Re-check after Phase 1 design.*

- **Beginner-readable structure**: PASS. Design keeps files shallow and named by responsibility.
- **Local-only v1 scope**: PASS. Contracts expose no external API and data remains local.
- **Transparent recommendation output**: PASS. Data model and UI contract require activity-level and total time/cost.
- **Responsive UI baseline**: PASS. UI contract and quickstart include mobile and desktop verification.
- **Browser verification**: PASS. Quickstart includes dev-server, build, desktop viewport, mobile viewport, recommendation flow, no-match state, and recent recommendation checks.
- **Minimal dependencies**: PASS. No dependency additions beyond the React + Vite baseline.

## Complexity Tracking

No constitution violations or added complexity are required for this plan.
