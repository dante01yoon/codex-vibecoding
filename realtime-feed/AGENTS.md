# AGENTS.md

## Project

이 프로젝트는 React, Vite, Vercel, Supabase로 만드는 한국어 실시간 방명록 앱입니다.

방문자는 로그인 화면 없이 익명 세션으로 이름, 메시지, 무드, 아바타 색상, 선택 첨부를 남깁니다. 피드는 새 게시글을 실시간으로 반영하고, 사용자가 게시글을 펼쳤을 때 댓글을 로드하고 구독합니다.

첫 버전은 큰 소셜 플랫폼이 아니라 행사, 수업, 소규모 커뮤니티를 위한 따뜻한 포스트잇 스타일 방명록입니다.

## Required Reading

작업 전에 다음 문서를 먼저 읽습니다.

- `DESIGN.md`: UI/UX 디자인 방향, 컬러, 타이포그래피, 간격, 카드/폼/댓글/상태 패턴의 필수 기준입니다.
- `docs/superpowers/specs/2026-05-10-realtime-guestbook-design.md`: 제품 요구사항, 사용자 흐름, 데이터 모델, Supabase 연동, realtime 동작, 보안 정책 기준입니다.
- `.agents/skills/guestbook-memory-bank/SKILL.md`: 기능 수정, 구현, 세션 재개, 메모리 정리가 필요할 때 따라야 하는 메모리 뱅크 절차입니다.
- `.memory-bank/project-brief.md`: 안정적인 프로젝트 요약, 대상 사용자, 범위, 비범위입니다.
- `.memory-bank/active-context.md`: 현재 작업 초점, 최근 변경, 다음 세션이 알아야 할 내용입니다.
- `.memory-bank/progress.md`: 완료, 진행 중, blocked, 다음 작업 상태입니다.
- `.memory-bank/decision-log.md`: 오래 유지해야 할 결정과 이유입니다.
- `.memory-bank/next-actions.md`: 바로 이어서 집을 수 있는 작은 작업 목록입니다.
- `.memory-bank/verification-log.md`: 실행한 검증, 수동 확인, 남은 검증 공백입니다.

특히 UI, React component, layout, copy, state, Supabase integration을 수정하기 전에는 `DESIGN.md`와 PRD 스펙 문서를 모두 확인합니다.

## Memory Bank Workflow

추가 기능 수정 또는 구현이 필요하면 먼저 `guestbook-memory-bank` 스킬 문서인 `.agents/skills/guestbook-memory-bank/SKILL.md`를 참조합니다.

그 다음 코드 수정 계획을 세우기 전에 `.memory-bank/`의 핵심 문서를 읽어 현재 상태를 확인합니다. 메모리 뱅크 문서가 없다면 가능한 문서만 읽고 계속 진행하되, 메모리 설정이나 업데이트가 작업 범위라면 누락된 파일을 보강합니다.

메모리 뱅크를 사용하는 구현 작업에서는 `.memory-bank/tasks/` 아래에 작은 task card를 만들거나 갱신합니다. 작업이 끝나면 필요한 범위에서 `active-context.md`, `progress.md`, `decision-log.md`, `next-actions.md`, `verification-log.md`를 짧게 업데이트합니다.

메모리 뱅크에는 password, API key, access token, Supabase service role key, `.env` 값 같은 secret을 기록하지 않습니다.

## Product Scope

첫 버전은 실제 방명록 화면을 바로 보여주는 앱입니다. 마케팅 랜딩 페이지가 아닙니다.

핵심 범위:

- 익명 세션 기반 작성
- 이름, 메시지, 무드, 아바타 색상 입력
- 게시글당 선택 첨부 1개
- 이미지 업로드 또는 단순 캔버스 그림 중 하나
- 최신순 실시간 피드
- 게시글 펼치기 기반 댓글
- 펼쳐진 댓글의 실시간 업데이트
- 본인이 작성한 게시글과 댓글 삭제
- 모바일 우선 작성 흐름

범위 밖:

- 일반 계정, 비밀번호 로그인, 소셜 로그인
- 관리자 대시보드 또는 모더레이션 UI
- 게시글당 여러 첨부
- 전문 그림판 기능
- 해시태그, 검색, 알림, 중첩 댓글
- 실제 방명록 앞에 별도 마케팅 히어로 만들기

