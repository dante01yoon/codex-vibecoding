# 수강생용 가이드: Figma Calendar Vercel 배포

이 문서는 Figma Calendar 앱을 Vercel에 배포하고, Cloudflare Turnstile을 사용해 Supabase 익명 로그인을 보호하는 실습 가이드입니다.

## 오늘의 결과물

실습이 끝나면 다음을 갖게 됩니다.

- Vercel 배포 URL
- Supabase에 저장되는 일정 앱
- Cloudflare Turnstile 보안 확인
- 배포용 환경 변수 설정
- 배포 후 검증 체크리스트

## 1. 배포란?

배포는 내 컴퓨터에서만 보이던 앱을 다른 사람이 접속할 수 있는 주소로 올리는 일입니다.

이번 앱에서는 다음 서비스가 함께 동작합니다.

| 서비스 | 역할 |
| --- | --- |
| Vercel | HTML/CSS/JS 파일 배포 |
| Supabase | 일정 데이터 저장 |
| Cloudflare Turnstile | 봇 방지 CAPTCHA |

## 2. 배포 전 준비물

필요한 계정:

- GitHub
- Vercel
- Supabase
- Cloudflare

필요한 값:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

주의:

- `TURNSTILE_SITE_KEY`는 Vercel 환경 변수에 넣습니다.
- `TURNSTILE_SECRET_KEY`는 Supabase 대시보드에 넣습니다.
- Supabase `service_role` key는 어디에도 넣지 않습니다.

## 3. 로컬에서 빌드 확인

프로젝트 폴더로 이동합니다.

```bash
cd /Users/dante/Desktop/codex-vibecoding/figma-calendar
```

문법 확인:

```bash
npm run check
```

배포 빌드 테스트:

```bash
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co" \
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..." \
TURNSTILE_SITE_KEY="YOUR_TURNSTILE_SITE_KEY" \
npm run build
```

`dist/` 폴더가 생기면 배포 준비가 된 것입니다.

## 4. Cloudflare Turnstile 만들기

1. Cloudflare 대시보드에 로그인합니다.
2. Turnstile 메뉴로 이동합니다.
3. Add widget을 누릅니다.
4. 이름을 정합니다.
   - 예: `figma-calendar-demo`
5. 도메인을 등록합니다.
   - `localhost`
   - 배포 후 Vercel 도메인
6. Site key를 복사합니다.
7. Secret key를 복사합니다.

기억할 것:

- Site key: 브라우저용
- Secret key: 서버 검증용

이 프로젝트에서는 Supabase Auth가 서버 검증 역할을 하므로, Secret key를 Supabase에 넣습니다.

## 5. Supabase 설정

Supabase 대시보드에서 확인합니다.

1. Auth > Sign In / Providers로 이동합니다.
2. Anonymous Sign-Ins를 켭니다.
3. Auth 설정의 Bot and Abuse Protection으로 이동합니다.
4. Enable CAPTCHA protection을 켭니다.
5. Provider를 Cloudflare Turnstile로 선택합니다.
6. Turnstile secret key를 입력합니다.
7. 저장합니다.

SQL은 이미 `supabase/schema.sql`에 준비되어 있습니다.

실행 전 확인:

- 개발용 프로젝트인지 확인
- 실제 개인정보가 없는지 확인
- RLS policy가 포함되어 있는지 확인

## 6. Vercel 프로젝트 만들기

1. Vercel에 로그인합니다.
2. Add New Project를 누릅니다.
3. GitHub 저장소를 연결합니다.
4. Root Directory를 `figma-calendar`로 설정합니다.
5. Build Command를 확인합니다.

```text
npm run build
```

6. Output Directory를 확인합니다.

```text
dist
```

## 7. Vercel 환경 변수 추가

Vercel Project Settings > Environment Variables에서 추가합니다.

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
TURNSTILE_SITE_KEY=your_turnstile_site_key
CAPTCHA_PROVIDER=turnstile
```

추가 후 다시 배포해야 적용됩니다.

## 8. 배포하기

Vercel에서 Deploy를 누릅니다.

빌드 로그에서 아래 문구를 확인합니다.

```text
Generated dist/supabase-config.js from deployment environment variables.
Deployment build ready in dist/.
```

배포가 끝나면 URL이 생깁니다.

예:

```text
https://figma-calendar-demo.vercel.app
```

이 URL을 Cloudflare Turnstile 위젯의 허용 도메인에 추가합니다.

## 9. 배포 후 검증

배포 URL을 열고 확인합니다.

- 캘린더가 보인다.
- Security check가 보인다.
- Turnstile 확인이 된다.
- 일정 목록이 불러와진다.
- 새 일정을 추가할 수 있다.
- 새로고침 후에도 일정이 남아 있다.
- 모바일 화면에서 깨지지 않는다.
- 콘솔에 예상하지 못한 에러가 없다.

개발자 도구 콘솔에서 확인:

```js
window.FIGMA_CALENDAR_DEBUG
```

## 10. 문제 해결

### `supabase-config.js`가 없다고 나올 때

확인할 것:

- Vercel 환경 변수가 들어갔는가
- Build Command가 `npm run build`인가
- Output Directory가 `dist`인가
- 배포를 다시 했는가

### CAPTCHA가 실패할 때

확인할 것:

- Cloudflare Turnstile site key가 Vercel env에 들어갔는가
- Cloudflare Turnstile secret key가 Supabase에 들어갔는가
- provider가 Turnstile로 설정되어 있는가
- Vercel 도메인이 Cloudflare 위젯 허용 도메인에 들어갔는가

### 일정 저장이 실패할 때

확인할 것:

- Supabase Anonymous Sign-Ins가 켜져 있는가
- `schedule_events` RLS policy가 있는가
- `schedule_categories` seed 데이터가 있는가
- 브라우저 콘솔에 어떤 에러가 나오는가

## 11. 제출할 것

수강생은 아래를 제출합니다.

- Vercel 배포 URL
- Turnstile이 보이는 화면 캡처
- 일정 추가 후 Supabase에 row가 들어간 화면 캡처
- 배포 중 만난 오류와 해결 방법 한 줄 요약

## 최신성 메모

확인일: 2026-05-04

이 가이드는 Vercel, Cloudflare Turnstile, Supabase 공식 문서를 기준으로 작성했습니다.
