import type { DuolingoRawUser } from "../types";
import { toLocalDateKey, getStartOfDayInTimezone, parseSummaryDateKey, MS_PER_DAY, resolveTimeZone } from "../utils/dateUtils";

interface TodayStats {
  xpToday: number;
  lessonsToday?: number;
  streakExtendedToday: boolean;
  streakExtendedTime?: string;
}

/**
 * 解析连胜延长时间
 */
function resolveStreakExtendedTime(
  streakExtendedToday: boolean,
  rawData: DuolingoRawUser,
  localTodayStart: number,
  localTodayEnd: number
): string | undefined {
  if (!streakExtendedToday) return undefined;

  if (rawData.streakData?.currentStreak?.lastExtendedDate) {
    return new Date(rawData.streakData.currentStreak.lastExtendedDate)
      .toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  if (rawData.calendar?.length) {
    const todayEvents = rawData.calendar
      .filter(e => e.datetime >= localTodayStart && e.datetime < localTodayEnd)
      .sort((a, b) => a.datetime - b.datetime);
    if (todayEvents.length > 0) {
      return new Date(todayEvents[0].datetime)
        .toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
  }

  if (rawData.xpGains?.length) {
    const todayGains = rawData.xpGains
      .filter((g) => g.time * 1000 >= localTodayStart)
      .sort((a, b) => a.time - b.time);
    if (todayGains.length > 0) {
      return new Date(todayGains[0].time * 1000)
        .toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
  }

  return undefined;
}

/**
 * 解析今日统计数据
 */
export function resolveTodayStats(
  rawData: DuolingoRawUser,
  xpByDate: Map<string, number>,
  timeZone?: string
): TodayStats {
  const resolvedTimeZone = resolveTimeZone(timeZone);
  let xpToday = 0;
  let lessonsToday = 0;
  const streakExtendedToday = rawData.streak_extended_today ?? rawData.streakExtendedToday ?? false;

  const now = new Date();
  const localTodayStart = getStartOfDayInTimezone(now, resolvedTimeZone);
  const localTodayEnd = localTodayStart + MS_PER_DAY;
  const localTodayDateKey = toLocalDateKey(now, resolvedTimeZone);

  const streakExtendedTime = resolveStreakExtendedTime(streakExtendedToday, rawData, localTodayStart, localTodayEnd);

  // 优先从 xpSummaries 获取今日数据
  if (rawData._xpSummaries?.length) {
    const todaySummary = rawData._xpSummaries.find((s) =>
      parseSummaryDateKey(s.date, resolvedTimeZone) === localTodayDateKey
    );
    if (todaySummary) {
      xpToday = todaySummary.gainedXp ?? todaySummary.gained_xp ?? 0;
      lessonsToday = todaySummary.numSessions ?? 0;
    }
  }

  // 备用：从其他数据源获取
  if (xpToday === 0) {
    const todayXpFromHistory = xpByDate.get(localTodayDateKey) || 0;

    if (rawData.xp_today !== undefined) {
      xpToday = rawData.xp_today;
    } else if (todayXpFromHistory > 0) {
      xpToday = todayXpFromHistory;
    } else if (rawData.streakData?.currentStreak?.endDate) {
      const streakEndTs = new Date(rawData.streakData.currentStreak.endDate).getTime();
      if (streakEndTs >= localTodayStart && streakEndTs < localTodayEnd) {
        xpToday = rawData.streakData.currentStreak.lastExtendedDate ? 1 : 0;
      }
    } else if (rawData.calendar?.length) {
      const todayEvents = rawData.calendar.filter(e =>
        e.datetime >= localTodayStart && e.datetime < localTodayEnd
      );
      xpToday = todayEvents.reduce((acc, e) => acc + (e.improvement || 0), 0);
      if (lessonsToday === 0) lessonsToday = todayEvents.length;
    }
  }

  // 最终备用：从 xpGains 获取
  if (xpToday === 0 && rawData.xpGains?.length) {
    const todayGains = rawData.xpGains.filter((g) => {
      const gainTs = g.time * 1000;
      return gainTs >= localTodayStart && gainTs < localTodayEnd;
    });
    xpToday = todayGains.reduce((acc, g) => acc + (g.xp || 0), 0);
    if (lessonsToday === 0) lessonsToday = todayGains.length;
  }

  return {
    xpToday,
    lessonsToday: lessonsToday || undefined,
    streakExtendedToday,
    streakExtendedTime
  };
}
