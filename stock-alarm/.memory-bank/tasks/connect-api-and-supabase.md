# Connect API And Supabase

## Goal

실제 API와 Supabase 연결을 시작할 수 있도록 local API proxy, provider adapter 골격, Supabase client/repository, RLS migration 초안을 추가한다.

## Status

done

## Files to inspect or edit

- `package.json`
- `.env.example`
- `server/`
- `src/lib/`
- `src/App.jsx`
- `supabase/migrations/`
- `.memory-bank/verification-log.md`

## Plan

- Demo Provider 데이터를 `src/lib` 모듈로 분리한다.
- Express local server를 추가하고 `/api/search`, `/api/quotes`, `/api/history`, `/api/market-status`를 만든다.
- Alpha Vantage와 KIS provider adapter 골격을 추가한다. API key가 없으면 setup error를 반환한다.
- Supabase anonymous auth client와 watchlist/rule/event repository를 추가한다.
- `watchlist_items`, `alert_rules`, `alert_events` RLS migration을 작성한다.
- 실제 Supabase 프로젝트 선택과 실제 provider key 입력 전에는 demo fallback으로 앱이 계속 동작하게 한다.

## Verification

- `npm test`: pass, 10 tests.
- `npm run build`: pass.
- `node --check server/index.js && node --check server/providers/alphaVantageProvider.js && node --check server/providers/kisProvider.js`: pass.
- `curl http://127.0.0.1:8787/api/health`: pass.
- `curl /api/search?provider=demo&market=KR&query=삼성`: pass.
- `curl /api/quotes?provider=demo&symbols=AAPL,005930`: pass.
- `curl /api/quotes?provider=alpha-vantage&symbols=AAPL`: expected `PROVIDER_SETUP_REQUIRED` without key.
- Chrome DevTools: mobile 390x844 and desktop 1440x900 horizontal overflow 없음.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.
- `git diff --check -- stock-alarm .agents/skills/stock-alert-memory-bank`: pass.

## Notes for the next session

- 실제 API key, Supabase URL/key, live project id는 메모리 뱅크에 저장하지 않는다.
- 실제 Supabase project에는 아직 migration을 적용하지 않았다.
- UI write path는 아직 repository에 완전히 연결하지 않았고, 이번 단계에서는 API/Supabase 연결 기반과 상태 표시까지 완료했다.
