---
project: Pop-up Store Survival Planner
status: final
created: 2026-05-18
updated: 2026-05-18
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - bmad-create-epcis-and-stories.md
---

# Pop-up Store Survival Planner - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for **Pop-up Store Survival Planner**, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

입문자 강의용 MVP이므로 첫 구현은 작게 유지한다. 로그인, 서버, 지도 API, 실시간 재고, 결제, SNS 공유는 어떤 story에도 포함하지 않는다.

요청에 적힌 참고 경로 중 `_bmad-output/planning-artifacts/PRD.md`와 `_bmad-output/planning-artifacts/ux-spec.md`는 현재 존재하지 않는다. 이 문서는 실제 존재하는 PRD와 UX spec 파일을 기준으로 작성되었다.

## Requirements Inventory

### Functional Requirements

FR1: 사용자는 방문 날짜를 입력할 수 있고, 생존 플랜 카드에 날짜가 즉시 반영된다.

FR2: 사용자는 방문 시간대를 선택할 수 있고, 생존 플랜 카드에 시간대가 즉시 반영된다.

FR3: 사용자는 예상 대기 시간을 입력할 수 있고, 120분 이상일 때 긴 대기 대비 메시지가 표시된다.

FR4: 사용자는 굿즈 항목을 추가하고 삭제할 수 있다.

FR5: 사용자는 굿즈 항목별 우선순위를 높음, 보통, 낮음 중 하나로 지정할 수 있다.

FR6: 사용자는 굿즈 항목별 예상 예산을 입력하고 전체 예산 합계를 확인할 수 있다.

FR7: 사용자는 기본 현장 체크리스트를 보고 체크/해제할 수 있다.

FR8: 사용자는 체크리스트 항목을 직접 추가하고 삭제할 수 있다. Architecture 기준으로 첫 구현 필수 범위가 아니라 선택/후속 story로 둔다.

FR9: 앱은 현재 입력값을 기반으로 오늘의 생존 플랜 카드를 자동 생성한다.

FR10: 앱은 예상 대기 시간과 체크리스트 상태를 바탕으로 상황별 생존 메시지를 표시한다.

FR11: 앱은 최근 방문 플랜 1개를 localStorage에 저장하고 새로고침 후 복원한다.

FR12: 사용자는 저장된 방문 플랜을 초기화할 수 있다.

FR13: 사용자는 방문 후 짧은 텍스트 메모를 남길 수 있다. Architecture 기준으로 첫 구현 필수 범위가 아니라 선택/후속 story로 둔다.

### NonFunctional Requirements

NFR1: 첫 사용자는 별도 설명 없이 3분 안에 방문 플랜을 만들 수 있어야 한다.

NFR2: 모든 입력은 label과 연결되어야 하며, 체크박스와 버튼은 키보드로 조작 가능해야 한다.

NFR3: 모바일 폭에서 입력 영역과 생존 플랜 카드가 세로로 자연스럽게 쌓여야 한다.

NFR4: 서버로 데이터를 전송하지 않고, 모든 데이터는 사용자 브라우저에만 저장되어야 한다.

NFR5: 새로고침 후 localStorage에 저장된 최근 플랜이 복원되어야 한다.

NFR6: React 입문자가 `useState`, controlled input, list rendering, conditional rendering, `useEffect`, localStorage를 연습할 수 있는 수준으로 구현되어야 한다.

### Additional Requirements

- React + Vite 단일 페이지 앱으로 구현한다.
- 라우팅은 사용하지 않는다.
- 서버, 로그인, 외부 API를 사용하지 않는다.
- 상태 관리는 React `useState`, `useEffect`만 사용한다.
- 새 상태 관리 라이브러리, `Context`, `Redux`, `Zustand`, `React Query`를 추가하지 않는다.
- 데이터 출처는 기본 mock data와 사용자 입력으로 제한한다.
- 스타일은 일반 CSS 또는 기존 프로젝트 스타일 방식으로 작성한다.
- localStorage key는 `popupStoreSurvivalPlanner.plan.v1`을 사용한다.
- localStorage에는 원본 `plan`만 저장하고, 생존 플랜 카드 계산 결과는 저장하지 않는다.
- 기본 체크리스트는 mock data로 제공한다.
- 굿즈 항목은 최대 5개로 제한한다.
- 최근 플랜은 1개만 저장한다.

