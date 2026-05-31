# Improve Attachment Drawing UX

## Goal

이미지 첨부와 간단한 그림 첨부 UI를 더 명확하게 만든다. 첨부 의미는 그대로 유지한다: 없음, 이미지 1개, 그림 1개 중 하나만 선택한다.

## Status

done

## Files to inspect or edit

- `src/App.jsx`
- `src/App.css`
- `.memory-bank/active-context.md`
- `.memory-bank/progress.md`
- `.memory-bank/next-actions.md`
- `.memory-bank/verification-log.md`

## Plan

- 첨부 모드 선택 상태와 현재 첨부 상태를 더 잘 보이게 한다.
- 이미지 선택 영역에 파일명, 변경, 제거, 오류 안내가 자연스럽게 이어지게 한다.
- 그림 도구의 활성 펜/지우개 상태, 캔버스 경계, 초기화/첨부 제거 경로를 명확하게 한다.
- 모바일에서 캔버스와 버튼이 넘치지 않게 CSS를 보강한다.

## Verification

- 통과: `npm run build`
- 통과: `git diff --check`
- 통과: `npx @google/design.md lint DESIGN.md`
- 통과: Vite 로컬 화면 `http://127.0.0.1:5178/`에서 1280px와 390px 폭 확인. 첨부 모드 버튼, 이미지 선택 상태, 그림 모드 상태, 모바일 가로 넘침 없음을 확인했다.

## Notes for the next session

- 새 dependency, backend service, Supabase migration은 건드리지 않는다.
- 전문 그림판 범위인 레이어, 스티커, undo stack, 텍스트 도구는 추가하지 않는다.
- 이번 변경은 `src/App.jsx`와 `src/App.css`의 UI/상호작용 보강만 포함한다.
