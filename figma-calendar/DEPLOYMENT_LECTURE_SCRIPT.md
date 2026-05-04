# 강사용 스크립트: Figma Calendar 앱 Vercel 배포와 Cloudflare Turnstile 적용

## 권장 러닝타임

- 총 55-70분
- 배포 정의와 전체 구조: 10분
- 배포 전 점검: 8분
- Cloudflare Turnstile와 Supabase CAPTCHA 설정: 15분
- Vercel 프로젝트 생성과 환경 변수 설정: 15분
- 배포 후 검증과 문제 해결: 15분
- 수강생 미션과 마무리: 5분

## 강의 목표

수강생은 이 강의를 마치면 다음을 할 수 있습니다.

- 배포가 무엇인지 입문자 언어로 설명할 수 있다.
- 로컬 앱, Supabase, Cloudflare Turnstile, Vercel의 역할을 구분할 수 있다.
- Vercel에 정적 HTML/CSS/JS 앱을 배포할 수 있다.
- Vercel 환경 변수로 공개 설정 파일을 생성하는 이유를 설명할 수 있다.
- Supabase 익명 로그인에 Cloudflare Turnstile을 붙이는 흐름을 이해할 수 있다.
- 배포 후 URL에서 CAPTCHA, Supabase 저장, 새로고침 유지 여부를 검증할 수 있다.

## 한 줄 메시지

> 배포는 내 컴퓨터에서만 보이던 앱을, 안전한 설정과 함께 다른 사람이 접속할 수 있는 주소로 올리는 과정입니다.

## 오프닝

안녕하세요. 이번 시간에는 우리가 만든 Figma Calendar 앱을 실제 웹 주소로 배포해보겠습니다.

지금까지 앱은 내 컴퓨터에서만 열렸습니다.

`python3 -m http.server 4175`를 실행하고, `localhost:4175`로 접속했습니다.

이 상태는 실습하기에는 좋지만, 다른 사람에게 보여줄 수는 없습니다.

오늘은 이 앱을 Vercel에 올려서 실제 URL을 만들겠습니다.

그리고 배포할 때 Cloudflare CAPTCHA, 정확히는 Cloudflare Turnstile도 함께 연결합니다.

왜냐하면 이 앱은 Supabase 익명 로그인을 사용합니다. 누구나 접속해서 임시 사용자가 될 수 있는 구조라서, 공개 배포 시 봇 가입을 줄이는 장치가 필요합니다.

## 1. 배포란 무엇인가

입문자에게 배포는 이렇게 설명합니다.

배포는 "내 컴퓨터의 파일을 인터넷에서 접속 가능한 서버에 올리는 일"입니다.

조금 더 앱 관점으로 말하면 다음 3가지를 준비하는 과정입니다.

1. 앱 파일을 올릴 장소
2. 앱이 사용할 외부 서비스 설정
3. 사용자가 접속할 주소

이번 앱에서는 각각 이렇게 연결됩니다.

| 역할 | 이번 강의에서 쓰는 도구 |
| --- | --- |
| 앱 파일을 올릴 곳 | Vercel |
| 일정 데이터 저장 | Supabase |
| 봇 방지 | Cloudflare Turnstile |
| 사용자가 접속할 주소 | Vercel 배포 URL |

강의 멘트:

배포는 버튼 하나 누르는 일이 아닙니다. 배포는 "로컬에서 되던 앱이 공개 환경에서도 안전하게 작동하도록 설정을 옮기는 일"입니다.

## 2. 이번 앱의 배포 구조

이번 앱은 Next.js나 React 프로젝트가 아닙니다.

순수 HTML, CSS, JavaScript 앱입니다.

그래서 배포 구조가 단순합니다.

```text
브라우저
  ↓
Vercel에 배포된 index.html, styles.css, script.js
  ↓
supabase-config.js에서 공개 설정 읽기
  ↓
Cloudflare Turnstile 확인
  ↓
Supabase Auth 익명 로그인
  ↓
schedule_events 테이블에 일정 저장
```

여기서 가장 중요한 분리는 이것입니다.

- 브라우저에 들어가도 되는 값: Supabase URL, publishable key, Turnstile site key
- 브라우저에 들어가면 안 되는 값: Supabase service_role key, secret key, Turnstile secret key

Turnstile secret key는 Supabase 대시보드의 Bot and Abuse Protection 설정에 넣습니다.

## 3. 배포 전 프로젝트 점검

먼저 프로젝트 파일을 봅니다.

```text
figma-calendar/
  index.html
  styles.css
  script.js
  supabase/schema.sql
  supabase-config.example.js
  package.json
  vercel.json
  scripts/build-deploy.mjs
```

강의 멘트:

우리는 `supabase-config.js`를 git에 올리지 않습니다.

