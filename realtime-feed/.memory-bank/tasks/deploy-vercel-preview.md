# Deploy Vercel Preview

## Goal

`realtime-feed` 앱을 Vercel `dante01yoons-projects` scope에 연결하고 preview deployment URL을 만든다.

## Status

done

## Files to inspect or edit

- `.vercel/project.json`
- `.gitignore`
- `.env`
- `package.json`
- `.memory-bank/active-context.md`
- `.memory-bank/progress.md`
- `.memory-bank/next-actions.md`
- `.memory-bank/verification-log.md`

## Plan

1. Vercel CLI 인증, 팀 목록, 기존 링크 파일을 확인한다.
2. `dante01yoons-projects` scope에 `realtime-feed` 프로젝트를 링크한다.
3. `.env`에서 공개 가능한 Vite Supabase 변수만 읽어 preview build env로 주입한다.
4. 로컬 build와 디자인 문서 lint를 확인한다.
5. Vercel preview deployment를 만들고 `vercel inspect --wait`로 READY 상태를 확인한다.

## Verification

- done: `npx --yes vercel@latest whoami`
- done: `npx --yes vercel@latest teams list --format json`
- done: `.vercel/project.json` 또는 `.vercel/repo.json`이 없음을 확인
- done: `npx --yes vercel@latest link --repo --scope dante01yoons-projects`는 같은 repo의 기존 `figma-calendar` 프로젝트만 제안해 중단함
- done: `npx --yes vercel@latest link --yes --scope dante01yoons-projects --project realtime-feed`
- done: `npm run build`
- done: `git diff --check`
- done: `npx @google/design.md lint DESIGN.md`
- done: `npx --yes vercel@latest deploy . -y --no-wait --scope dante01yoons-projects --target preview --archive=tgz ...`
- done: `npx --yes vercel@latest inspect https://realtime-feed-1qwf08rnl-dante01yoons-projects.vercel.app --wait --timeout 3m --scope dante01yoons-projects --format json` 결과 `target: preview`, `readyState: READY`

## Notes for the next session

Vercel project env에는 아직 값이 저장되어 있지 않다. 이번 preview deployment는 `.env`의 공개 가능한 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 일회성 build env로 주입했다. DB password, service role key, access token은 Vercel 브라우저 환경이나 메모리 뱅크에 기록하지 않는다.

첫 deploy 명령은 `--prod` 없이도 Vercel CLI가 `target: production`으로 처리해 `https://realtime-feed-guhg5b7xi-dante01yoons-projects.vercel.app` deployment와 `realtime-feed.vercel.app` alias를 만들었다. 이후 `--target preview`를 명시해 preview deployment를 별도로 만들었고, 최종 공유 대상은 preview URL이다. production alias 정리가 필요하면 Vercel Dashboard에서 확인 후 별도 작업으로 처리한다.
