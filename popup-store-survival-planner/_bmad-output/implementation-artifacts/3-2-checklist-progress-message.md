---
story_id: "3.2"
story_key: 3-2-checklist-progress-message
epic: "Epic 3 - 현장 체크리스트 준비"
status: done
created: 2026-05-18
source:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
previous_story:
  - _bmad-output/implementation-artifacts/3-1-default-checklist.md
---

# Story 3.2: Checklist Progress And Ready Message

Status: done

## Story

As a popup store visitor,  
I want to see checklist readiness in the card,  
so that I can understand preparation status at a glance.

## Scope

This story completes Epic 3 by deriving checklist progress from the existing default checklist state and reflecting it in the survival plan card.

Included:

- Checklist progress count, for example `3/5 준비됨`
- Prepared-complete message when every checklist item is checked
- General preparation message when not complete
- Immediate update when an item is unchecked after completion
- Unit tests for progress and message helpers

Excluded:

- Custom checklist item add/delete
- localStorage save/restore
- Reset controls
- Payment, external API, login, server, map, realtime inventory, SNS sharing

## Acceptance Criteria

1. Progress count appears in the card
   - Given there are 5 checklist items
   - When the user checks 3 items
   - Then the survival plan card shows `3/5 준비됨`

2. Complete message appears
   - Given there are 5 checklist items
   - When the user checks every item
   - Then the survival plan card shows a prepared-complete message

3. Complete message updates after uncheck
   - Given every checklist item is checked
   - When the user unchecks one item
   - Then the prepared-complete message disappears or changes back to a general preparation message

4. Existing behavior preservation
   - Given implementation is complete
   - When visit, wait, goods, budget, priority, and checklist toggle behavior are checked
   - Then prior behavior still works

## Tasks / Subtasks

- [x] Task 1: Confirm current code and scope (AC: 4)
  - [x] Read `src/App.jsx`, `src/styles.css`, `src/utils/planCalculations.js`, and `src/utils/planCalculations.test.mjs`.
  - [x] Preserve Story 3.1 native checkbox toggling.
  - [x] Do not add custom checklist items, storage, server, external API, or new state management.

- [x] Task 2: Add checklist progress helpers (AC: 1, 2, 3)
  - [x] Add a helper that returns checked count, total count, and label.
  - [x] Add a helper that returns a complete message only when all items are checked.
  - [x] Add tests for `3/5 준비됨`, complete state, and uncomplete state.

- [x] Task 3: Render progress in the survival card (AC: 1, 2, 3)
  - [x] Add a checklist progress row to the card summary.
  - [x] Add the checklist readiness message below the priority goods list or near the wait message.
  - [x] Ensure the card updates immediately when checkboxes change.

- [x] Task 4: Verify and review (AC: 1-4)
  - [x] Run `npm test`.
  - [x] Run `npm run build`.
  - [x] Browser-check 3/5 progress, all-checked complete message, uncheck general message, prior behavior, and excluded UI absence.

## Senior Developer Review (AI)

### Review Outcome

Approve - no blocking findings.

### Review Summary

- Blind Hunter: No storage, custom checklist, API, or optional Epic 5 scope entered the story.
- Edge Case Hunter: Progress is derived from current checkbox state, updates after unchecking from complete state, and handles total count through the helper.
- Acceptance Auditor: AC 1-4 passed through unit tests, build, and browser checks.

### Action Items

- None.

### Residual Risk

- The ready message text is intentionally simple for the beginner MVP; future UX polish can adjust copy without changing the state model.

## Dev Notes

### Current Code State

- `App.jsx` has `checklistItems` state with `{ id, label, checked }`.
- Story 3.1 renders the default checklist and toggles items immutably.
- The survival card currently shows visit date, time slot, wait, goods budget, and priority goods.

### Architecture Guardrails

- Keep progress and message as derived values, not stored state.
- Use plain React `useState`; no new dependencies.
- Custom checklist item management is Epic 5 optional scope.
- Persistence belongs to Epic 4.

### Expected Files To Modify

- `src/App.jsx`
- `src/styles.css`
- `src/utils/planCalculations.js`
- `src/utils/planCalculations.test.mjs`
- `_bmad-output/implementation-artifacts/3-2-checklist-progress-message.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-18: Story created and started from Epic 3 backlog.
- RED check: `npm test` failed because `getChecklistProgress` was not exported yet.
- Unit/regression check: `npm test` passed after checklist progress helpers were implemented.
- Production build check: `npm run build` passed.
- Browser check: Playwright at `http://127.0.0.1:5176/` verified `3/5 준비됨`, complete `5/5 준비됨`, complete message, uncheck back to `4/5 준비됨`, excluded UI absence, and 375px no-horizontal-scroll.
- Browser console check: only the React DevTools informational message appeared; no app errors were logged.

### Implementation Plan

- Add helper tests first.
- Derive progress and message from `checklistItems`.
- Render progress and message inside the survival card.

### Completion Notes

- Added checklist progress and ready-message helpers.
- Rendered checklist progress and readiness message in the survival card.
- Added unit tests for partial and complete checklist states.
- BMAD-style review approved the story with no blocking findings.

### File List

- `_bmad-output/implementation-artifacts/3-2-checklist-progress-message.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/verification/popup-store-survival-planner-3-2-375.png`
- `src/App.jsx`
- `src/styles.css`
- `src/utils/planCalculations.js`
- `src/utils/planCalculations.test.mjs`

### Change Log

- 2026-05-18: Created and started Story 3.2 implementation.
- 2026-05-18: Implemented checklist progress/card message, tests, browser verification, and BMAD review.
