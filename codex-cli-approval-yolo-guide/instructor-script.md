# Codex CLI Approval 권한과 YOLO 모드 안전하게 쓰기

## 강의 목적

이 강의는 Codex CLI 입문자가 승인 권한, 샌드박스, YOLO 모드를 정확히 구분하고, 실제 작업에서 안전하게 권한을 조절하는 법을 익히도록 돕습니다.

핵심 문장은 하나입니다.

> Approval은 "언제 멈춰서 물어볼지", Sandbox는 "어디까지 손댈 수 있는지", YOLO는 "그 안전장치를 크게 끄는 모드"입니다.

## 권장 러닝타임

- 총 45-60분
- 오프닝과 문제 제기: 5분
- Approval과 Sandbox 개념 설명: 12분
- 안전한 기본 실행 패턴: 10분
- YOLO 모드의 의미와 위험: 10분
- 실습 데모: 15분
- 수강생 미션과 마무리: 5분

## 강의 목표

수강생은 이 강의를 마치면 다음을 할 수 있습니다.

- `approval_policy`와 `sandbox_mode`의 차이를 설명할 수 있다.
- `read-only`, `workspace-write`, `danger-full-access`의 차이를 구분할 수 있다.
- `untrusted`, `on-request`, `never` 승인 정책의 사용 상황을 말할 수 있다.
- YOLO 모드가 왜 위험한지 설명할 수 있다.
- 초보자에게 적합한 안전한 Codex CLI 실행 명령을 선택할 수 있다.

## 녹화 전 준비

화면에 개인 토큰, API 키, 실제 고객 프로젝트 경로, 실서비스 `.env` 파일이 보이지 않도록 정리합니다.

실습은 반드시 장난감 폴더에서 진행합니다.

추천 폴더:

```bash
cd /Users/dante/Desktop/codex-vibecoding/codex-cli-approval-yolo-guide/safe-demo
```

버전 확인:

```bash
codex --version
codex --help
codex exec --help
```

녹화일 기준으로 확인한 로컬 CLI는 `codex-cli 0.128.0`입니다. 공식 문서에는 `codex exec`에서 `--dangerously-bypass-approvals-and-sandbox`와 `--yolo`가 같은 위험 옵션으로 소개되어 있습니다. 다만 설치된 CLI의 도움말에는 긴 옵션명만 보일 수 있으므로, 영상에서는 "내 CLI에서는 `codex exec --help`로 실제 지원 여부를 확인한다"고 말합니다.

## 오프닝

안녕하세요. 이번 시간에는 Codex CLI를 쓸 때 꼭 알아야 하는 권한 설정을 다룹니다.

코덱스가 강력한 이유는 단순히 답변을 잘해서가 아닙니다. 파일을 읽고, 수정하고, 명령을 실행하고, 때로는 프로젝트 전체를 다룰 수 있기 때문입니다.

그런데 바로 그 지점 때문에 권한 설정이 중요합니다.

초보자가 자주 하는 실수는 이겁니다.

"자꾸 물어보니까 귀찮네. 그냥 다 허용하면 더 빠르겠지?"

빠를 수는 있습니다. 하지만 안전하지 않을 수 있습니다.

오늘은 Codex CLI에서 Approval, Sandbox, YOLO 모드를 구분하고, 어떤 상황에서 어떤 권한을 선택해야 하는지 실무 감각으로 정리하겠습니다.

## 1. 먼저 용어를 나눠서 이해하기

강의 멘트:

Codex CLI 권한을 이해할 때는 두 축으로 나눠야 합니다.

첫 번째는 Approval입니다.

Approval은 코덱스가 명령을 실행하기 전에 사람에게 물어보는 방식입니다.

"이 명령 실행해도 될까요?"

"샌드박스 밖으로 나가야 하는데 허용할까요?"

이런 확인 절차가 Approval입니다.

두 번째는 Sandbox입니다.

Sandbox는 코덱스가 실제로 접근할 수 있는 경계입니다.

어떤 파일을 읽을 수 있는지, 어디에 쓸 수 있는지, 네트워크나 시스템에 어느 정도 접근할 수 있는지를 제한합니다.

짧게 말하면:

- Approval: 언제 물어볼지
- Sandbox: 어디까지 할 수 있는지
- YOLO: 이 둘의 안전장치를 크게 끄는 위험 모드

## 2. Sandbox 모드 설명

Codex CLI에서 자주 볼 수 있는 샌드박스 모드는 세 가지입니다.

### read-only

`read-only`는 읽기 중심 모드입니다.

코덱스가 프로젝트를 분석하고 설명할 수 있지만, 파일을 직접 수정하거나 명령을 자유롭게 실행하는 데는 제한이 있습니다.

이 모드는 다음 상황에 좋습니다.

