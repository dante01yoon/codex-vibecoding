---
story_id: "2.1"
story_key: 2-1-goods-item-list
epic: "Epic 2 - 굿즈 예산과 우선순위 정리"
status: done
created: 2026-05-18
source:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
previous_story:
  - _bmad-output/implementation-artifacts/1-2-visit-date-time-input.md
---

# Story 2.1: 굿즈 항목 추가와 삭제하기

Status: done

## Story

As a 팝업스토어 방문자,  
I want 사고 싶은 굿즈 항목을 추가하고 삭제하기를,  
so that 구매 계획을 작은 목록으로 정리할 수 있다.

## Scope

이번 story는 Epic 2의 첫 vertical slice다. 사용자는 사고 싶은 굿즈를 최대 5개까지 추가하고, 각 굿즈 행에서 이름, 우선순위, 예상 금액 입력을 볼 수 있다. 삭제 버튼으로 항목을 제거할 수 있다.

포함:

- 굿즈 예산 영역 추가
- 굿즈 이름 입력 후 항목 추가
- 추가된 항목 리스트 표시
- 각 항목의 이름, 우선순위, 예상 금액 입력 표시
- 각 항목 삭제
- 최대 5개 제한과 안내 문구 표시

제외:

- 예산 합계 계산
- 예산 음수 오류 문구
- 우선순위 정렬
- 생존 플랜 카드의 우선 구매 굿즈 반영
- localStorage 저장/복원
- 로그인, 서버, 외부 API, 지도, 결제, 실시간 재고, SNS 공유

## Acceptance Criteria

1. 굿즈 예산 영역 표시
   - Given 사용자가 앱을 연다
   - When 첫 화면을 확인한다
   - Then 방문 정보 영역 아래 또는 같은 입력 흐름 안에 `굿즈 우선순위와 예산` 영역이 보인다
   - And 기존 방문 정보 입력과 생존 플랜 카드는 계속 동작한다

2. 굿즈 항목 추가
   - Given 굿즈 예산 영역이 표시된다
   - When 사용자가 굿즈 이름을 입력하고 추가 버튼을 누른다
   - Then 굿즈 항목이 리스트에 표시된다
   - And 새 항목에는 이름 입력, 우선순위 선택, 예상 금액 입력, 삭제 버튼이 포함된다

3. 굿즈 항목 수정
   - Given 굿즈 리스트에 항목이 있다
   - When 사용자가 항목의 이름, 우선순위, 예상 금액을 변경한다
   - Then 같은 항목 행에 변경값이 유지되어 보인다
   - And 이 변경은 새로고침 후 복원될 필요는 없다

4. 굿즈 항목 삭제
   - Given 굿즈 리스트에 항목이 있다
   - When 사용자가 해당 항목의 삭제 버튼을 누른다
   - Then 해당 항목이 리스트에서 제거된다
   - And 다른 항목의 값은 유지된다

5. 최대 5개 제한
   - Given 굿즈 항목이 5개 있다
   - When 사용자가 새 항목을 추가하려고 한다
   - Then 새 항목은 추가되지 않는다
   - And `굿즈는 최대 5개까지만 추가할 수 있어요.` 안내가 표시된다

6. 제외 기능 보호
   - Given 구현 후 화면을 확인한다
   - When 버튼과 링크를 살펴본다
   - Then 결제, 가격 비교, 실시간 재고, 외부 API, SNS 공유 UI가 없다

7. 모바일 확인
   - Given 브라우저 폭을 375px로 줄인다
   - When 굿즈 항목을 1개 이상 추가한다
   - Then 굿즈 입력 영역과 항목 행이 가로 스크롤 없이 세로로 읽힌다

## Tasks / Subtasks

- [x] Task 1: 기존 구현 상태 확인 (AC: 1)
  - [x] `src/App.jsx`, `src/styles.css`, `src/utils/planCalculations.js`, `src/utils/planCalculations.test.mjs`를 읽고 현재 패턴을 유지한다.
  - [x] 기존 방문 날짜, 시간대, 대기 시간 입력 동작을 깨지 않는다.
  - [x] 새 라우터, API client, 상태 관리 라이브러리를 추가하지 않는다.

- [x] Task 2: 굿즈 상태와 기본 데이터 shape 추가 (AC: 2, 3, 4, 5)
  - [x] `App.jsx`에 `goodsItems` state를 추가한다.
  - [x] 새 굿즈 항목은 `{ id, name, priority, budget }` shape를 따른다.
  - [x] 기본 `priority`는 `medium`으로 둔다.
  - [x] `id`는 React key로 안정적으로 사용할 수 있게 생성한다. 배열 index를 key로 쓰지 않는다.