## UI Work Rule

UI 관련 변경 전에는 반드시 `DESIGN.md`를 읽고 그 규칙을 따릅니다.

다음 작업은 `DESIGN.md` 확인 없이 진행하지 않습니다.

- 컬러 token, typography, spacing, radius 변경
- 작성 폼, 첨부 컨트롤, 캔버스 도구 구현
- 포스트잇 카드 갤러리 구현
- 댓글 상세/확장 UI 구현
- empty, loading, error, realtime disconnected 상태 구현
- 모바일 레이아웃 조정
- 한국어 UI 문구 작성

UI 관련 변경 후에는 가능한 경우 아래 명령으로 디자인 문서 형식을 확인합니다.

```bash
npx @google/design.md lint DESIGN.md
```

lint error 또는 warning이 생기면 UI 구현보다 먼저 `DESIGN.md` 형식을 고칩니다.

## Implementation Guidance

- 작고 집중된 변경을 우선합니다.
- 구현 전에 확인하거나 수정할 파일을 간단히 설명합니다.
- UI 컴포넌트에 Supabase 쿼리 로직을 직접 흩뿌리지 않습니다.
- Supabase 호출은 `auth`, `posts`, `comments`, `attachments` 같은 서비스 모듈로 분리합니다.
- UI는 provider-specific payload가 아니라 화면에서 쓰기 좋은 normalized data를 소비합니다.
- 작성 폼은 사용자가 입력한 내용을 실패 시에도 가능한 한 보존합니다.
- 첨부 업로드 실패 시 게시글을 자동 생성하지 않습니다.
- 댓글 구독은 게시글을 펼쳤을 때만 시작하고, 접거나 unmount되면 해제합니다.
- icon-only control에는 accessible label과 tooltip을 둡니다.
- loading, empty, error, disabled, permission, realtime disconnected 상태를 빠뜨리지 않습니다.

## Design Boundaries

- 화면은 따뜻한 포스트잇 갤러리 느낌을 유지합니다.
- 차가운 SaaS dashboard처럼 만들지 않습니다.
- 장식용 gradient orb, bokeh blob, 과한 glassmorphism을 추가하지 않습니다.
- 카드 안에 카드를 반복해서 중첩하지 않습니다.
- hover나 realtime highlight가 layout shift를 만들지 않게 합니다.
- UI 아이콘을 이모지로 대체하지 않습니다. 가능한 경우 lucide 같은 일관된 아이콘 세트를 사용합니다.
- 모바일 390px와 데스크톱 1280px에서 입력, 버튼, 카드 텍스트가 부모 밖으로 넘치지 않게 합니다.

## Supabase And Security Rules

- Supabase `service_role` key나 secret을 browser code에 넣지 않습니다.
- 브라우저에는 공개 가능한 anon/publishable key만 사용합니다.
- RLS를 전제로 작성하고, 소유권 판단은 `auth.uid()` 기준으로 유지합니다.
- 게시글과 댓글 삭제는 작성자 본인에게만 허용합니다.
- Storage 경로는 사용자 id와 생성된 파일명을 포함하는 구조를 사용합니다.
- 마이그레이션, Storage 정책, Supabase CLI 명령을 작성하기 전에는 현재 Supabase 공식 문서를 확인합니다.
- `.env`와 실제 credential 파일은 git에 포함하지 않습니다.

## Verification

작업 후 다음을 확인합니다.

- `DESIGN.md`와 PRD 스펙 요구사항을 위반하지 않았는지 확인합니다.
- UI 변경이 있으면 `npx @google/design.md lint DESIGN.md`를 실행합니다.
- desktop과 mobile에서 layout이 겹치거나 넘치지 않는지 확인합니다.
- 작성, 첨부, 피드 로딩, 새 게시글 반영, 댓글 펼치기, 삭제 권한 상태를 확인합니다.
- 실시간 연결 끊김 상태에서도 기존 피드가 유지되는지 확인합니다.
- 한국어 오류 문구가 짧고 복구 방법을 제시하는지 확인합니다.
