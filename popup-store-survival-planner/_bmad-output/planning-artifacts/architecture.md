---
project: Pop-up Store Survival Planner
status: final
created: 2026-05-18
updated: 2026-05-18
workflowType: architecture
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - bmad-create-architecture-prompt.md
---

# Architecture: Pop-up Store Survival Planner

## 1. 문서 목적

이 문서는 **Pop-up Store Survival Planner**를 React + Vite 단일 페이지 앱으로 구현하기 위한 기술 구조를 정한다. 목표는 입문자 강의에서 바로 따라 만들 수 있는 작고 명확한 구조를 제공하는 것이다.

이 문서는 과한 추상화를 피한다. 서버, 로그인, 외부 API, 결제, 지도, 실시간 재고, 새 상태 관리 라이브러리는 사용하지 않는다.

## 2. 기술 결정 요약

| 항목 | 결정 |
| --- | --- |
| 앱 형태 | React + Vite 단일 페이지 앱 |
| 라우팅 | 사용하지 않음 |
| 서버 | 없음 |
| 로그인 | 없음 |
| 외부 API | 없음 |
| 상태 관리 | React `useState`, `useEffect` |
| 저장 방식 | 브라우저 `localStorage` |
| 데이터 출처 | 기본 mock data + 사용자 입력 |
| 스타일 | 일반 CSS, `src/styles.css` 중심 |
| 첫 구현 범위 | 최근 플랜 1개 저장 |

## 3. 첫 구현 범위

첫 구현 버전은 UX spec의 4개 흐름만 구현한다.

1. 방문 정보 입력.
2. 굿즈 우선순위와 예산 입력.
3. 기본 현장 체크리스트 체크/해제.
4. 생존 플랜 카드 생성과 최근 플랜 1개 localStorage 저장.

선택 과제로 미룰 것:

- 방문 후 메모.
- 체크리스트 항목 직접 추가/삭제.
- 카드 이미지 저장.
- SNS 공유.
- 여러 플랜 목록 관리.

## 4. 권장 파일 구조

```text
popup-store-survival-planner/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
    styles.css
    components/
      AppHeader.jsx
      VisitInfoForm.jsx
      GoodsBudgetList.jsx
      ChecklistSection.jsx
      SurvivalPlanCard.jsx
      RecentPlanStorage.jsx
    data/
      defaultChecklist.js
      defaultPlan.js
    utils/
      planCalculations.js
      storage.js
      validation.js
```

### 4.1 구조 원칙

- `App.jsx`는 전체 상태를 소유한다.
- `components/`는 화면 조각을 담당한다.
- `data/`는 기본값과 mock data를 보관한다.
- `utils/`는 화면과 분리 가능한 계산, 저장, 검증 함수를 보관한다.
- `Context`, `Redux`, `Zustand`, `React Query`는 사용하지 않는다.

입문자 강의에서는 처음에 `App.jsx` 하나로 시작한 뒤, 화면이 길어지면 위 구조로 컴포넌트를 분리해도 된다.

## 5. 주요 컴포넌트

### 5.1 `App`

역할:

- `plan` 상태를 가진다.
- 입력 변경 함수를 만든다.
- localStorage 저장과 복원을 연결한다.
- 생존 플랜 요약값을 계산해 `SurvivalPlanCard`에 전달한다.

주요 상태:

- `plan`
- `saveStatus`
- `lastSavedAt`

### 5.2 `AppHeader`

역할:

- 앱 제목과 짧은 설명을 보여준다.
- 저장 상태를 작은 문구로 보여준다.

props:

- `saveStatus`
- `lastSavedAt`

### 5.3 `VisitInfoForm`

역할:

- 방문 날짜, 시간대, 예상 대기 시간을 입력한다.

props:

- `visitDate`
- `timeSlot`
- `waitMinutes`
- `errors`
- `onChangeVisitInfo`

구현 메모:

