# Project Brief

상태: done
마지막 업데이트: 2026-05-10

## 프로젝트

`stock-alarm`은 React + Tailwind로 만드는 교육용 개인 주식 알림 앱이다. 사용자는 미국/한국 주식을 검색하고, 관심 종목과 알림 규칙을 관리하며, 브라우저가 열려 있는 동안 인앱 알림과 가능한 경우 브라우저 알림을 받는다.

## 현재 학습 범위

- 11-7 단계에서는 Demo Provider 데이터를 먼저 사용한다.
- 실제 KIS 또는 Alpha Vantage 연동은 11-7 범위에 포함하지 않는다.
- Supabase Auth/DB 구현도 11-7 범위에 포함하지 않는다.
- UI와 로직은 나중에 real provider와 Supabase를 붙일 수 있도록 normalized data를 기준으로 둔다.

## 비목표

- 투자 조언, 종목 추천, 가격 예측, 매수/매도 신호
- 주문, 계좌, 보유 종목, 포트폴리오 수익률 중심 UI
- 브라우저가 닫힌 상태의 백그라운드 알림
- secret, API key, token, private account data 저장

## 필수 기준 문서

- `AGENTS.md`
- `DESIGN.md`
- `docs/superpowers/specs/2026-05-07-stock-alarm-prd.md`
- `docs/superpowers/specs/2026-05-06-stock-alarm-design.md`
