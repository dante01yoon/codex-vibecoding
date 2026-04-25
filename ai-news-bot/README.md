# 7-5 [바이브 코딩 04] 매일 아침 AI 뉴스 수집 봇 만들어보기

## 강의 위치

- 섹션: 7. 코덱스 앱, 자동화, 그리고 서브에이전트
- 차시: 7-5
- 유형: 강의 + 미션
- 프로젝트명: 매일 아침 AI 뉴스 수집 봇
- 핵심 도구: Codex App Automations, Thread automation(하트비트), Web search, Codex thread context

## 학습 목표

수강생은 이 강의를 마치면 다음을 할 수 있습니다.

- Codex App의 Automations와 하트비트 개념을 설명할 수 있다.
- 매일 아침 같은 스레드가 깨어나 AI 뉴스를 수집하도록 프롬프트를 설계할 수 있다.
- 뉴스 수집 봇의 출력 형식, 선별 기준, 안전 규칙을 직접 정의할 수 있다.
- 자동화 결과를 처음 몇 번 검토하고 프롬프트를 개선할 수 있다.

## 최종 결과물

- Codex App 안의 하트비트 자동화 1개
- 매일 오전 AI 뉴스 브리핑을 생성하는 durable prompt
- 한국어 AI 뉴스 브리핑 결과물
- 선택 과제: 브리핑을 마크다운 파일로 저장하는 프로젝트 자동화

## 강의 메시지

이번 차시는 "코덱스가 내가 부를 때만 답하는 도구"에서 "정해진 시간에 먼저 일하러 오는 동료"로 넘어가는 수업입니다. 코딩보다 중요한 포인트는 자동화할 일을 작게 정의하고, 반복 실행에도 무너지지 않는 프롬프트를 만드는 것입니다.

## 준비 파일

- `instructor-script.md`: 강사용 녹화 스크립트
- `student-guide.md`: 수강생용 단계별 가이드
- `prompts/heartbeat-ai-news-bot.md`: Codex App 하트비트에 넣을 최종 프롬프트
- `prompts/test-run-prompt.md`: 자동화 등록 전 수동 테스트 프롬프트
- `templates/daily-ai-news-brief.md`: 뉴스 브리핑 출력 템플릿
- `templates/review-checklist.md`: 첫 실행 검토 체크리스트

## 최신성 메모

2026-04-25 기준 공식 Codex App 문서에서 확인한 내용:

- Codex App Automations는 반복 작업을 백그라운드에서 수행하고 결과를 inbox/Triage에 남길 수 있다.
- Thread automation은 현재 스레드에 붙는 heartbeat-style 반복 wake-up이며, 같은 대화 맥락을 유지해야 할 때 적합하다.
- 자동화는 기본 sandbox 설정을 따른다. 읽기 전용 모드에서는 파일 수정, 네트워크 접근, 컴퓨터 앱 조작이 필요한 tool call이 실패할 수 있다.
- 자동화 프롬프트는 예약 전에 일반 스레드에서 먼저 테스트하는 것이 좋다.

공식 문서:

- https://developers.openai.com/codex/app/automations
- https://developers.openai.com/codex/app
