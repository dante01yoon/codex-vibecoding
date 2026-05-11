# Progress

## done

- 한국어 PRD와 루트 `DESIGN.md`, `AGENTS.md`가 준비되어 있다.
- `AGENTS.md`가 `guestbook-memory-bank` 스킬과 `.memory-bank/` 문서를 기능 작업 전 필수 참고 흐름으로 연결한다.
- React/Vite 앱 셸을 추가했다.
- 샘플 작성 폼, 포스트잇 피드, 카드 확장 댓글, 이미지/그림 첨부 UI를 추가했다.
- 모바일 390px와 데스크톱 1280px에서 가로 넘침 없이 기본 화면을 확인했다.
- `@supabase/supabase-js`를 추가하고 `auth`, `posts`, `comments`, `attachments` 서비스 모듈을 만들었다.
- 환경 변수가 없을 때 샘플 모드를 유지하고, 있을 때 Supabase 익명 인증과 실제 Data API/Reatime 흐름을 쓰도록 `src/App.jsx`를 연결했다.
- RLS, Data API grant, Storage bucket/policy, Realtime publication을 담은 Supabase 마이그레이션을 추가했다.
- `.env.example`과 `supabase/README.md`에 공개 환경 변수와 적용 순서를 남겼다.
- `supabase/config.toml`을 만들고 로컬 익명 로그인을 켰다.
- 게시글/댓글 `update` grant를 삭제 전용 의도에 맞게 `deleted_at` 컬럼으로 좁혔다.
- 로컬 Supabase 실행 가이드를 `supabase/README.md`와 `.env.example`에 추가했다.
- Docker Desktop 실행 후 로컬 Supabase stack을 시작하고 마이그레이션을 적용했다.
- `db reset`, `db lint`, `db advisors`, RLS/권한/Realtime publication 쿼리, Supabase JS 스모크 테스트를 통과했다.
- 로컬 `.env`를 만들어 앱이 샘플 모드가 아니라 로컬 Supabase 모드로 실행되게 했다.
- hosted Supabase 연결 가이드를 `supabase/README.md`에 추가하고 다음 작업 카드를 만들었다.
- `npx supabase login`, hosted project link, `db push --dry-run`까지 완료했고 dry-run은 migration 1개 적용 예정으로 통과했다.
- `.env`의 `SUPABASE_DB_PASSWORD`를 읽어 `db push`에 전달하는 helper script와 npm scripts를 추가했다.
- hosted DB에 guestbook backend migration을 적용했다.
- Storage public bucket broad SELECT policy advisor 경고를 후속 migration으로 제거했다.
- linked/local migration history와 DB advisors를 확인했고, 양쪽 모두 advisor 이슈 없음 상태다.
- hosted Auth anonymous sign-ins를 켰다.
- hosted smoke에서 익명 Auth, Data API, Storage upload/public URL, owner-only policy, 비허용 update 차단, 타인 삭제 차단을 확인했다.
- hosted Realtime은 명시적 Realtime auth token 동기화가 필요함을 확인했고 `src/lib/supabase/auth.js`에 보강했다.
- hosted URL과 publishable key 불일치로 생긴 브라우저 401 문제를 해결했다.
- Supabase 모드 초기 expanded post가 샘플 id라 hosted 댓글 조회 400을 만들던 문제를 해결했다.
- 실제 앱 UI에서 hosted 새 게시글 작성과 두 번째 탭 Realtime 반영을 확인했다.

## in progress

- hosted Supabase 첨부와 펼쳐진 댓글 실제 앱 검증.

## blocked

- 없음.

## next

- 브라우저 2개로 첨부, 펼쳐진 댓글 Realtime과 본인 삭제 권한을 추가 수동 검증한다.
- 작업 종료 후 노출된 DB password를 rotate하고 `.env`도 새 값으로 갱신한다.
- 로컬 작업이 끝나면 `npx supabase stop`으로 컨테이너를 정리한다.
