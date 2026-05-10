# Decision Log

마지막 업데이트: 2026-05-10

## 2026-05-10

결정: `stock-alarm/.memory-bank/`를 프로젝트 재개용 memory bank로 사용한다.

이유: 다음 Codex 세션이 긴 PRD와 디자인 문서를 모두 다시 읽기 전에 현재 상태, 검증, 다음 작업을 빠르게 파악할 수 있어야 한다.

결과: `project-brief.md`, `active-context.md`, `progress.md`, `decision-log.md`, `next-actions.md`, `verification-log.md`와 task card를 유지한다.

## 2026-05-10

결정: 11-7 단계는 Demo Provider 데이터와 브라우저 open-only 알림 평가를 먼저 다룬다.

이유: 실제 KIS/Alpha Vantage API와 Supabase Auth/DB는 초보 단계에서 setup 부담이 크고, 현재 스펙에서도 provider adapter와 Demo Provider로 UI/logic 개발을 unblock하도록 되어 있다.

결과: 현재 구현과 노트는 secret 없는 데모 데이터, 순수 `alertEvaluator`, 단위 테스트 중심으로 유지한다.

## 2026-05-10

결정: 현재 알림 평가 로직은 UI에서 분리된 `src/lib/alertEvaluator.js`에 둔다.

이유: 가격/등락률/cooldown 판단은 provider payload나 React component와 분리되어야 테스트와 후속 provider 연결이 쉽다.

결과: `App.jsx`는 평가기를 호출하고 UI 상태를 업데이트하며, 세부 조건 판단은 `alertEvaluator`가 담당한다.

## 2026-05-10

결정: `AGENTS.md`에 `$stock-alert-memory-bank` 기반 메모리 뱅크 사용을 필수 규칙으로 명시한다.

이유: 새 Codex 세션이 프로젝트 상태를 놓치지 않고 `.memory-bank/`와 task card를 먼저 확인하도록 프로젝트 루트 계약에 남겨야 한다.

결과: 이후 `stock-alarm` 작업은 작업 전 memory bank 읽기, 작업 전/후 task card 갱신, secret 저장 금지 경계를 따른다.
