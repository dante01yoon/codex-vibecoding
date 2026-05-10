# 데모 프롬프트 모음

## 1. 프로젝트 분석 전용

실행:

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

프롬프트:

```text
이 폴더의 파일을 읽고, 어떤 실습용 자료인지 설명해주세요. 파일은 수정하지 마세요.
```

## 2. 수정 계획만 받기

실행:

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

프롬프트:

```text
sample.txt를 더 좋은 강의 실습 파일로 만들려면 무엇을 추가하면 좋을지 계획만 알려주세요. 아직 파일은 수정하지 마세요.
```

## 3. 작은 수정 맡기기

실행:

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

프롬프트:

```text
sample.txt에 "workspace-write 모드에서는 현재 작업 폴더 안의 파일 수정이 가능하다"는 문장을 한 줄 추가해주세요. 현재 파일만 수정하고, 수정 후 변경 내용을 요약해주세요.
```

## 4. 반복 자동화 예시

실행:

```bash
codex -C . --sandbox workspace-write --ask-for-approval never
```

프롬프트:

```text
현재 폴더의 문서 파일을 확인하고 오탈자 후보만 요약해주세요. 파일은 수정하지 마세요.
```

## 5. 위험한 요청을 안전하게 바꾸기

나쁜 요청:

```text
내 데스크탑 전체를 정리하고 필요 없는 파일을 삭제해줘.
```

좋은 요청:

```text
현재 실습 폴더 안의 파일만 읽고, 정리 후보를 목록으로 제안해주세요. 실제 삭제는 하지 마세요.
```

## 6. YOLO 설명용 명령

강의에서는 바로 실행하지 말고 체크리스트와 함께 설명합니다.

```bash
codex exec -C /tmp/codex-yolo-lab --dangerously-bypass-approvals-and-sandbox "이 일회용 폴더 안에서만 샘플 파일을 정리해주세요"
```

체크리스트:

```text
- 이 폴더는 삭제해도 되는가?
- 비밀키와 .env가 없는가?
- 실제 업무 저장소가 아닌가?
- 실행 후 diff나 파일 목록을 확인할 수 있는가?
- 이 작업은 컨테이너나 /tmp 같은 격리 환경에서 하는가?
```

## 7. 학생 퀴즈

프롬프트:

```text
다음 상황에 맞는 Codex CLI 권한 조합을 추천해주세요.

1. 처음 보는 프로젝트를 분석한다.
2. README를 수정한다.
3. 테스트를 반복 실행한다.
4. 홈 디렉터리 전체를 정리한다.
5. 컨테이너 안에서 일회용 샘플 앱을 만든다.

각 상황마다 sandbox와 approval을 나눠서 답해주세요.
```
