# 수강생용 가이드

# Codex CLI Approval 권한과 YOLO 모드 안전하게 쓰기

## 오늘 꼭 기억할 문장

> Approval은 "언제 물어볼지", Sandbox는 "어디까지 손댈 수 있는지", YOLO는 "안전장치를 크게 끄는 위험 모드"입니다.

## 1. Approval과 Sandbox 차이

Codex CLI 권한은 두 가지로 나눠서 이해하면 쉽습니다.

| 구분 | 의미 | 예시 질문 |
| --- | --- | --- |
| Approval | 명령 실행 전 사람에게 물어볼지 | "이 명령 실행해도 될까요?" |
| Sandbox | 코덱스가 접근할 수 있는 범위 | "이 폴더 밖도 수정할 수 있나요?" |

## 2. Sandbox 모드

| 모드 | 의미 | 추천 상황 |
| --- | --- | --- |
| `read-only` | 읽기 중심 | 코드 분석, 리뷰, 계획 수립 |
| `workspace-write` | 작업 폴더 안에서 읽고 쓰기 | 일반 기능 구현, 문서 수정, 테스트 추가 |
| `danger-full-access` | 샌드박스 제한 거의 없음 | 격리된 컨테이너나 일회용 러너 |

입문자 기본값:

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

## 3. Approval 정책

| 정책 | 의미 | 추천 상황 |
| --- | --- | --- |
| `untrusted` | 신뢰된 명령 외에는 확인 | 처음 보는 프로젝트 |
| `on-request` | 필요할 때 승인 요청 | 일반적인 대화형 작업 |
| `never` | 승인 요청하지 않음 | 제한된 폴더 안의 반복 자동화 |

## 4. 추천 실행 패턴

### 분석만 할 때

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

추천 프롬프트:

```text
이 프로젝트 구조를 설명해주세요. 파일은 수정하지 마세요.
```

### 일반적인 수정 작업

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

추천 프롬프트:

```text
현재 작업 폴더 안에서만 README를 개선해주세요. 새 파일을 만들기 전에 먼저 설명해주세요.
```

### 반복 실행 자동화

```bash
codex -C . --sandbox workspace-write --ask-for-approval never
```

추천 프롬프트:

```text
테스트를 실행하고 실패 원인을 요약해주세요. 파일 수정은 하지 마세요.
```

## 5. YOLO 모드란?

공식 문서에서 `codex exec`의 위험 옵션으로 다음 형태가 소개됩니다.

```bash
codex exec --dangerously-bypass-approvals-and-sandbox "작업 내용"
```

문서에서는 별칭으로 `--yolo`도 소개하지만, 설치된 CLI 버전에 따라 도움말에 긴 옵션명만 보일 수 있습니다. 내 환경에서는 항상 다음으로 확인하세요.

```bash
codex exec --help
```

YOLO는 승인 프롬프트와 샌드박스를 우회하는 모드입니다.

그래서 일상 작업용이 아닙니다.

## 6. YOLO를 쓰면 안 되는 상황

- 실제 업무 저장소
- 홈 디렉터리
- 데스크탑 전체
- `.env`가 있는 프로젝트
- SSH 키, 배포 키, API 키가 있는 환경
- 프로덕션 DB와 연결된 프로젝트
- 어떤 명령이 실행될지 이해하지 못한 상태

## 7. YOLO를 고려할 수 있는 상황

- 일회용 `/tmp` 폴더
- 컨테이너
- 삭제 가능한 샘플 프로젝트
- 비밀키가 없는 환경
- 실패해도 되돌릴 수 있는 Git 상태

예시:

```bash
codex exec -C /tmp/codex-yolo-lab --dangerously-bypass-approvals-and-sandbox "샘플 프로젝트를 정리해주세요"
```

## 8. 권한 선택표

| 내가 하려는 일 | 추천 권한 |
| --- | --- |
| 코드 설명만 받고 싶다 | `read-only` + `untrusted` |
| 문서나 코드 파일을 수정하고 싶다 | `workspace-write` + `on-request` |
| 테스트를 반복 실행하고 싶다 | `workspace-write` + `never` |
| 작업 폴더 밖도 필요하다 | 먼저 범위를 좁히거나 writable root 검토 |
| YOLO를 쓰고 싶다 | 격리 환경인지 먼저 확인 |

## 9. 실습 미션

실습 폴더에서 다음 명령을 실행해보세요.

```bash
cd /Users/dante/Desktop/codex-vibecoding/codex-cli-approval-yolo-guide/safe-demo
```

### 미션 1: read-only

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

프롬프트:

```text
이 폴더의 파일을 읽고 어떤 실습인지 설명해주세요. 파일은 수정하지 마세요.
```

### 미션 2: workspace-write

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

프롬프트:

```text
sample.txt에 Codex CLI 권한 학습용 파일이라는 설명을 한 줄 추가해주세요. 현재 파일만 수정해주세요.
```

### 미션 3: 안전 체크리스트 작성

아래 문장을 완성하세요.

```text
나는 YOLO 모드를 쓰기 전에 반드시 ______, ______, ______를 확인한다.
```

추천 답:

```text
나는 YOLO 모드를 쓰기 전에 반드시 일회용 폴더인지, 비밀키가 없는지, 실행 후 diff를 검토할 수 있는지 확인한다.
```

## 10. 최종 정리

권한을 크게 주는 것이 실력이 아닙니다.

필요한 만큼만 권한을 주고, 결과를 검토하는 것이 Codex CLI를 안전하게 쓰는 실력입니다.
