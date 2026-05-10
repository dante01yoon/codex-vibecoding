# Next Actions

마지막 업데이트: 2026-05-10

## next

1. publish가 필요하면 좁은 commit 범위를 유지한다.
   - `stock-alarm` 변경과 `.agents/skills/stock-alert-memory-bank`만 확인한다.
   - `stock-alarm/.superpowers/`, `stock-alarm/skill-creator-memory.md`, unrelated staged/untracked 파일은 섞지 않는다.

2. 다음 기능을 시작하기 전에 새 task card를 만든다.
   - Goal
   - Status
   - Files to inspect or edit
   - Plan
   - Verification
   - Notes for the next session

3. 다음 후보 작업을 고른다.
   - Demo Provider 데이터를 `src/lib` 모듈로 더 분리
   - provider status/error sample state 추가
   - 최근 알림 이력의 Supabase `acknowledged_at` 저장 연결은 Supabase 단계에서 진행
