---
version: "alpha"
name: "Stock Alarm"
description: "Calm personal stock monitoring dashboard for US and Korean stock alerts."
colors:
  primary: "#2563EB"
  secondary: "#334155"
  tertiary: "#D97706"
  neutral: "#F8FAFC"
  bg-app: "#F8FAFC"
  bg-surface: "#FFFFFF"
  bg-surface-muted: "#F1F5F9"
  border-default: "#E2E8F0"
  border-strong: "#CBD5E1"
  text-primary: "#0F172A"
  text-secondary: "#334155"
  text-muted: "#64748B"
  text-subtle: "#94A3B8"
  brand-primary: "#2563EB"
  brand-primary-hover: "#1D4ED8"
  monitoring-active: "#0F766E"
  alert-threshold: "#D97706"
  alert-triggered: "#DC2626"
  success: "#16A34A"
  warning: "#D97706"
  info: "#2563EB"
  sample: "#7C3AED"
  chart-grid: "#E2E8F0"
  chart-crosshair: "#94A3B8"
typography:
  page-title:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: "700"
    lineHeight: "32px"
    letterSpacing: "0px"
  primary-price:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: "700"
    lineHeight: "36px"
    letterSpacing: "0px"
    fontFeature: "tabular-nums"
  section-title:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: "600"
    lineHeight: "28px"
    letterSpacing: "0px"
  body:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "20px"
    letterSpacing: "0px"
  dense-body:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: "500"
    lineHeight: "18px"
    letterSpacing: "0px"
  caption:
    fontFamily: "Inter, Noto Sans KR, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: "500"
    lineHeight: "16px"
    letterSpacing: "0px"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  app-shell:
    backgroundColor: "{colors.bg-app}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
  surface-panel:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  muted-panel:
    backgroundColor: "{colors.bg-surface-muted}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  border-default:
    backgroundColor: "{colors.border-default}"
  border-strong:
    backgroundColor: "{colors.border-strong}"
  primary-action:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "40px"
  primary-action-hover:
    backgroundColor: "{colors.brand-primary-hover}"
    textColor: "{colors.bg-surface}"
  selected-data:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.bg-surface}"
  monitoring-badge:
    backgroundColor: "{colors.monitoring-active}"
    textColor: "{colors.bg-surface}"
    rounded: "{rounded.md}"
  threshold-badge:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
  threshold-line:
    backgroundColor: "{colors.alert-threshold}"
  triggered-alert:
    backgroundColor: "{colors.alert-triggered}"
    textColor: "{colors.bg-surface}"
    rounded: "{rounded.md}"
  success-badge:
    backgroundColor: "{colors.success}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
  warning-banner:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
  info-banner:
    backgroundColor: "{colors.info}"
    textColor: "{colors.bg-surface}"
    rounded: "{rounded.lg}"
  sample-badge:
    backgroundColor: "{colors.sample}"
    textColor: "{colors.bg-surface}"
    rounded: "{rounded.md}"
  chart-grid:
    backgroundColor: "{colors.chart-grid}"
  chart-crosshair:
    backgroundColor: "{colors.chart-crosshair}"
  muted-text:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.text-muted}"
  subtle-indicator:
    backgroundColor: "{colors.text-subtle}"
  secondary-text:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
---

# Stock Alarm DESIGN.md

상태: 초안
마지막 업데이트: 2026-05-09
프로젝트 루트: `stock-alarm`
대상 독자: React + Tailwind UI를 구현할 AI coding agent와 입문 개발자

관련 문서:

- `docs/superpowers/specs/2026-05-06-stock-alarm-design.md`
- `docs/superpowers/specs/2026-05-07-stock-alarm-prd.md`

> 입문자 메모: 이 문서는 예쁜 화면을 위한 취향 모음이 아니라 UI 구현 계약서입니다. React 컴포넌트를 만들기 전에 이 문서의 색상, 간격, 상태, 문구 규칙을 Tailwind theme, CSS variable, 컴포넌트 props, 상태 처리 로직으로 옮겨야 합니다.

## Overview

이 문서는 Google식 `DESIGN.md`의 취지를 따른다. 즉, 구현 전에 배경, 목표, 비목표, 디자인 결정, 대안, 위험, 검증 기준을 한 곳에 정리한다.

