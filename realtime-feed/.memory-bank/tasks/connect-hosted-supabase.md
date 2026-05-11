# Connect Hosted Supabase

## Goal

로컬에서 검증된 Supabase 마이그레이션과 프론트엔드 연동을 실제 hosted Supabase 프로젝트에 연결하고 live Auth, Data API, Storage, Realtime을 검증한다.

## Status

in progress

## Files to inspect or edit

- `supabase/README.md`
- `supabase/config.toml`
- `supabase/migrations/20260511010100_create_guestbook_backend.sql`
- `supabase/migrations/20260511021759_restrict_guestbook_media_listing.sql`
- `scripts/supabase-db-push.mjs`
- `src/lib/supabase/auth.js`
- `.env.example`
- `.memory-bank/active-context.md`
- `.memory-bank/progress.md`
- `.memory-bank/next-actions.md`
- `.memory-bank/verification-log.md`

## Plan

1. Supabase Dashboard에서 새 프로젝트를 만들고 Anonymous Sign-Ins를 켠다.
2. `npx supabase login` 후 `npx supabase link --project-ref <project-ref>`로 원격 프로젝트를 연결한다.
3. `npx supabase db push --dry-run`으로 적용될 migration을 먼저 확인한다.
4. `npx supabase db push`로 hosted DB에 마이그레이션을 적용한다.
5. `npx supabase migration list --linked`와 `npx supabase db advisors --linked`로 원격 상태를 확인한다.
6. 로컬 `.env` 또는 Vercel 환경 변수에 Project URL과 publishable key만 설정한다.
7. 브라우저 2개로 게시글, 첨부, 펼쳐진 댓글 Realtime, 본인 삭제 권한을 수동 검증한다.

## Verification

- done: `npx supabase login`
- done: `npx supabase init` 실행 시 기존 `supabase/config.toml`이 있어 중단됨. 덮어쓰지 않음.
- done: `npx supabase link --project-ref znykttqnogkmglbpeint`
- done: `npx supabase db push --dry-run`
- done: `npx supabase db push --help`로 현재 CLI의 `--password` 플래그를 확인함. 문서에는 셸 히스토리 노출을 피하기 위해 `SUPABASE_DB_PASSWORD` 임시 환경 변수 방식을 우선 기록함.
- done: `.env`의 `SUPABASE_DB_PASSWORD`를 읽어 `npx supabase db push`에 전달하는 `scripts/supabase-db-push.mjs`와 npm scripts를 추가함
- done: 비밀번호가 없을 때 `npm run supabase:db:push`가 원격 접속 전에 중단되는 것을 확인함
- done: `.env`에 `SUPABASE_DB_PASSWORD`가 비어 있지 않게 들어간 것은 확인함. 실제 값은 확인하거나 기록하지 않음.
- done: DB password 재설정 후 `npx supabase link --project-ref znykttqnogkmglbpeint`로 IPv4/pooler 연결을 다시 설정함
- done: `npm run supabase:db:push`로 `20260511010100_create_guestbook_backend.sql`을 hosted DB에 적용함
- done: `npx supabase migration list --linked`에서 local/remote migration history 일치 확인
- done: `npx supabase db advisors --linked`에서 public bucket broad SELECT policy 경고 확인
- done: `npx supabase migration new restrict_guestbook_media_listing`으로 후속 migration 생성
- done: `20260511021759_restrict_guestbook_media_listing.sql`로 `guestbook-media` broad SELECT policy 제거
- done: `npm run supabase:db:push:dry-run`에서 후속 migration 1개 적용 예정 확인
- done: `npm run supabase:db:push`로 후속 migration을 hosted DB에 적용함
- done: `npx supabase migration list --linked`에서 migration 2개가 local/remote 모두 일치함
- done: `npx supabase db advisors --linked` 결과 `No issues found`
- done: `npx supabase config push --project-ref znykttqnogkmglbpeint --yes`로 hosted Auth anonymous sign-ins를 켬
- done: hosted smoke에서 익명 Auth, Data API insert, Storage upload/public URL, owner-only path policy, 비허용 update 차단, 타인 삭제 차단이 통과함
- done: hosted Realtime은 명시적 `supabase.realtime.setAuth(access_token)` 호출 시 INSERT 이벤트 수신 확인
- done: `src/lib/supabase/auth.js`에서 익명 세션 확보 후 Realtime auth token을 명시적으로 동기화하도록 보강
- done: `npx supabase db reset`으로 로컬 migration 2개 적용 확인
- done: `npx supabase migration list --local`
- done: `npx supabase db advisors --local` 결과 `No issues found`
- done: `npm run build`
- done: `git diff --check`
- done: `.env`의 `VITE_SUPABASE_URL`은 hosted를 가리켰지만 `VITE_SUPABASE_PUBLISHABLE_KEY`가 다른 프로젝트/로컬 key라서 브라우저에서 Auth/REST 401이 발생함을 확인
- done: hosted publishable key로 `.env`의 `VITE_SUPABASE_PUBLISHABLE_KEY`를 갱신하고 dev server 재시작
- done: Supabase 모드 초기 상태가 샘플 `post-102`를 펼쳐 댓글 조회 400을 만들던 문제를 수정함
- done: 브라우저 콘솔에서 401/400 에러가 사라진 것 확인
- done: 실제 앱 UI에서 hosted 새 게시글 작성 확인
- done: 두 번째 탭에서 새 게시글 Realtime 반영 확인
- done: 테스트 게시글/댓글을 원격 DB에서 soft-delete 정리하고 active test post 0개 확인
- next: 실제 앱 UI에서 첨부 업로드와 펼쳐진 댓글 Realtime을 추가 수동 확인
- next: 대화/IDE 컨텍스트에 DB password가 노출되었으므로 hosted migration 작업이 끝난 뒤 DB password rotate 권장

## Notes for the next session

Project URL과 publishable key는 `.env`나 Vercel 환경 변수에만 넣는다. `service_role` key, secret key, access token, DB password는 git이나 메모리 뱅크에 기록하지 않는다.

원격 DB migration 적용, migration history 확인, linked DB advisors 확인은 완료되었다. Storage broad SELECT policy 경고는 후속 migration으로 제거했고 local/linked advisors 모두 이슈 없음 상태다. Hosted Auth anonymous sign-ins도 config push로 켰다. 브라우저 이슈는 URL만 hosted로 바뀌고 publishable key가 다른 프로젝트/로컬 key였던 것, 그리고 Supabase 모드 초기 expanded post가 샘플 id였던 것이 원인이었다. `.env`의 publishable key를 hosted 값으로 갱신했고 `src/App.jsx`의 live 초기 상태를 빈 피드/빈 댓글/펼침 없음으로 수정했다. 실제 앱 UI에서 hosted 새 게시글 작성과 두 번째 탭 Realtime 반영을 확인했다. DB password는 대화/IDE 컨텍스트에 노출되었으므로 작업 종료 후 Supabase Dashboard에서 rotate하는 것이 안전하다.
