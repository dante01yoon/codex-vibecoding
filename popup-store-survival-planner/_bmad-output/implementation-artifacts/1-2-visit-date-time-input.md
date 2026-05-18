---
story_id: "1.2"
story_key: 1-2-visit-date-time-input
epic: "Epic 1 - 기본 방문 플랜 생성"
status: done
created: 2026-05-18
source:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Story 1.2: 기본 방문 플랜 카드 생성

Status: done

## Story

As a 팝업스토어 방문자,  
I want 방문 날짜, 시간대, 예상 대기 시간을 입력하면 기본 방문 플랜 카드가 바로 만들어지기를,  
so that 방문 전에 언제 가고 얼마나 기다릴지 한눈에 확인할 수 있다.

## Scope

이번 story는 첫 기능 구현용 vertical slice다. 방문 정보 3개만 입력하고, 같은 화면의 `오늘의 생존 플랜` 카드에 즉시 반영한다.

포함:

- React + Vite 단일 페이지 앱 실행 상태 만들기
- 방문 날짜 입력
- 시간대 선택: 오전, 오후, 저녁
- 예상 대기 시간 입력
- 기본 방문 플랜 카드 생성
- 대기 시간에 따른 짧은 안내 메시지 표시
- 모바일 375px에서 깨지지 않는 기본 레이아웃

제외:

- 굿즈 항목 추가/삭제
- 굿즈 예산 합계
- 체크리스트 체크/해제
- localStorage 필수 저장
- 로그인, 서버, 외부 API, 지도, 결제, 실시간 재고, SNS 공유

선택 사항:

- 시간이 남으면 `visitDate`, `timeSlot`, `waitMinutes`만 localStorage에 저장해도 된다. 단, 이 story의 완료 조건은 아니다.

## Acceptance Criteria

1. 앱 실행
   - Given 프로젝트를 로컬에서 연다
   - When `npm install` 후 `npm run dev`를 실행한다
   - Then 브라우저에서 React + Vite 단일 페이지 앱이 열린다
   - And 라우터, 서버, 외부 API, 새 상태 관리 라이브러리는 추가되지 않는다

2. 방문 날짜 입력
   - Given 방문 정보 영역이 보인다
   - When 사용자가 날짜 입력에서 날짜를 선택한다
   - Then 생존 플랜 카드에 같은 날짜가 즉시 표시된다
   - And 날짜가 비어 있으면 `날짜 미정`이 표시된다

3. 시간대 선택
   - Given 시간대 선택 UI가 보인다
   - When 사용자가 오전, 오후, 저녁 중 하나를 선택한다
   - Then 생존 플랜 카드에 선택한 시간대가 즉시 표시된다
   - And 시간대가 비어 있으면 `시간대 미정`이 표시된다

4. 예상 대기 시간 입력과 메시지
   - Given 예상 대기 시간 입력 칸이 보인다
   - When 사용자가 `30`을 입력한다
   - Then 생존 플랜 카드에 `가볍게 다녀오기 좋은 플랜이에요.`가 표시된다
   - When 사용자가 `90`을 입력한다
   - Then `대기가 조금 길 수 있어요. 물과 배터리를 챙겨요.`가 표시된다
   - When 사용자가 `150`을 입력한다
   - Then `긴 대기 예상! 보조 배터리와 물은 꼭 챙겨요.`가 표시된다

5. 대기 시간 오류 처리
   - Given 예상 대기 시간 입력 칸이 보인다
   - When 사용자가 `-1`을 입력한다
   - Then 입력 영역 근처에 `0 이상의 숫자로 입력해주세요.`가 표시된다
   - And 앱은 멈추지 않고 생존 플랜 카드 레이아웃도 깨지지 않는다

6. 제외 기능 보호
   - Given 앱 첫 화면을 확인한다
   - When 사용자가 버튼과 링크를 살펴본다
   - Then 로그인, 결제, 지도, 실시간 재고, SNS 공유, 서버 저장을 암시하는 UI가 없다

7. 모바일 확인
   - Given 브라우저 폭을 375px로 줄인다
   - When 앱 화면을 확인한다
   - Then 방문 정보 영역과 생존 플랜 카드가 세로로 쌓이고 가로 스크롤이 생기지 않는다

## Tasks / Subtasks