`stock-alarm`은 개인용 주식 알림 웹 앱이다. 사용자는 미국 및 한국 주식을 검색하고, 선택한 종목의 가격과 차트를 보고, 관심 종목과 알림 규칙을 저장하며, 브라우저가 열려 있는 동안 인앱 알림과 브라우저 알림을 받을 수 있다.

이 앱은 증권사 앱, 포트폴리오 관리 앱, 매수/매도 추천 앱, 투자 자문 앱이 아니다.

승인된 첫 버전 화면 구조:

- 왼쪽: 종목 검색, 검색 결과, 관심 종목
- 가운데: 선택 종목 정보, 최신 가격, 차트, 기간 선택
- 오른쪽: 알림 규칙, 쿨다운 상태, 최근 알림 이력

> 입문자 메모: 여기서 "대시보드"는 첫 화면이 바로 실제 작업 화면이라는 뜻입니다. 마케팅 랜딩 페이지, 큰 hero 영역, 후기 섹션, 가격표, CTA 중심 페이지를 먼저 만들지 않습니다.

### UI/UX Pro Max 결과 해석

이번 디자인은 기존 PRD와 UI/UX Pro Max 결과를 함께 반영한다.

- 추천 패턴: real-time monitoring dashboard
- 스타일 방향: 높은 가독성, 낮은 시각 소음, 명확한 상태 피드백
- 색상 방향: 파란색 데이터 accent, 중립 surface, amber/green/red 의미 색상
- 차트 방향: 시간 흐름을 보여주는 line chart, 알림 발생 marker, 가격 규칙 threshold line
- UX 방향: loading, empty, error, recovery, hover, focus, accessibility 상태를 명확히 표시
- React/Tailwind 방향: controlled form, 일관된 card spacing, 안정적인 layout dimension, 측정 후 최적화

UI/UX Pro Max의 넓은 검색 결과에는 OLED dark mode와 친근한 handwritten typography도 포함되어 있었다. 이 앱에서는 기본값으로 채택하지 않는다. 이유는 다음과 같다.

- OLED dark mode를 기본값으로 쓰면 전문 trading terminal처럼 보일 위험이 있다.
- handwritten/friendly font는 금융 데이터의 신뢰도와 다국어 가독성에 맞지 않는다.
- 첫 버전은 light theme 중심의 차분한 개인 모니터링 도구로 만든다.
- dark mode는 나중에 같은 semantic token 체계로 선택 기능으로 추가할 수 있다.

### 목표

- 사용자가 가격과 알림 상태를 한눈에 이해할 수 있게 한다.
- 거래를 부추기는 긴장감이 아니라 차분한 모니터링 느낌을 만든다.
- 데이터 출처, 샘플 여부, 지연 여부, 시장 종료, provider 오류를 숨기지 않는다.
- AI coding agent가 React + Tailwind 컴포넌트를 만들 때 임의의 색상과 간격을 만들지 않게 한다.
- 한국어와 영어 종목명, 통화, 날짜, 숫자가 모두 자연스럽게 읽히게 한다.
- 입문자가 문서를 읽고 "왜 이렇게 디자인하는지" 이해할 수 있게 주석을 함께 둔다.

### 비목표

- 투자 조언, 종목 추천, 가격 예측, 등급 평가, trading signal 제공
- 주문, 매수, 매도, 계좌 잔고, 보유 종목, 수익률 중심 포트폴리오 UI
- 기본 candlestick/OHLC chart, order book, depth chart, heatmap, tick-by-tick terminal
- neon black trading terminal 스타일
- 실제 대시보드 앞에 마케팅 landing page 배치
- 깜빡이는 빨강/초록 가격 타일, 카운트다운 압박, 수익 중심 gamification

### 디자인 원칙

#### 5.1 Calm Monitoring Over Trading Urgency

이 제품은 빠른 매매 결정을 밀어붙이는 도구가 아니라 사용자가 정한 조건을 차분히 확인하는 도구다. 색상, 애니메이션, 문구 모두 긴급성과 투기성을 낮춰야 한다.

#### 5.2 Source Clarity

