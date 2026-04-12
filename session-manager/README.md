# Codex Session Manager

`session-manager`는 로컬에 저장된 `~/.codex/sessions`와 `~/.codex/session_index.jsonl`을 읽어서 Codex 세션을 브라우징하고, 선택한 세션을 `codex resume <SESSION_ID>`로 다시 여는 Electron 데스크톱 앱입니다.

## Features

- 맥과 윈도우에서 같은 Electron 앱으로 동작
- 저장된 세션을 최신순으로 나열
- 세션 제목, 대표 미리보기, 작업 경로 표시
- 선택한 세션의 대화 시작부와 최근 메시지 미리보기 제공
- `Enter` 또는 `Resume Session` 버튼으로 새 터미널 창에서 `codex resume` 실행

## Run

```bash
npm install
npm run start
```

개발 중 렌더러를 별도로 띄우려면:

```bash
npm run dev
```

## Package

각 운영체제에서 설치형 앱을 만들려면 해당 OS에서 아래 명령을 실행하면 됩니다.

```bash
npm run dist
```

- macOS: `release/` 아래 `dmg`, `zip`
- Windows: `release/` 아래 `nsis`, `zip`

## Keyboard

- `Arrow Up / Arrow Down` 또는 `J / K`: 세션 이동
- `Enter`: 선택한 세션 재개
- `/`: 검색 입력으로 이동
- `Esc`: 검색어 지우고 포커스 해제
- `Ctrl/Cmd + R`: 세션 목록 새로고침
