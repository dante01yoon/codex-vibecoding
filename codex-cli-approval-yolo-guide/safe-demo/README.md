# Codex CLI 권한 실습 폴더

이 폴더는 Codex CLI의 Approval, Sandbox, YOLO 개념을 설명하기 위한 안전한 실습 공간입니다.

실제 업무 프로젝트가 아닙니다.

## 실습 순서

1. read-only로 분석만 해보기
2. workspace-write로 작은 파일 수정해보기
3. approval never를 제한된 폴더에서 설명하기
4. YOLO는 실행보다 체크리스트 중심으로 이해하기

## 권장 명령

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

```bash
codex -C . --sandbox workspace-write --ask-for-approval never
```

## 주의

YOLO 모드는 이 폴더에서도 꼭 필요한 경우가 아니면 실행하지 마세요.

실제 프로젝트, 홈 디렉터리, `.env`가 있는 폴더에서는 YOLO를 사용하지 않습니다.