모든 quote, chart, alert는 데이터 상태를 보여줘야 한다. 실제 provider 데이터인지, 샘플 데이터인지, 지연 데이터인지, 시장 종료 상태인지, rate limit인지, 오류인지 숨기면 안 된다.

#### 5.3 State-First UI

loading, empty, error, disabled, cooldown, permission, triggered 상태는 나중에 붙이는 예외 화면이 아니라 기본 설계의 일부다.

#### 5.4 Glanceable But Not Decorative

화면은 빠르게 훑어볼 수 있어야 하지만 장식적이면 안 된다. 큰 hero 타이포, 배경 blob, 과한 gradient, card 안의 card를 피한다.

#### 5.5 Accessible By Default

색상만으로 의미를 전달하지 않는다. 아이콘, 라벨, 숫자 기호, marker shape, 텍스트를 함께 사용한다.

## Colors

### 6.1 Token 원칙

컴포넌트에서는 임의의 Tailwind 색상을 직접 고르지 말고 semantic token을 사용한다.

> 입문자 메모: semantic token은 `blue-600`처럼 색상 이름을 그대로 쓰는 것이 아니라 `brand-primary`, `alert-triggered`처럼 역할 이름을 붙이는 방식입니다. 나중에 dark mode를 추가하거나 경고 색을 바꿔도 컴포넌트 코드를 덜 고치게 됩니다.

### 6.2 Light Theme Tokens

첫 버전 기본 theme은 light theme이다.

| Token | Hex | 용도 |
| --- | --- | --- |
| `bg-app` | `#F8FAFC` | 전체 페이지 배경 |
| `bg-surface` | `#FFFFFF` | 패널, 폼, 반복 list item |
| `bg-surface-muted` | `#F1F5F9` | empty state, disabled background, subtle row |
| `border-default` | `#E2E8F0` | 패널과 control 기본 border |
| `border-strong` | `#CBD5E1` | active 또는 selected border |
| `text-primary` | `#0F172A` | 본문 주요 텍스트와 heading |
| `text-secondary` | `#334155` | label, 보조 텍스트 |
| `text-muted` | `#64748B` | metadata, helper text |
| `text-subtle` | `#94A3B8` | timestamp, placeholder |
| `brand-primary` | `#2563EB` | primary action, selected stock, main chart line |
| `brand-primary-hover` | `#1D4ED8` | primary action hover |
| `monitoring-active` | `#0F766E` | 활성 모니터링, enabled rule |
| `alert-threshold` | `#D97706` | threshold line, warning emphasis |
| `alert-triggered` | `#DC2626` | triggered alert, destructive action, blocking error |
| `success` | `#16A34A` | positive movement, 저장 성공, 확인됨 |
| `warning` | `#D97706` | rate limit, permission warning, delayed data |
| `info` | `#2563EB` | 정보성 notice |
| `sample` | `#7C3AED` | demo/sample data label |
| `chart-grid` | `#E2E8F0` | chart grid와 axis |
| `chart-crosshair` | `#94A3B8` | chart hover crosshair |

### 6.3 Optional Dark Theme Tokens

Dark mode는 첫 구현 필수 범위가 아니다. 나중에 추가할 때만 아래 token을 사용한다.

| Token | Hex | 용도 |
| --- | --- | --- |
| `dark-bg-app` | `#09090B` | dark page background |
| `dark-bg-surface` | `#18181B` | dark panel |
| `dark-bg-surface-muted` | `#27272A` | dark muted panel |
| `dark-border-default` | `#3F3F46` | dark border |
| `dark-text-primary` | `#FAFAFA` | dark 주요 텍스트 |
| `dark-text-muted` | `#A1A1AA` | dark metadata |
| `dark-brand-primary` | `#60A5FA` | dark main chart/action accent |

### 6.4 색상 사용 규칙

- 파란색은 선택된 데이터, primary action, main chart line에 쓴다.
- teal은 enabled rule과 active monitoring에 쓴다.
- amber는 threshold line, delayed data, rate limit, warning에 쓴다.
- red는 triggered alert, destructive action, blocking error, negative movement에만 쓴다.
- green은 positive movement, 저장 성공, acknowledged success에만 쓴다.
- purple은 demo/sample data label에만 쓰고 primary action에는 쓰지 않는다.
- 주가 상승/하락은 색상만으로 표시하지 않는다. `+`, `-`, label, icon, text를 함께 쓴다.
- 기본 theme에서 full-screen black, neon green, 빽빽한 red/green grid, trading terminal 스타일을 쓰지 않는다.