- 날짜는 `input type="date"`를 사용한다.
- 시간대는 `morning`, `afternoon`, `evening` 중 하나를 선택한다.
- 대기 시간은 숫자 입력으로 받고, 음수는 오류로 처리한다.

### 5.4 `GoodsBudgetList`

역할:

- 굿즈 항목을 추가, 수정, 삭제한다.
- 예산 합계를 보여준다.

props:

- `items`
- `budgetTotal`
- `errors`
- `onAddItem`
- `onUpdateItem`
- `onDeleteItem`

구현 메모:

- 굿즈는 최대 5개까지만 허용한다.
- 이름이 비어 있는 항목은 생존 플랜 카드의 우선 구매 목록에서 제외한다.
- 금액은 0 이상의 숫자로 처리한다.

### 5.5 `ChecklistSection`

역할:

- 기본 체크리스트를 보여준다.
- 체크 상태를 바꾼다.

props:

- `items`
- `checkedCount`
- `totalCount`
- `onToggleItem`

첫 구현에서는 항목 추가/삭제를 넣지 않는다. 기본 항목 체크/해제만 구현한다.

### 5.6 `SurvivalPlanCard`

역할:

- 현재 입력값에서 계산된 생존 플랜을 카드로 보여준다.

props:

- `summary`

표시 항목:

- 방문 날짜.
- 시간대.
- 예상 대기 시간.
- 대기 시간 메시지.
- 예산 합계.
- 우선 구매 굿즈 1-3개.
- 체크리스트 진행 상태.
- 준비 완료 메시지.

### 5.7 `RecentPlanStorage`

역할:

- 최근 플랜 저장 상태를 보여준다.
- 초기화 버튼을 제공한다.

props:

- `lastSavedAt`
- `onResetPlan`

구현 메모:

- 여러 플랜 목록은 만들지 않는다.
- 초기화 전 `window.confirm`으로 확인한다.

## 6. 데이터 모델

TypeScript를 쓰지 않는 JavaScript 실습을 기준으로 한다. 아래 형태를 기준으로 객체를 만든다.

### 6.1 `Plan`

```js
const plan = {
  visitDate: '',
  timeSlot: '',
  waitMinutes: '',
  goodsItems: [],
  checklistItems: []
}
```

### 6.2 `GoodsItem`

```js
const goodsItem = {
  id: 'goods-1',
  name: '키링',
  priority: 'high',
  budget: 12000
}
```

허용 값:

- `priority`: `high`, `medium`, `low`
- `budget`: 0 이상의 숫자

### 6.3 `ChecklistItem`

```js
const checklistItem = {
  id: 'battery',
  label: '보조 배터리',
  checked: false
}
```

### 6.4 `SurvivalPlanSummary`

저장하지 않고 화면 렌더링 때 계산한다.

```js
const summary = {
  displayDate: '2026-05-18',
  displayTimeSlot: '오후',
  waitMessage: '긴 대기 예상! 보조 배터리와 물은 꼭 챙겨요.',
  budgetTotal: 42000,
  topGoodsItems: [],
  checkedCount: 3,
  totalChecklistCount: 5,
  isChecklistComplete: false
}
```

## 7. Mock Data

### 7.1 기본 체크리스트

파일: `src/data/defaultChecklist.js`

```js
export const defaultChecklist = [
  { id: 'battery', label: '보조 배터리', checked: false },
  { id: 'water', label: '물', checked: false },
  { id: 'entry-info', label: '입장 정보 확인', checked: false },
  { id: 'payment-ready', label: '카드/현금 준비 확인', checked: false },
  { id: 'bag', label: '굿즈 보관 가방', checked: false }
]
```

`카드/현금 준비 확인`은 실제 결제 기능이 아니다. 현장에서 가져갈 준비물을 확인하는 체크리스트 문구다.

### 7.2 기본 플랜

파일: `src/data/defaultPlan.js`

```js
import { defaultChecklist } from './defaultChecklist'

export const defaultPlan = {
  visitDate: '',
  timeSlot: '',
  waitMinutes: '',
  goodsItems: [],
  checklistItems: defaultChecklist
}
```

