import type { UserData, DuolingoRawUser } from "../types";
import { parseSummaryDateKey, calcDaysSince, resolveTimeZone } from "../utils/dateUtils";
import { resolveCourses, resolveLearningLanguage, resolveTierIndex, parseCreationDate, resolveIsPlus, resolveTotalXp } from "./duolingoResolvers";
import { buildHistoryData, calculateTotalLearningTime } from "./historyBuilder";
import { resolveTodayStats } from "./todayStatsResolver";
import { LEAGUE_TIERS } from "../constants/tiers";

export function transformDuolingoData(rawData: DuolingoRawUser, timeZone?: string): UserData {
  if (!rawData || typeof rawData !== 'object') {
    throw new TypeError('transformDuolingoData: 输入必须是有效的用户数据对象');
  }
  const resolvedTimeZone = resolveTimeZone(timeZone);

  const streak = rawData.site_streak ?? rawData.streak ?? 0;
  const gems = rawData.gemsTotalCount || rawData.totalGems || rawData.gems || rawData.tracking_properties?.gems || rawData.lingots || rawData.rupees || 0;
  const totalXp = resolveTotalXp(rawData);
  const dailyGoal = rawData.dailyGoal ?? rawData.daily_goal ?? rawData.xpGoal ?? 0;
  const creationTs = rawData.creation_date || rawData.creationDate;

  const courses = resolveCourses(rawData);
  const learningLanguage = resolveLearningLanguage(rawData, courses);

  const {
    dailyXpHistory,
    dailyTimeHistory,
    weeklyXpHistory,
    weeklyTimeHistory,
    yearlyXpHistory
  } = buildHistoryData(rawData, resolvedTimeZone);

  const tierIndex = resolveTierIndex(rawData);
  const leagueName = (tierIndex >= 0 && tierIndex < LEAGUE_TIERS.length)
    ? LEAGUE_TIERS[tierIndex] : '暂无数据';

  const { dateStr: creationDateStr, ageDays: accountAgeDays } = parseCreationDate(
    creationTs,
    rawData.created,
    calcDaysSince,
    resolvedTimeZone
  );

  const isPlus = resolveIsPlus(rawData);
  const estimatedLearningTime = calculateTotalLearningTime(rawData);

  const xpByDate = new Map<string, number>();
  if (rawData._xpSummaries?.length) {
    for (const summary of rawData._xpSummaries) {
      const dateKey = parseSummaryDateKey(summary.date, resolvedTimeZone);
      if (dateKey) {
        const gainedXp = summary.gainedXp ?? summary.gained_xp ?? 0;
        xpByDate.set(dateKey, (xpByDate.get(dateKey) || 0) + gainedXp);
      }
    }
  }

  const { xpToday, lessonsToday, streakExtendedToday, streakExtendedTime } = resolveTodayStats(rawData, xpByDate, resolvedTimeZone);

  return {
    streak,
    totalXp,
    gems,
    league: leagueName,
    leagueTier: tierIndex,
    courses,
    dailyXpHistory,
    dailyTimeHistory,
    yearlyXpHistory,
    weeklyXpHistory,
    weeklyTimeHistory,
    learningLanguage,
    creationDate: creationDateStr,
    accountAgeDays,
    isPlus,
    dailyGoal,
    estimatedLearningTime,
    xpToday,
    lessonsToday,
    streakExtendedToday,
    streakExtendedTime,
    weeklyXp: rawData.weeklyXp,
    sessionCount: rawData.sessionCount,
    streakFreezeCount: rawData.streakFreezeCount
  };
}
