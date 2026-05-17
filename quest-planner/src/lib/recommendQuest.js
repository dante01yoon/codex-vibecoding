import {
  budgetOptions,
  companionOptions,
  mockQuests,
  moodOptions,
  timeOptions,
} from '../data/mockQuests.js';

export function getCourseTotals(course) {
  return course.activities.reduce(
    (totals, activity) => ({
      minutes: totals.minutes + activity.minutes,
      costWon: totals.costWon + activity.costWon,
    }),
    { minutes: 0, costWon: 0 },
  );
}

export function recommendQuest(preference, courses = mockQuests) {
  const matches = courses
    .map((course, index) => ({
      course,
      index,
      totals: getCourseTotals(course),
    }))
    .filter(({ course, totals }) => {
      return (
        course.moods.includes(preference.mood) &&
        course.companionOptions.includes(preference.companion) &&
        totals.minutes <= preference.timeLimitMinutes &&
        totals.costWon <= preference.budgetLimitWon
      );
    })
    .sort((left, right) => {
      if (left.totals.costWon !== right.totals.costWon) {
        return left.totals.costWon - right.totals.costWon;
      }

      if (left.totals.minutes !== right.totals.minutes) {
        return left.totals.minutes - right.totals.minutes;
      }

      return left.index - right.index;
    });

  if (matches.length === 0) {
    return {
      type: 'empty',
      preference,
    };
  }

  const bestMatch = matches[0];

  return {
    type: 'match',
    preference,
    course: bestMatch.course,
    totalMinutes: bestMatch.totals.minutes,
    totalCostWon: bestMatch.totals.costWon,
  };
}

export function getPreferenceLabels(preference) {
  return {
    mood: findLabel(moodOptions, preference.mood),
    time: findLabel(timeOptions, preference.timeLimitMinutes),
    budget: findLabel(budgetOptions, preference.budgetLimitWon),
    companion: findLabel(companionOptions, preference.companion),
  };
}

export function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

export function formatWon(costWon) {
  if (costWon === 0) {
    return '무료';
  }

  return `${costWon.toLocaleString('ko-KR')}원`;
}

function findLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? '선택 없음';
}
