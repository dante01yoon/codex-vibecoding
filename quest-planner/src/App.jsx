import { useEffect, useMemo, useState } from 'react';
import EmptyState from './components/EmptyState.jsx';
import QuestForm from './components/QuestForm.jsx';
import RecentRecommendation from './components/RecentRecommendation.jsx';
import RecommendationCard from './components/RecommendationCard.jsx';
import {
  budgetOptions,
  companionOptions,
  moodOptions,
  timeOptions,
} from './data/mockQuests.js';
import { recommendQuest } from './lib/recommendQuest.js';
import { loadRecentRecommendation, saveRecentRecommendation } from './lib/storage.js';

const initialPreference = {
  mood: '',
  timeLimitMinutes: '',
  budgetLimitWon: '',
  companion: '',
};

const fieldLabels = {
  mood: '오늘의 기분',
  timeLimitMinutes: '사용 가능 시간',
  budgetLimitWon: '예산',
  companion: '동행 여부',
};

export default function App() {
  const [preference, setPreference] = useState(initialPreference);
  const [errors, setErrors] = useState({});
  const [currentResult, setCurrentResult] = useState(null);
  const [recentRecommendation, setRecentRecommendation] = useState(null);

  useEffect(() => {
    setRecentRecommendation(loadRecentRecommendation());
  }, []);

  const formOptions = useMemo(
    () => ({
      budgetOptions,
      companionOptions,
      moodOptions,
      timeOptions,
    }),
    [],
  );

  function handlePreferenceChange(field, value) {
    setPreference((currentPreference) => ({
      ...currentPreference,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validatePreference(preference);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const result = recommendQuest(preference);
    setCurrentResult(result);

    if (result.type === 'match') {
      const savedRecommendation = saveRecentRecommendation(result);
      setRecentRecommendation(savedRecommendation);
    }
  }

  return (
    <main className="app-shell">
      <section className="intro-section">
        <div>
          <p className="eyebrow">Weekend Quest Planner</p>
          <h1>오늘 바로 실행할 미니 코스 찾기</h1>
        </div>
        <p className="intro-copy">
          기분, 시간, 예산, 동행 여부만 고르면 지금 조건에 맞는 가벼운 코스를 추천합니다.
        </p>
      </section>

      <div className="workspace-grid">
        <section className="input-panel" aria-labelledby="input-panel-title">
          <div className="panel-heading">
            <p className="section-kicker">조건 선택</p>
            <h2 id="input-panel-title">오늘의 범위</h2>
          </div>
          <QuestForm
            errors={errors}
            onChange={handlePreferenceChange}
            onSubmit={handleSubmit}
            preference={preference}
            {...formOptions}
          />
        </section>

        <section className="output-panel" aria-label="추천 결과와 최근 추천">
          {currentResult?.type === 'match' ? <RecommendationCard result={currentResult} /> : null}
          {currentResult?.type === 'empty' ? <EmptyState /> : null}
          {!currentResult ? (
            <section className="waiting-state">
              <div className="section-kicker">추천 결과</div>
              <h2>조건을 선택하면 코스가 나타납니다.</h2>
              <p>가벼운 산책부터 짧은 전시까지, 오늘의 범위 안에서 시작할 수 있는 코스를 찾습니다.</p>
            </section>
          ) : null}
          <RecentRecommendation recent={recentRecommendation} />
        </section>
      </div>
    </main>
  );
}

function validatePreference(preference) {
  return Object.entries(fieldLabels).reduce((nextErrors, [field, label]) => {
    const value = preference[field];

    if (value === '' || value === null || value === undefined) {
      return {
        ...nextErrors,
        [field]: `${label}을 선택해주세요.`,
      };
    }

    return nextErrors;
  }, {});
}
