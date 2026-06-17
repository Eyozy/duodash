import { useMemo, useRef } from 'react';
import { MS_PER_DAY, toLocalDateKey } from '../utils/dateUtils';

const MAX_STREAK_CHECK = 3650;

interface DailyXpData {
  date: string;
  xp: number;
  time?: number;
}

interface AchievementStats {
  maxStreak: number;
  currentStreak: number;
  maxDailyXp: number;
  totalDays: number;
  totalXp: number;
  streakMilestones: Record<number, string>;
  dailyXpMilestones: Record<number, string>;
  totalDaysMilestones: Record<number, string>;
  totalXpMilestones: Record<number, string>;
}

const MILESTONES = {
  streak: [7, 30, 60, 100, 365],
  dailyXp: [500, 1000, 2000, 5000],
  totalDays: [50, 100, 200, 365],
  totalXp: [10000, 50000, 100000, 500000],
} as const;


function recordMilestone(
  milestones: Record<number, string>,
  thresholds: readonly number[],
  value: number,
  date: string,
  exact = false
): void {
  for (const threshold of thresholds) {
    if (milestones[threshold]) continue;
    if (exact ? value === threshold : value >= threshold) {
      milestones[threshold] = date;
    }
  }
}

export function useAchievementStats(data: DailyXpData[]): AchievementStats {
  const dateCacheRef = useRef<Map<string, number>>(new Map());

  return useMemo(() => {
    const getCachedTimestamp = (dateStr: string): number => {
      const cache = dateCacheRef.current;
      let ts = cache.get(dateStr);
      if (ts === undefined) {
        ts = new Date(dateStr).getTime();
        if (cache.size > 500) {
          const firstKey = cache.keys().next().value;
          if (firstKey) cache.delete(firstKey);
        }
        cache.set(dateStr, ts);
      }
      return ts;
    };

    if (!Array.isArray(data) || data.length === 0) {
      return {
        maxStreak: 0,
        currentStreak: 0,
        maxDailyXp: 0,
        totalDays: 0,
        totalXp: 0,
        streakMilestones: {},
        dailyXpMilestones: {},
        totalDaysMilestones: {},
        totalXpMilestones: {},
      };
    }

    const validData = data.filter(
      (d): d is DailyXpData =>
        d != null &&
        typeof d.date === 'string' &&
        typeof d.xp === 'number' &&
        !isNaN(d.xp)
    );

    const sortedData = [...validData]
      .filter(d => d.xp > 0)
      .sort((a, b) => getCachedTimestamp(a.date) - getCachedTimestamp(b.date));

    let maxStreak = 0;
    let tempStreak = 1;
    const streakMilestones: Record<number, string> = {};

    for (let i = 1; i < sortedData.length; i++) {
      const prevTs = getCachedTimestamp(sortedData[i - 1].date);
      const currTs = getCachedTimestamp(sortedData[i].date);
      const diffDays = Math.round((currTs - prevTs) / MS_PER_DAY);

      if (diffDays === 1) {
        tempStreak++;
        recordMilestone(streakMilestones, MILESTONES.streak, tempStreak, sortedData[i].date);
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    const xpByDate = new Map(data.map(d => [d.date, d.xp]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(today);

    const todayXp = xpByDate.get(toLocalDateKey(today));
    if (!todayXp || todayXp === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let currentStreak = 0;
    for (let i = 0; i < MAX_STREAK_CHECK; i++) {
      const xp = xpByDate.get(toLocalDateKey(checkDate));
      if (!xp || xp <= 0) break;
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let maxDailyXp = 0;
    const dailyXpMilestones: Record<number, string> = {};
    for (const d of data) {
      if (d.xp > maxDailyXp) maxDailyXp = d.xp;
      recordMilestone(dailyXpMilestones, MILESTONES.dailyXp, d.xp, d.date);
    }

    const totalDays = sortedData.length;
    const totalDaysMilestones: Record<number, string> = {};
    sortedData.forEach((d, i) => {
      recordMilestone(totalDaysMilestones, MILESTONES.totalDays, i + 1, d.date, true);
    });

    const totalXpMilestones: Record<number, string> = {};
    let runningXp = 0;
    for (const d of sortedData) {
      runningXp += d.xp;
      recordMilestone(totalXpMilestones, MILESTONES.totalXp, runningXp, d.date);
    }

    return {
      maxStreak,
      currentStreak,
      maxDailyXp,
      totalDays,
      totalXp: runningXp,
      streakMilestones,
      dailyXpMilestones,
      totalDaysMilestones,
      totalXpMilestones,
    };
  }, [data]);
}
