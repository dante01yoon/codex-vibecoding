# Task Card: Add Demo Alert Evaluator

상태: done
마지막 업데이트: 2026-05-10

## Goal

Demo Provider 데이터만으로 가격/등락률 알림 규칙을 평가하고, 조건이 맞으면 인앱 최근 알림과 브라우저 알림을 표시할 수 있게 한다.

## Files to inspect or edit

- `package.json`
- `src/App.jsx`
- `src/lib/alertEvaluator.js`
- `src/lib/alertEvaluator.test.js`
- `DESIGN.md`

## Plan

1. `alertEvaluator`를 순수 함수로 유지한다.
2. price above/below, daily percent above/below, disabled, missing quote, cooldown을 테스트한다.
3. `App.jsx`는 데모 평가 실행, 알림 이벤트 추가, Notification permission 요청만 담당한다.
4. UI copy는 투자 조언처럼 읽히지 않게 유지한다.
5. 브라우저에서 버튼/상태/최근 알림 표시를 수동 확인한다.

## Verification

완료한 확인:

- `npm test`: pass, 7 tests.
- `npm run build`: pass.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.
- 브라우저에서 데모 평가 버튼 클릭 후 cooldown 상태 표시 확인.
- 새 AAPL price below rule 추가 후 최근 알림 생성 확인.
- 같은 평가 재실행 시 cooldown으로 중복 알림 방지 확인.
- 초기 notification-needed 상태 확인. denied/unsupported는 copy helper 구현까지만 확인.
- mobile 390x844, desktop 1440x950에서 horizontal overflow 없음.
- reload 후 console/page error 없음.

## Notes for the next session

- 현재 코드는 아직 커밋되지 않았다.
- 실제 KIS/Alpha Vantage 또는 Supabase Auth/DB를 붙이지 않는다.
- secret이나 `.env` 값은 메모리 뱅크에 기록하지 않는다.
- publish가 필요하면 `.superpowers/` helper 산출물과 unrelated 파일을 섞지 않는다.