주의: 구현할 때는 `defaultChecklist`를 직접 변경하지 않도록 복사해서 사용한다.

## 8. localStorage 저장 방식

### 8.1 저장 키

```js
const STORAGE_KEY = 'popupStoreSurvivalPlanner.plan.v1'
```

### 8.2 저장 대상

localStorage에는 사용자가 입력한 원본 플랜만 저장한다.

저장하는 것:

- 방문 날짜.
- 시간대.
- 예상 대기 시간.
- 굿즈 항목.
- 체크리스트 체크 상태.
- 마지막 저장 시간.

저장하지 않는 것:

- 생존 플랜 카드의 계산 결과.
- 오류 메시지.
- 일시적인 UI 상태.

### 8.3 저장 형태

```js
const savedPayload = {
  version: 1,
  savedAt: '2026-05-18T01:00:00.000Z',
  plan
}
```

### 8.4 저장 함수

파일: `src/utils/storage.js`

```js
export function savePlan(plan) {
  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    plan
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return payload.savedAt
}
```

### 8.5 복원 함수

```js
export function loadPlan() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  const parsed = JSON.parse(raw)
  if (parsed.version !== 1) return null

  return parsed
}
```

### 8.6 삭제 함수

```js
export function clearPlan() {
  localStorage.removeItem(STORAGE_KEY)
}
```

### 8.7 오류 처리

localStorage는 브라우저 설정이나 private mode에서 실패할 수 있다.

처리 방식:

- 저장 실패 시 앱은 멈추지 않는다.
- `saveStatus`를 `error`로 바꾼다.
- 화면에는 `이 브라우저에서는 저장을 사용할 수 없어요.`를 보여준다.

## 9. 생존 플랜 생성 로직

파일: `src/utils/planCalculations.js`

### 9.1 계산 함수

```js
export function createSurvivalPlanSummary(plan) {
  const validGoodsItems = plan.goodsItems.filter((item) => item.name.trim())
  const budgetTotal = validGoodsItems.reduce((sum, item) => {
    return sum + Number(item.budget || 0)
  }, 0)

  const topGoodsItems = [...validGoodsItems]
    .sort(compareGoodsPriority)
    .slice(0, 3)

  const checkedCount = plan.checklistItems.filter((item) => item.checked).length
  const totalChecklistCount = plan.checklistItems.length

  return {
    displayDate: plan.visitDate || '날짜 미정',
    displayTimeSlot: formatTimeSlot(plan.timeSlot),
    waitMessage: getWaitMessage(Number(plan.waitMinutes || 0)),
    budgetTotal,
    topGoodsItems,
    checkedCount,
    totalChecklistCount,
    isChecklistComplete:
      totalChecklistCount > 0 && checkedCount === totalChecklistCount
  }
}
```

### 9.2 우선순위 정렬

```js
const priorityRank = {
  high: 0,
  medium: 1,
  low: 2
}

function compareGoodsPriority(a, b) {
  return priorityRank[a.priority] - priorityRank[b.priority]
}
```

같은 우선순위에서는 입력 순서를 최대한 유지한다. 최신 브라우저의 `sort`는 안정 정렬이지만, 강의에서 더 안전하게 설명하려면 항목에 `createdAt` 또는 `order`를 넣어도 된다.

### 9.3 대기 시간 메시지

```js
function getWaitMessage(waitMinutes) {
  if (waitMinutes >= 120) {
    return '긴 대기 예상! 보조 배터리와 물은 꼭 챙겨요.'
  }

  if (waitMinutes >= 60) {
    return '대기가 조금 길 수 있어요. 물과 배터리를 챙겨요.'
  }

  return '가볍게 다녀오기 좋은 플랜이에요.'
}
```

### 9.4 시간대 표시

```js
function formatTimeSlot(timeSlot) {
  const labels = {
    morning: '오전',
    afternoon: '오후',
    evening: '저녁'
  }

  return labels[timeSlot] || '시간대 미정'
}
```

