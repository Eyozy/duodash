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

/**
 * 计算成就统计数据的自定义 Hook
 * 用于分析学习数据并计算各类成就里程碑
 */
export function useAchievementStats(data: DailyXpData[]): AchievementStats {
  return useMemo(() => {
    const sortedData = [...data]
      .filter(d => d.xp > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 计算最长连续天数和里程碑
    let maxStreak = 0;
    let tempStreak = 1;
    const streakMilestones: Record<number, string> = {};

    const checkStreakMilestone = (streak: number, endDate: string) => {
      [7, 30, 60, 100, 365].forEach(milestone => {
        if (streak >= milestone && !streakMilestones[milestone]) {
          streakMilestones[milestone] = endDate;
        }
      });
    };

    for (let i = 1; i < sortedData.length; i++) {
      const prevDate = new Date(sortedData[i - 1].date);
      const currDate = new Date(sortedData[i].date);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        checkStreakMilestone(tempStreak, sortedData[i].date);
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    // 当前连续天数
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const xpByDate = new Map(data.map(d => [d.date, d.xp]));
    let checkDate = new Date(today);

    if (!xpByDate.get(todayStr) || xpByDate.get(todayStr) === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 安全边界：最多检查 10 年数据，防止异常数据导致无限循环
    const MAX_STREAK_CHECK = 3650;
    let iterations = 0;
    while (iterations < MAX_STREAK_CHECK) {
      iterations++;
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const xp = xpByDate.get(dateStr);
      if (xp && xp > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 单日最高 XP
    let maxDailyXp = 0;
    const dailyXpMilestones: Record<number, string> = {};
    data.forEach(d => {
      if (d.xp > maxDailyXp) maxDailyXp = d.xp;
      [500, 1000, 2000, 5000].forEach(milestone => {
        if (d.xp >= milestone && !dailyXpMilestones[milestone]) {
          dailyXpMilestones[milestone] = d.date;
        }
      });
    });

    // 总学习天数
    const totalDays = data.filter(d => d.xp > 0).length;
    const totalDaysMilestones: Record<number, string> = {};
    let dayCount = 0;
    sortedData.forEach(d => {
      dayCount++;
      [50, 100, 200, 365].forEach(milestone => {
        if (dayCount === milestone && !totalDaysMilestones[milestone]) {
          totalDaysMilestones[milestone] = d.date;
        }
      });
    });

    // 累计 XP
    const totalXp = data.reduce((sum, d) => sum + (d.xp > 0 ? d.xp : 0), 0);
    const totalXpMilestones: Record<number, string> = {};
    let runningXp = 0;
    sortedData.forEach(d => {
      runningXp += d.xp;
      [10000, 50000, 100000, 500000].forEach(milestone => {
        if (runningXp >= milestone && !totalXpMilestones[milestone]) {
          totalXpMilestones[milestone] = d.date;
        }
      });
    });

    return {
      maxStreak,
      currentStreak,
      maxDailyXp,
      totalDays,
      totalXp,
      streakMilestones,
      dailyXpMilestones,
      totalDaysMilestones,
      totalXpMilestones,
    };
  }, [data]);
}

export default useAchievementStats;