### UX Design Requirements

UX-DR1: 앱은 단일 페이지에서 방문 정보, 굿즈 예산, 체크리스트, 생존 플랜 카드, 최근 플랜 저장 영역을 보여준다.

UX-DR2: 첫 구현 버전의 핵심 흐름은 방문 정보 입력, 굿즈 예산 정리, 현장 체크리스트 확인, 생존 플랜 카드와 최근 플랜 저장이다.

UX-DR3: 텍스트 입력보다 선택, 체크, 짧은 숫자 입력을 우선한다.

UX-DR4: 생존 플랜 카드는 비어 있는 상태에서도 기본 상태로 항상 보인다.

UX-DR5: 모바일 375px 폭에서 가로 스크롤 없이 사용할 수 있어야 한다.

UX-DR6: 1024px 이상에서는 입력 영역과 결과 카드 영역을 2열로 배치할 수 있다.

UX-DR7: 모든 입력에는 label이 있어야 하고, placeholder가 label을 대신하면 안 된다.

UX-DR8: 시간대는 오전, 오후, 저녁 선택 UI로 제공한다.

UX-DR9: 기본 체크리스트는 보조 배터리, 물, 입장 정보 확인, 카드/현금 준비 확인, 굿즈 보관 가방을 포함한다.

UX-DR10: 브라우저에서 날짜, 시간대, 대기 시간, 굿즈 예산, 체크리스트, 새로고침 복원, 초기화, 모바일 폭을 검증할 수 있어야 한다.

### FR Coverage Map

FR1: Epic 1 - 기본 방문 플랜 생성

FR2: Epic 1 - 기본 방문 플랜 생성

FR3: Epic 1 - 기본 방문 플랜 생성

FR4: Epic 2 - 굿즈 예산과 우선순위 정리

FR5: Epic 2 - 굿즈 예산과 우선순위 정리

FR6: Epic 2 - 굿즈 예산과 우선순위 정리

FR7: Epic 3 - 현장 체크리스트 준비

FR8: Epic 5 - 선택 과제와 후속 확장

FR9: Epic 1, Epic 2, Epic 3 - 생존 플랜 카드가 각 입력을 요약

FR10: Epic 1, Epic 3 - 대기 시간 메시지와 준비 완료 메시지

FR11: Epic 4 - 최근 플랜 저장과 복원

FR12: Epic 4 - 최근 플랜 초기화

FR13: Epic 5 - 선택 과제와 후속 확장

## Epic List

### Epic 1: 기본 방문 플랜 생성

사용자는 앱을 열어 방문 날짜, 시간대, 예상 대기 시간을 입력하고, 오늘의 생존 플랜 카드에서 기본 방문 계획을 즉시 확인할 수 있다.

**FRs covered:** FR1, FR2, FR3, FR9, FR10  
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR7, UX-DR8

### Epic 2: 굿즈 예산과 우선순위 정리

사용자는 사고 싶은 굿즈를 최대 5개까지 입력하고, 우선순위와 예상 예산을 정리해 생존 플랜 카드에서 구매 우선순위와 예산 합계를 확인할 수 있다.

**FRs covered:** FR4, FR5, FR6, FR9  
**UX-DRs covered:** UX-DR2, UX-DR3, UX-DR10

### Epic 3: 현장 체크리스트 준비

사용자는 기본 현장 체크리스트를 체크/해제하고, 준비 상태와 준비 완료 메시지를 생존 플랜 카드에서 확인할 수 있다.

