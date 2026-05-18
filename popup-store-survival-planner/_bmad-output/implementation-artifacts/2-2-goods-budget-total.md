---
story_id: "2.2"
story_key: 2-2-goods-budget-total
epic: "Epic 2 - 굿즈 예산과 우선순위 정리"
status: done
created: 2026-05-18
source:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
previous_story:
  - _bmad-output/implementation-artifacts/2-1-goods-item-list.md
---

# Story 2.2: Goods Budget Total

Status: done

## Story

As a popup store visitor,  
I want to see a total when I enter expected budgets for each goods item,  
so that I can reduce budget overrun before visiting.

## Scope

This story continues Epic 2 after the goods item list exists. The user can enter budgets for goods items, see a total in the goods section, and see the same budget total reflected in the survival plan card.

Included:

- Budget total calculation for existing goods items
- Blank budget values counted as 0
- Negative budget validation message under the affected budget input
- Budget total display in the goods section
- Budget total display in the survival plan card
- Unit tests for budget calculation and validation helpers

Excluded:

- Priority sorting in the survival plan card
- Priority purchase goods list in the survival plan card
- localStorage save/restore
- Currency formatting beyond a simple Korean won display
- Payment, price comparison, realtime inventory, external API, SNS sharing, login, server

## Acceptance Criteria

1. Budget total for multiple goods
   - Given there are 2 goods items
   - When the user enters `12000` and `30000`
   - Then the budget total is displayed as `42000`

2. Blank budget counts as zero
   - Given a goods budget input exists
   - When the user leaves the value blank
   - Then that item is calculated as 0 won

3. Negative budget validation
   - Given a goods budget input exists
   - When the user enters a negative number
   - Then an error message is displayed under that input

4. Survival card reflection
   - Given goods budget values are entered
   - When the survival plan card renders
   - Then the card shows the same budget total as the goods section

5. Existing behavior preservation
   - Given the implementation is complete
   - When visit date, time slot, wait minutes, goods add/edit/delete, and 5-item limit are checked
   - Then the existing Story 1 and Story 2.1 behaviors still work

6. Excluded feature protection
   - Given the implementation is complete
   - When buttons and links are checked
   - Then payment, price comparison, realtime inventory, external API, SNS sharing, login, and server UI are absent

## Tasks / Subtasks

- [x] Task 1: Confirm current code patterns (AC: 5, 6)
  - [x] Read `src/App.jsx`, `src/styles.css`, `src/utils/planCalculations.js`, and `src/utils/planCalculations.test.mjs`.
  - [x] Preserve the existing `goodsItems` data shape `{ id, name, priority, budget }`.
  - [x] Do not add router, server, external API client, or new state management libraries.

- [x] Task 2: Add budget calculation and validation helpers (AC: 1, 2, 3)
  - [x] Add a helper that converts blank budget values to 0.
  - [x] Add a helper that sums all goods budgets.
  - [x] Add a helper that detects negative budget values.
  - [x] Keep helpers in `src/utils/planCalculations.js`.

- [x] Task 3: Add focused tests for budget behavior (AC: 1, 2, 3)
  - [x] Add tests for `12000 + 30000 = 42000`.
  - [x] Add tests for blank budget values counting as 0.
  - [x] Add tests for negative budget validation.
  - [x] Run `npm test` and confirm the new tests fail before implementation if possible, then pass after implementation.

- [x] Task 4: Display budget validation in the goods list (AC: 3)
  - [x] Add `aria-describedby` for budget inputs with errors.
  - [x] Display `0 이상의 금액으로 입력해주세요.` under a negative budget input.
  - [x] Keep the edited value visible so the user can fix it.

- [x] Task 5: Display the budget total in the goods section and survival card (AC: 1, 2, 4)
  - [x] Show the current budget total near the goods list.
  - [x] Add a budget total row to the survival plan card.
  - [x] Ensure both displays use the same calculated value.

- [x] Task 6: Verification and documentation (AC: 1-6)
  - [x] Run `npm test`.
  - [x] Run `npm run build`.
  - [x] Browser-check adding two goods with `12000` and `30000`, blank budget, negative budget error, and survival card total.
  - [x] Browser-check existing visit info, wait message, goods add/delete, 5-item limit, mobile no-horizontal-scroll, and excluded UI absence.

## Senior Developer Review (AI)

### Review Outcome

Approve - no blocking findings.

### Review Summary

- Blind Hunter: No unscoped features or dependency drift found. The implementation stays in `App.jsx`, CSS, and calculation helpers.
- Edge Case Hunter: Blank budgets are counted as 0, negative values remain visible with an inline error, and existing add/delete/max-5 behavior still works.
- Acceptance Auditor: AC 1-6 passed through unit tests, build, and browser checks.

### Action Items

- None.

### Residual Risk

- Negative budget values currently still participate in the raw derived total while the field is invalid. This matches the story's helper guidance but could be refined in a future validation-focused story if the product wants invalid inputs excluded from totals.

## Dev Notes

### Current Code State

