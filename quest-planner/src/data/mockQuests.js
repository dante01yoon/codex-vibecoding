export const moodOptions = [
  { value: 'rest', label: '쉬고 싶음' },
  { value: 'active', label: '움직이고 싶음' },
  { value: 'new', label: '새로움이 필요함' },
  { value: 'social', label: '사람과 시간을 보내고 싶음' },
];

export const timeOptions = [
  { value: 60, label: '1시간 이하' },
  { value: 120, label: '2시간 이하' },
  { value: 240, label: '반나절 이하' },
];

export const budgetOptions = [
  { value: 0, label: '무료' },
  { value: 10000, label: '1만원 이하' },
  { value: 30000, label: '3만원 이하' },
];

export const companionOptions = [
  { value: 'solo', label: '혼자' },
  { value: 'with-companion', label: '동행 있음' },
];

export const mockQuests = [
  {
    id: 'quiet-riverside-reset',
    title: '강변 리셋 산책',
    moods: ['rest', 'active'],
    companionOptions: ['solo'],
    whyItFits: '혼자서 바로 시작할 수 있고 비용 없이 몸을 가볍게 움직일 수 있어요.',
    activities: [
      { name: '가까운 강변이나 공원까지 이동', minutes: 10, costWon: 0 },
      { name: '휴대폰 알림을 끄고 천천히 걷기', minutes: 35, costWon: 0 },
      { name: '벤치에서 오늘 할 일 하나만 정리', minutes: 10, costWon: 0 },
    ],
  },
  {
    id: 'active-pocket-loop',
    title: '동네 한 바퀴 에너지 루프',
    moods: ['active'],
    companionOptions: ['solo', 'with-companion'],
    whyItFits: '짧은 시간 안에 걷기와 간단한 스트레칭을 섞어 기분 전환을 만들어요.',
    activities: [
      { name: '동네 산책 코스 고르기', minutes: 5, costWon: 0 },
      { name: '빠르게 걷기와 계단 오르기', minutes: 35, costWon: 0 },
      { name: '마무리 스트레칭', minutes: 15, costWon: 0 },
    ],
  },
  {
    id: 'bookstore-breath',
    title: '서점 숨 고르기 코스',
    moods: ['rest', 'new'],
    companionOptions: ['solo'],
    whyItFits: '조용한 장소에서 부담 없이 새로운 자극을 얻을 수 있어요.',
    activities: [
      { name: '동네 서점 둘러보기', minutes: 40, costWon: 0 },
      { name: '마음에 드는 책 한 권 훑어보기', minutes: 30, costWon: 0 },
      { name: '따뜻한 음료 한 잔', minutes: 20, costWon: 6000 },
    ],
  },
  {
    id: 'cafe-walk-catchup',
    title: '카페 산책 캐치업',
    moods: ['rest', 'social'],
    companionOptions: ['with-companion'],
    whyItFits: '대화와 가벼운 산책이 섞여 부담 없는 동행 코스로 좋아요.',
    activities: [
      { name: '조용한 카페에서 음료 고르기', minutes: 25, costWon: 7000 },
      { name: '근처 골목 산책', minutes: 45, costWon: 0 },
      { name: '다음 약속 없이 짧게 마무리 대화', minutes: 20, costWon: 0 },
    ],
  },
  {
    id: 'small-gallery-spark',
    title: '작은 전시 영감 충전',
    moods: ['new'],
    companionOptions: ['solo', 'with-companion'],
    whyItFits: '긴 준비 없이 새로운 장면을 보고 가벼운 기록까지 남길 수 있어요.',
    activities: [
      { name: '무료 또는 저가 전시 관람', minutes: 70, costWon: 8000 },
      { name: '인상 깊은 작품 메모', minutes: 15, costWon: 0 },
      { name: '근처 카페에서 짧은 정리', minutes: 25, costWon: 6000 },
    ],
  },
  {
    id: 'market-snack-route',
    title: '시장 간식 루트',
    moods: ['new', 'social'],
    companionOptions: ['solo', 'with-companion'],
    whyItFits: '짧은 동선 안에서 먹거리와 구경거리를 동시에 챙길 수 있어요.',
    activities: [
      { name: '시장 입구에서 먹거리 후보 정하기', minutes: 10, costWon: 0 },
      { name: '대표 간식 두 가지 나눠 먹기', minutes: 35, costWon: 9000 },
      { name: '생활용품 골목 구경', minutes: 25, costWon: 0 },
    ],
  },
  {
    id: 'board-game-light',
    title: '보드게임 짧은 승부',
    moods: ['social'],
    companionOptions: ['with-companion'],
    whyItFits: '대화 주제를 억지로 만들지 않아도 자연스럽게 같이 웃을 수 있어요.',
    activities: [
      { name: '룰이 쉬운 게임 고르기', minutes: 10, costWon: 0 },
      { name: '보드게임 2라운드', minutes: 80, costWon: 12000 },
      { name: '오늘의 하이라이트 이야기하기', minutes: 15, costWon: 0 },
    ],
  },
  {
    id: 'pop-up-dessert-halfday',
    title: '팝업 스토어 디저트 반나절',
    moods: ['new', 'social'],
    companionOptions: ['with-companion'],
    whyItFits: '새로운 공간과 달콤한 휴식을 묶어 반나절 기분 전환에 맞아요.',
    activities: [
      { name: '관심 있는 팝업 스토어 방문', minutes: 80, costWon: 0 },
      { name: '사진과 짧은 기록 남기기', minutes: 20, costWon: 0 },
      { name: '디저트 카페에서 마무리', minutes: 60, costWon: 18000 },
    ],
  },
];
