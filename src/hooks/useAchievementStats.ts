import { useMemo } from 'react';

export interface DailyXpData {
  date: string;
  xp: number;
  time?: number;
}

export interface AchievementStats {
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

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MAX_STREAK_CHECK = 3650;

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  return useMemo(() => {
    // 防御性检查：确保 data 是有效数组
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

    // 过滤无效数据项
    const validData = data.filter(
      (d): d is DailyXpData =>
        d != null &&
        typeof d.date === 'string' &&
        typeof d.xp === 'number' &&
        !isNaN(d.xp)
    );

    const sortedData = [...validData]
      .filter(d => d.xp > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 连续天数统计
    let maxStreak = 0;
    let tempStreak = 1;
    const streakMilestones: Record<number, string> = {};

    for (let i = 1; i < sortedData.length; i++) {
      const prevDate = new Date(sortedData[i - 1].date);
      const currDate = new Date(sortedData[i].date);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / MS_PER_DAY);

      if (diffDays === 1) {
        tempStreak++;
        recordMilestone(streakMilestones, MILESTONES.streak, tempStreak, sortedData[i].date);
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    // 当前连续天数
    const xpByDate = new Map(data.map(d => [d.date, d.xp]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(today);

    const todayXp = xpByDate.get(formatDateString(today));
    if (!todayXp || todayXp === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let currentStreak = 0;
    for (let i = 0; i < MAX_STREAK_CHECK; i++) {
      const xp = xpByDate.get(formatDateString(checkDate));
      if (!xp || xp <= 0) break;
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 单日最高 XP
    let maxDailyXp = 0;
    const dailyXpMilestones: Record<number, string> = {};
    for (const d of data) {
      if (d.xp > maxDailyXp) maxDailyXp = d.xp;
      recordMilestone(dailyXpMilestones, MILESTONES.dailyXp, d.xp, d.date);
    }

    // 总学习天数
    const totalDays = sortedData.length;
    const totalDaysMilestones: Record<number, string> = {};
    sortedData.forEach((d, i) => {
      recordMilestone(totalDaysMilestones, MILESTONES.totalDays, i + 1, d.date, true);
    });

    // 累计 XP
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
