# Decision Log

## 2026-05-11

### Decision

로컬 Supabase 설정은 `supabase/config.toml`을 저장소에 두고, 익명 로그인은 로컬에서도 켠다.

### Reason

이 앱은 로그인 화면 없이 `signInAnonymously()`로 작성자를 식별한다. 로컬 검증에서도 hosted 프로젝트와 같은 인증 경로를 써야 RLS, Storage 경로, 본인 삭제 권한을 제대로 확인할 수 있다.

### Consequence

Docker Desktop이 준비되면 `npx supabase start`로 로컬 Auth/Postgres/Storage/Realtime을 띄우고, 출력되는 publishable key만 `.env`에 넣어 검증한다. secret key나 service role key는 기록하지 않는다.

### Decision

게시글과 댓글의 Data API `update` 권한은 `deleted_at` 컬럼으로 제한한다.

### Reason

첫 버전에서는 작성 후 수정 기능이 없고 본인 삭제만 허용한다. 테이블 전체 update 권한을 두면 작성자가 자신의 row에서 메시지나 메타데이터도 직접 바꿀 수 있다.

### Consequence

마이그레이션은 `grant update (deleted_at)`을 사용한다. 앱의 soft delete 경로는 유지하되, 다른 컬럼 갱신은 Data API 권한에서 차단한다.

### Decision

Supabase 환경 변수가 없을 때는 앱을 실패시키지 않고 샘플 모드로 유지한다.

### Reason

이 프로젝트는 강의/데모 흐름에서도 쓰이므로 실제 Supabase 프로젝트가 연결되지 않은 상태에서도 UI와 상호작용을 보여줄 수 있어야 한다.

### Consequence

`src/lib/supabase/client.js`가 환경 변수 존재 여부를 판단한다. URL/key가 있으면 익명 인증과 실제 서비스 모듈을 사용하고, 없으면 기존 샘플 데이터와 로컬 상호작용을 유지한다.

### Decision

추가 기능 수정이나 구현을 시작할 때는 `guestbook-memory-bank` 스킬을 참조하고 `.memory-bank/` 핵심 문서를 먼저 읽는다.

### Reason

현재 프로젝트는 문서와 샘플 UI 상태가 함께 움직인다. 다음 세션에서 바로 코드부터 수정하면 기존 범위, 디자인 기준, 검증 공백을 놓칠 수 있다.

### Consequence

`AGENTS.md`가 `DESIGN.md`, PRD 스펙, 메모리 뱅크 문서, task card 흐름을 함께 안내한다. 기능 작업 후에는 관련 메모리 문서를 짧게 갱신한다.

### Decision

첫 UI 작업은 Supabase 연결 없이 샘플 데이터 기반 React/Vite 앱 셸로 시작한다.

### Reason

섹션 11-7 메모리뱅크 데모 흐름에서는 프로젝트 구조와 UI 방향을 먼저 안전하게 보여주는 것이 중요하다. 실제 인증, Storage, Realtime 연결은 별도 작업으로 나누는 편이 설명과 검증이 쉽다.

### Consequence

초기 UI는 샘플 게시글, 샘플 댓글, 로컬 상호작용을 사용한다. 이후 서비스 모듈을 추가할 때 현재 UI 데이터를 normalized shape로 맞춰 이어갈 수 있게 한다.

### Decision

Hosted Supabase DB password는 `VITE_` 환경 변수가 아니라 로컬 CLI 전용 `SUPABASE_DB_PASSWORD`로만 다룬다.

### Reason

`supabase login`은 Supabase 계정 인증이고, hosted Postgres migration push에는 DB password가 별도로 필요할 수 있다. 이 값은 브라우저 앱이나 Vercel 프론트엔드 환경 변수에 들어가면 안 된다.

### Consequence

`scripts/supabase-db-push.mjs`가 로컬 `.env`에서 `SUPABASE_DB_PASSWORD`를 읽어 `npx supabase db push`에만 전달한다. `.env`는 gitignore 상태로 유지하고, 실제 password는 채팅, git, 메모리 뱅크에 기록하지 않는다.

### Decision

`guestbook-media` public bucket에는 broad SELECT policy를 두지 않는다.

### Reason

Supabase DB advisor가 public bucket의 broad SELECT policy를 파일 목록 조회 노출 위험으로 보고했다. Public object URL 접근에는 이 SELECT policy가 필요하지 않다.

### Consequence

초기 migration은 이미 원격에 적용되었으므로 후속 migration `20260511021759_restrict_guestbook_media_listing.sql`에서 `"Anyone can read guestbook media"` policy를 제거한다. 업로드와 삭제는 작성자 소유 경로 정책으로 유지한다.

### Decision

익명 세션을 확보한 뒤 Realtime auth token을 명시적으로 동기화한다.

### Reason

Hosted smoke에서 Auth, Data API, Storage는 통과했지만 Realtime Postgres changes는 명시적 token 동기화 없이는 timeout이 발생했다. `supabase.realtime.setAuth(access_token)` 호출 시 INSERT 이벤트 수신이 확인되었다.

### Consequence

`src/lib/supabase/auth.js`는 기존 세션 또는 새 anonymous session을 확보한 뒤 `client.realtime.setAuth(session.access_token)`을 호출한다. 이후 실제 브라우저 2개로 UI Realtime을 다시 확인한다.

### Decision

Supabase configured 상태에서는 샘플 게시글/댓글과 샘플 expanded post를 초기 상태로 쓰지 않는다.

### Reason

Hosted DB는 `uuid` id를 사용한다. Supabase 모드에서 샘플 id인 `post-102`를 펼친 상태로 시작하면 `guestbook_comments.post_id` 조회가 400으로 실패한다.

### Consequence

`src/App.jsx`는 Supabase 환경 변수가 있으면 초기 `posts`, `commentsByPost`, `expandedPostId`를 빈 상태로 시작하고, 실제 `listPosts()` 결과를 받은 뒤 live feed를 보여준다. 샘플 데이터는 Supabase 환경 변수가 없을 때만 초기 화면에 사용한다.
