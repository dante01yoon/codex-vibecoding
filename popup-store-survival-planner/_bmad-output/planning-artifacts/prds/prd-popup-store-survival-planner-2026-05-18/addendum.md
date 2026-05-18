# PRD Addendum: Pop-up Store Survival Planner

## Purpose

이 addendum은 PRD 본문에 넣기에는 구현 쪽에 가까운 학습 메모를 보관한다. downstream 아키텍처와 구현 단계에서 참고하되, PRD의 제품 요구사항보다 우선하지 않는다.

## Beginner React Practice Notes

- 앱은 단일 페이지 React 앱으로 구현한다.
- 주요 상태는 방문 정보, 굿즈 목록, 체크리스트, 방문 후 메모, 저장 상태로 나눌 수 있다.
- 입력 폼은 controlled input으로 만든다.
- 굿즈 목록과 체크리스트는 배열 상태를 사용해 렌더링한다.
- 생존 플랜 카드는 현재 상태에서 파생된 요약 UI로 만든다.
- localStorage 저장은 `useEffect`로 상태 변경 시 실행하고, 앱 초기 로딩 시 한 번 복원한다.
- 외부 API, 백엔드, 인증 라이브러리는 MVP에서 사용하지 않는다.

## Deferred Ideas

- 여러 팝업스토어 방문 계획 저장.
- 생존 플랜 카드 이미지 저장.
- 공유용 텍스트 복사.
- 체크리스트 템플릿 선택.
- 지도 링크 수동 입력.

