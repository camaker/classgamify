import type { LessonCharacter } from '@/learn/hanzi-course';

const PROGRESS_STORAGE_KEY = 'lang-study:beginner-hanzi-progress:v1';

export type CharacterProgress = {
  completed: boolean;
  completedAt?: string;
  correctStrokes: number;
  mistakeStrokes?: number[];
  mistakes: number;
};

export type StoredProgress = Record<string, CharacterProgress>;

export type HanziReviewItem = {
  ageDays: number | null;
  character: LessonCharacter;
  index: number;
  progress: CharacterProgress;
  urgency: HanziReviewUrgency;
};

export type HanziReviewUrgency = 'fresh' | 'due' | 'overdue' | 'unscheduled';

export type NextPracticeTarget = {
  character: LessonCharacter;
  index: number;
};

export type HanziProgressSummary = {
  activeDayCount: number;
  cleanCount: number;
  completedCount: number;
  completedTodayCount: number;
  currentStreakDays: number;
  lastPracticeAt?: string;
  lessonComplete: boolean;
  nextPracticeTarget?: NextPracticeTarget;
  practicedToday: boolean;
  progressValue: number;
  reviewCharacters: string[];
  reviewItems: HanziReviewItem[];
  total: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function getDisplayStrokeNumber(strokeIndex: number) {
  return strokeIndex + 1;
}

export function getPracticeAgeDays(completedAt?: string) {
  if (!completedAt) return null;

  const completedTime = Date.parse(completedAt);
  if (Number.isNaN(completedTime)) return null;

  const today = getLocalDayStart(new Date()).getTime();
  const completedDay = getLocalDayStart(new Date(completedTime)).getTime();
  return Math.max(0, Math.floor((today - completedDay) / DAY_MS));
}

export function getHanziReviewUrgency(
  progress: CharacterProgress
): HanziReviewUrgency {
  const ageDays = getPracticeAgeDays(progress.completedAt);

  if (ageDays === null) return 'unscheduled';
  if (ageDays >= 3) return 'overdue';
  if (ageDays >= 1) return 'due';
  return 'fresh';
}

function getCompletedAtTime(completedAt?: string) {
  if (!completedAt) return Number.POSITIVE_INFINITY;

  const completedTime = Date.parse(completedAt);
  return Number.isNaN(completedTime) ? Number.POSITIVE_INFINITY : completedTime;
}

export function readStoredHanziProgress(): StoredProgress {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    return parsed as StoredProgress;
  } catch {
    return {};
  }
}

export function writeStoredHanziProgress(progress: StoredProgress) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function getHanziProgressSummary(
  characters: LessonCharacter[],
  progress: StoredProgress
): HanziProgressSummary {
  const scopedProgress = characters
    .map((item) => progress[item.character])
    .filter((item): item is CharacterProgress => Boolean(item));
  const practiceStats = getHanziPracticeStats(scopedProgress);
  const completedCount = characters.filter(
    (item) => progress[item.character]?.completed
  ).length;
  const cleanCount = characters.filter((item) => {
    const itemProgress = progress[item.character];
    return itemProgress?.completed && itemProgress.mistakes === 0;
  }).length;
  const reviewItems = characters
    .map((character, index) => {
      const itemProgress = progress[character.character];

      return {
        ageDays: getPracticeAgeDays(itemProgress?.completedAt),
        character,
        index,
        progress: itemProgress,
        urgency: itemProgress
          ? getHanziReviewUrgency(itemProgress)
          : 'unscheduled',
      };
    })
    .filter(
      (item): item is HanziReviewItem =>
        Boolean(item.progress?.completed) && item.progress.mistakes > 0
    )
    .sort(
      (a, b) =>
        getReviewUrgencyRank(b.urgency) - getReviewUrgencyRank(a.urgency) ||
        b.progress.mistakes - a.progress.mistakes ||
        getCompletedAtTime(a.progress.completedAt) -
          getCompletedAtTime(b.progress.completedAt)
    );
  const nextPracticeIndex = characters.findIndex(
    (item) => !progress[item.character]?.completed
  );
  const nextPracticeTarget =
    nextPracticeIndex >= 0
      ? {
          character: characters[nextPracticeIndex],
          index: nextPracticeIndex,
        }
      : undefined;

  return {
    activeDayCount: practiceStats.activeDayCount,
    cleanCount,
    completedCount,
    completedTodayCount: practiceStats.completedTodayCount,
    currentStreakDays: practiceStats.currentStreakDays,
    lastPracticeAt: practiceStats.lastPracticeAt,
    lessonComplete: completedCount === characters.length,
    nextPracticeTarget,
    practicedToday: practiceStats.practicedToday,
    progressValue:
      characters.length > 0
        ? Math.round((completedCount / characters.length) * 100)
        : 0,
    reviewCharacters: reviewItems.map((item) => item.character.character),
    reviewItems,
    total: characters.length,
  };
}

function getReviewUrgencyRank(urgency: HanziReviewUrgency) {
  return {
    fresh: 0,
    due: 1,
    overdue: 2,
    unscheduled: 3,
  }[urgency];
}

function getHanziPracticeStats(progressItems: CharacterProgress[]) {
  const completedItems = progressItems
    .filter((item) => item.completed && item.completedAt)
    .map((item) => ({
      completedAt: item.completedAt as string,
      completedTime: Date.parse(item.completedAt as string),
    }))
    .filter((item) => !Number.isNaN(item.completedTime));

  if (completedItems.length === 0) {
    return {
      activeDayCount: 0,
      completedTodayCount: 0,
      currentStreakDays: 0,
      lastPracticeAt: undefined,
      practicedToday: false,
    };
  }

  const today = getLocalDayStart(new Date());
  const yesterday = getOffsetLocalDay(today, -1);
  const todayKey = getLocalDayKey(today);
  const yesterdayKey = getLocalDayKey(yesterday);
  const dayKeys = new Set(
    completedItems.map((item) => getLocalDayKey(new Date(item.completedTime)))
  );
  const completedTodayCount = completedItems.filter(
    (item) => getLocalDayKey(new Date(item.completedTime)) === todayKey
  ).length;
  const practicedToday = dayKeys.has(todayKey);
  const streakStart = practicedToday
    ? today
    : dayKeys.has(yesterdayKey)
      ? yesterday
      : null;
  let currentStreakDays = 0;

  if (streakStart) {
    let currentDay = streakStart;

    while (dayKeys.has(getLocalDayKey(currentDay))) {
      currentStreakDays += 1;
      currentDay = getOffsetLocalDay(currentDay, -1);
    }
  }

  return {
    activeDayCount: dayKeys.size,
    completedTodayCount,
    currentStreakDays,
    lastPracticeAt: completedItems.reduce((latest, item) =>
      item.completedTime > latest.completedTime ? item : latest
    ).completedAt,
    practicedToday,
  };
}

function getLocalDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getOffsetLocalDay(date: Date, offset: number) {
  const nextDate = getLocalDayStart(date);
  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate;
}

function getLocalDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
