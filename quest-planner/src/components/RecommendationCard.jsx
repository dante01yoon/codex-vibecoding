import { formatMinutes, formatWon, getPreferenceLabels } from '../lib/recommendQuest.js';

export default function RecommendationCard({ result }) {
  if (!result || result.type !== 'match') {
    return null;
  }

  const labels = getPreferenceLabels(result.preference);

  return (
    <article className="result-card" aria-live="polite">
      <div className="section-kicker">추천 코스</div>
      <h2>{result.course.title}</h2>
      <p className="result-reason">{result.course.whyItFits}</p>

      <dl className="summary-grid" aria-label="추천 조건과 예상 합계">
        <SummaryItem label="기분" value={labels.mood} />
        <SummaryItem label="시간" value={formatMinutes(result.totalMinutes)} />
        <SummaryItem label="비용" value={formatWon(result.totalCostWon)} />
        <SummaryItem label="동행" value={labels.companion} />
      </dl>

      <div className="activity-list" aria-label="추천 활동 목록">
        {result.course.activities.map((activity) => (
          <div className="activity-row" key={activity.name}>
            <span className="activity-name">{activity.name}</span>
            <span className="activity-meta">
              {formatMinutes(activity.minutes)} · {formatWon(activity.costWon)}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
