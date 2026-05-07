# Stock Alarm 제품 요구사항 문서 (PRD)

작성일: 2026-05-07
프로젝트: `stock-alarm`
기준 문서: `2026-05-06-stock-alarm-design.md`
문서 상태: MVP 구현 전 요구사항 초안

이 PRD는 승인된 디자인 스펙을 제품 요구사항 형식으로 재구성한 문서다. 원본 스펙에서 확정된 범위는 그대로 유지하고, 원본에 명시되지 않은 제품 지표와 운영 세부사항은 "PRD 제안값" 또는 "확인 필요"로 표시한다.

## 1. Executive Summary

### Problem Statement

개인 사용자가 미국 및 한국 주식의 가격 변화를 계속 확인하려면 여러 사이트나 앱을 반복적으로 열어야 하며, 원하는 가격 또는 등락률 조건을 놓치기 쉽다. 특히 간단한 개인 모니터링 목적에는 거래 기능이나 포트폴리오 관리가 과하고, API 키를 브라우저에 노출하지 않는 안전한 로컬 구성이 필요하다.

### Proposed Solution

`stock-alarm`은 브라우저가 열려 있는 동안 미국 및 한국 주식을 검색하고, 관심 종목과 알림 규칙을 저장하며, 조건 충족 시 인앱 및 브라우저 알림을 제공하는 개인용 웹 앱이다. React/Vite 프론트엔드, Node/Express 로컬 시장 데이터 프록시, Supabase 익명 인증 및 RLS 기반 저장소를 사용해 첫 버전을 구성한다.

### Success Criteria

다음 기준은 MVP 완료 여부를 판단하기 위한 PRD 제안값이다.

- 사용자는 로컬 환경에서 Supabase 설정과 데모 제공자만으로 앱을 실행하고, 관심 종목 추가부터 알림 이벤트 저장까지의 핵심 흐름을 완료할 수 있다.
- 미국 주식 1개 이상과 한국 주식 1개 이상에 대해 검색, 선택, 차트 표시, 관심 종목 저장이 동작한다.
- 가격 상향, 가격 하향, 일일 등락률 상향, 일일 등락률 하향 규칙이 각각 정상 평가되고, 조건 충족 시 1회의 알림 이벤트가 저장된다.
- 기본 60초 quote polling 주기에서 조건 충족 후 다음 polling cycle 안에 인앱 알림이 표시된다.
- 쿨다운이 설정된 규칙은 `last_triggered_at` 이후 쿨다운 시간이 지나기 전까지 중복 이벤트를 만들지 않는다.
- 브라우저 번들에는 KIS, Alpha Vantage, Polygon, Massive, Supabase `service_role` 같은 서버 또는 관리자 비밀 키가 포함되지 않는다.
- `alertEvaluator` 단위 테스트는 가격/등락률/비활성화/누락 quote/쿨다운 주요 분기를 모두 포함한다.

## 2. User Experience & Functionality

### User Personas

- 개인 모니터링 사용자: 특정 미국 또는 한국 주식의 가격 조건을 놓치지 않기 위해 브라우저를 열어 둔 상태에서 알림을 받고 싶은 사용자.
- 학습 및 데모 사용자: API 프록시, Supabase RLS, 브라우저 알림, 상태 기반 UI를 작은 프로젝트에서 실습하려는 사용자.
- 로컬 개발자: 외부 시장 데이터 API 키를 브라우저에 노출하지 않고 provider adapter 구조로 확장 가능한 앱을 구현하려는 개발자.

### User Stories

#### Story 1: 주식 검색 및 선택

사용자로서, 미국 티커와 한국 종목 코드 또는 회사명으로 주식을 검색하고 선택하고 싶다. 그래야 한 화면에서 최신 가격과 과거 가격 흐름을 확인할 수 있다.

Acceptance Criteria:

- 검색 입력은 미국 티커, 한국 종목 코드, 한국 회사명 검색을 지원한다.
- 검색 결과는 `symbol`, `market`, `exchange`, `displayName`, `currency`, `provider` 정보를 표시할 수 있는 normalized record로 반환된다.
- 검색 결과 선택 시 중앙 패널에 종목명, 최신 가격, 통화, 변화량, 변화율, provider, timestamp가 표시된다.
- unsupported symbol 또는 provider 오류는 전체 대시보드를 깨뜨리지 않고 해당 검색/종목 단위 오류로 표시된다.

#### Story 2: 관심 종목 저장 및 삭제

