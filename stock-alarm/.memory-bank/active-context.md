# Active Context

상태: in progress
마지막 업데이트: 2026-05-10

## 지금 이어갈 작업

API/Supabase 연결 1차 구현이 끝났다. 로컬 Express API proxy, provider adapter 골격, Supabase browser client/repository/migration이 들어갔고, 앱은 API/Supabase 연결 상태를 상태바에 표시한다. 앱은 이제 `VITE_MARKET_DATA_PROVIDER=auto`로 실제 provider를 시도하고 실패한 시장만 demo fallback으로 내려간다. 다음 작업은 실제 개인 `.env` 값과 Supabase 프로젝트가 준비된 뒤 live 연결을 검증하고 UI write path를 repository에 연결하는 것이다.

## 현재 변경 상태

- `5f536fd Add stock alarm demo evaluator and memory bank`: Demo alert evaluator, memory bank, AGENTS memory rule을 좁게 커밋함. push는 하지 않음.
- `1235392 Add alert acknowledgment UX`: 최근 알림 확인 UX를 좁게 커밋함. push는 하지 않음.
- `server/`: Express API server와 Demo/Alpha Vantage/KIS provider adapter가 추가됨.
- `src/lib/demoMarketData.js`: 데모 market data가 App에서 분리됨.
- `src/lib/stockApiClient.js`: 브라우저 API client가 추가됨.
- `src/lib/supabaseClient.js`: Supabase publishable key 기반 browser client와 anonymous session bootstrap이 추가됨.
- `src/lib/*Repository.js`, `src/lib/supabaseMappers.js`: watchlist/rule/event persistence layer가 추가됨.
- `supabase/migrations/20260510074616_create_stock_alarm_tables.sql`: watchlist/rule/event table과 RLS policy 초안이 추가됨.
- `src/App.jsx`: API/Supabase 상태바 표시와 `/api/*` 기반 demo provider 로드가 추가됨.
- `src/App.jsx`: `demo` 고정을 제거하고 `VITE_MARKET_DATA_PROVIDER=auto` 기반 실제 provider 호출과 demo fallback을 추가함.
- `docs/api-setup.md`: 실제 API 설정과 curl 검증 절차가 추가됨.
- `src/lib/alertEvaluator.js`: 새 alert event가 `acknowledgedAt: null`을 가진다.
- `src/lib/alertEvaluator.test.js`: 새 event의 `acknowledgedAt: null` 분기를 검증한다.
- `src/App.jsx`: 단일 알림 확인, 선택 종목 알림 `모두 확인`, 확인 시간 표시, `acknowledgedAt` 기반 UI 상태가 추가됨.
- `.memory-bank/tasks/acknowledge-alert-events.md`: 완료 상태로 갱신됨.
- `.memory-bank/tasks/connect-api-and-supabase.md`: 완료 상태로 갱신됨.

## 주의할 점

- 현재 API/Supabase 연결 변경은 아직 커밋되지 않았다.
- `stock-alarm/.superpowers/`는 brainstorm/design helper 산출물일 수 있으니 제품 변경으로 섞지 않는다.
- `stock-alarm/skill-creator-memory.md`는 이번 제품 변경에 섞지 않는다.
- secret, API key, `.env` 내용은 메모리에 저장하지 않는다.
- 실제 Supabase 프로젝트에 migration을 적용하기 전 project id와 anonymous auth 설정을 확인한다.
- Alpha Vantage/KIS provider는 server-only env가 없으면 `setup_required` 또는 not implemented error를 반환한다. 앱은 이 경우 demo fallback을 표시한다.
- KIS는 현재 exact code quote만 연결되어 있고 검색/history는 후속 작업이다.
- UI를 더 고칠 때는 먼저 `DESIGN.md`를 읽고 `npx @google/design.md lint DESIGN.md`로 확인한다.

## 다음 세션 시작 순서

1. `AGENTS.md`와 `.memory-bank/` core 파일을 먼저 읽는다.
2. `git status --short -- stock-alarm .agents/skills/stock-alert-memory-bank`로 변경 범위를 확인한다.
3. publish가 필요하면 `stock-alarm/.superpowers/`와 `stock-alarm/skill-creator-memory.md`를 제품 커밋에 섞지 않는다.
4. Supabase/Provider live 연결을 계속할 때 실제 secret 값을 메모리나 커밋에 남기지 않는다.
5. UI를 더 고치면 `npm test`, `npm run build`, `npx @google/design.md lint DESIGN.md`를 다시 실행한다.
