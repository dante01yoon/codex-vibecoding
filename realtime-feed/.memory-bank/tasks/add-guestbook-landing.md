# Add Guestbook Landing

## Goal

따뜻한 포스트잇 방명록 분위기를 유지하면서 방명록 앱 위에 한국어 랜딩 섹션을 추가하고, CTA가 작성/피드 영역으로 이동하게 한다.

## Status

done

## Files to inspect or edit

- `DESIGN.md`
- `docs/superpowers/specs/2026-05-10-realtime-guestbook-design.md`
- `src/App.jsx`
- `src/App.css`
- `src/components/GuestbookLanding.jsx`

## Plan

1. 기존 앱 구조와 디자인 토큰을 확인한다.
2. 랜딩 컴포넌트를 별도 파일로 만들고 CTA 콜백을 받게 한다.
3. `App.jsx`에서 composer/feed ref와 스크롤 핸들러를 연결한다.
4. 모바일/데스크톱에서 넘침을 줄이는 CSS를 추가한다.
5. 디자인 lint와 빌드를 실행한다.

## Verification

- Pass: `npx @google/design.md lint DESIGN.md`
- Pass: `npm run build`

## Notes for the next session

사용자 요청이 DESIGN/AGENTS의 “마케팅 랜딩 제외” 원칙보다 우선한다. 단, 랜딩은 제품 설명 위주의 차가운 SaaS 히어로가 아니라 실제 작성/피드로 바로 이어지는 따뜻한 안내 섹션으로 제한한다.

- Warning: Playwright Chromium download failed with CDN 403, so automated 390px/1280px screenshot capture could not be completed in this environment.
