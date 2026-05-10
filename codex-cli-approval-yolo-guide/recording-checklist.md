# 녹화 체크리스트

## 녹화 전

- [ ] 실제 프로젝트 대신 실습 폴더에서 시작한다.
- [ ] 화면에 API 키, SSH 키, `.env`, 토큰이 보이지 않는다.
- [ ] 터미널 현재 위치가 실습 폴더인지 확인한다.
- [ ] `codex --version`을 실행해 CLI 버전을 확인한다.
- [ ] `codex --help`와 `codex exec --help`를 열어 현재 설치된 옵션명을 확인한다.
- [ ] YOLO 명령은 실제 업무 폴더에서 실행하지 않는다.

## 화면에 보여줄 핵심 명령

```bash
codex --version
codex --help
codex exec --help
```

```bash
codex -C . --sandbox read-only --ask-for-approval untrusted
```

```bash
codex -C . --sandbox workspace-write --ask-for-approval on-request
```

```bash
codex -C . --sandbox workspace-write --ask-for-approval never
```

```bash
codex exec -C /tmp/codex-yolo-lab --dangerously-bypass-approvals-and-sandbox "작업 내용"
```

## 반드시 말할 문장

```text
Approval은 언제 물어볼지, Sandbox는 어디까지 손댈 수 있는지를 정합니다.
```

```text
YOLO는 더 똑똑한 모드가 아니라, 안전장치를 크게 끄는 모드입니다.
```

```text
입문자는 기본적으로 workspace-write와 on-request 조합을 사용하세요.
```

```text
처음 보는 프로젝트는 read-only로 분석부터 시작하세요.
```

```text
YOLO는 격리된 컨테이너나 일회용 폴더에서만 고려하세요.
```

## 녹화 중 피해야 할 장면

- [ ] 실제 홈 디렉터리에서 YOLO 명령 실행
- [ ] 실제 업무 저장소에서 `danger-full-access` 사용
- [ ] `.env` 파일 내용 노출
- [ ] Git 상태가 더러운 실제 프로젝트에서 무작정 수정
- [ ] "YOLO가 빠르고 편하다"는 식의 표현

## 녹화 후 확인

- [ ] 화면에 비밀 정보가 노출되지 않았는지 다시 확인한다.
- [ ] 명령어 자막에 오타가 없는지 확인한다.
- [ ] `--yolo` 별칭은 설치 버전에 따라 보이지 않을 수 있다는 설명을 넣는다.
- [ ] 위험 명령은 실습 전용 또는 설명용이라는 표시를 넣는다.