사용자로서, 자주 확인하는 종목을 관심 종목으로 저장하고 삭제하고 싶다. 그래야 매번 다시 검색하지 않고 반복적으로 모니터링할 수 있다.

Acceptance Criteria:

- Supabase 익명 로그인 이후 관심 종목을 `watchlist_items`에 저장할 수 있다.
- 같은 `user_id`, `symbol`, `market`, `provider` 조합의 중복 active row는 만들지 않는다.
- 관심 종목 삭제 시 해당 종목의 `alert_rules`와 `alert_events`도 함께 삭제된다.
- Supabase 설정이 없거나 익명 인증이 실패하면 저장 기능은 차단되고, 데모 시장 데이터 확인은 가능해야 한다.

#### Story 3: 알림 규칙 생성 및 관리

사용자로서, 가격 또는 일일 등락률 기준으로 상향/하향 알림을 만들고 켜거나 끄고 싶다. 그래야 내가 정한 조건만 반복적으로 확인할 수 있다.

Acceptance Criteria:

- 지원 규칙은 `price above`, `price below`, `daily_change_percent above`, `daily_change_percent below` 네 가지다.
- 각 규칙은 `threshold_value`, `cooldown_minutes`, `enabled` 상태를 가진다.
- 비활성화된 규칙은 평가하지 않는다.
- 가격 규칙은 차트에 수평 threshold line으로 표시된다.
- 일일 등락률 규칙은 기본적으로 알림 패널에 표시하고, `previousClose` 기반 현재가 환산이 가능한 경우에만 가격선 표시를 고려한다.

#### Story 4: 브라우저가 열려 있는 동안 알림 수신

사용자로서, 앱을 켜 둔 동안 조건이 충족되면 인앱 알림과 가능한 경우 브라우저 알림을 받고 싶다. 그래야 별도의 백그라운드 서버 없이도 개인 모니터링을 할 수 있다.

Acceptance Criteria:

- 첫 버전의 alert evaluation은 브라우저에서 실행된다.
- 기본 quote polling interval은 60초다.
- 조건 충족 및 쿨다운 통과 시 인앱 알림을 표시하고 `alert_events` row를 추가한다.
- 브라우저 Notification permission이 granted이면 브라우저 알림도 표시한다.
- Notification permission이 denied여도 인앱 알림과 이벤트 저장은 계속 동작한다.
- 브라우저가 닫힌 상태의 백그라운드 알림은 MVP 범위에 포함하지 않는다.

#### Story 5: 알림 이력 확인 및 처리

사용자로서, 최근 발생한 알림을 보고 확인 처리하고 싶다. 그래야 어떤 조건이 언제 충족됐는지 나중에 확인할 수 있다.

Acceptance Criteria:

- 최근 알림 패널은 `alert_events`의 symbol, message, triggered value, created time, acknowledged state를 보여준다.
- 알림 확인 처리는 `acknowledged_at`을 업데이트한다.
- 새 이벤트는 조건 충족과 쿨다운 통과가 모두 만족될 때만 생성된다.

#### Story 6: 데이터 출처와 상태 이해

사용자로서, 현재 가격 데이터가 실시간인지 지연인지 샘플인지, 또는 시장이 닫혔는지 알고 싶다. 그래야 알림과 차트를 올바른 맥락에서 해석할 수 있다.

Acceptance Criteria:

- quote와 history 응답은 `provider`, `isDelayed`, `isSample`, `timestamp`를 UI에 표시할 수 있어야 한다.
- demo provider 데이터는 UI에서 sample data로 명확히 표시한다.
- provider rate limit 상태는 사용자가 볼 수 있게 표시하고 polling을 늦추거나 일시 정지한다.
- market closed 상태는 market status와 quote timestamp를 함께 보여준다.
- sample data와 real provider data를 조용히 섞어 보여주지 않는다.

### Non-Goals

- 브라우저가 닫힌 상태의 백그라운드 알림.
- 이메일, SMS, 서버 push, 모바일 push 알림.
- 증권사 거래, 주문, 계좌 잔고, 보유 종목 연동.
- Supabase 익명 사용자 분리 이상의 계정 관리.
- 투자 조언, 매수/매도 추천, 예측 로직.
- exchange-grade 실시간 데이터 보장.
- 첫 버전에서 모든 시장 데이터 provider를 완성하는 것.
- 운영용 SaaS 배포, 결제, 팀 기능, 관리자 화면.

## 3. AI System Requirements