- 처음 보는 프로젝트를 분석할 때
- 코드 리뷰를 받을 때
- 수정 전 계획만 받고 싶을 때
- 위험한 저장소에서 일단 구조만 보고 싶을 때

예시:

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

강의 멘트:

처음 보는 프로젝트에서는 이 모드가 가장 편안합니다. 코덱스에게 눈은 주되, 손은 묶어두는 느낌입니다.

### workspace-write

`workspace-write`는 실무에서 가장 자주 쓸 기본값입니다.

현재 작업 폴더 안에서는 파일을 읽고 수정할 수 있지만, 작업 폴더 바깥이나 더 위험한 작업에는 제한이 걸립니다.

이 모드는 다음 상황에 좋습니다.

- 일반적인 기능 구현
- 문서 수정
- 테스트 추가
- 작은 리팩터링
- 강의 실습 프로젝트 작업

예시:

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

강의 멘트:

입문자에게 추천하는 기본 조합은 `workspace-write`와 `on-request`입니다. 평소 작업은 진행하되, 경계를 넘을 때는 멈춰서 확인할 수 있기 때문입니다.

### danger-full-access

`danger-full-access`는 이름 그대로 조심해야 하는 모드입니다.

샌드박스 제한을 크게 없애기 때문에 작업 폴더 밖의 파일이나 시스템 자원에 영향을 줄 수 있습니다.

이 모드는 초보자 일상 작업용이 아닙니다.

쓸 수 있는 경우가 있다면 다음처럼 제한된 상황입니다.

- 격리된 컨테이너
- 일회용 임시 폴더
- CI 전용 러너
- 비밀키와 실서비스 설정이 없는 환경

강의 멘트:

`danger-full-access`는 "고급 모드"가 아닙니다. "보호 장치가 적은 모드"입니다. 그래서 더 똑똑하게 만들어주는 옵션이 아니라, 더 책임지고 써야 하는 옵션입니다.

## 3. Approval 정책 설명

이제 Approval을 봅니다.

### untrusted

`untrusted`는 신뢰된 명령만 바로 실행하고, 그 외에는 물어보는 방식입니다.

처음 보는 저장소나 수강생 실습 환경에서는 안전한 선택입니다.

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

### on-request

`on-request`는 실무형 기본값으로 설명하면 좋습니다.

코덱스가 샌드박스 안에서 할 수 있는 일은 진행하고, 경계를 넘거나 추가 권한이 필요할 때 요청합니다.

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

강의 멘트:

이 조합은 운전으로 치면 일반 도로 주행에 가깝습니다. 계속 멈추지는 않지만, 위험한 구간에서는 확인합니다.

### never

`never`는 승인 요청을 하지 않는 모드입니다.

비대화형 자동화에서는 유용할 수 있지만, 초보자가 아무 저장소에서 켜두고 쓰기에는 위험합니다.

```bash
codex -C . --sandbox workspace-write --ask-for-approval never
```

강의 멘트:

여기서 중요한 점은 `never` 자체가 항상 최악은 아니라는 겁니다. 문제는 `never`와 넓은 샌드박스를 같이 쓰는 것입니다. `workspace-write` 안에서 반복 테스트를 돌리는 자동화와, 전체 시스템 접근을 허용한 자동화는 위험도가 완전히 다릅니다.

## 4. 추천 조합 정리

초보자에게는 네 가지 조합으로 가르치면 충분합니다.

### 1단계: 분석만 할 때

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

사용 상황:

- 코드 설명
- 구조 분석
- 버그 원인 추정
- 수정 계획 만들기

### 2단계: 일반 작업

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

사용 상황:

- 파일 수정
- 테스트 추가
- 문서 작성
- 작은 기능 구현

### 3단계: 로컬 자동화

```bash
codex -C . --sandbox workspace-write --ask-for-approval never
```

사용 상황:

- 이미 신뢰하는 저장소
- 작업 범위가 명확한 반복 명령
- CI처럼 실패를 로그로 받아도 되는 작업

주의할 점:

이 조합을 쓰더라도 프로젝트 밖을 쓰게 만들지 않습니다. 필요한 폴더가 여러 개라면 전체 권한을 푸는 대신, 필요한 writable root를 명확히 주는 방식이 더 안전합니다.

### 4단계: 격리 러너 전용

```bash
codex exec -C /tmp/codex-yolo-lab --dangerously-bypass-approvals-and-sandbox "작업 내용"
```

공식 문서에서는 이 옵션의 별칭으로 `--yolo`를 소개합니다. 다만 설치된 CLI 버전에 따라 도움말에 별칭이 보이지 않을 수 있으므로, 항상 `codex exec --help`로 확인합니다.

강의 멘트:

