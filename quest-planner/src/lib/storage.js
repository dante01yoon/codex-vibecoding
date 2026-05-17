import { getCourseTotals, getPreferenceLabels } from './recommendQuest.js';

const STORAGE_KEY = 'weekend-quest-planner:recent-recommendation';

export function loadRecentRecommendation() {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const savedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!savedValue) {
      return null;
    }

    const parsedValue = JSON.parse(savedValue);
    return isValidRecentRecommendation(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export function saveRecentRecommendation(result) {
  if (!canUseLocalStorage() || result.type !== 'match') {
    return null;
  }

  const recentRecommendation = createRecentRecommendation(result);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentRecommendation));
    return recentRecommendation;
  } catch {
    return null;
  }
}

function createRecentRecommendation(result) {
  const totals = getCourseTotals(result.course);

  return {
    savedAt: new Date().toISOString(),
    preferenceLabels: getPreferenceLabels(result.preference),
    courseSummary: {
      title: result.course.title,
      whyItFits: result.course.whyItFits,
      totalMinutes: totals.minutes,
      totalCostWon: totals.costWon,
    },
    activities: result.course.activities.map((activity) => ({
      name: activity.name,
      minutes: activity.minutes,
      costWon: activity.costWon,
    })),
  };
}

function isValidRecentRecommendation(value) {
  return (
    value &&
    typeof value === 'object' &&
    value.courseSummary &&
    typeof value.courseSummary.title === 'string' &&
    Array.isArray(value.activities) &&
    value.activities.every(
      (activity) =>
        activity &&
        typeof activity.name === 'string' &&
        typeof activity.minutes === 'number' &&
        typeof activity.costWon === 'number',
    )
  );
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}
