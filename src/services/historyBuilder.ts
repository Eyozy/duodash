import type { DuolingoRawUser } from "../types";
import { toLocalDateKey, parseSummaryDateKey, getMonday } from "../utils/dateUtils";

interface HistoryData {
  dailyXpHistory: { date: string; xp: number }[];
  dailyTimeHistory: { date: string; time: number }[];
  weeklyXpHistory: { date: string; xp: number; isFuture: boolean }[];
  weeklyTimeHistory: { date: string; time: number; isFuture: boolean }[];
  yearlyXpHistory: { date: string; xp: number; time?: number }[];
}

function addToMap(map: Map<string, number>, key: string, value: number): void {
  map.set(key, (map.get(key) || 0) + value);
}

/**
 * 构建历史数据（日、周、年）
 */
export function buildHistoryData(rawData: DuolingoRawUser): HistoryData {
  const xpByDate = new Map<string, number>();
  const timeByDate = new Map<string, number>();

  // 处理日历事件
  function addCalendarEvent(event: { datetime: number; improvement?: number }): void {
    const dateKey = toLocalDateKey(new Date(event.datetime));
    const improvement = event.improvement || 0;
    addToMap(xpByDate, dateKey, improvement);
    addToMap(timeByDate, dateKey, Math.ceil((improvement || 10) / 3));
  }

  // 优先使用 xpSummaries
  if (rawData._xpSummaries?.length) {
    for (const summary of rawData._xpSummaries) {
      const dateKey = parseSummaryDateKey(summary.date);
      if (!dateKey) continue;

      const gainedXp = summary.gainedXp ?? summary.gained_xp ?? 0;
      addToMap(xpByDate, dateKey, gainedXp);

      const sessionTimeSeconds = summary.totalSessionTime ?? summary.total_session_time ?? 0;
      const minutes = Math.round(sessionTimeSeconds / 60);
      addToMap(timeByDate, dateKey, minutes > 0 ? minutes : Math.ceil(gainedXp / 3));
    }
  } else if (rawData.calendar?.length) {
    rawData.calendar.forEach(addCalendarEvent);
  } else if (rawData.language_data) {
    Object.values(rawData.language_data).forEach((lang) => {
      if (lang.calendar?.length) lang.calendar.forEach(addCalendarEvent);
    });
  }

  // 滚动 7 天数据（用于首页图表）
  const dailyXpHistory: { date: string; xp: number }[] = [];
  const dailyTimeHistory: { date: string; time: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = toLocalDateKey(d);
    const dayLabel = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    dailyXpHistory.push({ date: dayLabel, xp: xpByDate.get(dateKey) || 0 });
    dailyTimeHistory.push({ date: dayLabel, time: timeByDate.get(dateKey) || 0 });
  }

  // 自然周数据（用于分享卡片，周一到周日）
  const weeklyXpHistory: { date: string; xp: number; isFuture: boolean }[] = [];
  const weeklyTimeHistory: { date: string; time: number; isFuture: boolean }[] = [];
  const monday = getMonday(today);
  const todayDateKey = toLocalDateKey(today);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateKey = toLocalDateKey(d);
    const dayLabel = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    const isFuture = dateKey > todayDateKey;

    weeklyXpHistory.push({
      date: dayLabel,
      xp: isFuture ? 0 : (xpByDate.get(dateKey) || 0),
      isFuture
    });
    weeklyTimeHistory.push({
      date: dayLabel,
      time: isFuture ? 0 : (timeByDate.get(dateKey) || 0),
      isFuture
    });
  }

  // 年度数据
  const yearlyXpHistory: { date: string; xp: number; time?: number }[] = [];
  xpByDate.forEach((xp, date) => yearlyXpHistory.push({ date, xp, time: timeByDate.get(date) }));

  return {
    dailyXpHistory,
    dailyTimeHistory,
    weeklyXpHistory,
    weeklyTimeHistory,
    yearlyXpHistory
  };
}

/**
 * 计算总学习时间
 */
export function calculateTotalLearningTime(rawData: DuolingoRawUser): string {
  if (!rawData._xpSummaries?.length) {
    return '暂无数据';
  }

  const totalSeconds = rawData._xpSummaries.reduce((acc, s) =>
    acc + (s.totalSessionTime ?? s.total_session_time ?? 0), 0);

  if (totalSeconds === 0) {
    return '暂无数据';
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return `${hours}小时 ${mins}分钟`;
}
