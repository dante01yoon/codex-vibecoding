# Real Market API Setup

마지막 업데이트: 2026-05-10

## 목표

브라우저에는 provider secret을 넣지 않고, 로컬 `server/` API proxy가 실제 주식 provider를 호출하게 한다.

현재 provider mode는 `.env`의 `VITE_MARKET_DATA_PROVIDER`로 고른다.

- `demo`: 샘플 데이터만 사용한다.
- `auto`: 미국 종목은 Alpha Vantage, 한국 종목은 KIS를 시도한다. 설정이 없거나 실패하면 해당 시장만 demo 데이터로 내려간다.
- `alpha-vantage`: Alpha Vantage를 강제로 사용한다.
- `kis`: KIS를 강제로 사용한다.

## 1. `.env` 만들기

`stock-alarm/.env.example`을 참고해서 `stock-alarm/.env`를 만든다. 실제 값은 커밋하지 않는다.

```bash
VITE_MARKET_DATA_PROVIDER=auto
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_APP_KEY=your_kis_app_key
KIS_APP_SECRET=your_kis_app_secret
KIS_ACCESS_TOKEN=your_kis_access_token
```

## 2. 서버와 앱 실행

```bash
npm run dev:full
```

또는 분리해서 실행한다.

```bash
npm run dev:server
npm run dev
```

## 3. API 직접 확인

Alpha Vantage 키가 있으면:

```bash
curl 'http://127.0.0.1:8787/api/quotes?provider=alpha-vantage&market=US&symbols=AAPL'
curl 'http://127.0.0.1:8787/api/search?provider=alpha-vantage&market=US&query=Apple'
curl 'http://127.0.0.1:8787/api/history?provider=alpha-vantage&market=US&symbol=AAPL&range=1M'
```

KIS token이 있으면:

```bash
curl 'http://127.0.0.1:8787/api/quotes?provider=kis&market=KR&symbols=005930'
```

앱 기본값인 `auto`를 확인하려면:

```bash
curl 'http://127.0.0.1:8787/api/quotes?provider=auto&market=US&symbols=AAPL'
curl 'http://127.0.0.1:8787/api/quotes?provider=auto&market=KR&symbols=005930'
```

## 4. 현재 제한

- KIS는 현재 exact KRX code quote만 연결되어 있다. KIS 검색과 daily history는 후속 작업이다.
- Alpha Vantage free key는 rate limit이 낮을 수 있다. rate limit 또는 key 오류가 나면 앱은 해당 시장을 demo 데이터로 표시한다.
- provider secret은 반드시 `server/` 프로세스의 env에만 둔다. `VITE_` prefix로 provider secret을 만들지 않는다.
