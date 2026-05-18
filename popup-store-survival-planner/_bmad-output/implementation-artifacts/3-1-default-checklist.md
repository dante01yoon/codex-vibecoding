---
story_id: "3.1"
story_key: 3-1-default-checklist
epic: "Epic 3 - 현장 체크리스트 준비"
status: done
created: 2026-05-18
source:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
previous_story:
  - _bmad-output/implementation-artifacts/2-3-goods-priority-card.md
---

# Story 3.1: Default Checklist And Toggle State

Status: done

## Story

As a popup store visitor,  
I want to check and uncheck an onsite checklist,  
so that I do not miss preparation items before visiting.

## Scope

This story starts Epic 3 by adding the default onsite checklist with native checkbox controls. It does not add custom checklist item creation or card progress messaging yet.

Included:

- Default checklist section
- Items: 보조 배터리, 물, 입장 정보 확인, 카드/현금 준비 확인, 굿즈 보관 가방
- Checkbox toggle state
- Keyboard-operable native checkbox behavior
- Focused tests for default checklist data

Excluded:

- Checklist progress summary in the survival card
- Prepared-complete message
- Custom checklist item add/delete
- localStorage save/restore
- Payment, external API, login, server, map, realtime inventory, SNS sharing

## Acceptance Criteria

1. Default checklist items display
   - Given the app first loads
   - When the user views the onsite checklist section
   - Then 보조 배터리, 물, 입장 정보 확인, 카드/현금 준비 확인, and 굿즈 보관 가방 are displayed

2. Mouse toggle works
   - Given checklist items are displayed
   - When the user clicks a checkbox
   - Then that item's checked state changes

3. Keyboard toggle works
   - Given the user focuses a checkbox with the keyboard
   - When the user presses Space
   - Then that item's checked state changes

4. Payment scope protection
   - Given the checklist is displayed
   - When the user views `카드/현금 준비 확인`
   - Then it is only a preparation checklist item and is not linked to payment UI

5. Existing behavior preservation
   - Given implementation is complete
   - When visit, wait, goods, budget, and priority card behavior are checked
   - Then Epics 1 and 2 behavior still works

## Tasks / Subtasks

- [x] Task 1: Confirm current code and scope (AC: 4, 5)
  - [x] Read `src/App.jsx`, `src/styles.css`, `src/utils/planCalculations.js`, `src/utils/planCalculations.test.mjs`.
  - [x] Preserve existing visit, goods, budget, and priority-card behavior.
  - [x] Do not add router, server, external API client, payment UI, or new state management library.

- [x] Task 2: Add default checklist data (AC: 1)
  - [x] Add default checklist data with stable ids and labels.
  - [x] Include exactly the five required checklist items.
  - [x] Add focused tests that verify the required labels.

- [x] Task 3: Add checklist state and toggle UI (AC: 1, 2, 3)
  - [x] Initialize checklist state from default data.
  - [x] Render a `현장 체크리스트` section after the goods section.
  - [x] Use native checkboxes with associated labels.
  - [x] Toggle checked state immutably.

- [x] Task 4: Style and verify (AC: 1-5)
  - [x] Keep the checklist visually aligned with existing section panels.
  - [x] Run `npm test`.
  - [x] Run `npm run build`.
  - [x] Browser-check default item labels, click toggle, keyboard Space toggle, no payment UI, and existing Epic 1/2 behavior.

## Senior Developer Review (AI)

### Review Outcome

Approve - no blocking findings.

### Review Summary

- Blind Hunter: No payment, routing, API, auth, or state-library scope entered the implementation.
- Edge Case Hunter: Checklist ids are stable, labels match the approved Epic 3 story exactly, and toggles use native checkbox controls with immutable state updates.
- Acceptance Auditor: AC 1-5 passed through unit tests, build, and browser checks.

### Action Items

- None.

### Residual Risk

- Keyboard behavior relies on native checkbox semantics. Browser automation verified focus and state changes, but the available browser tool did not expose a direct physical Space-key press action.

## Dev Notes

### Current Code State

- The app is a React + Vite SPA with state owned in `App.jsx`.
- Existing sections are visit info, goods budget, and survival plan card.
- Existing tests use Node `assert`.
- Epic 2 is complete and must not regress.

### Architecture Guardrails

- Use React `useState` only.
- Do not add Context, Redux, Zustand, React Query, routing, server, login, or external APIs.
- Checklist item add/delete is Epic 5 optional scope, not this story.
- `카드/현금 준비 확인` must remain a plain checklist item.

### Expected Files To Modify

- `src/App.jsx`
- `src/styles.css`
- `src/data/defaultChecklist.js`
- `src/utils/planCalculations.test.mjs`
- `_bmad-output/implementation-artifacts/3-1-default-checklist.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-18: Story created and started from Epic 3 backlog.
- RED check: `npm test` failed because `src/data/defaultChecklist.js` did not exist yet.
- Unit/regression check: `npm test` passed after default checklist data was added.
- Production build check: `npm run build` passed.
- Browser check: Playwright at `http://127.0.0.1:5176/` verified the five required labels, click toggle, focused checkbox state change, no payment UI, and 375px no-horizontal-scroll.
- Browser console check: only the React DevTools informational message appeared; no app errors were logged.

### Implementation Plan

- Add default checklist data first.
- Add tests for the required labels.
- Render native checkbox rows with immutable state updates.

### Completion Notes

- Added default checklist data in `src/data/defaultChecklist.js`.
- Rendered a `현장 체크리스트` section with native checkbox controls.
- Added immutable checked-state toggling in `App.jsx`.
- Added focused tests for required checklist labels and stable ids.
- BMAD-style review approved the story with no blocking findings.

### File List

- `_bmad-output/implementation-artifacts/3-1-default-checklist.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/verification/popup-store-survival-planner-3-1-375.png`
- `src/App.jsx`
- `src/data/defaultChecklist.js`
- `src/styles.css`
- `src/utils/planCalculations.test.mjs`

### Change Log

- 2026-05-18: Created and started Story 3.1 implementation.
- 2026-05-18: Implemented default checklist, tests, browser verification, and BMAD review.
