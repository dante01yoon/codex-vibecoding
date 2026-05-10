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

## in progress

- 없음.

## blocked

- 없음.

## next

- 확인 UX 변경 범위를 확인하고 필요하면 좁게 커밋/푸시한다.
- 다음 구현 주제를 고르면 `AGENTS.md`의 Memory Bank Rule에 따라 `.memory-bank/tasks/`에 새 task card를 만든다.