## 10. 상태 관리 방식

### 10.1 기본 원칙

- `App.jsx`에서 `plan` 하나를 중심 상태로 둔다.
- 하위 컴포넌트는 필요한 값과 변경 함수만 props로 받는다.
- 생존 플랜 요약은 저장하지 않고 `plan`에서 계산한다.
- 상태 관리 라이브러리는 추가하지 않는다.

### 10.2 예시 구조

```js
function App() {
  const [plan, setPlan] = useState(() => getInitialPlan())
  const [saveStatus, setSaveStatus] = useState('idle')
  const [lastSavedAt, setLastSavedAt] = useState('')

  const summary = createSurvivalPlanSummary(plan)

  useEffect(() => {
    try {
      const savedAt = savePlan(plan)
      setLastSavedAt(savedAt)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [plan])

  return (
    // layout and components
  )
}
```

### 10.3 초기 로딩

```js
function getInitialPlan() {
  const saved = loadPlan()
  return saved?.plan ?? createDefaultPlan()
}
```

`createDefaultPlan()`은 기본 체크리스트를 새 배열로 복사해서 반환해야 한다.

## 11. 에러와 빈 상태 처리

### 11.1 방문 정보

- 날짜가 비어 있으면 `날짜 미정`을 표시한다.
- 시간대가 비어 있으면 `시간대 미정`을 표시한다.
- 대기 시간이 비어 있으면 0분처럼 처리하되 입력 칸은 비워둘 수 있다.
- 대기 시간이 음수이면 오류 문구를 표시한다.

### 11.2 굿즈 항목

- 굿즈가 없으면 카드에 `아직 우선 구매 굿즈가 없어요.`를 표시한다.
- 이름이 빈 항목은 카드 요약에서 제외한다.
- 예산이 비어 있으면 0으로 계산한다.
- 예산이 음수이면 해당 입력 아래에 오류를 표시한다.
- 5개를 넘게 추가하려 하면 `굿즈는 최대 5개까지만 추가할 수 있어요.`를 표시한다.

### 11.3 체크리스트

- 기본 체크리스트는 항상 존재해야 한다.
- 체크리스트가 비어 있는 예외 상황에서는 `체크리스트를 불러오지 못했어요.`를 표시한다.
- 모든 항목이 체크되면 준비 완료 메시지를 표시한다.

### 11.4 저장

- 저장 성공: `최근 플랜 저장됨`.
- 저장 실패: `이 브라우저에서는 저장을 사용할 수 없어요.`
- 초기화 전 확인: `저장된 플랜을 지울까요?`

## 12. 모바일 반응형 기준

### 12.1 Breakpoints

```css
/* 기본은 모바일 */

@media (min-width: 768px) {
  /* tablet */
}

@media (min-width: 1024px) {
  /* desktop two-column layout */
}
```

### 12.2 Layout Rules

- 기본 CSS는 모바일 1열 기준으로 작성한다.
- 1024px 이상에서 입력 영역과 카드 영역을 2열로 배치한다.
- 전체 컨테이너는 최대 너비를 둔다.
- 모바일 375px에서 가로 스크롤이 없어야 한다.
- 버튼과 체크박스 라벨은 최소 44px 높이의 터치 영역을 가진다.

### 12.3 CSS 구조

파일: `src/styles.css`

권장 class 예시:

```css
.app-shell {}
.app-header {}
.planner-layout {}
.planner-inputs {}
.planner-result {}
.section-panel {}
.form-grid {}
.goods-list {}
.checklist {}
.survival-card {}
.storage-panel {}
```

초보자 강의에서는 CSS module이나 CSS-in-JS를 쓰지 않고 일반 class 기반 CSS로 충분하다.

## 13. 구현 후 확인 방법

### 13.1 수동 브라우저 확인

개발 서버 실행 후 브라우저에서 확인한다.