이 제품의 MVP에는 생성형 AI, 모델 추론, RAG, LLM 기반 의사결정 기능이 포함되지 않는다.

### Tool Requirements

- AI 도구 요구사항은 해당 없음.
- 시장 데이터 도구 요구사항은 provider adapter와 외부 API 연동 요구사항으로 `Technical Specifications`에 정의한다.

### Evaluation Strategy

- AI 출력 품질 평가는 해당 없음.
- 대신 알림 평가 정확도는 deterministic unit test로 검증한다.
- provider normalized response 품질은 대표 mock response와 error payload fixture로 검증한다.

## 4. Technical Specifications

### Architecture Overview

MVP는 세 부분으로 나뉜다.

- Frontend: React + Vite 단일 페이지 대시보드.
- Local server: Node + Express 기반 시장 데이터 API proxy.
- Storage: Supabase anonymous auth + RLS 기반 사용자 데이터 저장소.

데이터 흐름:

1. 브라우저가 Supabase anonymous auth로 사용자 세션을 만든다.
2. 브라우저가 Supabase에서 watchlist, alert rules, alert events를 읽는다.
3. 브라우저가 시장 데이터 요청을 local server endpoint로 보낸다.
4. local server가 provider adapter를 통해 KIS, Alpha Vantage 또는 demo provider를 호출한다.
5. local server가 provider-specific payload를 normalized response로 변환한다.
6. 브라우저가 quote polling 결과로 alert rules를 평가한다.
7. 트리거된 알림은 인앱/브라우저 알림으로 표시되고 Supabase에 `alert_events`로 저장된다.

### Main Interface

첫 버전은 반복 모니터링에 최적화된 단일 대시보드다.

- Left panel: 검색 입력, 검색 결과, 관심 종목.
- Center panel: 선택 종목 정보, 최신 가격, 차트, range tabs.
- Right panel: 알림 규칙, 쿨다운 상태, 최근 알림 이력.

Mobile behavior:

- 패널은 세로로 stack된다.
- 관심 종목과 알림 영역은 접을 수 있어야 한다.
- 선택 종목과 차트가 모바일에서 우선적으로 확인 가능해야 한다.

### Integration Points

Browser to local server endpoints:

- `GET /api/search?query=&market=`
- `GET /api/quotes?symbols=`
- `GET /api/history?symbol=&range=`
- `GET /api/market-status?market=`

Provider adapter interface:

- `searchSymbols(query, market)`
- `getQuotes(symbols)`
- `getHistory(symbol, range)`
- `getMarketStatus(market)`

Initial providers:

- Korean stocks: KIS Open API adapter.
- US stocks: Alpha Vantage adapter.
- Fallback: demo provider with explicit sample-data labeling.

Later provider candidates:

- Polygon 또는 Massive 같은 더 안정적인 유료 US provider.

### Normalized Data Contracts

Symbol record:

- `symbol`
- `market`
- `exchange`
- `displayName`
- `currency`
- `provider`

Quote record:

- `symbol`
- `market`
- `price`
- `currency`
- `change`
- `changePercent`
- `previousClose`
- `timestamp`
- `provider`
- `isDelayed`
- `isSample`

History record:

- `symbol`
- `range`
- `bars`: `time`, `open`, `high`, `low`, `close`, optional `volume`
- `provider`
- `isSample`

### Supabase Data Model

All user-data tables must enable RLS and restrict rows by `user_id = auth.uid()`.

`watchlist_items`:

- Purpose: 저장된 관심 종목.
- Required columns: `id`, `user_id`, `symbol`, `market`, `provider`, `display_name`, `currency`, `exchange`, `created_at`.
- Key rules: user/provider/symbol/market 단위 중복 방지, 삭제 시 관련 rules/events cascade delete.

`alert_rules`:

- Purpose: 알림 조건과 쿨다운 상태.
- Required columns: `id`, `watchlist_item_id`, `user_id`, `rule_type`, `operator`, `threshold_value`, `cooldown_minutes`, `last_triggered_at`, `enabled`, `created_at`, `updated_at`.
- Allowed values: `rule_type`은 `price` 또는 `daily_change_percent`; `operator`는 `above` 또는 `below`.
- Key rules: disabled rule 미평가, cooldown 통과 전 중복 trigger 금지.

`alert_events`:

- Purpose: 알림 발생 이력.
- Required columns: `id`, `alert_rule_id`, `user_id`, `symbol`, `triggered_value`, `message`, `created_at`, `acknowledged_at`.
- Key rules: trigger와 cooldown 통과 시에만 생성, acknowledge 시 `acknowledged_at` 업데이트.

