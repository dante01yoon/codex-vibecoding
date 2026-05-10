# Verification Log

마지막 업데이트: 2026-05-10

## 2026-05-10

작업: Demo alert evaluator 현재 상태 확인

명령:

```bash
npm test
npm run build
npx @google/design.md lint DESIGN.md
```

결과:

- `npm test`: pass, 7 tests.
- `npm run build`: pass, Vite production build 성공.
- `npx @google/design.md lint DESIGN.md`: pass, errors 0, warnings 0.

브라우저 확인:

- `http://127.0.0.1:5175/`에서 렌더링 확인.
- 초기 상태: `아직 평가 전`, `인앱 알림 우선`, 브라우저 알림 버튼 표시 확인.
- permission prompt는 실제 승인하지 않았고, denied/unsupported는 copy helper 구현까지만 확인함.
- 데모 평가 1회: 기존 AAPL percent rule은 cooldown 상태로 표시됨.
- AAPL price below 190 rule을 추가한 뒤 데모 평가: 최근 알림에 새 event 표시됨.
- 같은 평가를 다시 실행하면 cooldown이 중복 알림을 막음.
- mobile 390x844: horizontal overflow 없음.
- desktop 1440x950: search/detail/alert 3-column layout 표시, horizontal overflow 없음.
- reload 후 console error와 page error 없음.

## 2026-05-10

작업: `AGENTS.md`에 memory bank 사용 규칙 추가

명령:

```bash
git diff --check -- stock-alarm/AGENTS.md stock-alarm/.memory-bank
```

결과:

- pass.