## Typography

권장 font stack:

- 기본 UI: `Inter`, `Noto Sans KR`, `system-ui`, `sans-serif`
- 한국어 label이 많은 영역: 같은 stack 유지
- 숫자 데이터: 같은 font에 tabular number 적용
- monospace: provider id, raw symbol, debug metadata 같은 좁은 용도에만 사용

사용하지 말 것:

- handwritten font
- novelty font
- 금융 데이터 전체를 monospace로 표시하는 terminal 스타일

| 역할 | 크기 / line-height | 굵기 | 용도 |
| --- | --- | --- | --- |
| Page title | `24px / 32px` | 650-700 | 앱 제목 또는 선택 종목 그룹 heading |
| Primary price | `28px / 36px` | 600-700 | 선택 종목 현재가 |
| Section title | `18px / 28px` | 600 | 주요 패널 섹션 제목 |
| Panel title | `16px / 24px` | 600 | card/list group 제목 |
| Body | `14px / 20px` | 400 | 대부분의 UI 텍스트 |
| Dense body | `13px / 18px` | 400-500 | watchlist row, metadata가 많은 row |
| Caption | `12px / 16px` | 400-500 | timestamp, provider label, helper text |
| Button | `14px / 20px` | 500-600 | button, segmented control |

규칙:

- 가격, 퍼센트, threshold, timestamp에는 `tabular-nums` 또는 동등한 설정을 쓴다.
- letter spacing은 기본적으로 `0`으로 둔다.
- viewport width에 따라 font-size를 자동으로 키우거나 줄이지 않는다.
- 긴 회사명은 compact row에서는 truncate하고, 상세 header에서는 wrap한다.
- 가장 큰 글자는 마케팅 문구가 아니라 선택 종목의 현재가에 사용한다.

## Layout

### 8.1 Spacing Scale

4px base scale을 사용한다.

| Token | 값 | 용도 |
| --- | --- | --- |
| `space-1` | `4px` | icon/text 사이의 아주 작은 간격 |
| `space-2` | `8px` | row 내부 간격 |
| `space-3` | `12px` | control group 간격 |
| `space-4` | `16px` | panel 내부 기본 간격 |
| `space-5` | `20px` | dashboard gutter |
| `space-6` | `24px` | desktop panel padding |
| `space-8` | `32px` | 큰 세로 구분 |

레이아웃 규칙:

- desktop app padding: `24px`
- tablet app padding: `16px`
- mobile app padding: `12px` to `16px`
- desktop grid gap: `16px` to `20px`
- compact panel padding: `16px`
- main panel padding: `20px` to `24px`
- repeated list row 최소 높이: `44px`
- input 높이: `40px`
- compact button 높이: `36px`
- primary button 높이: `40px`
- touch target 최소 크기: `40px` by `40px`

### 8.2 Radius

운영 도구처럼 단정한 반경을 사용한다.

| Token | 값 | 용도 |
| --- | --- | --- |
| `radius-sm` | `4px` | 작은 indicator, chart tooltip |
| `radius-md` | `6px` | input, button, badge |
| `radius-lg` | `8px` | panel, repeated list card, modal |

규칙:

- card와 panel radius는 `8px`를 넘기지 않는다.
- pill 모양 text container는 compact status badge를 제외하고 피한다.
- card 안에 card를 넣지 않는다. section heading, divider, spacing으로 구조를 만든다.

### 8.3 Elevation

- 무거운 shadow보다 `1px` border와 subtle background를 우선한다.
- shadow는 menu, popover, toast처럼 떠 있는 요소에만 사용한다.
- 기본 panel은 떠 있는 card가 아니라 dashboard에 붙어 있는 작업 영역처럼 보여야 한다.

### 9. Responsive Layout

### 9.1 Desktop

3-zone dashboard를 사용한다.

