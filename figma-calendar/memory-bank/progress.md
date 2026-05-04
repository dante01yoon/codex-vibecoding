# 2026-05-03

- 보안 강화 Supabase v1 구현 계획을 적용했다.
- CDN 기반 `@supabase/supabase-js@2`, 로컬 `supabase-config.js`, 익명 Auth, 사용자 소유권 RLS 모델을 기준으로 앱 코드를 재작성했다.
- 실제 Supabase SQL은 실행하지 않고 `supabase/schema.sql` 초안으로만 추가했다.
- 브라우저에 `sb_secret_`, `service_role`, DB 연결 문자열처럼 보이는 값이 들어오면 연결을 중단하도록 설정 검증을 추가했다.
- `supabase-config.js`는 git에 올리지 않는 로컬 placeholder로 만들었고, 예시값 상태에서는 연결하지 않도록 막았다.
- 달력이 1월 고정으로 멈추지 않도록 이전/다음 월 이동 버튼을 추가하고, 앱 시작 날짜를 현재 날짜 기준으로 바꿨다.
- Supabase가 아직 연결되지 않아도 폼 입력은 가능하게 하고, 저장 시에는 네트워크 호출 없이 연결 필요 메시지를 보여주도록 조정했다.
- Supabase Auth CAPTCHA 보호에 대응하기 위해 Turnstile/hCaptcha site key 설정, 위젯 렌더링, captchaToken 기반 익명 로그인 흐름을 추가했다.
- CAPTCHA 통과 후 Supabase가 토큰을 거절하는 경우 provider/secret key/site key 도메인 확인 메시지가 화면에 뜨도록 오류 상태를 보강했다.
- 남은 작업: 개발용 Supabase 프로젝트에서 SQL 검토/승인/실행, Anonymous Sign-Ins 활성화, 실제 `supabase-config.js` 작성 후 브라우저 저장 흐름 확인.

# 2026-05-04

- 배포 강의 준비를 위해 `DEPLOYMENT_LECTURE_SCRIPT.md`와 `DEPLOYMENT_STUDENT_GUIDE.md`를 추가했다.
- Vercel 배포용 `package.json`, `vercel.json`, `scripts/build-deploy.mjs`를 추가했다.
- Vercel 빌드 단계에서 `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `TURNSTILE_SITE_KEY`를 읽어 `dist/supabase-config.js`를 생성하도록 했다.
- `dist/`, `supabase-config.js`, `verification-*.png`를 로컬 `.gitignore`에 추가했다.
- `npm run check`, 더미 공개값 기반 `npm run build`, `dist/` 정적 파일 200 응답 확인을 완료했다.
- 남은 작업: 실제 Vercel 프로젝트 환경 변수 입력, Cloudflare Turnstile 허용 도메인 등록, Supabase Auth CAPTCHA secret 설정, 배포 URL에서 일정 저장 검증.
- 배포 개념부터 Vercel/Turnstile/Supabase 검증까지 설명하는 19장 발표 자료를 PDF와 PPTX로 생성했다.