### Alert Evaluation Logic

- 평가 위치: browser runtime.
- 기본 polling interval: 60초.
- local server는 provider call 절약을 위해 short TTL cache를 사용할 수 있다.
- rate-limit 오류가 발생하면 해당 provider polling을 늦추거나 pause하고 UI에 상태를 표시한다.
- quote missing value는 crash가 아니라 평가 skip 또는 symbol-level 오류로 처리한다.
- `last_triggered_at` update와 `alert_events` insert는 동일 trigger 흐름 안에서 수행한다.

### Component Boundaries

Frontend components:

- `SearchPanel`: 검색 입력과 결과.
- `Watchlist`: 저장 종목과 quick status.
- `StockDetail`: 선택 종목 헤더와 최신 quote.
- `PriceChart`: historical line chart와 threshold lines.
- `AlertRuleForm`: 알림 규칙 생성 및 편집.
- `AlertRuleList`: enabled/disabled 상태와 cooldown 상태.
- `RecentAlerts`: 알림 이벤트 이력.

Frontend modules:

- `stockApiClient`: local server API 호출.
- `supabaseClient`: Supabase 초기화 및 anonymous auth.
- `watchlistRepository`: 관심 종목 저장소.
- `alertRuleRepository`: 알림 규칙 저장소.
- `alertEventRepository`: 알림 이력 저장소.
- `alertEvaluator`: 순수 알림 조건 및 cooldown 로직.

Server modules:

- `routes/search`
- `routes/quotes`
- `routes/history`
- `routes/marketStatus`
- `providers/kisProvider`
- `providers/usMarketProvider`
- `providers/demoProvider`
- `providers/providerTypes`
- `config/env`

### Security & Privacy

- provider secret key는 브라우저 코드에 노출하지 않는다.
- Supabase `service_role` key는 브라우저 코드에 노출하지 않는다.
- browser code는 Supabase publishable 또는 anon credential만 사용한다.
- `.env` 및 local credential 파일은 git에 포함하지 않는다.
- 모든 user-data table은 RLS를 켜고 `auth.uid()` 기준 policy를 사용한다.
- RLS는 사용자가 수정 가능한 metadata를 신뢰하지 않는다.
- MVP는 투자 조언을 제공하지 않으며, 제품 UI 또는 README에 "not investment advice" 성격을 명확히 해야 한다.

### Testing Requirements

Unit tests:

- `alertEvaluator`: price above, price below, percent above, percent below.
- `alertEvaluator`: disabled rules, missing quote values, cooldown behavior.
- provider normalizers: representative success response와 error payload.

Integration checks:

- local server endpoints가 normalized search, quote, history, market status shape를 반환한다.
- provider API key 누락 시 setup error를 보여주고 crash하지 않는다.
- demo provider만으로 앱의 핵심 흐름을 실행할 수 있다.
- Supabase anonymous sign-in, watchlist 저장, alert rule 저장, alert event 저장이 동작한다.

Manual browser checklist:

- 미국 demo symbol과 한국 demo symbol을 검색할 수 있다.
- 관심 종목 추가 및 삭제가 동작한다.
- 가격 및 등락률 alert rule을 만들 수 있다.
- 차트 range 전환 시 레이아웃이 크게 흔들리지 않는다.
- 가격 threshold line이 price rule에 맞게 표시된다.
- Notification permission 요청이 사용자의 알림 기능 사용 맥락에서 나타난다.
- demo quote가 rule을 넘으면 인앱 알림이 표시된다.
- alert event가 Supabase에 저장되고 recent alerts에 표시된다.
- cooldown이 반복 알림을 막는다.
- provider 오류와 sample data 상태가 UI에 명확히 보인다.

## 5. Risks & Roadmap

### Phased Rollout

MVP:

- 단일 대시보드.
- demo provider + 실제 provider adapter skeleton.
- Supabase anonymous auth, RLS, watchlist/rules/events 저장.
- 브라우저 open-only alert evaluation.
- price 및 daily percent alert rules.
- chart range와 price threshold line.
- provider status, sample-data labeling, 기본 error state.

v1.1:

- KIS와 Alpha Vantage 실제 연동 안정화.
- provider quota/backoff/cache 정책 정교화.
- Supabase schema migration과 RLS policy 자동화.
- Playwright 기반 핵심 브라우저 흐름 E2E.
- market calendar, timezone, holiday 처리 강화.
- accessibility와 mobile responsive QA 기준 추가.

