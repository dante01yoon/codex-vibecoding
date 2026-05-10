
이 프로젝트를 위한 저장소 로컬 스킬을 만들어주세요.

스킬 이름:
guestbook-memory-bank

목적:
Codex가 Realtime Guestbook 앱의 간단한 프로젝트 메모리 뱅크를 유지하도록 돕습니다.

다음과 같은 경우 이 스킬을 사용하세요:
- 이 프로젝트의 새 Codex 세션을 시작할 때
- 휴식 후 작업을 이어갈 때
- 작은 구현 작업을 준비할 때
- 완료된 작업을 요약할 때
- 프로젝트 진행 노트를 업데이트할 때

이 스킬은 다음을 수행해야 합니다:
- AGENTS.md, DESIGN.md, PRD/디자인 문서, 그리고 .memory-bank 파일들이 있을 때 읽기
- .memory-bank 파일이 없으면 생성하기
- project-brief.md, active-context.md, progress.md, decision-log.md, next-actions.md, verification-log.md 유지 관리
- .memory-bank/tasks/ 아래에 작은 작업 카드 생성
- 노트는 짧고 초보자가 읽기 쉽게 유지
- 비밀번호, API 키, 토큰, Supabase URL 값, 개인 계정 데이터는 절대 저장하지 않기
- 완료(done), 진행 중(in progress), 차단됨(blocked), 다음(next) 상태를 구분
- 사용자가 계획만 요청한 경우 코드 편집 전에 먼저 확인하기

중요한 프로젝트 제약 사항:
- 이 앱은 실시간 방명록(realtime guestbook)입니다.
- 실제 Supabase 연결은 명시적으로 요청되지 않는 한 11-7 범위 밖입니다.
- 로그인/회원가입은 11-7 범위 밖입니다.
- 샘플 방명록 데이터를 먼저 사용해야 합니다.

다음 경로에 스킬을 생성해주세요:
.agents/skills/guestbook-memory-bank/SKILL.md

생성 후 다음을 요약해주세요:
1. 스킬이 언제 트리거되어야 하는지
2. 어떤 파일을 읽는지
3. 어떤 파일을 업데이트하는지
4. 어떤 안전 경계(safety boundaries)를 따르는지
