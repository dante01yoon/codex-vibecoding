# Fix Soft Delete RLS

## Goal

Vercel 배포 앱에서 본인이 작성한 게시글/댓글 삭제가 실패하는 문제를 수정한다.

## Status

done

## Files to inspect or edit

- `supabase/migrations/20260511010100_create_guestbook_backend.sql`
- `supabase/migrations/20260511105059_allow_owner_soft_deleted_select.sql`
- `src/lib/supabase/posts.js`
- `src/lib/supabase/comments.js`
- `.memory-bank/verification-log.md`

## Plan

1. 삭제 버튼에서 호출되는 `softDeletePost`, `softDeleteComment` 경로를 확인한다.
2. hosted Supabase에서 같은 익명 세션으로 soft-delete update를 재현한다.
3. RLS `UPDATE`가 soft-delete 후 row를 검증할 수 있도록 SELECT 정책을 보강한다.
4. local reset, advisors, remote dry-run, remote push를 확인한다.
5. API smoke와 public Vercel UI에서 작성 후 삭제 흐름을 확인한다.

## Verification

- done: 현재 구현이 hard delete가 아니라 `deleted_at` 업데이트임을 확인
- done: 기존 정책에서 owner soft-delete update가 RLS `42501`로 실패하는 것을 hosted Supabase에서 재현
- done: Supabase docs에서 `UPDATE`에는 대응되는 `SELECT` policy가 필요함을 확인
- done: `supabase/migrations/20260511105059_allow_owner_soft_deleted_select.sql` 추가
- done: 기존 active-only SELECT policy를 drop하고 active row 또는 owner soft-deleted row를 허용하는 combined SELECT policy로 교체
- done: `npx supabase db reset`
- done: `npx supabase db advisors --local` 결과 `No issues found`
- done: `npm run supabase:db:push:dry-run`
- done: `npm run supabase:db:push`
- done: `npx supabase migration list --linked`
- done: API smoke에서 owner post/comment delete 성공, other session delete 차단, active row 0개 확인
- done: public Vercel alias `https://realtime-feed.vercel.app`에서 UI 작성 후 삭제 버튼 클릭 성공, console error 0개 확인

## Notes for the next session

삭제 실패의 원인은 버튼 핸들러가 아니라 RLS 정책이었다. soft-delete는 업데이트 후 `deleted_at is not null` 상태가 되므로, owner가 그 row를 읽을 수 있는 SELECT policy가 없으면 UPDATE 자체가 RLS에서 막힌다. 앱의 일반 feed/comment 조회는 계속 `.is('deleted_at', null)` 필터를 사용하므로 삭제된 row가 화면에 다시 나타나지 않는다.