이 명령은 영상에서 습관처럼 따라 치게 만들면 안 됩니다. 보여주더라도 반드시 `/tmp` 같은 일회용 폴더나 컨테이너에서만 보여줍니다.

## 5. YOLO 모드 설명

YOLO 모드는 이름 때문에 재미있게 들릴 수 있지만, 실제 의미는 굉장히 무겁습니다.

`--dangerously-bypass-approvals-and-sandbox`는 승인 프롬프트와 샌드박스를 우회합니다.

즉, 코덱스가 멈춰서 물어보는 과정도 줄어들고, 파일 시스템 경계도 크게 약해집니다.

강의 멘트:

YOLO는 "빠른 모드"라고 설명하면 안 됩니다. "외부에서 이미 격리된 환경이라고 확신할 때만 쓰는 모드"라고 설명해야 합니다.

YOLO를 쓰면 안 되는 상황:

- 실제 업무 저장소
- 홈 디렉터리
- 데스크탑 전체
- `.env` 파일이 있는 프로젝트
- SSH 키나 배포 키가 있는 환경
- 프로덕션 DB나 배포 토큰이 노출된 터미널
- 어떤 명령이 실행될지 이해하지 못한 상태

YOLO를 고려할 수 있는 상황:

- 컨테이너 안
- 일회용 VM
- 빈 `/tmp` 실습 폴더
- 네트워크와 비밀키가 없는 러너
- 실패해도 삭제하면 되는 샘플 프로젝트

## 6. 실습 데모 1: 안전한 실습 폴더 확인

터미널에서 실습 폴더로 이동합니다.

```bash
cd /Users/dante/Desktop/codex-vibecoding/codex-cli-approval-yolo-guide/safe-demo
pwd
ls -la
```

샘플 파일을 확인합니다.

```bash
cat sample.txt
cat .env.example
```

강의 멘트:

이 폴더는 실습용입니다. 실제 프로젝트가 아닙니다. 권한을 설명하는 강의에서는 실습 공간을 분리하는 것 자체가 첫 번째 안전 습관입니다.

## 7. 실습 데모 2: read-only로 분석만 시키기

명령:

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

프롬프트:

```text
이 폴더의 파일을 읽고, 어떤 실습용 자료인지 설명해주세요. 파일은 수정하지 마세요.
```

설명 포인트:

- 코덱스가 분석 중심으로 동작한다.
- 수정 요청이 아니므로 read-only가 적합하다.
- 초보자는 처음 보는 프로젝트에서 이 단계부터 시작하면 안전하다.

## 8. 실습 데모 3: workspace-write로 작은 수정 맡기기

명령:

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

프롬프트:

```text
sample.txt에 "workspace-write 모드에서는 현재 작업 폴더 안의 파일 수정이 가능하다"는 문장을 한 줄 추가해주세요. 수정 후 변경한 파일만 요약해주세요.
```

수정 후 확인:

```bash
git diff -- sample.txt
```

강의 멘트:

이게 평소 작업의 기본 흐름입니다. 작업 폴더 안의 작은 수정은 맡기고, 코덱스가 더 큰 권한을 요구하면 그때 판단합니다.

## 9. 실습 데모 4: never를 안전하게 설명하기

명령:

```bash
codex -C . --sandbox workspace-write --ask-for-approval never
```

프롬프트:

```text
sample.txt 내용을 읽고 오탈자가 있는지 확인해주세요. 필요하면 현재 파일만 수정하고, 다른 파일은 만들거나 삭제하지 마세요.
```

강의 멘트:

여기서는 승인 요청을 하지 않지만, 샌드박스는 여전히 `workspace-write`입니다. 그래서 중요한 건 `never`를 쓴다고 곧바로 모든 안전장치가 사라지는 것이 아니라는 점입니다. 위험은 승인 정책과 샌드박스 범위를 어떻게 조합하느냐에서 생깁니다.

## 10. 실습 데모 5: YOLO는 실행보다 판단 기준을 보여주기

영상에서는 아래 명령을 바로 실행하지 말고, 먼저 체크리스트를 보여줍니다.

```bash
codex exec -C /tmp/codex-yolo-lab --dangerously-bypass-approvals-and-sandbox "이 폴더의 파일을 정리해주세요"
```

체크리스트:

- 이 폴더는 삭제해도 되는가?
- 이 환경에 `.env`, SSH 키, 배포 토큰이 없는가?
- 실제 업무 저장소가 아닌가?
- Git 상태가 깨끗하거나 일회용인가?
- 네트워크 접근이 없어도 되는가?
- 실행 결과를 사람이 다시 검토할 것인가?

강의 멘트:

YOLO를 잘 쓰는 사람은 과감한 사람이 아닙니다. 격리 환경을 먼저 만드는 사람입니다.

