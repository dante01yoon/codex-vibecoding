# Verification Log

마지막 업데이트: 2026-05-10

## 2026-05-10

작업: 실제 Market API 사용 경로 활성화

명령:

```bash
npm test
npm run build
node --check server/index.js && node --check server/providers/alphaVantageProvider.js && node --check server/providers/kisProvider.js
STOCK_API_PORT=8790 ALPHA_VANTAGE_API_KEY=demo node server/index.js
curl -sS 'http://127.0.0.1:8790/api/health'
curl -sS 'http://127.0.0.1:8790/api/quotes?provider=alpha-vantage&market=US&symbols=IBM'
curl -sS 'http://127.0.0.1:8790/api/search?provider=alpha-vantage&market=US&query=IBM'
curl -sS 'http://127.0.0.1:8790/api/quotes?provider=kis&market=KR&symbols=005930'
curl -sS 'http://127.0.0.1:8787/api/quotes?provider=auto&market=US&symbols=AAPL'
curl -sS 'http://127.0.0.1:8787/api/history?provider=auto&market=US&symbol=AAPL&range=1M'
npx @google/design.md lint DESIGN.md
git diff --check -- .gitignore stock-alarm .agents/skills/stock-alert-memory-bank
```

결과:

- `npm test`: pass, 10 tests.
- `npm run build`: pass.
- `node --check ...`: pass.
- API health: pass, provider readiness에 `alphaVantage: true`, `kis: false` 반환.
- Alpha Vantage IBM quote: pass, 실제 Alpha Vantage 응답을 normalized quote로 반환.
- Alpha Vantage search with demo key: expected `ALPHA_VANTAGE_LIMITED`.
- KIS quote without KIS env: expected `PROVIDER_SETUP_REQUIRED`.
- Auto quote/history without key: pass, demo fallback 200 반환.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.
- `git diff --check -- .gitignore stock-alarm .agents/skills/stock-alert-memory-bank`: pass.
- Chrome DevTools mobile reload: `/api/*provider=auto` 요청이 200/304로 응답, console error 없음, horizontal overflow 없음.

메모:

- 실제 key/token 값은 기록하지 않았다.
- 검증용 임시 API 서버는 종료했다.

## 2026-05-10

작업: API/Supabase 연결 1차 구현

명령:

```bash
npm test
npm run build
node --check server/index.js && node --check server/providers/alphaVantageProvider.js && node --check server/providers/kisProvider.js
curl -sS 'http://127.0.0.1:8787/api/health'
curl -sS 'http://127.0.0.1:8787/api/search?provider=demo&market=KR&query=%EC%82%BC%EC%84%B1'
curl -sS 'http://127.0.0.1:8787/api/quotes?provider=demo&symbols=AAPL,005930'
curl -sS 'http://127.0.0.1:8787/api/quotes?provider=alpha-vantage&symbols=AAPL'
npx @google/design.md lint DESIGN.md
git diff --check -- stock-alarm .agents/skills/stock-alert-memory-bank
```

결과:

- `npm test`: pass, 10 tests.
- `npm run build`: pass, Vite production build 성공.
- `node --check ...`: pass.
- API health: pass, Demo/Alpha Vantage/KIS provider 목록 반환.
- Demo search: pass, `005930` 삼성전자 반환.
- Demo quotes: pass, `AAPL`, `005930` quote 반환.
- Alpha Vantage without key: expected `PROVIDER_SETUP_REQUIRED`.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.
- `git diff --check -- stock-alarm .agents/skills/stock-alert-memory-bank`: pass.

브라우저 확인:

- Chrome DevTools로 `http://127.0.0.1:5175/` 확인.
- status bar에 `Demo provider 연결됨`, `Supabase env 없음` 표시 확인.
- DevTools network에서 `/api/health`, `/api/search`, `/api/quotes`, `/api/history` 요청 확인.
- 데모 평가 버튼 클릭 후 `쿨다운 중 1개 · 방금` 상태 표시 확인.
- desktop 1440x900: horizontal overflow 없음, clipped text 없음.
- mobile 390x844: horizontal overflow 없음, clipped text 없음.
- console error/warn 없음.

## 2026-05-10

작업: Demo alert evaluator 현재 상태 확인

명령:

```bash
npm test
npm run build
npx @google/design.md lint DESIGN.md
```

결과:

- `npm test`: pass, 7 tests.
- `npm run build`: pass, Vite production build 성공.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.

브라우저 확인:

- `http://127.0.0.1:5175/`에서 렌더링 확인.
- 초기 상태: `아직 평가 전`, `인앱 알림 우선`, 브라우저 알림 버튼 표시 확인.
- permission prompt는 실제 승인하지 않았고, denied/unsupported는 copy helper 구현까지만 확인함.
- 데모 평가 1회: 기존 AAPL percent rule은 cooldown 상태로 표시됨.
- AAPL price below 190 rule을 추가한 뒤 데모 평가: 최근 알림에 새 event 표시됨.
- 같은 평가를 다시 실행하면 cooldown이 중복 알림을 막음.
- mobile 390x844: horizontal overflow 없음.
- desktop 1440x950: search/detail/alert 3-column layout 표시, horizontal overflow 없음.
- reload 후 console error와 page error 없음.

## 2026-05-10

작업: `AGENTS.md`에 memory bank 사용 규칙 추가

명령:

```bash
git diff --check -- stock-alarm/AGENTS.md stock-alarm/.memory-bank
```

결과:

- pass.

## 2026-05-10

작업: 최근 알림 확인 UX 추가

명령:

```bash
npm test
npm run build
npx @google/design.md lint DESIGN.md
git diff --check -- stock-alarm .agents/skills/stock-alert-memory-bank
```

결과:

- `npm test`: pass, 7 tests.
- `npm run build`: pass, Vite production build 성공.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.
- `git diff --check -- stock-alarm .agents/skills/stock-alert-memory-bank`: pass.

브라우저 확인:

- Chrome DevTools로 `http://127.0.0.1:5175/` 확인.
- desktop 1440x950: 단일 `확인` 클릭 시 `확인됨`, `확인 방금` 표시 확인.
- desktop 1440x950: 새 demo alert 2개 생성 후 `모두 확인` 클릭 시 모든 미확인 알림이 확인 상태로 변경되고 `모두 확인` 버튼이 사라짐.
- desktop 1440x950: horizontal overflow 없음.
- mobile 390x844: horizontal overflow 없음.
- Notification denied 상태를 init script로 흉내 냈을 때도 `브라우저 알림 차단 · 인앱 알림 활성` copy와 인앱 alert event 생성 확인.
- console error 없음.