- [x] Task 3: 굿즈 추가 UI 구현 (AC: 2, 5)
  - [x] 굿즈 이름 입력과 추가 버튼을 만든다.
  - [x] 빈 이름은 추가하지 않는다.
  - [x] 추가 성공 후 굿즈 이름 입력을 비운다.
  - [x] 항목이 5개일 때 추가를 막고 제한 안내 문구를 표시한다.

- [x] Task 4: 굿즈 리스트 편집 UI 구현 (AC: 2, 3, 4)
  - [x] `goodsItems.map(...)`으로 리스트를 렌더링한다.
  - [x] 각 항목에 label이 연결된 이름 input을 둔다.
  - [x] 각 항목에 `high`, `medium`, `low` 우선순위 select를 둔다.
  - [x] 각 항목에 예상 금액 number input을 둔다.
  - [x] 각 항목에 삭제 버튼을 둔다.
  - [x] 항목 수정은 `map`으로, 삭제는 `filter`로 불변 업데이트한다.

- [x] Task 5: 스타일과 모바일 레이아웃 정리 (AC: 1, 7)
  - [x] 기존 `.section-panel`, `.form-field`, `.planner-layout` 스타일과 어울리게 작성한다.
  - [x] 모바일 375px에서 굿즈 행이 가로로 넘치지 않게 한다.
  - [x] 버튼과 입력은 최소 44px 이상 터치 가능한 크기를 유지한다.

- [x] Task 6: 테스트와 브라우저 검증 (AC: 1-7)
  - [x] 굿즈 최대 개수 또는 helper 계산 로직을 `src/utils/planCalculations.test.mjs`에 추가한다.
  - [x] `npm test`를 통과시킨다.
  - [x] `npm run build`를 통과시킨다.
  - [x] 브라우저에서 항목 1개 추가, 수정, 삭제, 5개 제한, 375px 모바일 폭을 확인한다.

### Review Findings

- [x] [Review][Decision] Decide whether edited goods names may be blank — resolved: keep current behavior. The add flow blocks blank names, but an existing item name can be edited to an empty value. This is acceptable for this story because AC 3 focuses on preserving edited values, and stricter validation can be handled in a later validation story if needed. Evidence: `src/App.jsx:38-41`, `src/App.jsx:177-183`.
- [x] [Review][Patch] Enforce the 5-item cap inside the state update as well as before it [`src/App.jsx:44`] — resolved: `handleAddGoodsItem` now rechecks `canAddGoodsItem(currentGoodsItems)` inside the functional updater before appending. Browser double-click did not reproduce an overflow in the current UI, but the state transition now owns the max-5 invariant.

## Dev Notes

### Current Code State

- 현재 앱은 React + Vite 단일 페이지 앱이다.
- `src/App.jsx`가 전체 UI와 상태를 직접 소유한다.
- 현재 state는 `visitDate`, `timeSlot`, `waitMinutes` 3개다.
- `src/utils/planCalculations.js`에는 시간대 옵션과 대기 시간 표시/검증 함수가 있다.
- `src/utils/planCalculations.test.mjs`는 Node `assert` 기반 테스트다. 새 test framework를 추가하지 않는다.
- Story 1.2는 `done` 상태이며 `npm test`, `npm run build`, Playwright 검증을 통과했다.

### Architecture Guardrails

- `App.jsx` 중심의 작은 구조를 유지한다. 이번 story에서 컴포넌트 분리는 필수가 아니다.
- 필요하면 `src/utils/planCalculations.js`에 `MAX_GOODS_ITEMS`, `priorityOptions`, `canAddGoodsItem` 같은 작은 helper를 추가한다.
- `Context`, `Redux`, `Zustand`, `React Query`를 추가하지 않는다.
- 라우터, 서버, 외부 API를 추가하지 않는다.
- localStorage는 이번 story 범위가 아니다.
- 예산 합계와 카드 반영은 후속 Story 2.2, 2.3에서 구현한다.

### Recommended Data Shape

```js
const [goodsItems, setGoodsItems] = useState([])
const [newGoodsName, setNewGoodsName] = useState('')
const [goodsNotice, setGoodsNotice] = useState('')
```

```js
const goodsItem = {
  id: 'goods-1',
  name: '키링',
  priority: 'medium',
  budget: ''
}
```

Priority options:

