# AGENTS.md

## Project

이 프로젝트는 React + Tailwind로 만드는 개인용 주식 알림 앱입니다.

사용자는 미국 및 한국 주식을 검색하고, 관심 종목을 저장하고, 가격/등락률 기준 알림 규칙을 만들고, 브라우저가 열려 있는 동안 인앱 알림과 브라우저 알림을 받을 수 있습니다.

이 앱은 투자 자문, 종목 추천, 매수/매도 실행, 포트폴리오 수익률 관리 도구가 아닙니다.

## Required Reading

작업 전에 다음 문서를 먼저 읽습니다.

- `DESIGN.md`: UI 작업의 필수 기준입니다.
- `docs/superpowers/specs/2026-05-07-stock-alarm-prd.md`: 제품 요구사항 기준입니다.
- `docs/superpowers/specs/2026-05-06-stock-alarm-design.md`: 최초 승인된 제품/아키텍처 범위입니다.
- `.memory-bank/project-brief.md`: 프로젝트 요약과 현재 학습 범위입니다.
- `.memory-bank/active-context.md`: 최근 작업 상태와 다음 세션 시작 순서입니다.
- `.memory-bank/progress.md`: `done`, `in progress`, `blocked`, `next` 기준 진행 상태입니다.
- `.memory-bank/decision-log.md`: 오래 유지해야 하는 결정 기록입니다.
- `.memory-bank/next-actions.md`: 바로 이어갈 수 있는 작은 작업 목록입니다.
- `.memory-bank/verification-log.md`: 실행한 검증과 남은 확인입니다.

## Memory Bank Rule

이 프로젝트에서 새 세션을 시작하거나, 작업을 이어가거나, 작은 구현 작업을 준비하거나, 완료한 작업을 요약할 때는 `$stock-alert-memory-bank` 스킬을 사용합니다.

스킬 위치:

- `/Users/dante/Desktop/codex-vibecoding/.agents/skills/stock-alert-memory-bank/SKILL.md`

메모리 뱅크 사용 규칙:

- 작업 전에는 위 Required Reading 문서와 `.memory-bank/` 파일을 가능한 범위에서 읽습니다.
- 구현 작업 전에는 `.memory-bank/tasks/` 아래에 작은 task card를 만들거나 기존 task card를 갱신합니다.
- 작업 후에는 `active-context.md`, `progress.md`, `decision-log.md`, `next-actions.md`, `verification-log.md`, 관련 task card를 짧게 갱신합니다.
- 메모리 노트는 입문자가 이어받기 쉽게 짧은 한국어로 유지합니다.
- secret, API key, token, private account data, `.env` 내용은 메모리 뱅크에 저장하지 않습니다.

## UI Work Rule

UI, React component, Tailwind class, layout, chart, alert state, copy를 수정하기 전에는 반드시 `DESIGN.md`를 읽고 그 규칙을 따릅니다.

특히 다음 작업은 `DESIGN.md` 확인 없이 진행하지 않습니다.

- 색상 token 또는 Tailwind theme 변경
- typography, spacing, radius 변경
- dashboard layout 변경
- search/watchlist/selected stock/alert panel component 구현
- chart library 또는 chart visual 변경
- alert, loading, empty, error, permission state 구현
- 투자 자문처럼 보일 수 있는 문구 작성

UI 관련 변경 후에는 가능한 경우 아래 lint를 실행합니다.

```bash
npx @google/design.md lint DESIGN.md
```

lint error 또는 warning이 생기면 UI 구현보다 먼저 `DESIGN.md` 형식을 고칩니다.

## Product Shape

첫 버전은 단일 dashboard입니다.

- Left rail: 종목 검색, 검색 결과, 관심 종목
- Center workspace: 선택 종목 정보, 최신 가격, chart, range controls
- Right rail: 알림 규칙, cooldown state, 최근 알림 이력

모바일에서는 선택 종목과 chart가 우선적으로 보여야 합니다.

## Design Boundaries

다음은 금지합니다.

- 투자 조언, 종목 추천, 예측, 등급, trading signal
- buy/sell button, 주문 UI, portfolio P/L 중심 dashboard
- 기본 candlestick/OHLC chart, order book, depth chart, tick terminal
- neon black trading terminal 스타일
- 깜빡이는 red/green price tile 또는 압박성 animation
- 실제 dashboard 앞에 marketing landing page 만들기

## Implementation Guidance

- 작고 집중된 변경을 우선합니다.
- 구현 전에 확인하거나 수정할 파일을 간단히 설명합니다.
- UI component는 provider-specific payload가 아니라 normalized data를 소비해야 합니다.
- form은 controlled component로 구현합니다.
- 금융 숫자에는 tabular number 스타일을 사용합니다.
- icon-only control에는 accessible label과 tooltip을 둡니다.
- loading, empty, error, disabled, cooldown, permission, triggered state를 빠뜨리지 않습니다.
- 새 UI library 또는 chart library는 사용자가 요청했거나 구현 계획에서 명시된 경우에만 추가합니다.

## Security Rules

- provider secret key를 browser code에 넣지 않습니다.
- Supabase `service_role` key를 browser code에 넣지 않습니다.
- browser demo에는 Supabase anon/publishable key만 사용하고 RLS를 전제로 합니다.
- `.env`와 실제 credential 파일은 git에 포함하지 않습니다.

## Verification

작업 후 다음을 확인합니다.

- `DESIGN.md` 규칙을 위반하지 않았는지 확인합니다.
- UI 변경이 있으면 `npx @google/design.md lint DESIGN.md`를 실행합니다.
- desktop과 mobile에서 layout이 겹치거나 넘치지 않는지 확인합니다.
- sample/delayed/market closed/rate limited/provider error 상태가 보이는지 확인합니다.
- 투자 자문 또는 매매 지시처럼 읽히는 문구가 없는지 확인합니다.
