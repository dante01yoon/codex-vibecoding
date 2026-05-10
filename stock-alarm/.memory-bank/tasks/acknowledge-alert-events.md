# Acknowledge Alert Events

## Goal

최근 알림 이력에서 미확인 알림을 확인 처리하고, 확인 시간을 볼 수 있게 한다.

## Status

done

## Files to inspect or edit

- `src/App.jsx`
- `src/lib/alertEvaluator.js`
- `src/lib/alertEvaluator.test.js`
- `.memory-bank/verification-log.md`

## Plan

- alert event shape를 `acknowledgedAt: string | null` 기준으로 맞춘다.
- 단일 알림 확인 시 현재 시각을 `acknowledgedAt`에 저장한다.
- 미확인 알림이 있을 때만 `모두 확인` 버튼을 보여준다.
- 확인된 알림에는 확인 상태와 확인 시간을 표시한다.
- Supabase 저장은 아직 붙이지 않고 demo/browser state만 유지한다.

## Verification

- `npm test`: pass, 7 tests.
- `npm run build`: pass.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.
- `git diff --check -- stock-alarm .agents/skills/stock-alert-memory-bank`: pass.
- Chrome DevTools browser check:
  - 단일 `확인` 클릭 시 `확인됨`과 `확인 방금` 표시.
  - 두 개의 새 demo alert 생성 후 `모두 확인` 클릭 시 미확인 알림이 모두 확인 상태로 변경.
  - desktop 1440px와 mobile 390px에서 horizontal overflow 없음.
  - Notification denied 상태에서도 인앱 alert event 생성 확인.
  - console error 없음.

## Notes for the next session

- 11-7 범위에서는 Demo Provider와 브라우저 state만 사용한다.
- Supabase `acknowledged_at` 저장은 아직 연결하지 않았다.