v2.0:

- 서버 기반 백그라운드 알림 옵션.
- email, push, mobile notification 연동.
- paid/stable market data provider 확장.
- 사용자 계정, 기기 간 동기화, alert delivery preference.
- 고급 rule 조합, 그룹화, bulk edit.

### Technical Risks

- Provider rate limit: 무료 또는 제한된 API는 quote polling에 쉽게 걸릴 수 있다. Mitigation: short TTL cache, batch quote endpoint, provider별 backoff, visible limited state.
- Provider latency and delay: 실시간성이 provider마다 다르다. Mitigation: `timestamp`, `isDelayed`, market status를 항상 노출한다.
- KIS authentication complexity: 한국투자증권 API는 인증, app key, token lifecycle이 구현 난도를 높일 수 있다. Mitigation: provider adapter를 분리하고 demo provider로 UI 개발을 unblock한다.
- Timezone and market calendar errors: 미국/한국 시장 시간, 휴장일, daylight saving 처리가 알림 신뢰도에 영향을 준다. Mitigation: market status endpoint와 provider timestamp를 기준으로 UI copy를 명확히 한다.
- Supabase RLS misconfiguration: 익명 사용자 데이터가 섞이거나 접근이 막힐 수 있다. Mitigation: migration에 RLS policy test와 최소 권한 정책을 포함한다.
- Browser notification permission denial: 사용자가 권한을 거부하면 알림 도달성이 낮아진다. Mitigation: 인앱 알림과 event history를 항상 제공한다.
- Local server setup friction: API key와 Supabase config가 누락되면 초보 사용자가 막힐 수 있다. Mitigation: `.env.example`, setup status panel, demo mode를 제공한다.
- Silent sample-data confusion: 데모 데이터와 실데이터가 섞이면 사용자가 오해할 수 있다. Mitigation: sample label과 provider source를 모든 관련 UI에 표시한다.

### 누락 및 보완 사항 점검

원본 디자인 스펙은 MVP 범위, 아키텍처, 데이터 모델, alert evaluation, 보안, 테스트 체크리스트가 비교적 명확하다. PRD 관점에서 보완이 필요한 항목은 아래와 같다.

보완해서 PRD에 반영한 항목:

- 성공 기준: 원본에는 제품 완료 여부를 판단할 KPI가 별도로 없어서 MVP completion 기준을 추가했다.
- 사용자 persona와 user story: 원본의 기능 흐름을 persona, story, acceptance criteria로 재구성했다.
- 단계별 rollout: MVP, v1.1, v2.0 범위를 분리해 후속 작업 경계를 명확히 했다.
- 기술 리스크: provider rate limit, KIS 인증, timezone, Supabase RLS, permission denial을 명시했다.
- 투자 조언 아님 고지: out-of-scope 내용을 security/privacy 요구사항에도 반영했다.

추가 결정이 필요한 항목:

- 정확한 Supabase schema type, index, unique constraint, cascade FK, migration 파일 구조.
- RLS policy SQL과 policy test 방식.
- KIS와 Alpha Vantage의 실제 rate limit, token refresh, retry/backoff, cache TTL 수치.
- market calendar source, 휴장일 처리, daylight saving 처리 방식.
- Notification permission 요청 타이밍, 재요청 UX, browser별 fallback copy.
- chart library 최종 선택과 threshold line 구현 제약.
- local server 실행 포트, env validation, setup status UI의 구체적인 copy.
- alert event 보존 기간, 익명 사용자 데이터 초기화/삭제 정책.
- accessibility 목표치와 mobile viewport acceptance 기준.
- 구현 후 자동화할 E2E 범위와 CI 실행 방식.

### Open Questions For Implementation Planning

- MVP에서 실제 KIS와 Alpha Vantage 연동을 모두 완료해야 하는가, 아니면 demo provider와 adapter contract를 먼저 완성한 뒤 실제 provider를 v1.1로 미룰 수 있는가?
- Supabase 프로젝트는 기존 프로젝트를 사용할 것인가, 아니면 `stock-alarm` 전용 새 프로젝트를 만들 것인가?
- 브라우저 알림 권한 요청은 첫 alert rule 생성 직후에 할 것인가, 첫 trigger 직전에 할 것인가?
- 첫 구현에서 chart library는 Recharts를 기본값으로 확정할 것인가?
- 한국/미국 시장별 market status는 provider API 값에 의존할 것인가, 별도 calendar utility를 둘 것인가?
