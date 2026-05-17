import { formatMinutes, formatWon } from '../lib/recommendQuest.js';

export default function RecentRecommendation({ recent }) {
  if (!recent) {
    return (
      <section className="recent-panel empty-recent">
        <div className="section-kicker">최근 추천</div>
        <p>아직 저장된 추천이 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="recent-panel">
      <div className="section-kicker">최근 추천</div>
      <div className="recent-header">
        <h2>{recent.courseSummary.title}</h2>
        <p>
          {formatMinutes(recent.courseSummary.totalMinutes)} ·{' '}
          {formatWon(recent.courseSummary.totalCostWon)}
        </p>
      </div>

      <dl className="recent-conditions" aria-label="최근 추천 조건">
        <Condition label="기분" value={recent.preferenceLabels.mood} />
        <Condition label="시간" value={recent.preferenceLabels.time} />
        <Condition label="예산" value={recent.preferenceLabels.budget} />
        <Condition label="동행" value={recent.preferenceLabels.companion} />
      </dl>

      <div className="compact-activity-list" aria-label="최근 추천 활동 목록">
        {recent.activities.map((activity) => (
          <div className="compact-activity-row" key={activity.name}>
            <span>{activity.name}</span>
            <span>
              {formatMinutes(activity.minutes)} · {formatWon(activity.costWon)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Condition({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