## 11. config.toml로 기본값 관리하기

Codex CLI는 매번 긴 옵션을 붙이지 않고 설정 파일과 profile로 기본값을 관리할 수 있습니다.

예시:

```toml
[profiles.readonly]
sandbox_mode = "read-only"
approval_policy = "untrusted"

[profiles.safe]
sandbox_mode = "workspace-write"
approval_policy = "on-request"

[profiles.local_automation]
sandbox_mode = "workspace-write"
approval_policy = "never"

# 일상 작업용이 아닙니다. 격리된 러너에서만 사용하세요.
[profiles.isolated_runner]
sandbox_mode = "danger-full-access"
approval_policy = "never"
```

설명 포인트:

- CLI 옵션이 profile보다 우선한다.
- 프로젝트별 설정보다 사용자 설정이 넓게 적용된다.
- 조직 정책에 따라 `never`나 `danger-full-access`가 막혀 있을 수 있다.
- 입문자는 `safe` profile부터 만들면 충분하다.

강의 멘트:

설정 파일을 보여줄 때 실제 개인 설정을 그대로 노출하지 마세요. 강의용 예시 파일을 따로 만들어 보여주는 것이 좋습니다.

## 12. 권한 선택 의사결정표

수강생에게 다음 표를 보여줍니다.

| 상황 | 추천 조합 | 이유 |
| --- | --- | --- |
| 처음 보는 프로젝트 분석 | `read-only` + `untrusted` | 수정 없이 이해부터 한다 |
| 일반 기능 구현 | `workspace-write` + `on-request` | 작업은 가능하고 위험 구간은 확인한다 |
| 반복 테스트 자동화 | `workspace-write` + `never` | 작업 폴더 안에서만 빠르게 반복한다 |
| 외부 폴더까지 필요한 작업 | writable root 추가 검토 | 전체 권한 해제보다 범위 추가가 안전하다 |
| YOLO 실행 | 격리 러너에서만 | 승인과 샌드박스를 우회하므로 위험하다 |

## 13. 수강생 미션

수강생에게 다음 미션을 줍니다.

### 미션 1: 세 가지 모드 실행해보기

실습 폴더에서 다음 세 명령을 각각 실행하고 차이를 기록합니다.

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

```bash
codex -C . --sandbox workspace-write --ask-for-approval never
```

### 미션 2: 상황별 권한 고르기

다음 상황에 맞는 권한 조합을 고릅니다.

1. 새 회사 프로젝트를 처음 분석한다.
2. README 문서를 수정한다.
3. 테스트를 10번 반복 실행하고 요약만 받는다.
4. 홈 디렉터리 전체를 정리해달라고 하고 싶다.
5. 컨테이너 안에서 일회용 샘플 앱을 만든다.

정답 방향:

- 1번: `read-only` + `untrusted`
- 2번: `workspace-write` + `on-request`
- 3번: `workspace-write` + `never`
- 4번: 하지 않는다. 범위를 좁힌다.
- 5번: 격리 여부를 확인한 뒤 필요할 때만 full access 또는 YOLO 검토

### 미션 3: 나만의 안전 체크리스트 만들기

아래 문장을 완성합니다.

```text
나는 YOLO 모드를 쓰기 전에 반드시 ______, ______, ______를 확인한다.
```

추천 답:

```text
나는 YOLO 모드를 쓰기 전에 반드시 일회용 폴더인지, 비밀키가 없는지, 실행 후 diff를 검토할 수 있는지 확인한다.
```

## 마무리 멘트

오늘 배운 내용을 한 문장으로 정리하면 이렇습니다.

> 권한을 많이 주는 것이 실력이 아니라, 필요한 만큼만 주는 것이 실력입니다.

Codex CLI를 잘 쓰는 사람은 YOLO를 자주 쓰는 사람이 아닙니다. 작업의 위험도를 보고, `read-only`, `workspace-write`, `danger-full-access`를 정확히 선택하는 사람입니다.

입문자는 기본적으로 `workspace-write`와 `on-request`를 사용하세요. 분석만 할 때는 `read-only`로 시작하세요. YOLO는 격리된 실습장이나 자동화 러너에서만 고려하세요.

다음 강의에서는 이 권한 설정을 실제 프로젝트 작업 흐름에 연결해서, "분석, 계획, 수정, 검증"을 CLI에서 안전하게 반복하는 방법을 다루겠습니다.

## 참고한 공식 문서

- OpenAI Codex CLI reference: https://developers.openai.com/codex/cli/reference
- OpenAI Codex sandboxing: https://developers.openai.com/codex/concepts/sandboxing
- OpenAI Codex config reference: https://developers.openai.com/codex/config-reference
- OpenAI Codex best practices: https://developers.openai.com/codex/learn/best-practices