| 영역 | 권장 너비 | 내용 |
| --- | --- | --- |
| Left rail | `280px` to `320px` | search, filter, watchlist |
| Center workspace | flexible, min `0` | selected stock header, chart, range controls |
| Right rail | `320px` to `360px` | alert rules, alert form, recent alerts |

규칙:

- center chart가 화면의 visual anchor여야 한다.
- left/right rail은 내용이 길 때만 내부 scroll을 허용한다.
- nested scroll은 최대한 피한다.
- 넓은 desktop에서는 chart에 공간을 주되, 텍스트 line length가 과하게 길어지지 않게 한다.

### 9.2 Tablet

- 가능하면 2-column을 사용한다.
- search/watchlist와 alert panel은 tabs 또는 accordion으로 바꿀 수 있다.
- chart 높이와 선택 종목 가독성은 유지한다.

### 9.3 Mobile

선택 종목이 없을 때:

1. 검색
2. 관심 종목
3. 선택 종목 empty state
4. 종목 선택 후 알림 규칙 영역 표시

선택 종목이 있을 때:

1. 선택 종목 header
2. chart와 range controls
3. alert summary와 triggered state
4. 접힌 search/watchlist section
5. alert rules와 recent alerts

> 입문자 메모: 모바일에서 사용자가 종목을 이미 선택했다면, 긴 관심 종목 목록을 다시 지나가야 chart를 볼 수 있게 만들면 안 됩니다.

## Components

### 10.1 App Header

목적:

- 제품 이름, 데이터/source 상태, 브라우저 알림 권한 상태를 보여준다.

규칙:

- title은 `Stock Alarm`을 사용한다.
- H1에 마케팅성 value proposition을 넣지 않는다.
- `Sample data`, `Delayed`, `Market closed`, `Monitoring` 같은 compact status label을 둘 수 있다.
- actions는 settings, theme, notification permission, refresh처럼 작고 예측 가능해야 한다.

### 10.2 Search Panel

목적:

- 사용자가 미국 ticker, 한국 종목 코드, 한국 회사명으로 검색할 수 있게 한다.

규칙:

- label이 있는 search input을 사용한다.
- market filter는 `All`, `US`, `KR`를 제공한다.
- 구현 시 debounced search를 사용한다.
- 검색 중에는 skeleton row 또는 작은 spinner를 보여준다.
- 결과가 없으면 다음 행동을 알려주는 empty state를 보여준다.
- provider 오류는 전체 화면 crash가 아니라 검색 영역 근처 inline error로 보여준다.

### 10.3 Search Result Row

각 row에 표시할 것:

- symbol
- display name
- market/exchange
- currency
- provider 또는 sample label

규칙:

- row 전체를 click 가능하게 만들 수 있다.
- hover, focus, selected state를 모두 만든다.
- 긴 이름은 row에서 truncate하고, selected stock header에서 전체 이름을 보여준다.

### 10.4 Watchlist

각 watchlist item에 표시할 것:

- symbol과 display name
- 가능한 경우 latest price
- change amount와 percent
- data freshness 또는 source state
- active alert count

규칙:

- 삭제는 destructive action으로 명확히 표현한다.
- MVP에서 watchlist 삭제 시 관련 rule/event도 삭제된다면 confirmation copy에 그 사실을 써야 한다.
- 큰 마케팅 card가 아니라 compact row로 만든다.

### 10.5 Selected Stock Header

표시할 것:

- 회사명 또는 display name
- symbol, exchange, market, currency
- latest price
- change amount와 percent
- provider, delayed/sample status, last updated time

규칙:

- 가장 큰 텍스트는 현재가다.
- quote가 stale, delayed, sample이면 가격 근처에 표시한다.
- `good entry`, `sell signal`처럼 조언으로 읽히는 표현을 쓰지 않는다.

### 10.6 Chart Panel

표시할 것:

- historical line chart
- range segmented control: `1D`, `1W`, `1M`, `6M`, `1Y`
- active price rule의 threshold line
- visible chart time과 매핑되는 recent alert marker
- loading, empty, error state

규칙:

- loading이나 range 변경 중에도 chart dimension을 유지한다.
- desktop chart 기본 높이: `320px` to `360px`
- mobile chart 기본 높이: `220px` to `260px`
- tooltip 내용 때문에 panel 크기가 바뀌면 안 된다.

