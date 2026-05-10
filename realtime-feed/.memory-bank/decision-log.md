# Decision Log

## 2026-05-11

### Decision

첫 UI 작업은 Supabase 연결 없이 샘플 데이터 기반 React/Vite 앱 셸로 시작한다.

### Reason

섹션 11-7 메모리뱅크 데모 흐름에서는 프로젝트 구조와 UI 방향을 먼저 안전하게 보여주는 것이 중요하다. 실제 인증, Storage, Realtime 연결은 별도 작업으로 나누는 편이 설명과 검증이 쉽다.

### Consequence

초기 UI는 샘플 게시글, 샘플 댓글, 로컬 상호작용을 사용한다. 이후 서비스 모듈을 추가할 때 현재 UI 데이터를 normalized shape로 맞춰 이어갈 수 있게 한다.
