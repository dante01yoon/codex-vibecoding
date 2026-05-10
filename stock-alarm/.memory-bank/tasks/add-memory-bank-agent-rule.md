# Task Card: Add Memory Bank Agent Rule

상태: done
마지막 업데이트: 2026-05-10

## Goal

`AGENTS.md`에 `$stock-alert-memory-bank` 스킬 기반 메모리 뱅크 사용 규칙을 명시한다.

## Files to inspect or edit

- `AGENTS.md`
- `.memory-bank/active-context.md`
- `.memory-bank/progress.md`
- `.memory-bank/decision-log.md`
- `.memory-bank/next-actions.md`
- `.memory-bank/verification-log.md`

## Plan

1. `Required Reading`에 `.memory-bank/` core 파일을 추가한다.
2. `Memory Bank Rule` 섹션을 추가한다.
3. 세션 시작/재개/작업 준비/완료 요약 시 `$stock-alert-memory-bank` 사용을 명시한다.
4. secret, API key, token, `.env` 저장 금지 경계를 함께 적는다.

## Verification

- `git diff --check -- stock-alarm/AGENTS.md stock-alarm/.memory-bank`: pass.

## Notes for the next session

- 이후 `stock-alarm` 작업은 `AGENTS.md` 기준으로 `.memory-bank/`를 먼저 읽고 task card를 유지해야 한다.
