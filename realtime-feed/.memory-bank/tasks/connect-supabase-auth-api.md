# Connect Supabase Auth And API

## Goal

Supabase 익명 인증, 게시글/댓글 Data API, Storage 첨부, Realtime 구독을 현재 샘플 UI에 연결한다.

## Status

done

## Files to inspect or edit

- `src/App.jsx`
- `src/lib/guestbook/*`
- `src/lib/supabase/*`
- `.env.example`
- `supabase/migrations/*`
- `.memory-bank/active-context.md`
- `.memory-bank/progress.md`
- `.memory-bank/next-actions.md`
- `.memory-bank/verification-log.md`

## Plan

1. Supabase 공식 문서와 현재 앱 구조를 확인한다.
2. 브라우저 공개 키만 사용하는 Supabase client와 auth/posts/comments/attachments 서비스 모듈을 만든다.
3. 환경 변수가 없으면 기존 샘플 모드로 유지하고, 있으면 익명 세션과 실제 Data API/Realtime 흐름을 사용한다.
4. RLS, Data API grants, Realtime publication, Storage bucket/policy SQL을 마이그레이션으로 남긴다.
5. 빌드와 디자인 문서 lint를 실행하고 남은 실제 Supabase 검증 공백을 기록한다.

## Verification

- done: `npm run build`
- done: `git diff --check`
- done: `npx @google/design.md lint DESIGN.md`
- done: Supabase 익명 인증, Data API grants, RLS, Storage, Realtime 정적 재점검
- done: 삭제 전용 의도에 맞게 `update` grant를 `deleted_at` 컬럼으로 좁힘
- done: 로컬 Supabase DB에 마이그레이션 적용 및 lint/advisors 통과
- done: Supabase JS 스모크 테스트로 Auth/Data API/Storage 정책 확인
- done: `curl -I http://127.0.0.1:5175/`
- done: desktop/mobile Playwright screenshots in sample mode
- blocked: Supabase 실제 프로젝트 적용 후 브라우저 2개 realtime 수동 확인

## Notes for the next session

실제 Supabase URL/key는 메모리 뱅크나 git에 기록하지 않는다. 브라우저에는 publishable/anon key만 둔다. 다음 세션은 Supabase Dashboard에서 Anonymous Sign-Ins를 켜고 마이그레이션을 적용한 뒤 live Auth/Storage/Realtime을 검증하면 된다.
