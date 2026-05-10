# Enable Real Market API

## Goal

앱이 demo provider 고정이 아니라 `.env` 설정에 따라 실제 Alpha Vantage/KIS provider를 호출할 수 있게 만든다.

## Status

done

## Files to inspect or edit

- `.env.example`
- `src/App.jsx`
- `src/lib/stockApiClient.js`
- `server/providers/`
- `docs/api-setup.md`
- `.memory-bank/verification-log.md`

## Plan

- `VITE_MARKET_DATA_PROVIDER=auto` 설정을 추가한다.
- 앱의 search/quote/history 호출에서 `demo` 고정을 제거한다.
- watchlist quote는 시장별로 나누어 `auto` provider를 호출한다.
- 실제 provider가 key/token 미설정 또는 rate limit이면 해당 시장만 demo fallback으로 표시한다.
- 실제 API 사용법 문서를 추가한다.

## Verification

- `npm test`: pass, 10 tests.
- `npm run build`: pass.
- `node --check server/index.js && node --check server/providers/alphaVantageProvider.js && node --check server/providers/kisProvider.js`: pass.
- `STOCK_API_PORT=8790 ALPHA_VANTAGE_API_KEY=demo node server/index.js`로 임시 서버 실행.
- `curl /api/health`: pass, `alphaVantage: true`, `kis: false` readiness 반환.
- `curl /api/quotes?provider=alpha-vantage&market=US&symbols=IBM`: pass, 실제 Alpha Vantage 응답을 normalized quote로 반환.
- `curl /api/search?provider=alpha-vantage&market=US&query=IBM`: demo key 제한으로 expected `ALPHA_VANTAGE_LIMITED`.
- `curl /api/quotes?provider=kis&market=KR&symbols=005930`: expected `PROVIDER_SETUP_REQUIRED`.
- `curl /api/quotes?provider=auto&market=US&symbols=AAPL`: pass, missing Alpha key에서 demo fallback 200 반환.
- `curl /api/history?provider=auto&market=US&symbol=AAPL&range=1M`: pass, missing Alpha key에서 demo fallback 200 반환.
- Chrome DevTools reload: `/api/*provider=auto`가 200/304로 응답하고 console error 없음.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.
- `git diff --check -- .gitignore stock-alarm .agents/skills/stock-alert-memory-bank`: pass.

## Notes for the next session

- 실제 API key/token 값은 메모리 뱅크와 커밋에 저장하지 않는다.
- 실제 local 사용은 `stock-alarm/.env`에 `VITE_MARKET_DATA_PROVIDER=auto`와 provider key/token을 넣고 `npm run dev:full`로 시작한다.
- `provider=auto`는 서버에서 demo fallback까지 처리해서 browser console에 expected 503 noise가 남지 않는다.
- KIS는 현재 quote만 연결되어 있고, 검색/history는 후속 작업이다.
