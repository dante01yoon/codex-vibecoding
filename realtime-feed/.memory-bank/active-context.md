# Active Context

## 현재 초점

샘플 데이터 기반 첫 UI 셸 위에 Supabase 연동 경계를 붙였다. 현재 앱은 환경 변수가 없으면 샘플 모드로 실행되고, `VITE_SUPABASE_URL`과 공개 가능한 publishable/anon key가 있으면 익명 세션, 게시글/댓글 Data API, Storage 첨부, Realtime 구독을 사용한다.

## 작업 기준

- `AGENTS.md`, `DESIGN.md`, PRD 스펙을 먼저 읽었다.
- Supabase 호출은 `src/lib/supabase/` 서비스 모듈로 분리한다.
- 실제 Supabase credential은 git이나 메모리 뱅크에 기록하지 않는다.
- 샘플 모드는 환경 변수 누락 시 데모와 강의 흐름을 보존하기 위한 fallback이다.

## 다음 세션 참고

UI를 수정할 때는 `DESIGN.md`의 포스트잇 갤러리, 모바일 우선 작성 흐름, 댓글 확장 패턴을 계속 기준으로 삼는다. Supabase 실제 검증을 하려면 먼저 Supabase 프로젝트에 `supabase/migrations/20260511010100_create_guestbook_backend.sql`을 적용하고 `.env` 또는 Vercel 환경 변수에 공개 가능한 URL/key를 넣는다.

추가 기능 수정이나 구현을 시작할 때는 `AGENTS.md`의 `Memory Bank Workflow`를 확인하고 `.agents/skills/guestbook-memory-bank/SKILL.md`와 `.memory-bank/` 문서를 먼저 읽는다.

로컬 Supabase 검증은 Docker Desktop 실행 후 진행되었다. `npx supabase start`, `npx supabase db reset`, `npx supabase db lint --local`, `npx supabase db advisors --local`이 통과했고, 로컬 `.env`에는 공개 가능한 로컬 Supabase URL과 publishable key만 설정되어 있다. Vite dev server는 검증 후 중지했으며, 다시 보려면 `npm run dev`를 실행한다.

Hosted Supabase 프로젝트 연결 작업을 진행했다. `supabase/README.md`에 CLI 기반 연결 가이드와 `.env` 기반 DB push helper 사용법을 추가했고, `.memory-bank/tasks/connect-hosted-supabase.md`를 task card로 만들었다.

Hosted DB에는 guestbook backend migration과 Storage broad SELECT policy 제거 migration이 적용되었다. `migration list --linked`, `db advisors --linked`, `db reset`, `migration list --local`, `db advisors --local`, `npm run build`, `git diff --check`가 통과했다. Hosted Auth anonymous sign-ins도 config push로 켰다. Hosted smoke에서 Auth/Data API/Storage/RLS 권한 차단은 통과했고, Realtime은 명시적 `supabase.realtime.setAuth(access_token)` 호출이 필요해 `src/lib/supabase/auth.js`를 보강했다. 브라우저 이슈는 hosted URL과 다른 프로젝트/로컬 publishable key 조합으로 인한 401, Supabase 모드 초기 샘플 expanded post로 인한 댓글 조회 400이었다. `.env`의 publishable key를 hosted 값으로 갱신했고, Supabase configured 상태에서는 초기 posts/comments/expandedPostId를 빈 상태로 시작하도록 `src/App.jsx`를 수정했다. 실제 앱 UI에서 hosted 새 게시글 작성과 두 번째 탭 Realtime 반영을 확인했다. DB password는 대화/IDE 컨텍스트에 노출되었으므로 작업 종료 후 rotate한다.

Vercel `dante01yoons-projects` scope에 `realtime-feed` 프로젝트를 만들고 `.vercel/project.json`으로 링크했다. 이번 배포는 Git integration이 아니라 CLI preview deployment로 진행했고, `.env`의 공개 가능한 Vite Supabase 변수만 일회성 build env로 주입했다. Preview URL은 `https://realtime-feed-1qwf08rnl-dante01yoons-projects.vercel.app`이고 `vercel inspect --wait` 결과 `READY`다. 첫 CLI deploy가 `--prod` 없이 production target으로 처리되어 `realtime-feed.vercel.app` alias도 생겼으므로, production alias 정리가 필요하면 별도 확인이 필요하다.

삭제 액션 실패는 UI 버튼 문제가 아니라 RLS soft-delete 정책 문제였다. `deleted_at` 업데이트 후 row가 기존 active-only SELECT policy를 통과하지 못해 UPDATE가 `42501`로 막혔다. `20260511105059_allow_owner_soft_deleted_select.sql`에서 게시글/댓글 SELECT policy를 combined policy로 교체해 active row는 모두 읽고, owner는 자기 soft-deleted row도 읽을 수 있게 했다. Hosted DB에 적용했고 API smoke와 public Vercel UI에서 작성 후 삭제를 확인했다.

Agent Skills 섹션 마무리용 Realtime Guestbook 홍보 영상을 Remotion으로 만들었다. 이전에 생성한 이미지 3장은 `img/`에 보관하고, Remotion `staticFile()`용 복사본은 `public/img/`에 둔다. 최종 무음 MP4는 `output/video/realtime-guestbook-promo.mp4`이며 1920x1080, 약 30초다.

댓글 UX를 `src/App.jsx`와 `src/App.css`에서 보강했다. 펼쳐진 카드 안에서만 댓글 영역이 보이고, 헤더/개수/상태 pill, 로딩/빈 상태, 말풍선, 삭제 버튼, 댓글 작성기의 240자 카운트와 무드 chip 선택을 더 명확하게 했다. backend 서비스나 migration은 바꾸지 않았다.
