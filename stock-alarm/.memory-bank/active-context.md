# Active Context

상태: done
마지막 업데이트: 2026-05-10

## 지금 이어갈 작업

Demo Provider 기반 알림 평가와 최근 알림 확인 UX 구현/검증이 끝났다. 다음 작업은 변경 범위를 확인한 뒤 필요하면 커밋/푸시하거나, provider 상태/error sample UI 또는 Demo Provider 데이터 분리를 고르는 것이다.

## 현재 변경 상태

- `5f536fd Add stock alarm demo evaluator and memory bank`: Demo alert evaluator, memory bank, AGENTS memory rule을 좁게 커밋함. push는 하지 않음.
- `src/lib/alertEvaluator.js`: 새 alert event가 `acknowledgedAt: null`을 가진다.
- `src/lib/alertEvaluator.test.js`: 새 event의 `acknowledgedAt: null` 분기를 검증한다.
- `src/App.jsx`: 단일 알림 확인, 선택 종목 알림 `모두 확인`, 확인 시간 표시, `acknowledgedAt` 기반 UI 상태가 추가됨.
- `.memory-bank/tasks/acknowledge-alert-events.md`: 완료 상태로 갱신됨.

## 주의할 점

- 현재 확인 UX 변경은 아직 커밋되지 않았다.
- `stock-alarm/.superpowers/`는 brainstorm/design helper 산출물일 수 있으니 제품 변경으로 섞지 않는다.
- `stock-alarm/skill-creator-memory.md`는 이번 제품 변경에 섞지 않는다.
- secret, API key, `.env` 내용은 메모리에 저장하지 않는다.
- UI를 더 고칠 때는 먼저 `DESIGN.md`를 읽고 `npx @google/design.md lint DESIGN.md`로 확인한다.

## 다음 세션 시작 순서

1. `AGENTS.md`와 `.memory-bank/` core 파일을 먼저 읽는다.
2. `git status --short -- stock-alarm .agents/skills/stock-alert-memory-bank`로 변경 범위를 확인한다.
3. publish가 필요하면 `stock-alarm/.superpowers/`와 `stock-alarm/skill-creator-memory.md`를 제품 커밋에 섞지 않는다.
4. 다음 개발 작업을 시작할 때 새 task card를 만든다.
5. UI를 더 고치면 `npm test`, `npm run build`, `npx @google/design.md lint DESIGN.md`를 다시 실행한다.
