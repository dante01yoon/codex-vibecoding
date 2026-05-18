---
story_id: "1.3"
story_key: 1-3-wait-time-message
epic: "Epic 1 - 기본 방문 플랜 생성"
status: done
created: 2026-05-18
resolved_by: _bmad-output/implementation-artifacts/1-2-visit-date-time-input.md
---

# Story 1.3 - 예상 대기 시간과 대기 메시지 표시하기

Status: done

## 상태 정리 메모

이 story의 핵심 범위는 Story 1.2 구현 과정에서 함께 완료되었다.

구현된 내용:

- 예상 대기 시간 입력값을 `waitMinutes` state로 관리한다.
- `30` 입력 시 `가볍게 다녀오기 좋은 플랜이에요.` 메시지를 표시한다.
- `90` 입력 시 `대기가 조금 길 수 있어요. 물과 배터리를 챙겨요.` 메시지를 표시한다.
- `150` 입력 시 `긴 대기 예상! 보조 배터리와 물은 꼭 챙겨요.` 메시지를 표시한다.
- `-1` 입력 시 `0 이상의 숫자로 입력해주세요.` 오류 문구를 표시한다.

관련 파일:

- `src/App.jsx`
- `src/utils/planCalculations.js`
- `src/utils/planCalculations.test.mjs`
- `_bmad-output/implementation-artifacts/1-2-visit-date-time-input.md`

검증:

- `npm test` 통과
- `npm run build` 통과
- Playwright 브라우저 검증에서 `30`, `90`, `150`, `-1` 케이스 확인 완료