### 10.7 Alert Rule Form

필드:

- rule type: price 또는 daily change percent
- operator: above 또는 below
- threshold value
- cooldown minutes
- enabled toggle

규칙:

- 구현 시 controlled React input을 사용한다.
- validation message는 해당 field 바로 아래에 둔다.
- threshold는 numeric input 또는 stepper를 사용한다.
- rule label로 `stop loss`, `take profit`, `buy`, `sell`을 쓰지 않는다.
- submit button은 `Save rule` 또는 한국어 equivalent를 사용한다. `Trade`, `Signal`, `Execute`는 쓰지 않는다.

### 10.8 Alert Rule List

각 rule row/card에 표시할 것:

- rule condition
- enabled/disabled state
- cooldown state
- last triggered time
- edit/delete actions

규칙:

- enabled state는 teal과 text/icon을 함께 사용한다.
- cooldown state는 amber와 남은 시간을 함께 표시한다.
- disabled state는 muted style을 사용한다.
- delete action의 red는 icon/button 수준에만 쓰고 row 전체를 red로 만들지 않는다.

### 10.9 Recent Alerts

각 alert event에 표시할 것:

- symbol
- 충족된 조건
- triggered value
- created time
- acknowledged/unacknowledged state

규칙:

- triggered alert는 marker와 readable text를 함께 쓴다.
- acknowledged alert는 muted 처리하되 읽을 수 있어야 한다.
- unacknowledged alert를 깜빡이게 만들지 않는다.

### 10.10 Buttons And Icons

규칙:

- 가능한 경우 Lucide icon을 사용한다.
- icon-only button에는 accessible label과 tooltip이 있어야 한다.
- primary button은 한 작업 영역에 하나만 둔다.
- secondary/ghost button은 낮은 우선순위 action에 쓴다.
- danger button은 destructive action에만 쓴다.
- 모든 clickable element에는 hover와 focus state가 있어야 한다.

### 11. Chart Rules

#### 11.1 기본 chart

MVP에서는 historical price line chart를 사용한다.

이유:

- 이 제품은 전문 trading 분석 도구가 아니라 alert monitoring 도구다.
- line chart가 입문자에게 더 읽기 쉽다.
- threshold line이 price rule과 자연스럽게 연결된다.

#### 11.2 기본으로 피할 chart

미래 spec이 바꾸기 전까지 MVP에서는 사용하지 않는다.

- Candlestick/OHLC chart
- Order book 또는 depth chart
- Volume heatmap
- Buy/sell signal overlay
- Prediction 또는 confidence band

#### 11.3 Visual Encoding

| 요소 | 스타일 |
| --- | --- |
| Main price line | `brand-primary`, 2px stroke |
| Secondary line | 필요할 때만 muted gray 또는 dashed blue |
| Price threshold line | `alert-threshold`, dashed, label 포함 |
| Triggered marker | `alert-triggered`, shape marker와 label 포함 |
| Positive movement | `success`, `+` sign과 text 포함 |
| Negative movement | `alert-triggered`, `-` sign과 text 포함 |
| Grid | `chart-grid`, low contrast |
| Tooltip | white surface, border, small radius, tabular numbers |

#### 11.4 Tooltip 내용

포함할 것:

- date/time
- currency가 포함된 price
- 가능한 경우 change
- 필요한 경우 provider 또는 sample/delayed label

포함하지 말 것:

- `Buy`, `sell`, `hold`, `entry`, `exit`, `profit`, `target` 같은 조언성 단어

#### 11.5 접근성

- latest price와 change는 chart 밖의 텍스트로도 보여준다.
- alert state를 chart에서만 알 수 있게 만들지 않는다.
- threshold line에는 색상뿐 아니라 label이 있어야 한다.
- triggered marker에는 색상뿐 아니라 shape 또는 text가 있어야 한다.

### 12. Alert And Data States

이 표를 UI 상태의 source of truth로 사용한다.