대신 Vercel 빌드 단계에서 환경 변수를 읽어서 `dist/supabase-config.js`를 생성합니다.

이렇게 하면 로컬 설정과 배포 설정을 분리할 수 있습니다.

로컬 확인:

```bash
npm run check
```

배포 빌드 확인:

```bash
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co" \
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..." \
TURNSTILE_SITE_KEY="YOUR_TURNSTILE_SITE_KEY" \
npm run build
```

생성 결과:

```text
dist/
  index.html
  styles.css
  script.js
  supabase-config.js
```

## 4. Cloudflare Turnstile 준비

Cloudflare Turnstile은 CAPTCHA 대체 도구입니다.

강의에서는 "Cloudflare CAPTCHA"라고 부를 수 있지만, 정확한 제품명은 Turnstile입니다.

준비 순서:

1. Cloudflare 대시보드에서 Turnstile로 이동합니다.
2. 새 위젯을 만듭니다.
3. 위젯 이름을 `figma-calendar-demo`처럼 정합니다.
4. 도메인에 로컬과 배포 도메인을 추가합니다.
   - `localhost`
   - Vercel preview 도메인
   - Vercel production 도메인
5. Site key를 복사합니다.
6. Secret key를 복사합니다.

주의:

- Site key는 브라우저에 들어갈 수 있습니다.
- Secret key는 브라우저에 넣으면 안 됩니다.
- Secret key는 Supabase Auth CAPTCHA 설정에 넣습니다.

## 5. Supabase에서 CAPTCHA 켜기

Supabase 대시보드에서 다음을 확인합니다.

1. Auth > Sign In / Providers에서 Anonymous Sign-Ins를 켭니다.
2. Auth 설정의 Bot and Abuse Protection에서 CAPTCHA 보호를 켭니다.
3. Provider를 Cloudflare Turnstile로 선택합니다.
4. Cloudflare Turnstile secret key를 입력합니다.
5. 저장합니다.

강의 멘트:

우리가 브라우저에서 Turnstile 토큰을 받으면, 앱은 그 토큰을 Supabase 익명 로그인 요청에 함께 보냅니다.

Supabase Auth가 서버 쪽에서 CAPTCHA를 검증합니다.

즉, 이 구조에서는 우리가 직접 Cloudflare Siteverify API를 호출하는 서버를 만들지 않습니다. Supabase Auth가 그 역할을 맡습니다.

단, 직접 백엔드 API를 만들 때는 Cloudflare 문서처럼 서버에서 Siteverify API를 호출해야 합니다. 클라이언트 위젯만으로는 보호가 완성되지 않습니다.

## 6. Vercel 배포 준비

Vercel 배포 방식은 두 가지가 있습니다.

1. GitHub 저장소를 연결해서 배포
2. Vercel CLI로 배포

강의에서는 GitHub 연결 방식을 추천합니다. 수강생이 나중에 수정하고 push하면 자동으로 다시 배포되는 흐름을 이해하기 좋습니다.

Vercel에서 새 프로젝트를 만듭니다.

설정:

- Root Directory: `figma-calendar`
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework Preset: Other 또는 자동 감지

`vercel.json`이 있으므로 Vercel은 build command와 output directory를 파일 기준으로도 확인할 수 있습니다.

## 7. Vercel 환경 변수