```bash
npm run dev
```

확인 항목:

1. 날짜를 선택하면 생존 플랜 카드의 날짜가 즉시 바뀐다.
2. 시간대를 선택하면 카드의 시간대가 즉시 바뀐다.
3. 예상 대기 시간 120분 이상을 입력하면 긴 대기 메시지가 보인다.
4. 굿즈 2개와 예산을 입력하면 예산 합계가 정확히 표시된다.
5. 우선순위가 높은 굿즈가 카드에서 먼저 보인다.
6. 체크리스트를 체크하면 진행 숫자가 바뀐다.
7. 모든 체크리스트를 체크하면 준비 완료 메시지가 보인다.
8. 새로고침 후 방문 정보, 굿즈, 체크 상태가 복원된다.
9. 최근 플랜 초기화 후 새로고침해도 이전 플랜이 복원되지 않는다.
10. 375px 모바일 폭에서 가로 스크롤 없이 사용할 수 있다.

### 13.2 localStorage 확인

브라우저 개발자 도구에서 Application 탭을 열고 아래 key를 확인한다.

```text
popupStoreSurvivalPlanner.plan.v1
```

확인할 것:

- 입력 후 key가 생성된다.
- 새로고침 후 같은 값이 복원된다.
- 초기화 후 key가 삭제된다.

### 13.3 코드 확인

구현 완료 후 아래를 확인한다.

- 새 상태 관리 라이브러리가 추가되지 않았다.
- API 호출 코드가 없다.
- 로그인 관련 코드가 없다.
- 지도, 결제, SNS 공유 코드가 없다.
- 생존 플랜 계산 결과를 localStorage에 중복 저장하지 않는다.
- 모든 입력에 label이 있다.

## 14. Requirements Mapping

| 요구사항 | 구현 위치 |
| --- | --- |
| 방문 날짜와 시간대 입력 | `VisitInfoForm`, `plan.visitDate`, `plan.timeSlot` |
| 예상 대기 시간 입력 | `VisitInfoForm`, `plan.waitMinutes`, `validation.js` |
| 굿즈 우선순위와 예산 입력 | `GoodsBudgetList`, `plan.goodsItems` |
| 현장 체크리스트 | `ChecklistSection`, `defaultChecklist.js` |
| 생존 플랜 카드 생성 | `SurvivalPlanCard`, `planCalculations.js` |
| localStorage 저장 | `storage.js`, `App.jsx` |
| 최근 플랜 초기화 | `RecentPlanStorage`, `clearPlan()` |
| 모바일 대응 | `styles.css` media query |

## 15. Architecture Validation

### 15.1 Coherence Check

- React + Vite 단일 페이지 앱 제약과 일치한다.
- 서버, 로그인, 외부 API가 필요하지 않다.
- localStorage 저장 방식이 MVP 요구와 일치한다.
- UX spec의 핵심 4개 흐름과 일치한다.
- 입문자 강의용으로 이해 가능한 수준의 파일 구조다.

### 15.2 Risks and Guardrails

- **위험:** 기능을 추가하다가 첫 구현 범위가 커질 수 있다.  
  **가드레일:** 방문 후 메모와 사용자 정의 체크리스트는 선택 과제로 둔다.

- **위험:** localStorage에 계산 결과까지 저장해 데이터가 중복될 수 있다.  
  **가드레일:** 저장은 원본 `plan`만 하고, 카드는 매번 계산한다.

- **위험:** 굿즈/체크리스트 로직이 컴포넌트 안에 흩어질 수 있다.  
  **가드레일:** 계산은 `planCalculations.js`, 저장은 `storage.js`, 검증은 `validation.js`에 둔다.

### 15.3 Ready for Implementation

상태: **READY FOR IMPLEMENTATION**

다음 단계는 `bmad-create-epics-and-stories`로 구현 스토리를 나누거나, 작은 실습 목적이라면 바로 React + Vite 앱을 생성해 첫 화면부터 구현하는 것이다.

