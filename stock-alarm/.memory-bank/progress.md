# Progress

마지막 업데이트: 2026-05-10

## done

- 제품/아키텍처 디자인 스펙 작성 완료.
- PRD 작성 완료.
- `DESIGN.md` 작성 및 `@google/design.md` lint 기준 통과.
- `AGENTS.md`에 UI 작업 전 `DESIGN.md` 필수 읽기 규칙 추가.
- React + Tailwind 단일 대시보드 mock UI shell 구현 완료.
- `stock-alert-memory-bank` 스킬 생성 완료.
- `.memory-bank` core 파일 생성 완료.
- `AGENTS.md`에 `$stock-alert-memory-bank` 기반 메모리 뱅크 사용 규칙 추가 완료.
- Demo alert evaluator 추가.
- 앱에서 데모 알림 평가 버튼과 브라우저 알림 권한 요청 흐름 연결 완료.
- 데스크톱/모바일 브라우저 확인 완료.
- Demo alert evaluator와 memory bank 변경을 `5f536fd`로 좁게 커밋 완료. push는 하지 않음.
- 최근 알림 확인 UX 추가 완료.
- alert event shape를 `acknowledgedAt: string | null` 기준으로 정리 완료.
- 단일 확인, `모두 확인`, 확인 시간 표시 검증 완료.
- Local API proxy 추가 완료.
- Demo/Alpha Vantage/KIS provider adapter 골격 추가 완료.
- Supabase browser client, anonymous session bootstrap, repository mapper, RLS migration 초안 추가 완료.
- 앱 상태바에 API 연결 상태와 Supabase 저장 설정 상태 표시 완료.
- `VITE_MARKET_DATA_PROVIDER=auto` 기반 실제 provider 호출 흐름 추가 완료.
- 실제 Alpha Vantage quote adapter 경로를 demo API key로 검증 완료.
- 실제 API 설정 문서 `docs/api-setup.md` 추가 완료.

## in progress

- 실제 개인 provider key/token과 Supabase project env를 넣은 live 연결 검증.

## blocked

- 실제 Alpha Vantage/KIS/Supabase credentials는 코드와 메모리에 저장하지 않는다. 사용자가 `.env`에 직접 넣은 뒤 live 검증한다.

## next

- Supabase migration을 실제 stock-alarm 프로젝트에 적용한다.
- watchlist/rule/event repository를 UI write path에 연결한다.
- KIS 검색/history adapter를 추가한다.
- 필요하면 provider 선택 UI를 추가한다.
