# Setup Local Supabase

## Goal

로컬 Supabase stack을 준비해서 마이그레이션, 익명 인증, Storage, Realtime 흐름을 실제 DB에 적용하고 검증할 수 있게 만든다.

## Status

done

## Files to inspect or edit

- `supabase/config.toml`
- `supabase/migrations/20260511010100_create_guestbook_backend.sql`
- `supabase/README.md`
- `.env.example`
- `.memory-bank/verification-log.md`

## Plan

1. Supabase CLI 공식 문서와 현재 CLI help를 확인한다.
2. `supabase/config.toml`을 만들고 로컬 익명 로그인을 켠다.
3. 삭제 전용 의도에 맞게 `update` grant를 `deleted_at` 컬럼으로 좁힌다.
4. Docker Desktop이 준비되면 `npx supabase start`, `npx supabase db reset`, `npx supabase db lint --local`을 실행한다.
5. 로컬 URL/key로 `.env`를 만든 뒤 브라우저 2개에서 live 흐름을 확인한다.

## Verification

- done: `npx supabase init`
- done: `npx supabase init --help`
- done: `npx supabase start --help`
- done: `npx supabase db reset --help`
- done: Docker daemon 준비 후 `npx supabase start`
- done: `npx supabase db reset`
- done: `npx supabase migration list --local`
- done: `npx supabase db lint --local --fail-on error`
- done: `npx supabase db advisors --local`
- done: RLS, grants, Realtime publication SQL 확인
- done: Supabase JS 스모크 테스트로 Auth/Data API/Storage 소유권 정책 확인
- done: desktop/mobile screenshot으로 로컬 Supabase 모드 UI 확인

## Notes for the next session

로컬 Supabase stack은 Docker Desktop 위에서 실행할 수 있다. 로컬 publishable key는 `.env`에만 넣고 메모리 뱅크에는 기록하지 않는다. 작업이 끝나면 `npx supabase stop`으로 컨테이너를 정리한다.
