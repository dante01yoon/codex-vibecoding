# Active Context

상태: done
마지막 업데이트: 2026-05-10

## 지금 이어갈 작업

Demo Provider 기반 알림 평가 흐름은 구현과 검증이 끝났다. 다음 작업은 변경 범위를 확인한 뒤 필요하면 커밋/푸시하거나, 다음 기능 task card를 새로 만드는 것이다.

## 현재 변경 상태

- `AGENTS.md`: `$stock-alert-memory-bank` 기반 메모리 뱅크 사용 규칙과 `.memory-bank/` 필수 읽기 항목이 추가됨.
- `package.json`: `npm test` 스크립트가 추가됨.
- `src/lib/alertEvaluator.js`: 가격/등락률 조건, disabled, missing quote, cooldown, event 생성 로직이 추가됨.
- `src/lib/alertEvaluator.test.js`: Node test 기반 단위 테스트가 추가됨. missing value 분기도 포함됨.
- `src/App.jsx`: 데모 알림 평가 버튼, Notification permission 요청, 최근 알림 생성, 상대 시간 표시, 권한 상태 copy가 연결됨.
- `.agents/skills/stock-alert-memory-bank/`: 프로젝트 메모리 뱅크 유지 스킬이 추가됨.

## 주의할 점

- 현재 변경은 아직 커밋되지 않았다.
- `stock-alarm/.superpowers/`는 brainstorm/design helper 산출물일 수 있으니 제품 변경으로 섞지 않는다.
- secret, API key, `.env` 내용은 메모리에 저장하지 않는다.
- UI를 더 고칠 때는 먼저 `DESIGN.md`를 읽고 `npx @google/design.md lint DESIGN.md`로 확인한다.

## 다음 세션 시작 순서

1. `AGENTS.md`와 `.memory-bank/` core 파일을 먼저 읽는다.
2. `git status --short -- stock-alarm .agents/skills/stock-alert-memory-bank`로 변경 범위를 확인한다.
3. publish가 필요하면 `stock-alarm/.superpowers/` 같은 helper 산출물을 제품 커밋에 섞지 않는다.
4. 다음 개발 작업을 시작할 때 새 task card를 만든다.
5. UI를 더 고치면 `npm test`, `npm run build`, `npx @google/design.md lint DESIGN.md`를 다시 실행한다.
