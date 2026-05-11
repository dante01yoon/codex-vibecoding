# Next Actions

- 브라우저 2개로 이미지/그림 첨부 업로드와 펼쳐진 댓글 Realtime을 추가 확인한다.
- Vercel Git integration과 project env를 영구 설정할지 결정한다. 설정한다면 repo root를 `realtime-feed`로 두고 preview env에는 공개 가능한 Vite Supabase 변수만 넣는다.
- 첫 CLI deploy가 만든 production alias를 유지할지 정리할지 Vercel Dashboard에서 확인한다.
- Supabase Dashboard RLS Tester로 실제 프로젝트 정책을 한 번 더 눈으로 확인한다.
- 대화/IDE 컨텍스트에 노출된 DB password를 rotate하고 로컬 `.env`를 새 값으로 갱신한다.
- 로컬 검증이 끝나면 `npx supabase stop`으로 컨테이너를 정리한다.