- The app is a React + Vite single-page app.
- `src/App.jsx` owns state directly with `useState`.
- Existing state includes `visitDate`, `timeSlot`, `waitMinutes`, `goodsItems`, `newGoodsName`, and `goodsNotice`.
- Existing goods items use `{ id, name, priority, budget }`.
- Existing Story 2.1 behavior includes add, edit, delete, and max-5 limit.
- `src/utils/planCalculations.test.mjs` uses Node `assert`; do not add a new test framework.

### Architecture Guardrails

- Keep this story in the existing small `App.jsx` structure.
- Do not introduce `Context`, `Redux`, `Zustand`, `React Query`, routing, server, auth, or external APIs.
- localStorage is not part of this story.
- The budget total is derived state; do not store it separately in React state.
- Names may remain editable as Story 2.1 allowed. Empty names are not filtered from total calculation in this story because budget total is based on item budget inputs, not card priority list.

### Recommended Helper Shape

```js
export function parseGoodsBudget(budget) {
  if (budget === '') {
    return 0
  }

  return Number(budget)
}

export function hasGoodsBudgetError(budget) {
  if (budget === '') {
    return false
  }

  return Number(budget) < 0
}

export function getGoodsBudgetTotal(goodsItems) {
  return goodsItems.reduce((total, item) => total + parseGoodsBudget(item.budget), 0)
}
```

Implementation notes:

- `input type="number"` may still provide values as strings; keep `budget` as a string in state.
- Blank values should not show an error.
- Negative values should show an error and still remain visible.
- The total should derive from current `goodsItems` on render.

### Existing Behavior To Preserve

- Date selection updates the survival plan card immediately.
- Time slot selection updates the survival plan card immediately.
- Wait minute messages for `30`, `90`, `150`, and `-1` continue to work.
- Goods item add/edit/delete continues to work.
- The max-5 goods limit and notice continue to work.
- Mobile 375px width has no horizontal scroll.
- Payment, price comparison, realtime inventory, external API, SNS sharing, login, and server UI remain absent.

### Expected Files To Modify

- `src/App.jsx` - derived budget total, budget error display, goods total UI, survival card row
- `src/styles.css` - small total summary styling if needed
- `src/utils/planCalculations.js` - budget calculation/validation helpers
- `src/utils/planCalculations.test.mjs` - budget helper tests
- `_bmad-output/implementation-artifacts/2-2-goods-budget-total.md` - dev-story progress, review, and file list
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - story status transitions

Files not expected:

- `src/utils/storage.js`
- API client files
- router files
- auth files

### Testing / Verification

```bash
npm test
npm run build
npm run dev
```

Browser checklist:

- Add goods `키링` and `티셔츠`.
- Enter `12000` and `30000`; goods section and card both show `42000`.
- Clear one budget; total treats it as 0.
- Enter `-1`; the affected input shows `0 이상의 금액으로 입력해주세요.`.
- Existing visit date, time slot, wait time, goods delete, max-5 notice still work.
- 375px mobile width has no horizontal scroll.
- Excluded features are not present.

## References

- Epics: `_bmad-output/planning-artifacts/epics.md`
- PRD: `_bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- UX Spec: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Previous Story: `_bmad-output/implementation-artifacts/2-1-goods-item-list.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from the first backlog Epic 2 item in `sprint-status.yaml`.
- 2026-05-18: Story status moved to in-progress for dev-story execution.
- RED check: `npm test` failed because `getGoodsBudgetTotal` was not exported yet.
- Unit/regression check: `npm test` passed after budget helpers were implemented.
- Production build check: `npm run build` passed.
- Browser check: Playwright at `http://127.0.0.1:5174/` verified `12000 + 30000 = 42000`, blank budget as 0, negative budget error with `aria-describedby`, matching goods/card totals, goods delete, visit info, wait message, max-5 limit, excluded UI absence, and 375px no-horizontal-scroll.
- Browser console check: only the React DevTools informational message appeared; no app errors were logged.

### Implementation Plan

- Keep `budget` as string state and derive all totals from helpers.
- Add calculation tests before UI wiring.
- Surface the same derived total in the goods section and survival plan card.

### Completion Notes

- Added budget parsing, validation, and total helpers.
- Added unit tests for budget sum, blank budget, and negative-budget validation.
- Displayed `예상 예산 합계` in the goods section and `굿즈 예산` in the survival plan card from the same derived total.
- Added inline negative budget feedback with `aria-describedby`.
- BMAD-style review approved the story with no blocking findings.

### File List

- `_bmad-output/implementation-artifacts/2-2-goods-budget-total.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/verification/popup-store-survival-planner-2-2-375.png`
- `src/App.jsx`
- `src/styles.css`
- `src/utils/planCalculations.js`
- `src/utils/planCalculations.test.mjs`

### Change Log

- 2026-05-18: Created ready-for-dev Story 2.2 from Epic 2 backlog.
- 2026-05-18: Started Story 2.2 implementation.
- 2026-05-18: Implemented goods budget totals, validation, card reflection, tests, browser verification, and BMAD review.
