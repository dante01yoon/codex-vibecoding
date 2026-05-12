# Create Promo Video

## Goal

Realtime Guestbook 홍보용 1920x1080, 30fps, 25-35초 영상을 Remotion으로 만든다. 이전에 생성한 `img/` 이미지 3장을 활용한다.

## Status

done

## Files to inspect or edit

- `video.md`
- `img/realtime-guestbook-hero-background.png`
- `img/realtime-guestbook-digital-notes-scene.png`
- `img/realtime-guestbook-portfolio-showcase.png`
- `public/img/`
- `src/remotion/`
- `package.json`

## Plan

- Remotion dependency와 npm scripts를 추가한다.
- 생성 이미지를 Remotion `staticFile()`에서 쓸 수 있게 `public/img/`에 복사한다.
- 30초 구성의 홍보 영상 컴포지션을 만든다.
- still render와 full render로 결과물을 확인한다.

## Verification

- 통과: `npm run video:still`
- 통과: `npm run video:render`
- 통과: `mdls` 확인 결과 `1920x1080`, 약 `30.015`초, H.264 MP4
- 통과: `check-frame-060.png`, `check-frame-270.png`, `check-frame-810.png` 대표 프레임 확인
- 통과: `npm run build`
- 통과: `git diff --check`

## Notes for the next session

- 영상은 무음 MP4로 시작한다. 배경음악/나레이션이 필요하면 별도 asset 또는 TTS 작업을 후속으로 붙인다.
- 최종 파일은 `output/video/realtime-guestbook-promo.mp4`이다.
