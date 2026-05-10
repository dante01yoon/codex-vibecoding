# Start Sample Guestbook UI

## Goal

샘플 데이터 기반으로 첫 React/Vite 방명록 UI를 만든다. 첫 화면은 마케팅 페이지가 아니라 작성 폼과 포스트잇 피드가 보이는 실제 앱 화면이어야 한다.

## Status

done

## Files to Inspect or Edit

- `AGENTS.md`
- `DESIGN.md`
- `docs/superpowers/specs/2026-05-10-realtime-guestbook-design.md`
- `package.json`
- `index.html`
- `src/App.jsx`
- `src/App.css`
- `src/main.jsx`

## Plan

- Vite React 앱의 최소 파일을 만든다.
- 한국어 작성 폼, 무드 선택, 아바타 색상 선택, 선택 첨부 영역을 배치한다.
- 샘플 포스트잇 카드 피드와 카드 확장형 댓글 영역을 만든다.
- 로딩, empty, error, realtime 상태를 화면에서 확인 가능한 형태로 둔다.
- 모바일과 데스크톱에서 텍스트와 버튼이 넘치지 않게 CSS를 작성한다.

## Verification

- 통과: `npx @google/design.md lint DESIGN.md`
- 통과: `npm run build`
- 통과: 브라우저 1280px/390px 레이아웃 확인
- 통과: 샘플 작성, 댓글 작성, 본인 글 삭제, 실시간 연결 끊김 상태 확인

## Notes for the Next Session

Supabase 연결은 이번 작업 범위가 아니다. 실제 연결을 시작할 때는 `auth`, `posts`, `comments`, `attachments` 서비스 모듈을 먼저 나누고 UI에는 normalized data만 전달한다. 현재 dev server는 `http://127.0.0.1:5175/`에서 확인했다.