**FRs covered:** FR7, FR9, FR10  
**UX-DRs covered:** UX-DR2, UX-DR3, UX-DR9, UX-DR10

### Epic 4: 최근 플랜 저장과 모바일 검증

사용자는 최근 플랜 1개를 브라우저에 저장하고 새로고침 후 복원할 수 있으며, 저장된 플랜을 초기화할 수 있다. 앱은 모바일 화면에서도 사용할 수 있다.

**FRs covered:** FR11, FR12  
**UX-DRs covered:** UX-DR5, UX-DR6, UX-DR10

### Epic 5: 선택 과제와 후속 확장

첫 구현이 끝난 뒤, 강의의 선택 과제로 체크리스트 항목 직접 추가/삭제와 방문 후 메모를 추가할 수 있다.

**FRs covered:** FR8, FR13  
**UX-DRs covered:** UX-DR10

## Epic 1: 기본 방문 플랜 생성

목표: 사용자가 앱을 열고 방문 날짜, 시간대, 예상 대기 시간을 입력한 뒤, 생존 플랜 카드에서 기본 계획을 바로 확인한다.

### Story 1.1: React + Vite 앱 골격과 단일 페이지 레이아웃 만들기

As a 팝업스토어 방문자,  
I want 앱을 열자마자 방문 준비 화면을 볼 수 있기를,  
So that 별도 이동 없이 바로 플랜 작성을 시작할 수 있다.

**Acceptance Criteria:**

**Given** 프로젝트에 React + Vite 앱 소스가 없다  
**When** 구현을 시작한다  
**Then** React + Vite 단일 페이지 앱 scaffold가 생성된다  
**And** 새 상태 관리 라이브러리, 라우터, 서버, 외부 API 의존성은 추가되지 않는다.

**Given** 사용자가 앱을 처음 연다  
**When** 페이지가 로드된다  
**Then** 앱 제목, 짧은 설명, 방문 정보 영역, 굿즈 예산 영역, 체크리스트 영역, 생존 플랜 카드 영역, 최근 플랜 저장 영역이 한 페이지에 표시된다  
**And** 로그인, 지도, 결제, 실시간 재고, SNS 공유 UI가 보이지 않는다.

**Given** 화면 폭이 모바일 크기다  
**When** 페이지를 확인한다  
**Then** 영역들이 세로로 쌓이고 가로 스크롤이 생기지 않는다.

**검증 방법:**