| State | 의미 | 시각 규칙 | 예시 문구 |
| --- | --- | --- | --- |
| `empty-selection` | 선택된 종목 없음 | muted empty panel과 search action | `종목을 검색하거나 관심 종목에서 선택하세요.` |
| `loading-search` | 검색 진행 중 | skeleton row 또는 spinner | `검색 중...` |
| `loading-chart` | history 요청 진행 중 | 고정 높이 chart skeleton | `차트 데이터를 불러오는 중입니다.` |
| `sample-data` | demo provider 데이터 | purple badge, 가격/chart 근처에 표시 | `샘플 데이터입니다. 실제 시장 데이터가 아닙니다.` |
| `delayed-data` | provider가 지연 데이터로 표시 | amber badge, timestamp 근처에 표시 | `지연 데이터입니다.` |
| `market-closed` | 시장 종료 | neutral/amber status, timestamp 표시 | `시장 종료 상태입니다. 마지막 업데이트를 확인하세요.` |
| `monitoring-active` | rule 활성화 및 polling 중 | teal status | `모니터링 중` |
| `no-rules` | 선택 종목에 rule 없음 | create action이 있는 empty state | `아직 알림 규칙이 없습니다.` |
| `rule-disabled` | rule이 꺼져 있음 | muted row와 off toggle | `꺼짐` |
| `rule-cooldown` | 최근 trigger 후 대기 중 | amber cooldown label | `쿨다운 중: 12분 남음` |
| `permission-needed` | 브라우저 알림 권한 미결정 | info/warning banner | `브라우저 알림을 켜면 조건 충족 시 알림을 받을 수 있습니다.` |
| `permission-denied` | 브라우저 알림 차단 | amber warning, in-app은 계속 활성 | `브라우저 알림 권한이 꺼져 있어 인앱 알림만 표시합니다.` |
| `alert-triggered` | 조건 충족 및 쿨다운 통과 | red marker와 toast/list event | `AAPL 가격이 설정값 이상입니다.` |
| `alert-acknowledged` | 사용자가 알림 확인 | muted success/neutral state | `확인됨` |
| `provider-rate-limited` | provider 요청 한도 도달 | retry 상태가 있는 amber banner | `데이터 제공자 요청 한도에 도달했습니다. 잠시 후 다시 시도합니다.` |
| `provider-error` | provider 요청 실패 | retry가 있는 inline error | `가격 데이터를 불러오지 못했습니다.` |
| `supabase-disconnected` | 저장 기능 사용 불가 | save action 근처 warning | `저장 기능을 사용할 수 없습니다. 데모 데이터 확인은 가능합니다.` |

규칙:

- error와 새로 발생한 in-app alert에는 `aria-live` 또는 `role="alert"`를 사용한다.
- error는 가능한 경우 recovery path를 포함해야 한다.
- 모든 warning을 red error로 만들지 않는다. red는 triggered alert, destructive action, blocking failure에만 사용한다.

## Do's and Don'ts

### 13.1 Voice

문구는 사실 중심, 중립적, 개인 모니터링 중심이어야 한다.

사용 가능한 패턴:

- `설정한 조건에 도달했습니다.`
- `가격이 설정값 이상입니다.`
- `가격이 설정값 이하입니다.`
- `일일 등락률이 설정값 이상입니다.`
- `샘플 데이터입니다.`
- `마지막 업데이트`
- `브라우저가 열려 있는 동안 알림을 확인합니다.`

### 13.2 투자 자문처럼 보이는 표현 금지

아래처럼 조언, 예측, 긴급성, 매매 지시로 읽히는 표현은 쓰지 않는다.

- `매수하세요`
- `매도하세요`
- `강력 매수`
- `보유 추천`
- `진입 기회`
- `익절 구간`
- `손절 라인`
- `수익 기회`
- `목표가 달성`
- `상승 확정`
- `AI 추천`
- `승률`
- `시그널`
- `지금 행동하세요`

대체 표현:

| 피할 표현 | 대체 표현 |
| --- | --- |
| `매수 신호` | `알림 조건 충족` |
| `손절 라인` | `설정한 하한 가격` |
| `익절 목표` | `설정한 상한 가격` |
| `추천 종목` | `관심 종목` |
| `실시간 보장` | `제공자 상태에 따른 최신 데이터` |

### 13.3 과한 trading UI 스타일 금지

다음 visual pattern은 전문 trading execution처럼 보일 수 있으므로 피한다.

