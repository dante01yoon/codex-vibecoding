---
story_id: "2.3"
story_key: 2-3-goods-priority-card
epic: "Epic 2 - 굿즈 예산과 우선순위 정리"
status: done
created: 2026-05-18
source:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
previous_story:
  - _bmad-output/implementation-artifacts/2-2-goods-budget-total.md
---

# Story 2.3: Reflect Goods Priority In The Card

Status: done

## Story

As a popup store visitor,  
I want to assign priority to goods items,  
so that I can quickly decide what to buy first onsite.

## Scope

This story completes Epic 2 by reflecting the existing goods priority choices in the survival plan card. The card should show a compact priority purchase list, sorted so higher-priority valid goods appear first.

Included:

- Survival plan card priority purchase list
- Priority order: high, medium, low
- Empty goods names excluded from the card list
- Maximum 3 goods shown on the card
- Unit tests for priority-list helper behavior

Excluded:

- New goods fields
- Drag-and-drop sorting
- Budget total changes beyond preserving Story 2.2 behavior
- localStorage save/restore
- Payment, price comparison, realtime inventory, external API, SNS sharing, login, server

## Acceptance Criteria

1. High priority goods appear first
   - Given there are multiple goods items
   - When the user sets priorities to high, medium, and low
   - Then the survival plan card displays higher-priority items first

2. Empty goods names are excluded
   - Given there is a goods item with an empty name
   - When the survival plan card renders
   - Then the empty-name item is not displayed in the priority purchase list

3. Card list is capped at 3
   - Given there are 4 or more valid goods items
   - When the survival plan card renders
   - Then the priority purchase goods list displays at most 3 items

4. Empty card state
   - Given there are no valid goods names
   - When the survival plan card renders
   - Then the card shows a small empty-state message instead of a blank list

5. Existing behavior preservation
   - Given the implementation is complete
   - When visit info, wait message, goods add/edit/delete, max-5 limit, budget total, blank budget, and negative budget error are checked
   - Then Story 1, Story 2.1, and Story 2.2 behavior still works

6. Excluded feature protection
   - Given the implementation is complete
   - When buttons and links are checked
   - Then payment, price comparison, realtime inventory, external API, SNS sharing, login, and server UI are absent

## Tasks / Subtasks

- [x] Task 1: Confirm current code and previous story behavior (AC: 5, 6)
  - [x] Read `src/App.jsx`, `src/styles.css`, `src/utils/planCalculations.js`, and `src/utils/planCalculations.test.mjs`.
  - [x] Preserve `goodsItems` shape `{ id, name, priority, budget }`.
  - [x] Preserve Story 2.2 budget total and validation behavior.
  - [x] Do not add router, server, external API client, or new state management libraries.

- [x] Task 2: Add priority purchase helper (AC: 1, 2, 3, 4)
  - [x] Add a helper that filters out goods with blank trimmed names.
  - [x] Add priority sorting with `high` before `medium` before `low`.
  - [x] Preserve original relative order within the same priority.
  - [x] Return at most 3 goods.

- [x] Task 3: Add focused tests for priority card behavior (AC: 1, 2, 3)
  - [x] Add tests for high-priority goods appearing before medium and low.
  - [x] Add tests for blank names being excluded.
  - [x] Add tests for the max-3 card list cap.
  - [x] Run `npm test` and confirm the new tests fail before implementation if possible, then pass after implementation.

- [x] Task 4: Render priority goods in the survival card (AC: 1, 2, 3, 4)
  - [x] Add a `우선 구매 굿즈` area to the survival plan card.
  - [x] Render the helper output as a short list.
  - [x] Include each item's Korean priority label.
  - [x] Show an empty-state message when the helper returns no items.

- [x] Task 5: Verification and documentation (AC: 1-6)
  - [x] Run `npm test`.
  - [x] Run `npm run build`.
  - [x] Browser-check priority order, empty-name exclusion, max-3 card cap, and empty state.
  - [x] Browser-check existing visit info, wait message, goods add/delete, max-5 limit, budget total, negative budget error, mobile no-horizontal-scroll, and excluded UI absence.

## Senior Developer Review (AI)

### Review Outcome

Approve - no blocking findings.

### Review Summary

- Blind Hunter: No new feature scope or dependency drift found. The implementation reuses existing `goodsItems`, `priorityOptions`, and survival-card patterns.
- Edge Case Hunter: The helper trims blank names, keeps same-priority order stable, ranks unknown priority values after known values, and caps the card list at 3.
- Acceptance Auditor: AC 1-6 passed through unit tests, build, and browser checks.

### Action Items

- None.

### Residual Risk

