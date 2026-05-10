목적:
Codex가 My Stock Alert 앱을 위한 간단한 프로젝트 메모리 뱅크를 유지하도록 돕습니다.

이 스킬은 다음 상황에서 사용합니다:
- 이 프로젝트의 새 Codex 세션을 시작할 때
- 잠시 쉬었다가 작업을 이어갈 때
- 작은 구현 작업을 준비할 때
- 완료한 작업을 요약할 때
- 프로젝트 진행 노트를 업데이트할 때

이 스킬은 다음을 수행해야 합니다:
- 가능하면 AGENTS.md, DESIGN.md, PRD/design 문서, .memory-bank 파일을 읽습니다
- .memory-bank 파일이 없으면 생성합니다
- project-brief.md, active-context.md, progress.md, decision-log.md, next-actions.md, verification-log.md를 유지합니다
- .memory-bank/tasks/ 아래에 작은 task card를 생성합니다
- 노트는 짧고 입문자가 읽기 쉽게 유지합니다
- secret, API key, token, private account data를 절대 저장하지 않습니다
- done, in progress, blocked, next 상태를 구분합니다
- 사용자가 planning만 요청했다면 code를 수정하기 전에 먼저 물어봅니다

중요한 프로젝트 제약:
- 이 앱은 교육용 개인 주식 알림 도구이며, 투자 조언이 아닙니다.
- 실제 KIS 또는 Alpha Vantage API 연동은 11-7 범위에 포함하지 않습니다.
- Supabase Auth/DB는 11-7 범위에 포함하지 않습니다.
- Demo Provider 데이터를 먼저 사용해야 합니다.

다음 위치에 Skill을 생성해주세요:
.agents/skills/stock-alert-memory-bank/SKILL.md

생성 후 다음 내용을 요약해주세요:
1. 이 스킬이 언제 trigger되어야 하는지
2. 어떤 파일을 읽는지
3. 어떤 파일을 업데이트하는지
4. 어떤 safety boundary를 따르는지