- `package.json`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`가 생성되어 있는지 확인한다.
- `npm install` 후 `npm run dev`가 실행되는지 확인한다.
- `npm run dev`로 앱을 열고 첫 화면에 주요 영역이 모두 보이는지 확인한다.
- 브라우저 폭 375px에서 가로 스크롤이 없는지 확인한다.
- 로그인/지도/결제/재고/SNS 관련 버튼이나 링크가 없는지 확인한다.

### Story 1.2: 방문 날짜와 시간대 입력하기

As a 팝업스토어 방문자,  
I want 방문 날짜와 시간대를 입력하기를,  
So that 생존 플랜 카드에서 언제 방문할지 바로 확인할 수 있다.

**Acceptance Criteria:**

**Given** 방문 정보 영역이 표시된다  
**When** 사용자가 방문 날짜를 선택한다  
**Then** 생존 플랜 카드에 선택한 날짜가 표시된다  
**And** 날짜가 비어 있으면 `날짜 미정`이 표시된다.

**Given** 방문 정보 영역이 표시된다  
**When** 사용자가 오전, 오후, 저녁 중 하나를 선택한다  
**Then** 생존 플랜 카드에 선택한 시간대가 표시된다  
**And** 시간대가 비어 있으면 `시간대 미정`이 표시된다.

**검증 방법:**

- 날짜 input에서 날짜를 선택하고 카드의 날짜가 즉시 바뀌는지 확인한다.
- 오전/오후/저녁을 선택하고 카드의 시간대가 즉시 바뀌는지 확인한다.
- 새로고침 전 저장 기능이 없더라도 현재 화면에서 값이 반영되는지 확인한다.

### Story 1.3: 예상 대기 시간과 대기 메시지 표시하기

As a 팝업스토어 방문자,  
I want 예상 대기 시간을 입력하면 상황별 메시지를 보기를,  
So that 긴 대기 상황을 미리 준비할 수 있다.

**Acceptance Criteria:**

**Given** 예상 대기 시간 입력 칸이 표시된다  
**When** 사용자가 `30`을 입력한다  
**Then** 생존 플랜 카드에 가벼운 방문 메시지가 표시된다.

**Given** 예상 대기 시간 입력 칸이 표시된다  
**When** 사용자가 `90`을 입력한다  
**Then** 생존 플랜 카드에 물과 배터리를 챙기라는 메시지가 표시된다.

**Given** 예상 대기 시간 입력 칸이 표시된다  
**When** 사용자가 `120` 이상을 입력한다  
**Then** 생존 플랜 카드에 긴 대기 대비 메시지가 표시된다.

**Given** 예상 대기 시간 입력 칸이 표시된다  
**When** 사용자가 음수를 입력한다  
**Then** `0 이상의 숫자로 입력해주세요.` 오류 문구가 표시된다.

**검증 방법:**

- 대기 시간에 `30`, `90`, `150`, `-1`을 차례로 입력해 카드 메시지와 오류 문구를 확인한다.
- 개발자 도구 console에 오류가 없는지 확인한다.

## Epic 2: 굿즈 예산과 우선순위 정리

목표: 사용자가 사고 싶은 굿즈, 우선순위, 예상 예산을 정리하고 카드에서 우선 구매 목록과 예산 합계를 확인한다.

### Story 2.1: 굿즈 항목 추가와 삭제하기

As a 팝업스토어 방문자,  
I want 사고 싶은 굿즈 항목을 추가하고 삭제하기를,  
So that 구매 계획을 작은 목록으로 정리할 수 있다.

**Acceptance Criteria:**

**Given** 굿즈 예산 영역이 표시된다  
**When** 사용자가 굿즈 이름을 입력하고 추가한다  
**Then** 굿즈 항목이 리스트에 표시된다  
**And** 각 항목에는 이름, 우선순위, 예상 금액 입력이 포함된다.

**Given** 굿즈 리스트에 항목이 있다  
**When** 사용자가 삭제 버튼을 누른다  
**Then** 해당 항목이 리스트에서 제거된다.

**Given** 굿즈 항목이 5개 있다  
**When** 사용자가 추가 버튼을 누른다  
**Then** 새 항목이 추가되지 않고 `굿즈는 최대 5개까지만 추가할 수 있어요.` 안내가 표시된다.

**검증 방법:**

- 굿즈 항목을 1개 추가하고 화면에 표시되는지 확인한다.
- 삭제 버튼을 눌러 항목이 사라지는지 확인한다.
- 5개 초과 추가가 막히는지 확인한다.

### Story 2.2: 굿즈 예산 합계 계산하기

As a 팝업스토어 방문자,  
I want 굿즈별 예상 예산을 입력하면 합계를 보기를,  
So that 예산 초과를 미리 줄일 수 있다.

**Acceptance Criteria:**

**Given** 굿즈 항목 2개가 있다  
**When** 사용자가 각각 `12000`, `30000`을 입력한다  
**Then** 예산 합계가 `42000`으로 표시된다.

**Given** 굿즈 예산 입력 칸이 있다  
**When** 사용자가 빈 값을 둔다  
**Then** 해당 항목은 0원으로 계산된다.

**Given** 굿즈 예산 입력 칸이 있다  
**When** 사용자가 음수를 입력한다  
**Then** 해당 입력 아래에 오류 문구가 표시된다.

**검증 방법:**

- 여러 굿즈 예산을 입력하고 합계가 정확한지 확인한다.
- 빈 값과 음수 값의 표시를 확인한다.
- 합계가 생존 플랜 카드에도 반영되는지 확인한다.

### Story 2.3: 굿즈 우선순위를 카드에 반영하기

As a 팝업스토어 방문자,  
I want 굿즈 우선순위를 지정하기를,  
So that 현장에서 무엇을 먼저 살지 빠르게 판단할 수 있다.

**Acceptance Criteria:**

**Given** 굿즈 항목이 여러 개 있다  
**When** 사용자가 각 항목의 우선순위를 높음, 보통, 낮음으로 지정한다  
**Then** 생존 플랜 카드에는 우선순위가 높은 항목이 먼저 표시된다.

**Given** 이름이 비어 있는 굿즈 항목이 있다  
**When** 생존 플랜 카드가 렌더링된다  
**Then** 이름이 비어 있는 항목은 우선 구매 목록에 표시되지 않는다.

**Given** 유효한 굿즈 항목이 4개 이상 있다  
**When** 생존 플랜 카드가 렌더링된다  
**Then** 우선 구매 굿즈는 최대 3개까지만 표시된다.

**검증 방법:**

- 서로 다른 우선순위의 굿즈를 만들고 카드 표시 순서를 확인한다.
- 이름이 빈 항목이 카드에 나오지 않는지 확인한다.
- 4개 이상 입력했을 때 카드에는 3개까지만 보이는지 확인한다.

## Epic 3: 현장 체크리스트 준비

목표: 사용자가 기본 체크리스트를 확인하고 준비 상태를 카드에서 볼 수 있다.

### Story 3.1: 기본 체크리스트 표시와 체크 상태 변경하기

As a 팝업스토어 방문자,  
I want 현장 체크리스트를 체크하고 해제하기를,  
So that 방문 전 준비물을 빠뜨리지 않을 수 있다.

**Acceptance Criteria:**

**Given** 앱이 처음 로드된다  
**When** 현장 체크리스트 영역을 본다  
**Then** 보조 배터리, 물, 입장 정보 확인, 카드/현금 준비 확인, 굿즈 보관 가방 항목이 표시된다.

**Given** 체크리스트 항목이 표시된다  
**When** 사용자가 체크박스를 클릭한다  
**Then** 해당 항목의 체크 상태가 변경된다.

**Given** 사용자가 키보드로 체크박스에 접근한다  
**When** Space 키를 누른다  
**Then** 해당 항목의 체크 상태가 변경된다.

**검증 방법:**

- 기본 체크리스트 5개가 보이는지 확인한다.
- 마우스와 키보드로 체크/해제가 가능한지 확인한다.
- `카드/현금 준비 확인`이 결제 기능으로 연결되지 않는 단순 체크 항목인지 확인한다.

### Story 3.2: 체크리스트 진행 상태와 준비 완료 메시지 표시하기

As a 팝업스토어 방문자,  
I want 체크리스트 준비 상태를 카드에서 보기를,  
So that 지금 얼마나 준비됐는지 한눈에 알 수 있다.

**Acceptance Criteria:**

**Given** 체크리스트 항목 5개가 있다  
**When** 사용자가 3개를 체크한다  
**Then** 생존 플랜 카드에 `3/5 준비됨`처럼 진행 상태가 표시된다.

**Given** 체크리스트 항목 5개가 있다  
**When** 사용자가 모든 항목을 체크한다  
**Then** 생존 플랜 카드에 준비 완료 메시지가 표시된다.

**Given** 사용자가 항목을 다시 해제한다  
**When** 체크 상태가 완료 상태가 아니게 된다  
**Then** 준비 완료 메시지가 사라지거나 일반 준비 상태 메시지로 바뀐다.

**검증 방법:**

- 체크 개수를 바꿔 카드의 숫자가 즉시 바뀌는지 확인한다.
- 모든 항목 체크 시 준비 완료 메시지가 보이는지 확인한다.
- 체크 해제 후 메시지가 정상적으로 바뀌는지 확인한다.

## Epic 4: 최근 플랜 저장과 모바일 검증

목표: 사용자는 작성 중인 최근 플랜 1개를 브라우저에 저장하고, 새로고침 후 이어서 볼 수 있으며, 모바일에서도 사용할 수 있다.

### Story 4.1: 최근 플랜 localStorage 저장과 복원하기

As a 팝업스토어 방문자,  
I want 작성한 플랜이 브라우저에 저장되기를,  
So that 새로고침 후에도 다시 입력하지 않아도 된다.

**Acceptance Criteria:**

**Given** 사용자가 방문 정보, 굿즈, 체크리스트를 입력했다  
**When** 앱 상태가 변경된다  
**Then** 최근 플랜이 `popupStoreSurvivalPlanner.plan.v1` key로 localStorage에 저장된다.

**Given** localStorage에 최근 플랜이 저장되어 있다  
**When** 사용자가 페이지를 새로고침한다  
**Then** 방문 정보, 굿즈 항목, 체크리스트 체크 상태가 복원된다.

**Given** 생존 플랜 카드가 표시된다  
**When** localStorage 저장값을 확인한다  
**Then** 카드 계산 결과가 아니라 원본 `plan` 데이터만 저장되어 있다.

**검증 방법:**

- 입력 후 개발자 도구 Application 탭에서 localStorage key를 확인한다.
- 새로고침 후 입력값이 복원되는지 확인한다.
- 저장된 JSON에 계산 결과가 중복 저장되지 않았는지 확인한다.

### Story 4.2: 최근 플랜 저장 상태와 초기화 제공하기

As a 팝업스토어 방문자,  
I want 저장 상태를 확인하고 필요하면 플랜을 초기화하기를,  
So that 최근 플랜을 안전하게 관리할 수 있다.

**Acceptance Criteria:**

**Given** 플랜 저장이 성공했다  
**When** 화면을 확인한다  
**Then** `최근 플랜 저장됨` 상태가 표시된다.

**Given** localStorage 저장이 실패한다  
**When** 앱이 저장을 시도한다  
**Then** `이 브라우저에서는 저장을 사용할 수 없어요.` 문구가 표시되고 앱은 멈추지 않는다.

**Given** 저장된 플랜이 있다  
**When** 사용자가 최근 플랜 초기화 버튼을 누르고 확인한다  
**Then** localStorage key가 삭제되고 입력값은 기본 상태로 돌아간다.

**Given** 플랜 초기화가 완료됐다  
**When** 사용자가 새로고침한다  
**Then** 이전 플랜이 복원되지 않는다.

**검증 방법:**

- 입력 후 저장 상태 문구를 확인한다.
- 초기화 버튼을 누르고 확인한 뒤 화면과 localStorage가 초기화되는지 확인한다.
- 초기화 후 새로고침해도 이전 데이터가 없는지 확인한다.

### Story 4.3: 모바일 반응형과 기본 접근성 확인하기

As a 모바일 사용자,  
I want 작은 화면에서도 플랜을 작성하기를,  
So that 현장 대기 중에도 앱을 편하게 사용할 수 있다.

**Acceptance Criteria:**

**Given** 브라우저 폭이 375px이다  
**When** 사용자가 앱을 확인한다  
**Then** 모든 영역이 세로로 쌓이고 가로 스크롤이 생기지 않는다.

**Given** 브라우저 폭이 1024px 이상이다  
**When** 사용자가 앱을 확인한다  
**Then** 입력 영역과 생존 플랜 카드 영역이 2열 또는 넓은 화면에 맞는 안정적인 레이아웃으로 표시된다.

**Given** 폼 입력과 체크박스가 있다  
**When** 사용자가 label을 클릭하거나 키보드로 이동한다  
**Then** 입력과 체크박스를 조작할 수 있고 focus 상태가 보인다.

**검증 방법:**

- Chrome DevTools에서 375px, 768px, 1024px 폭을 확인한다.
- 모든 입력에 label이 있는지 확인한다.
- Tab 키와 Space 키로 주요 조작이 가능한지 확인한다.

## Epic 5: 선택 과제와 후속 확장

목표: 첫 구현을 마친 뒤 강의 선택 과제로 체크리스트 확장과 방문 후 기록을 추가할 수 있다. 이 Epic은 첫 MVP 구현 완료 조건이 아니다.

### Story 5.1: 체크리스트 항목 직접 추가와 삭제하기

As a 팝업스토어 방문자,  
I want 체크리스트 항목을 직접 추가하고 삭제하기를,  
So that 내 방문 상황에 맞게 준비 목록을 조정할 수 있다.

**Acceptance Criteria:**

**Given** 체크리스트 영역이 표시된다  
**When** 사용자가 새 항목 이름을 입력하고 추가한다  
**Then** 새 체크리스트 항목이 목록에 표시된다.

**Given** 사용자가 빈 텍스트를 입력했다  
**When** 추가 버튼을 누른다  
**Then** 새 항목은 추가되지 않는다.

**Given** 사용자 추가 항목이 있다  
**When** 사용자가 삭제 버튼을 누른다  
**Then** 해당 항목이 체크리스트와 저장된 플랜에서 제거된다.

**검증 방법:**

- 항목 추가/삭제가 화면에 반영되는지 확인한다.
- 빈 값 추가가 막히는지 확인한다.
- 새로고침 후 사용자 추가 항목과 삭제 결과가 유지되는지 확인한다.

### Story 5.2: 방문 후 한 줄 메모 저장하기

As a 팝업스토어 방문자,  
I want 방문 후 한 줄 메모를 남기기를,  
So that 방문 경험을 간단히 기록할 수 있다.

**Acceptance Criteria:**

**Given** 방문 후 메모 입력 영역이 표시된다  
**When** 사용자가 짧은 메모를 입력한다  
**Then** 메모가 화면에 표시된다.

**Given** 사용자가 메모를 입력했다  
**When** 페이지를 새로고침한다  
**Then** localStorage에서 메모가 복원된다.

**Given** 방문 후 메모 기능이 구현됐다  
**When** 사용자가 화면을 확인한다  
**Then** 사진 첨부, SNS 공유, 타임라인 기능은 제공되지 않는다.

**검증 방법:**

- 메모 입력 후 화면 반영을 확인한다.
- 새로고침 후 메모가 복원되는지 확인한다.
- SNS 공유나 사진 첨부 UI가 없는지 확인한다.

## Final Validation

### Requirements Coverage

- FR1-FR3 are covered by Epic 1.
- FR4-FR6 are covered by Epic 2.
- FR7 is covered by Epic 3.
- FR8 is covered by optional Epic 5.
- FR9 is covered across Epic 1, Epic 2, and Epic 3.
- FR10 is covered by Epic 1 and Epic 3.
- FR11-FR12 are covered by Epic 4.
- FR13 is covered by optional Epic 5.

### Architecture Compliance

- React + Vite SPA is assumed.
- No login, server, external API, map API, real-time stock, payment, or SNS integration is included.
- No new state management library is required.
- localStorage stores only the original `plan` payload.
- Stories are small enough for one Codex implementation task each.

### Recommended Implementation Order

1. Story 1.1
2. Story 1.2
3. Story 1.3
4. Story 2.1
5. Story 2.2
6. Story 2.3
7. Story 3.1
8. Story 3.2
9. Story 4.1
10. Story 4.2
11. Story 4.3

Story 5.1 and Story 5.2 are optional follow-up tasks after the first teaching MVP works end to end.