- Buy/sell button
- Profit/loss 중심 dashboard
- Leverage, margin, risk/reward, entry/exit label
- 깜빡이는 price tile
- 빽빽한 red/green ticker wall
- neon accent가 강한 black terminal
- 공격적인 alert sound 또는 animation

### 14. React + Tailwind 구현 계약

이 문서는 실제 React 코드를 포함하지 않는다. 구현 단계가 시작되면 coding agent는 아래 규칙을 따른다.

- 컴포넌트를 만들기 전에 semantic token을 Tailwind theme 또는 CSS variable로 매핑한다.
- 컴포넌트에서 임의의 one-off color를 만들지 않는다.
- form은 controlled component로 만든다.
- validation error는 문제가 생긴 field 바로 근처에 둔다.
- chart, row, button, tab, panel은 안정적인 dimension을 가진다.
- 금융 숫자에는 `tabular-nums` 또는 동등한 설정을 사용한다.
- 공통 action icon은 Lucide icon을 사용한다.
- icon-only control에는 accessible label과 tooltip을 둔다.
- `prefers-reduced-motion`을 존중한다.
- UI component는 provider-specific payload에 직접 의존하지 않고 normalized data를 소비한다.
- 새 UI library 또는 chart library는 구현 계획에서 명시적으로 선택하기 전까지 추가하지 않는다.
- 이전 설계 문서 기준으로 chart library 기본 후보는 Recharts다.

> 입문자 메모: 이 섹션은 코드가 아니라 코드 작성 규칙입니다. 다음 구현 agent가 "어떤 식으로 React + Tailwind를 짜야 하는지"를 알려주는 역할을 합니다.

### 15. Accessibility Checklist

- 일반 텍스트 contrast는 WCAG 2.1 AA 이상을 만족한다.
- keyboard focus ring이 눈에 보여야 한다.
- search input, filter control, range tab, toggle, button에는 accessible name이 있어야 한다.
- error와 triggered alert는 assistive technology에 announce되어야 한다.
- positive/negative movement나 triggered alert를 색상만으로 표시하지 않는다.
- touch target은 최소 `40px` 이상이다.
- `375px`, `768px`, `1024px`, `1440px`에서 텍스트가 겹치거나 container 밖으로 나가지 않는다.
- `prefers-reduced-motion`이 켜져 있으면 motion을 끄거나 줄인다.

### 16. 검토한 대안

#### 16.1 Default OLED Dark Mode

기본값으로 채택하지 않는다. 너무 전문 trading terminal처럼 보일 수 있다. light theme이 완성된 뒤 optional theme으로 추가하는 것은 가능하다.

#### 16.2 Handwritten Or Playful Typography

채택하지 않는다. 금융 데이터에는 신뢰도, 가독성, 다국어 지원이 더 중요하다. Inter와 Noto Sans KR 조합을 사용한다.

#### 16.3 Candlestick Chart

MVP에서는 채택하지 않는다. candlestick은 active trading 분석 느낌이 강하고 UI 복잡도를 높인다. line chart와 threshold line을 사용한다.

#### 16.4 Marketing Landing Page

채택하지 않는다. 첫 화면은 실제 dashboard여야 한다.

### 17. Future UI Verification Checklist

UI 구현 완료 전 다음을 확인한다.

- desktop에서 left, center, right zone이 좁아지거나 겹치지 않는다.
- mobile에서 종목 선택 후 selected stock과 chart가 먼저 보인다.
- search, watchlist, selected stock, chart, rule form, rule list, recent alerts에 loading/empty/error/ready state가 있다.
- sample data, delayed data, market closed, rate limited, provider error 상태가 보인다.
- triggered alert는 깜빡임 없이 in-app과 recent alerts에 표시된다.
- browser notification denied 상태에서도 in-app alert는 사용할 수 있다.
- chart range 변경 시 panel 크기가 흔들리지 않는다.
- price threshold line에는 label이 있다.
- percent rule은 chart line으로 표시하지 않더라도 alert panel에서 이해할 수 있다.
- 투자 조언 또는 매매 지시처럼 보이는 문구가 없다.
- buy/sell control, portfolio P/L, trading terminal visual이 없다.
