# Supabase Setup

## Local Supabase

로컬 Supabase는 Docker Desktop이 실행 중이어야 한다.

1. Docker Desktop을 실행하고 daemon이 준비될 때까지 기다린다.
2. 처음 한 번만 `npx supabase init`을 실행한다. 이 저장소에는 `supabase/config.toml`이 이미 있다.
3. `npx supabase start`를 실행한다.
4. 출력 또는 `npx supabase status`에서 로컬 `Project URL`과 `Publishable` key를 확인한다.
5. 로컬 `.env`에 아래처럼 공개 가능한 값만 넣는다.

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<local Publishable key>
```

6. `npx supabase db reset`으로 마이그레이션을 적용한다.
7. `npx supabase db lint --local`로 로컬 DB lint를 확인한다.
8. `npm run dev`를 실행하고 브라우저 2개에서 게시글, 첨부, 펼쳐진 댓글 Realtime, 본인 삭제 권한을 확인한다.

정리할 때는 `npx supabase stop`을 사용한다.

## Hosted Supabase

실제 Supabase 프로젝트에 연결할 때는 secret을 저장소에 기록하지 않는다.
브라우저 앱에는 Project URL과 publishable key만 사용한다.

### 1. 프로젝트 만들기

1. Supabase Dashboard에서 새 프로젝트를 만든다.
2. 프로젝트 URL에서 project ref를 확인한다.
   예: `https://supabase.com/dashboard/project/<project-ref>`
3. Dashboard의 Auth 설정에서 Anonymous Sign-Ins를 켠다.

### 2. 마이그레이션 적용

권장 경로는 CLI로 linked project에 migration을 push하는 방식이다.

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list --linked
npx supabase db advisors --linked
```

Dashboard SQL Editor로 직접 적용할 수도 있지만, 이 경우 migration history가
CLI와 어긋날 수 있다. 이 프로젝트에서는 가능한 한 `supabase/migrations/` 파일을
source of truth로 두고 `db push`를 사용한다.

이 저장소에는 `.env`에서 `SUPABASE_DB_PASSWORD`를 읽어 `db push`에 전달하는
helper script도 있다. `.env`는 gitignore되어 있으므로 로컬에만 아래 값을 넣는다.

```bash
SUPABASE_DB_PASSWORD=<your hosted database password>
```

그 다음 아래 명령으로 dry-run 또는 실제 push를 실행한다.

```bash
npm run supabase:db:push:dry-run
npm run supabase:db:push
```

`SUPABASE_DB_PASSWORD`는 `VITE_` 접두사가 없기 때문에 브라우저 앱 환경 변수로
사용하지 않는다. Vercel 프론트엔드 환경 변수에도 넣지 않는다.

#### Temp role 또는 circuit breaker 오류가 날 때

`db push` 또는 `migration list --linked`가 temp role 인증 오류나 circuit breaker로
막히면 같은 명령을 계속 반복하지 않는다.

1. 몇 분 기다린 뒤 `npx supabase db push`를 다시 실행한다.
2. 계속 막히면 Supabase Dashboard의 Database password를 로컬 셸에서만 임시로 설정한다.

```bash
printf "Supabase DB password: "
read -s SUPABASE_DB_PASSWORD
printf "\n"
export SUPABASE_DB_PASSWORD
npx supabase db push
unset SUPABASE_DB_PASSWORD
```

CLI에는 `--password` 플래그도 있지만, 터미널 히스토리에 남을 수 있으므로 이
프로젝트에서는 임시 환경 변수 방식을 우선한다. DB password는 채팅, git,
메모리 뱅크, 문서에 기록하지 않는다.

### 3. 앱 환경 변수 설정

Dashboard의 API settings에서 아래 값을 확인한다.

- Project URL
- Publishable key

로컬 `.env` 또는 Vercel 환경 변수에 공개 가능한 값만 넣는다.

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```

`service_role` key, secret key, access token은 브라우저 앱, git, 메모리 뱅크에
넣지 않는다.

### 4. 실제 연결 검증

1. `npm run build`를 실행한다.
2. `npm run dev` 또는 Vercel preview를 연다.
3. 브라우저 2개 또는 일반/시크릿 창 2개를 연다.
4. 새 게시글을 작성하고 다른 브라우저에 실시간으로 들어오는지 확인한다.
5. 이미지 첨부와 그림 첨부를 각각 확인한다.
6. 게시글을 펼친 뒤 댓글이 로드되고, 펼쳐진 상태에서 댓글 Realtime이 동작하는지 확인한다.
7. 본인이 쓴 게시글/댓글 삭제는 성공하고, 다른 브라우저 세션의 글 삭제는 UI와 RLS에서 막히는지 확인한다.
8. Supabase Dashboard에서 Security Advisor와 RLS Tester로 정책을 확인한다.