Vercel Project Settings > Environment Variables에 아래 값을 넣습니다.

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
TURNSTILE_SITE_KEY
CAPTCHA_PROVIDER
```

권장 값:

```text
CAPTCHA_PROVIDER=turnstile
```

환경 변수 설명:

| 이름 | 브라우저 노출 | 설명 |
| --- | --- | --- |
| `SUPABASE_URL` | 가능 | Supabase 프로젝트 URL |
| `SUPABASE_PUBLISHABLE_KEY` | 가능 | 브라우저용 공개 키 |
| `TURNSTILE_SITE_KEY` | 가능 | Cloudflare Turnstile site key |
| Turnstile secret key | 불가 | Supabase 대시보드에만 입력 |
| Supabase service_role key | 불가 | 브라우저와 Vercel env에 넣지 않음 |

강의 멘트:

Vercel 환경 변수에 넣는 값이라고 해서 모두 비밀은 아닙니다.

이번 값들은 빌드 시 `supabase-config.js`로 변환되어 브라우저에 공개됩니다.

그래서 여기에는 공개되어도 되는 값만 넣어야 합니다.

## 8. 첫 배포

Vercel에서 Deploy 버튼을 누릅니다.

빌드 로그에서 확인할 문구:

```text
Generated dist/supabase-config.js from deployment environment variables.
Deployment build ready in dist/.
```

배포가 완료되면 Preview URL이 생깁니다.

예:

```text
https://figma-calendar-xxxx.vercel.app
```

이 URL을 Cloudflare Turnstile 위젯의 허용 도메인에 추가합니다.

그 후 다시 배포하거나, 위젯 도메인 설정이 적용될 때까지 잠시 기다립니다.

## 9. 배포 후 검증

브라우저에서 Vercel URL을 엽니다.

확인할 것:

- 캘린더 화면이 뜬다.
- Supabase 설정 오류가 보이지 않는다.
- Security check 영역에 Cloudflare Turnstile이 뜬다.
- Turnstile 확인 후 Supabase 익명 로그인이 완료된다.
- 기존 일정이 보인다.
- 새 일정을 추가할 수 있다.
- 새로고침 후 일정이 다시 보인다.
- 브라우저 콘솔에 예상하지 못한 에러가 없다.
- Supabase `schedule_events` 테이블에 row가 추가된다.
- row의 `user_id`가 현재 익명 사용자와 연결된다.

강의 중 보여줄 디버깅 포인트:

```text
window.FIGMA_CALENDAR_DEBUG
```

이 값을 콘솔에서 확인하면 마지막 CAPTCHA 상태와 인증 상태를 볼 수 있습니다.

## 10. 자주 나는 배포 오류

### 1. `supabase-config.js`가 404

가능한 원인:

- Vercel build command가 실행되지 않았다.
- 환경 변수가 누락되어 빌드가 실패했다.
- Output Directory가 `dist`가 아니다.

확인:

- Vercel Build Logs
- `dist/supabase-config.js` 생성 여부

### 2. CAPTCHA가 계속 실패한다

가능한 원인:

- Turnstile site key와 secret key가 서로 다른 위젯의 것이다.
- Vercel 도메인이 Cloudflare Turnstile 허용 도메인에 없다.
- Supabase CAPTCHA provider가 Turnstile로 설정되어 있지 않다.
- Supabase에는 secret key를 넣어야 하는데 site key를 넣었다.

### 3. Supabase 저장이 실패한다

가능한 원인:

- Anonymous Sign-Ins가 꺼져 있다.
- RLS policy가 없다.
- `schedule_events.user_id` 정책과 현재 auth user가 맞지 않는다.
- `SUPABASE_PUBLISHABLE_KEY`가 잘못됐다.

### 4. 로컬에서는 됐는데 배포에서는 안 된다

대부분 설정 차이입니다.

- 로컬 `supabase-config.js`
- Vercel Environment Variables
- Cloudflare Turnstile allowed domains
- Supabase Auth CAPTCHA 설정
- Supabase Auth anonymous setting

## 11. 수강생 미션

미션 1:

- 배포가 무엇인지 자기 말로 한 문장으로 정리합니다.

미션 2:

- Vercel에 프로젝트를 만들고 Preview URL을 얻습니다.

미션 3:

- Cloudflare Turnstile site key와 Supabase CAPTCHA secret key의 위치를 구분합니다.

미션 4:

- 배포 URL에서 CAPTCHA를 통과하고 일정을 저장합니다.

미션 5:

- 새로고침 후 일정이 유지되는지 확인합니다.

## 마무리 멘트

오늘 배운 배포는 단순히 파일을 올리는 일이 아니었습니다.

앱 파일은 Vercel에 올렸고, 데이터는 Supabase에 저장했고, 공개 환경에서의 봇 방지는 Cloudflare Turnstile로 처리했습니다.

입문자가 배포에서 가장 먼저 배워야 하는 것은 "어디에 무엇을 넣어야 하는가"입니다.

브라우저에 들어가도 되는 값과 절대 들어가면 안 되는 값을 구분하는 것, 이것이 안전한 배포의 시작입니다.

## 녹화 전 체크

- Vercel 계정 로그인 상태
- GitHub 저장소 또는 배포할 프로젝트 준비
- Supabase 개발 프로젝트 준비
- Supabase Anonymous Sign-Ins 활성화
- Supabase CAPTCHA provider 설정 위치 확인
- Cloudflare Turnstile 위젯 생성 화면 준비
- Vercel 환경 변수 값 준비
- 실제 secret key가 녹화 화면에 보이지 않게 가림
- 배포 후 검증할 더미 일정 준비

## 참고한 공식 문서

- Vercel Deployments: https://vercel.com/docs/deployments/overview
- Vercel Project Configuration: https://vercel.com/docs/project-configuration
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- Cloudflare Turnstile client-side rendering: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- Cloudflare Turnstile server-side validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Supabase CAPTCHA protection: https://supabase.com/docs/guides/auth/auth-captcha
- Supabase Anonymous Sign-Ins: https://supabase.com/docs/guides/auth/auth-anonymous
