# Add Landing Page

## Goal

방명록 앱 앞에 따뜻한 한국어 랜딩 섹션을 추가하고 CTA로 실제 방명록 영역에 이동하게 한다.

## Status

done

## Files inspected or edited

- `DESIGN.md`
- `docs/superpowers/specs/2026-05-10-realtime-guestbook-design.md`
- `src/App.jsx`
- `src/App.css`
- `src/components/LandingPage.jsx`

## Plan

- 디자인 문서와 PRD의 컬러, 타이포그래피, 간격, 상태 표현 규칙을 확인한다.
- 현재 `App.jsx` 진입 구조를 확인하고 랜딩 섹션을 별도 컴포넌트로 분리한다.
- CTA 클릭 시 기존 방명록 작성/피드 영역으로 스크롤하도록 연결한다.
- 390px 모바일과 1280px 데스크톱에서 텍스트/버튼 넘침을 막는 반응형 CSS를 추가한다.

## Verification

- `npx @google/design.md lint DESIGN.md`: 통과, findings 없음.
- `npm run build`: 통과.
- `npx playwright install chromium`: CDN 403 `Domain forbidden`으로 브라우저 설치 실패. 스크린샷은 환경 제한으로 생성하지 못했다.

## Notes for the next session

랜딩 페이지는 실제 방명록 기능을 숨기지 않고 같은 페이지 상단에 배치되어 있다. CTA는 `#guestbook` 섹션으로 부드럽게 스크롤한다.
