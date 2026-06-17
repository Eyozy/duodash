import type { UserData } from '../types';
import { formatMonthDayInTimeZone, formatDuration, toLocalDateKey, getMonday } from './dateUtils';

type DemoHistoryPoint = { date: string; xp: number; time: number };

function buildDemoYearlyHistory(now = new Date()): DemoHistoryPoint[] {
  const history: DemoHistoryPoint[] = [];

  for (let offset = 364; offset >= 0; offset -= 1) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() - offset);

    const weekday = currentDate.getDay();
    const baseXp = 80 + ((364 - offset) * 37 + weekday * 29) % 240;
    const bonusXp = weekday === 6 ? 90 : weekday === 0 ? 40 : 0;
    const xp = offset === 0 ? 180 : baseXp + bonusXp;
    const time = offset === 0 ? 58 : Math.max(18, Math.round(xp / 4.5));

    history.push({ date: toLocalDateKey(currentDate), xp, time });
  }

  return history;
}

export function buildDemoData(now = new Date()): UserData {
  const yearlyHistory = buildDemoYearlyHistory(now);
  const historyByDate = new Map(yearlyHistory.map((entry) => [entry.date, entry]));
  const dailyHistory = yearlyHistory.slice(-7);
  const weeklyXpHistory: NonNullable<UserData['weeklyXpHistory']> = [];
  const weeklyTimeHistory: NonNullable<UserData['weeklyTimeHistory']> = [];
  const monday = getMonday(now);

  for (let index = 0; index < 7; index += 1) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + index);
    const entry = historyByDate.get(toLocalDateKey(currentDate));

    weeklyXpHistory.push({
      date: formatMonthDayInTimeZone(currentDate),
      xp: entry?.xp ?? 0,
      isFuture: false,
    });
    weeklyTimeHistory.push({
      date: formatMonthDayInTimeZone(currentDate),
      time: entry?.time ?? 0,
      isFuture: false,
    });
  }

  const totalMinutes = yearlyHistory.reduce((sum, entry) => sum + entry.time, 0);
  const todayEntry = dailyHistory[dailyHistory.length - 1];

  return {
    streak: 2045,
    totalXp: 202663,
    gems: 15400,
    league: '钻石',
    leagueTier: 9,
    learningLanguage: '英语',
    creationDate: '2015 年 5 月 12 日',
    accountAgeDays: 3200,
    isPlus: true,
    dailyGoal: 50,
    estimatedLearningTime: formatDuration(totalMinutes),
    courses: [
      { id: 'en', title: '英语', xp: 125000, fromLanguage: 'zh', learningLanguage: 'en', crowns: 150 },
      { id: 'ja', title: '日语', xp: 55000, fromLanguage: 'zh', learningLanguage: 'ja', crowns: 45 },
      { id: 'es', title: '西语', xp: 12000, fromLanguage: 'zh', learningLanguage: 'es', crowns: 20 },
      { id: 'fr', title: '法语', xp: 2500, fromLanguage: 'zh', learningLanguage: 'fr', crowns: 5 },
    ],
    dailyXpHistory: dailyHistory.map(({ date, xp }) => ({
      date: formatMonthDayInTimeZone(new Date(`${date}T00:00:00`)),
      xp,
    })),
    dailyTimeHistory: dailyHistory.map(({ date, time }) => ({
      date: formatMonthDayInTimeZone(new Date(`${date}T00:00:00`)),
      time,
    })),
    yearlyXpHistory: yearlyHistory,
    weeklyXpHistory,
    weeklyTimeHistory,
    xpToday: todayEntry?.xp ?? 0,
    lessonsToday: 6,
    streakExtendedToday: false,
    weeklyXp: weeklyXpHistory.reduce((sum, day) => sum + day.xp, 0),
  };
}