- The priority list is intentionally derived at render time and not saved yet. This is correct for Epic 2; persistence remains Epic 4 scope.

## Dev Notes

### Current Code State

- `App.jsx` owns visit, wait, and goods state.
- `goodsItems` already support editable `name`, `priority`, and `budget`.
- `priorityOptions` already defines `high`, `medium`, and `low` with Korean labels.
- Story 2.2 added `goodsBudgetTotal` and negative budget validation.
- The survival plan card currently shows visit date, time slot, wait minutes, and goods budget total.

### Architecture Guardrails

- Keep derived priority-list logic in `src/utils/planCalculations.js`.
- Do not store the priority purchase list in React state.
- Do not add dependencies or component libraries.
- Keep the implementation beginner-readable.
- localStorage is not part of this story.

### Recommended Helper Shape

```js
const priorityRank = {
  high: 0,
  medium: 1,
  low: 2
}

export function getPriorityGoodsForCard(goodsItems) {
  return goodsItems
    .map((item, index) => ({ ...item, name: item.name.trim(), originalIndex: index }))
    .filter((item) => item.name)
    .sort((left, right) => {
      const priorityDifference =
        priorityRank[left.priority] - priorityRank[right.priority]

      return priorityDifference || left.originalIndex - right.originalIndex
    })
    .slice(0, 3)
}
```

Implementation notes:

- Same-priority goods should keep the user's entered order.
- Unknown priority values can safely rank after `low` if encountered.
- The card can display priority labels using the existing `priorityOptions` values.

### Existing Behavior To Preserve

- Date, time slot, wait time message, and wait error still work.
- Goods add/edit/delete and max-5 limit still work.
- Budget total appears in the goods section and card.
- Blank budget counts as 0.
- Negative budget shows `0 이상의 금액으로 입력해주세요.` under the affected input.
- Mobile 375px width has no horizontal scroll.
- Payment, price comparison, realtime inventory, external API, SNS sharing, login, and server UI remain absent.

### Expected Files To Modify

- `src/App.jsx` - derive and render priority goods in the survival card
- `src/styles.css` - priority list and empty-state styling if needed
- `src/utils/planCalculations.js` - priority list helper
- `src/utils/planCalculations.test.mjs` - priority helper tests
- `_bmad-output/implementation-artifacts/2-3-goods-priority-card.md` - dev-story progress, review, and file list
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

- Add goods with low, high, and medium priorities; card shows high before medium before low.
- Clear an item name; it disappears from the card priority list.
- Add 4 or more valid goods; card shows only 3.
- With no valid goods names, card shows an empty priority message.
- Existing budget total and negative-budget validation still work.
- 375px mobile width has no horizontal scroll.
- Excluded features are not present.

## References

- Epics: `_bmad-output/planning-artifacts/epics.md`
- PRD: `_bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- UX Spec: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Previous Story: `_bmad-output/implementation-artifacts/2-2-goods-budget-total.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Story created from the first remaining backlog Epic 2 item in `sprint-status.yaml`.
- 2026-05-18: Story status moved to in-progress for dev-story execution.
- RED check: `npm test` failed because `getPriorityGoodsForCard` was not exported yet.
- Unit/regression check: `npm test` passed after the priority helper was implemented.
- Production build check: `npm run build` passed.
- Browser check: Playwright at `http://127.0.0.1:5174/` verified initial empty card state, priority order `키링, 앨범, 티셔츠`, blank-name exclusion, max-3 card cap, budget total preservation, negative budget error preservation, max-5 goods limit, excluded UI absence, and 375px no-horizontal-scroll.
- Browser console check: only the React DevTools informational message appeared; no app errors were logged.

### Implementation Plan

- Add tests for card priority ordering before implementing the helper.
- Derive card goods with a helper instead of new React state.
- Render the compact priority list inside the existing survival card.

### Completion Notes

- Added `getPriorityGoodsForCard` to derive the priority purchase list.
- Added unit tests for priority order, blank-name exclusion, and max-3 card cap.
- Rendered `우선 구매 굿즈` in the survival card with Korean priority labels and an empty state.
- BMAD-style review approved the story with no blocking findings.

### File List

- `_bmad-output/implementation-artifacts/2-3-goods-priority-card.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/verification/popup-store-survival-planner-2-3-375.png`
- `src/App.jsx`
- `src/styles.css`
- `src/utils/planCalculations.js`
- `src/utils/planCalculations.test.mjs`

### Change Log

- 2026-05-18: Created ready-for-dev Story 2.3 from Epic 2 backlog.
- 2026-05-18: Started Story 2.3 implementation.
- 2026-05-18: Implemented priority-card list, tests, browser verification, and BMAD review.
