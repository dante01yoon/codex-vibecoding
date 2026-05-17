# Improve Comments UX

## Goal

펼쳐진 댓글 영역을 모바일에서도 읽기 쉽고 작성하기 편하게 다듬는다.

## Status

done

## Files To Inspect Or Edit

- `src/App.jsx`
- `src/App.css`
- `.memory-bank/active-context.md`
- `.memory-bank/progress.md`
- `.memory-bank/next-actions.md`
- `.memory-bank/verification-log.md`

## Plan

- 댓글 영역 헤더, 상태, 개수, 빈 상태, 로딩 상태를 더 명확하게 만든다.
- 댓글 말풍선과 삭제 버튼을 더 안전하게 누를 수 있게 정리한다.
- 댓글 작성기에서 240자 카운트, 빈 입력 비활성화, 무드 선택 chip을 제공한다.
- 샘플 모드와 Supabase 모드의 댓글 로드/구독 흐름은 유지한다.

## Verification

- 통과: `npm run build`
- 통과: `git diff --check`
- 통과: `npx @google/design.md lint DESIGN.md`
- 통과: Playwright screenshot으로 1280px desktop과 390px mobile 샘플 모드 UI 확인

## Notes For Next Session

- 새 dependency나 backend 변경 없이 `CommentsThread` 중심으로 완료했다.
- hosted Supabase 댓글 Realtime 2브라우저 검증은 별도 후속 검증으로 남아 있다.
