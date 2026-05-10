# Next Actions

마지막 업데이트: 2026-05-10

## next

1. publish가 필요하면 좁은 commit 범위를 유지한다.
   - `stock-alarm` 변경과 `.agents/skills/stock-alert-memory-bank`만 확인한다.
   - `stock-alarm/.superpowers/`, `stock-alarm/skill-creator-memory.md`, unrelated staged/untracked 파일은 섞지 않는다.

2. 실제 Supabase 연결을 마무리한다.
   - 사용자가 `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 직접 입력한다.
   - Supabase anonymous sign-in 활성 여부를 확인한다.
   - `supabase/migrations/20260510074616_create_stock_alarm_tables.sql`을 실제 stock-alarm project에 적용한다.
   - RLS로 watchlist/rule/event가 현재 user_id만 읽고 쓰는지 확인한다.

3. UI write path를 Supabase repository에 연결한다.
   - 관심 종목 추가: `upsertWatchlistItem`
   - 규칙 저장/토글/lastTriggeredAt: `insertAlertRule`, `setAlertRuleEnabled`, `setAlertRulesTriggeredAt`
   - 알림 생성/확인: `insertAlertEvents`, `acknowledgeAlertEvent`, `acknowledgeAlertEventsForSymbol`

4. 실제 provider 연결을 점진적으로 켠다.
   - 사용자가 개인 Alpha Vantage key를 `.env`에 넣으면 `npm run dev:full` 후 AAPL quote/search/history를 확인한다.
   - 사용자가 KIS key/token을 `.env`에 넣으면 `npm run dev:full` 후 `005930` quote를 확인한다.
   - KIS token 자동 발급/갱신, KIS 검색, KIS history는 후속 작업이다.
   - 필요하면 provider 선택 UI를 추가한다.