```js
const priorityOptions = [
  { value: 'high', label: '높음' },
  { value: 'medium', label: '보통' },
  { value: 'low', label: '낮음' }
]
```

Implementation notes:

- `id`는 `crypto.randomUUID()`를 사용할 수 있다. 더 입문자 친화적으로 가려면 `Date.now()` 기반 문자열도 가능하다.
- 배열 index를 React key로 사용하지 않는다.
- 굿즈 이름 입력은 trim해서 빈 문자열이면 추가하지 않는다.
- 삭제 후 5개 제한 안내 문구는 사라져도 된다.
- budget은 이번 story에서 문자열로 보관해도 된다. 숫자 합계는 Story 2.2에서 처리한다.

### Existing Behavior To Preserve

- 날짜를 선택하면 생존 플랜 카드의 날짜가 즉시 바뀐다.
- 시간대를 선택하면 생존 플랜 카드의 시간대가 즉시 바뀐다.
- 대기 시간 `30`, `90`, `150`, `-1` 동작이 유지된다.
- 모바일 375px에서 전체 페이지에 가로 스크롤이 없어야 한다.
- Console error가 없어야 한다.

### Expected Files To Modify

- `src/App.jsx` - goods state, handlers, goods UI 추가
- `src/styles.css` - goods 영역과 리스트/행 스타일 추가
- `src/utils/planCalculations.js` - goods limit/priority helper 추가 가능
- `src/utils/planCalculations.test.mjs` - goods helper 테스트 추가 가능
- `_bmad-output/implementation-artifacts/2-1-goods-item-list.md` - dev-story 진행 중 체크박스와 Dev Agent Record 업데이트
- `_bmad-output/implementation-artifacts/sprint-status.yaml` - dev-story/code-review 단계에서 상태 업데이트

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

- 기존 방문 정보 입력이 계속 동작한다.
- 굿즈 이름 `키링`을 입력하고 추가하면 리스트에 보인다.
- 추가된 항목에 이름, 우선순위, 예상 금액 입력과 삭제 버튼이 있다.
- 항목의 이름, 우선순위, 예상 금액을 바꾸면 같은 행에 값이 유지된다.
- 삭제 버튼을 누르면 해당 항목만 사라진다.
- 5개 추가 후 6번째 추가가 막히고 `굿즈는 최대 5개까지만 추가할 수 있어요.`가 보인다.
- 375px 모바일 폭에서 가로 스크롤이 없다.
- 결제, 가격 비교, 실시간 재고, SNS 공유 UI가 없다.

### Latest Technical Notes

- React 공식 문서 기준 리스트 렌더링은 `array.map(...)`과 안정적인 `key`를 사용한다.
- React 공식 문서 기준 배열 state 수정은 기존 배열/객체를 직접 mutate하지 않고, `map`, `filter`, spread syntax로 새 배열/객체를 만든다.

## References

- Epics: `_bmad-output/planning-artifacts/epics.md`
- PRD: `_bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- UX Spec: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Previous Story: `_bmad-output/implementation-artifacts/1-2-visit-date-time-input.md`
- React docs via Context7: `/reactjs/react.dev`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- RED check: `npm test` failed because `MAX_GOODS_ITEMS` was not exported yet.
- Unit/regression check: `npm test` passed after goods helpers were implemented.
- Production build check: `npm run build` passed.
- Browser check: Playwright at `http://127.0.0.1:5174/` verified visit-card behavior, goods add/edit/delete, 5-item limit notice, excluded UI absence, 375px no-horizontal-scroll, and no console errors since latest navigation.

### Implementation Plan

- Keep Story 2.1 inside the existing single-page `App.jsx` flow.
- Add small helper constants/functions for goods limit, priority options, and new item shape.
- Use local React state only, with immutable `map` and `filter` updates.
- Keep localStorage, budget totals, sorting, and card goods reflection out of this story.

### Completion Notes List

- Added the `굿즈 우선순위와 예산` area below visit information.
- Added goods item creation, inline editing, deletion, and 5-item limit notice.
- Preserved existing visit date, time slot, wait time, and survival-card behavior.
- Added helper coverage for goods limit, priority options, and default goods item shape.

### File List

- `src/App.jsx`
- `src/styles.css`
- `src/utils/planCalculations.js`
- `src/utils/planCalculations.test.mjs`
- `_bmad-output/implementation-artifacts/2-1-goods-item-list.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-18: Implemented Story 2.1 goods add/edit/delete flow and moved story status to review.
- 2026-05-18: Resolved code review patch for defensive max-5 goods cap enforcement.
