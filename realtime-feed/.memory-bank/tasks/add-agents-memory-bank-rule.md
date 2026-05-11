# Add AGENTS Memory Bank Rule

## Goal

`AGENTS.md`가 프로젝트 관련 문서와 `guestbook-memory-bank` 스킬을 명시적으로 참조하게 만든다. 이후 기능 수정이나 구현을 시작할 때 메모리 뱅크 문서를 먼저 읽도록 안내한다.

## Status

done

## Files to Inspect or Edit

- `AGENTS.md`
- `.agents/skills/guestbook-memory-bank/SKILL.md`
- `.memory-bank/project-brief.md`
- `.memory-bank/active-context.md`
- `.memory-bank/progress.md`
- `.memory-bank/decision-log.md`
- `.memory-bank/next-actions.md`
- `.memory-bank/verification-log.md`

## Plan

- 기존 `AGENTS.md`, `DESIGN.md`, PRD 스펙, 메모리 뱅크 문서를 읽는다.
- `AGENTS.md`의 Required Reading에 프로젝트 관련 문서와 메모리 뱅크 문서를 추가한다.
- 기능 수정/구현 시 `guestbook-memory-bank` 스킬을 참조하고 메모리 뱅크 문서를 먼저 읽는 절차를 별도 섹션으로 남긴다.

## Verification

- 통과: 문서 변경 diff를 확인했다.
- 통과: `git diff --check`로 공백 오류가 없음을 확인했다.

## Notes for the Next Session

앱 코드는 변경하지 않았다. 다음 기능 구현을 시작할 때는 `AGENTS.md`의 `Memory Bank Workflow`와 `.agents/skills/guestbook-memory-bank/SKILL.md`를 먼저 읽고, 해당 작업용 task card를 새로 만들거나 갱신한다.