- [x] Task 1: 앱 scaffold 또는 기존 앱 상태 확인 (AC: 1)
  - [x] `package.json`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`가 없으면 최소 React + Vite 구조를 만든다.
  - [x] 이미 파일이 있으면 기존 구조를 재사용하고 불필요한 재생성은 하지 않는다.
  - [x] `npm run dev`로 실행 가능한 scripts를 둔다.

- [x] Task 2: 방문 정보 상태 만들기 (AC: 2, 3, 4, 5)
  - [x] `App.jsx`에서 `visitDate`, `timeSlot`, `waitMinutes`를 `useState`로 관리한다.
  - [x] 날짜 input은 `type="date"`를 사용한다.
  - [x] 시간대는 오전, 오후, 저녁을 선택할 수 있게 만든다.
  - [x] 대기 시간 input은 분 단위 숫자로 받는다.

- [x] Task 3: 기본 생존 플랜 카드 만들기 (AC: 2, 3, 4)
  - [x] 날짜가 비어 있으면 `날짜 미정`을 표시한다.
  - [x] 시간대가 비어 있으면 `시간대 미정`을 표시한다.
  - [x] 대기 시간이 비어 있으면 카드가 깨지지 않게 기본 문구를 보여준다.
  - [x] 대기 시간이 0-59분, 60-119분, 120분 이상일 때 메시지를 다르게 보여준다.

- [x] Task 4: 입력 오류와 기본 접근성 처리 (AC: 5)
  - [x] 대기 시간이 음수이면 `0 이상의 숫자로 입력해주세요.`를 표시한다.
  - [x] 모든 입력에 보이는 label을 연결한다.
  - [x] placeholder가 label을 대신하지 않게 한다.

- [x] Task 5: 모바일 기본 CSS 작성 (AC: 7)
  - [x] 기본은 모바일 1열 레이아웃으로 작성한다.
  - [x] 375px 폭에서 텍스트와 입력 요소가 넘치지 않게 한다.
  - [x] 1024px 이상에서는 입력 영역과 결과 카드가 넓은 화면에 맞게 배치되어도 된다.

- [x] Task 6: 브라우저 검증 (AC: 1-7)
  - [x] `npm run dev`로 앱을 연다.
  - [x] 날짜, 시간대, 대기 시간 `30`, `90`, `150`, `-1`을 직접 입력해 확인한다.
  - [x] 375px 모바일 폭을 확인한다.
  - [x] Console에 초기 렌더링 오류가 없는지 확인한다.

## Dev Notes

### Architecture Guardrails

- 앱 형태는 React + Vite 단일 페이지 앱이다.
- 라우팅은 사용하지 않는다.
- 서버, 로그인, 외부 API, 지도 API, 결제, 실시간 재고, SNS 공유를 구현하지 않는다.
- 새 상태 관리 라이브러리를 추가하지 않는다. `useState`만으로 충분하다.
- 이번 story에서는 `useEffect`와 localStorage가 필수가 아니다. 저장은 후속 story에서 본격 구현한다.
- 생존 플랜 카드의 표시값은 입력 상태에서 계산한다. 계산 결과를 별도 상태로 중복 저장하지 않는다.

### Recommended State Shape

이번 story는 굿즈와 체크리스트를 다루지 않으므로 작은 상태로 시작한다.

```js
const [visitDate, setVisitDate] = useState('')
const [timeSlot, setTimeSlot] = useState('')
const [waitMinutes, setWaitMinutes] = useState('')
```

후속 story에서 Architecture의 `plan` 객체로 합쳐도 된다.

```js
const plan = {
  visitDate: '',
  timeSlot: '',
  waitMinutes: '',
  goodsItems: [],
  checklistItems: []
}
```

### Display Rules

```js
const timeSlotLabels = {
  morning: '오전',
  afternoon: '오후',
  evening: '저녁'
}
```

- `visitDate || '날짜 미정'`
- `timeSlotLabels[timeSlot] || '시간대 미정'`
- `waitMinutes === ''`이면 대기 시간 표시는 `대기 시간 미정`처럼 안전한 빈 상태를 사용한다.
- `Number(waitMinutes) < 0`이면 오류를 표시한다.

대기 메시지:

```js
function getWaitMessage(waitMinutes) {
  const minutes = Number(waitMinutes || 0)

  if (minutes >= 120) {
    return '긴 대기 예상! 보조 배터리와 물은 꼭 챙겨요.'
  }

  if (minutes >= 60) {
    return '대기가 조금 길 수 있어요. 물과 배터리를 챙겨요.'
  }

  return '가볍게 다녀오기 좋은 플랜이에요.'
}
```

### Expected Files To Create Or Modify

현재 프로젝트에는 앱 소스가 아직 없을 수 있다. 구현자는 먼저 실제 파일 존재 여부를 확인한다.

예상 파일:

- `package.json` - Vite scripts와 React dependency
- `index.html` - Vite entry HTML
- `vite.config.js` - Vite 기본 설정
- `src/main.jsx` - React entry
- `src/App.jsx` - 이번 story의 상태, 입력, 카드 UI
- `src/styles.css` - 모바일 우선 기본 스타일

선택 파일:

- `src/utils/planCalculations.js` - 대기 메시지와 표시값 계산을 분리하고 싶을 때만 사용

이번 story에서 만들지 않을 파일:

- `src/utils/storage.js` - localStorage는 후속 story에서 본격 구현
- API client 파일
- router 파일
- auth 관련 파일

### UX Requirements

- 방문 정보 영역과 생존 플랜 카드가 같은 화면 흐름 안에 있어야 한다.
- 결과 카드는 입력 전에도 보여야 한다.
- 시간대는 텍스트 직접 입력보다 오전/오후/저녁 선택을 우선한다.
- 모든 입력에는 label이 있어야 한다.
- 모바일 375px에서 가로 스크롤이 없어야 한다.
- 랜딩 페이지처럼 과한 hero를 만들지 말고, 바로 사용할 수 있는 도구 화면으로 만든다.

### Previous Story Intelligence

- 이전에 작성된 `1-1-react-vite-app-shell.md`는 정적 앱 shell story다.
- 현재 작업공간에는 아직 `src/`나 `package.json`이 확인되지 않았다.
- 따라서 구현자는 1.1이 아직 실제 코드로 구현되지 않았다고 가정하고, 필요한 최소 scaffold를 포함해도 된다.
- 이미 누군가 1.1을 구현한 상태라면 해당 파일을 재사용하고, 정적 영역을 이번 story의 controlled input과 카드로 확장한다.

### Latest Technical Notes

- Vite 공식 문서 기준으로 현재 디렉터리에 React scaffold를 만들 때는 `npm create vite@latest . -- --template react` 흐름을 사용할 수 있다.
- Vite scaffold의 기본 scripts는 `dev`, `build`, `preview`다.
- React 공식 문서 기준 controlled input은 state 값을 `value`에 연결하고 `onChange`에서 setter를 호출해 UI가 매 입력마다 다시 렌더링되게 한다.

## Testing / Verification

자동 테스트는 이번 story의 필수 범위가 아니다. 대신 브라우저에서 직접 확인한다.

```bash
npm install
npm run dev
```

브라우저 확인:

- 날짜 선택 후 카드 날짜가 즉시 바뀐다.
- 오전, 오후, 저녁 선택 후 카드 시간대가 즉시 바뀐다.
- 대기 시간 `30`, `90`, `150`을 입력하면 메시지가 각각 바뀐다.
- 대기 시간 `-1`을 입력하면 오류 문구가 보인다.
- 입력값이 비어 있어도 카드가 깨지지 않는다.
- 375px 폭에서 가로 스크롤이 없다.
- Console에 빨간 렌더링 오류가 없다.

빌드 확인:

```bash
npm run build
```

`npm run build`가 아직 scripts에 없다면 Vite 기본 scripts를 먼저 맞춘다.

## References

- PRD: `_bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- UX Spec: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Epics: `_bmad-output/planning-artifacts/epics.md`
- Previous story: `_bmad-output/implementation-artifacts/1-1-react-vite-app-shell.md`
- Vite docs via Context7: `/vitejs/vite`
- React docs via Context7: `/reactjs/react.dev`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test` initially failed because `src/utils/planCalculations.js` did not exist yet. This confirmed the calculation test was red before implementation.
- `npm test` passed after `planCalculations.js` was added.
- `npm run build` passed with Vite 8.0.13.
- Playwright opened `http://127.0.0.1:5174/` and verified date, time slot, wait time messages, negative wait time error, mobile 375px no-overflow, and zero console errors.
- A missing favicon produced a 404 console error on the first browser pass; `index.html` now uses an inline SVG favicon.

### Completion Notes List

- Created a minimal React + Vite single page app for the first functional vertical slice.
- Implemented controlled inputs for visit date, time slot, and expected wait minutes.
- Implemented a basic survival plan card that updates immediately from state.
- Added wait-time display rules for 30, 90, and 150 minute examples.
- Added validation UI for negative wait minutes using the required message.
- Kept localStorage, goods, checklist, login, server, external API, map, payment, real-time inventory, and SNS sharing out of this story.
- Added a small Node `assert` test for display and wait-message calculation logic without adding a test framework dependency.
- Added `.gitignore` for `node_modules/`, `dist/`, and `.DS_Store`.

### File List

- `.gitignore`
- `index.html`
- `package-lock.json`
- `package.json`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `src/styles.css`
- `src/utils/planCalculations.js`
- `src/utils/planCalculations.test.mjs`
- `_bmad-output/implementation-artifacts/1-2-visit-date-time-input.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/verification/popup-store-survival-planner-375.png`

### Change Log

- 2026-05-18: Implemented Story 1.2 basic visit plan card and moved story status to review.
