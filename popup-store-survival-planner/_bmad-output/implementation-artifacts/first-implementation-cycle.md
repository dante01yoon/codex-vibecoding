---
project: Pop-up Store Survival Planner
cycle: 1
status: complete
created: 2026-05-18
selected_story: 1-1-react-vite-app-shell
selected_functional_story: 1-2-visit-date-time-input
---

# First Implementation Cycle

## 선택한 Vertical Slice

첫 번째 구현 사이클은 두 단계로 나눈다. 먼저 정적 shell은 `1-1-react-vite-app-shell`로 준비되어 있고, 첫 기능 구현 story는 `1-2-visit-date-time-input`으로 진행한다.

**선택한 story:** `1-1-react-vite-app-shell`  
**목표 시간:** 30분  
**목표 결과:** React + Vite 앱이 브라우저에서 실행되고, 첫 화면에 핵심 영역 5개가 보인다.

**선택한 기능 story:** `1-2-visit-date-time-input`  
**목표 결과:** 방문 날짜, 시간대, 예상 대기 시간이 오늘의 생존 플랜 카드에 즉시 반영된다.

## 선택 이유

- 프로젝트에 아직 앱 scaffold가 없으므로 실행 가능한 첫 화면이 가장 작은 시작점이다.
- 입문자에게 React 파일 구조, 컴포넌트, CSS 연결, 브라우저 확인 흐름을 한 번에 보여줄 수 있다.
- 아직 입력 로직, 계산, localStorage를 넣지 않으므로 30분 안에 끝낼 수 있다.
- 이후 Story 1.2부터 controlled input을 자연스럽게 추가할 수 있다.

## 30분 구현 범위

1. React + Vite 앱 scaffold 또는 기존 shell 확인
2. `App.jsx`에 방문 날짜, 시간대, 예상 대기 시간 상태 작성
3. 오늘의 생존 플랜 카드에 입력값 즉시 반영
4. 대기 시간 30분, 90분, 150분 메시지 확인
5. 모바일 375px 기준으로 세로 레이아웃 확인
6. 제외 기능 UI가 없는지 확인

## 브라우저 Acceptance Criteria

1. `npm run dev` 실행 후 로컬 브라우저에서 앱이 열린다.
2. 날짜를 선택하면 생존 플랜 카드의 날짜가 즉시 바뀐다.
3. 오전, 오후, 저녁을 선택하면 생존 플랜 카드의 시간대가 즉시 바뀐다.
4. 대기 시간 `30`, `90`, `150` 입력에 따라 카드 메시지가 바뀐다.
5. 대기 시간 `-1` 입력 시 오류 문구가 표시된다.
6. 375px 모바일 폭에서 가로 스크롤 없이 사용할 수 있다.
7. 로그인, 결제, 지도, 실시간 재고, SNS 공유 UI가 없다.

## 이번 사이클에서 하지 않을 것

- 굿즈 리스트 추가/삭제
- 체크리스트 체크 동작
- localStorage 필수 저장
- 서버나 외부 API 연결

## 완료 후 다음 단계

Story 1.2 구현과 code review가 완료되어 `done` 처리됐다. Story 1.1의 scaffold/shell 작업과 Story 1.3의 대기 메시지 작업은 Story 1.2에 흡수되어 함께 `done`으로 정리했다.

다음 구현 사이클은 Epic 2의 `2-1-goods-item-list`부터 시작한다.
