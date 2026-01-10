import type { UserData, DuolingoRawUser, Course } from "../types";

const LEAGUE_TIERS = [
  "青铜", "白银", "黄金", "蓝宝石", "红宝石",
  "祖母绿", "紫水晶", "珍珠", "黑曜石", "钻石"
];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * 将 Date 对象转换为 YYYY-MM-DD 格式的本地日期键
 * 为了保证一致性，默认使用 'Asia/Shanghai' 时区
 */
function toLocalDateKey(date: Date, timeZone: string = 'Asia/Shanghai'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone
    });
    return formatter.format(date);
  } catch (e) {
    // 降级方案：如果时区无效，回退到原始逻辑（服务器本地时间）
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calcDaysSince(createdAt: Date): number {
  const diffMs = getStartOfDay(new Date()).getTime() - getStartOfDay(createdAt).getTime();
  return Math.max(0, Math.floor(diffMs / MS_PER_DAY));
}

function resolveTierIndex(rawAny: any, rawData: DuolingoRawUser): number {
  if (rawAny.tier !== undefined && rawAny.tier >= 0 && rawAny.tier <= 10) return rawAny.tier;
  if (rawAny.trackingProperties?.league_tier !== undefined) return rawAny.trackingProperties.league_tier;
  if (rawAny.trackingProperties?.leaderboard_league !== undefined) return rawAny.trackingProperties.leaderboard_league;
  if (rawAny.tracking_properties?.league_tier !== undefined) return rawAny.tracking_properties.league_tier;
  if (rawAny.tracking_properties?.leaderboard_league !== undefined) return rawAny.tracking_properties.leaderboard_league;
  if (rawData.language_data) {
    const currentLang = Object.values(rawData.language_data).find((l: any) => l.current_learning) as any;
    if (currentLang?.tier !== undefined) return currentLang.tier;
  }
  return -1;
}

function parseCreationDate(creationTs: number | undefined, created: string | undefined): { dateStr: string; ageDays: number } {
  if (creationTs) {
    const ts = creationTs < 10000000000 ? creationTs * 1000 : creationTs;
    const cDate = new Date(ts);
    if (!isNaN(cDate.getTime())) {
      return {
        dateStr: cDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
        ageDays: calcDaysSince(cDate)
      };
    }
  }
  if (created) {
    const cDate = new Date(created);
    if (!isNaN(cDate.getTime())) {
      return {
        dateStr: cDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
        ageDays: calcDaysSince(cDate)
      };
    }
  }
  return { dateStr: "未知", ageDays: 0 };
}

function resolveStreakExtendedTime(
  streakExtendedToday: boolean,
  rawAny: any,
  rawData: DuolingoRawUser,
  localTodayStart: number
): string | undefined {
  if (!streakExtendedToday) return undefined;

  if (rawAny.streakData?.currentStreak?.lastExtendedDate) {
    return new Date(rawAny.streakData.currentStreak.lastExtendedDate)
      .toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  if (rawData.calendar?.length) {
    const todayStr = new Date().toDateString();
    const todayEvents = rawData.calendar
      .filter(e => new Date(e.datetime).toDateString() === todayStr)
      .sort((a, b) => a.datetime - b.datetime);
    if (todayEvents.length > 0) {
      return new Date(todayEvents[0].datetime)
        .toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
  }

  if (rawAny.xpGains?.length) {
    const todayGains = rawAny.xpGains
      .filter((g: any) => g.time * 1000 >= localTodayStart)
      .sort((a: any, b: any) => a.time - b.time);
    if (todayGains.length > 0) {
      return new Date(todayGains[0].time * 1000)
        .toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
  }

  return undefined;
}

function sumPoints(items: Array<{ points?: number; xp?: number }> | undefined): number {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (item.points || item.xp || 0), 0);
}

export function transformDuolingoData(rawData: DuolingoRawUser): UserData {
  const rawAny = rawData as any;

  const streak = rawData.site_streak ?? rawData.streak;
  const gems = rawData.gemsTotalCount || rawData.totalGems || rawData.gems || rawData.tracking_properties?.gems || rawData.lingots || rawData.rupees || 0;

  let totalXp = rawData.total_xp ?? rawData.totalXp ?? 0;
  if (totalXp === 0) totalXp = sumPoints(rawData.languages);
  if (totalXp === 0 && rawData.language_data) totalXp = sumPoints(Object.values(rawData.language_data));
  if (totalXp === 0) totalXp = sumPoints(rawData.courses);

  const dailyGoal = rawData.dailyGoal ?? rawData.daily_goal ?? rawData.xpGoal ?? 0;
  const creationTs = rawData.creation_date || rawData.creationDate;

  let courses: Course[] = [];

  if (rawData.courses?.length) {
    courses = rawData.courses
      .filter((c: any) => (c.xp || 0) > 0 || c.current_learning)
      .map(c => ({
        title: c.title,
        xp: c.xp,
        fromLanguage: c.fromLanguage,
        learningLanguage: c.learningLanguage,
        crowns: c.crowns || 0,
        id: c.id
      }));
  }

  if (rawAny.languages?.length) {
    const v1Courses = rawAny.languages
      .filter((l: any) => l.points > 0 || l.current_learning)
      .map((l: any) => ({
        id: l.language,
        title: l.language_string,
        xp: l.points || 0,
        crowns: l.crowns || 0,
        fromLanguage: 'en',
        learningLanguage: l.language,
      }));

    for (const v1c of v1Courses) {
      const exists = courses.some(c =>
        c.title === v1c.title ||
        c.learningLanguage === v1c.learningLanguage ||
        (c.id && v1c.id && c.id.includes(v1c.id))
      );
      if (!exists) courses.push(v1c);
    }
  }

  if (courses.length === 0 && rawData.language_data) {
    courses = Object.entries(rawData.language_data)
      .filter(([_, langDetail]: [string, any]) => {
        const xp = langDetail.points || langDetail.level_progress || 0;
        return xp > 0 || langDetail.current_learning;
      })
      .map(([langCode, langDetail]: [string, any]) => {
        let crowns = langDetail.crowns || 0;
        if (crowns === 0 && langDetail.skills?.length) {
          crowns = langDetail.skills.reduce((acc: number, skill: any) =>
            acc + (skill.levels_finished || skill.crowns || skill.finishedLevels || 0), 0);
        }
        return {
          id: langDetail.learning_language || langCode,
          title: langDetail.language_string,
          xp: langDetail.points || langDetail.level_progress || 0,
          crowns,
          fromLanguage: langDetail.from_language || 'en',
          learningLanguage: langDetail.learning_language || langCode,
        };
      });
  }

  let learningLanguage = "None";
  if (rawData.language_data) {
    const current = Object.values(rawData.language_data).find(l => l.current_learning);
    learningLanguage = current?.language_string ?? courses[0]?.title ?? "None";
  } else if (rawData.currentCourse) {
    learningLanguage = rawData.currentCourse.title;
  } else if (courses.length > 0) {
    learningLanguage = courses[0].title;
  }

  const xpByDate = new Map<string, number>();
  const timeByDate = new Map<string, number>();

  function addCalendarEvent(event: { datetime: number; improvement?: number }): void {
    const dateKey = toLocalDateKey(new Date(event.datetime));
    const improvement = event.improvement || 0;
    xpByDate.set(dateKey, (xpByDate.get(dateKey) || 0) + improvement);
    timeByDate.set(dateKey, (timeByDate.get(dateKey) || 0) + Math.ceil((improvement || 10) / 3));
  }

  if (rawAny._xpSummaries?.length) {
    for (const summary of rawAny._xpSummaries) {
      let dateKey: string;
      if (typeof summary.date === 'number') {
        dateKey = toLocalDateKey(new Date(summary.date * 1000));
      } else if (typeof summary.date === 'string') {
        const utcDate = new Date(summary.date.replace(/\//g, '-') + 'T00:00:00Z');
        dateKey = toLocalDateKey(utcDate);
      } else {
        continue;
      }

      const gainedXp = summary.gainedXp ?? summary.gained_xp ?? 0;
      xpByDate.set(dateKey, gainedXp);

      const sessionTimeSeconds = summary.totalSessionTime ?? summary.total_session_time ?? 0;
      const minutes = Math.round(sessionTimeSeconds / 60);
      timeByDate.set(dateKey, minutes > 0 ? minutes : Math.ceil(gainedXp / 3));
    }
  } else if (rawData.calendar?.length) {
    rawData.calendar.forEach(addCalendarEvent);
  } else if (rawData.language_data) {
    Object.values(rawData.language_data).forEach((lang: any) => {
      if (lang.calendar?.length) lang.calendar.forEach(addCalendarEvent);
    });
  }

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

  const yearlyXpHistory: { date: string; xp: number; time?: number }[] = [];
  xpByDate.forEach((xp, date) => yearlyXpHistory.push({ date, xp, time: timeByDate.get(date) }));

  const tierIndex = resolveTierIndex(rawAny, rawData);
  const leagueName = (tierIndex >= 0 && tierIndex < LEAGUE_TIERS.length)
    ? LEAGUE_TIERS[tierIndex] : "暂无数据";

  const { dateStr: creationDateStr, ageDays: accountAgeDays } = parseCreationDate(creationTs, rawData.created);

  const hasInventoryPremium = rawAny.inventory?.premium_subscription || rawAny.inventory?.super_subscription;
  const hasItemPremium = rawAny.has_item_premium_subscription || rawAny.has_item_immersive_subscription;
  const isPlus = !!(rawData.hasPlus || rawData.hasSuper || rawData.plusStatus === 'active' || rawAny.has_plus || rawAny.is_plus || hasInventoryPremium || hasItemPremium);

  const visibleTotalXp = courses.reduce((acc, c) => acc + c.xp, 0);
  const totalMinutes = Math.floor(visibleTotalXp / 6);
  const estimatedLearningTime = `${Math.floor(totalMinutes / 60)}小时 ${totalMinutes % 60}分钟`;

  let xpToday = 0;
  let lessonsToday = 0;
  const streakExtendedToday = rawAny.streak_extended_today ?? rawAny.streakExtendedToday ?? false;

  const now = new Date();
  const localTodayStart = getStartOfDay(now).getTime();
  const localTodayEnd = localTodayStart + MS_PER_DAY;
  const localTodayDateKey = toLocalDateKey(now);

  const streakExtendedTime = resolveStreakExtendedTime(streakExtendedToday, rawAny, rawData, localTodayStart);

  const todayXpFromHistory = xpByDate.get(localTodayDateKey) || 0;

  if (rawAny.xp_today !== undefined) {
    xpToday = rawAny.xp_today;
  } else if (todayXpFromHistory > 0) {
    xpToday = todayXpFromHistory;
  } else if (rawAny.streakData?.currentStreak?.endDate) {
    const streakEndTs = new Date(rawAny.streakData.currentStreak.endDate).getTime();
    if (streakEndTs >= localTodayStart && streakEndTs < localTodayEnd) {
      xpToday = rawAny.streakData.currentStreak.lastExtendedDate ? 1 : 0;
    }
  } else if (rawData.calendar?.length) {
    const todayEvents = rawData.calendar.filter(e =>
      e.datetime >= localTodayStart && e.datetime < localTodayEnd
    );
    xpToday = todayEvents.reduce((acc, e) => acc + (e.improvement || 0), 0);
    lessonsToday = todayEvents.length;
  }

  if (xpToday === 0 && rawAny.xpGains?.length) {
    const todayGains = rawAny.xpGains.filter((g: any) => {
      const gainTs = g.time * 1000;
      return gainTs >= localTodayStart && gainTs < localTodayEnd;
    });
    xpToday = todayGains.reduce((acc: number, g: any) => acc + (g.xp || 0), 0);
    lessonsToday = todayGains.length;
  }

  return {
    streak, totalXp, gems,
    league: leagueName, leagueTier: tierIndex, courses, dailyXpHistory,
    dailyTimeHistory, yearlyXpHistory,
    learningLanguage, creationDate: creationDateStr, accountAgeDays,
    isPlus, dailyGoal, estimatedLearningTime,
    xpToday,
    lessonsToday: lessonsToday || undefined,
    streakExtendedToday,
    streakExtendedTime,
    weeklyXp: rawAny.weeklyXp,
    numSessionsCompleted: rawAny.numSessionsCompleted,
    streakFreezeCount: rawAny.streakFreezeCount
  };
};

async function fetchFromProxy(target: string, params: Record<string, string>, jwt: string): Promise<any> {
  const url = new URL('/api/duo', window.location.origin);
  url.searchParams.set('target', target);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const response = await fetch(url.toString(), jwt ? { headers: { 'x-duo-jwt': jwt } } : {});
  if (!response.ok) return null;
  return response.json();
}

async function fetchXpSummaries(userId: number, jwt: string): Promise<any[]> {
  try {
    const data = await fetchFromProxy('xp_summaries', { userId: userId.toString() }, jwt);
    return data?.summaries || [];
  } catch {
    return [];
  }
}

async function fetchLeaderboardHistory(userId: number, jwt: string): Promise<any> {
  try {
    return await fetchFromProxy('leaderboard_history', { userId: userId.toString() }, jwt);
  } catch {
    return null;
  }
}

export async function fetchDuolingoData(username: string, jwt: string): Promise<UserData> {
  const data = await fetchFromProxy('users', { username }, jwt);
  if (!data) {
    throw new Error("连接失败。请确保本地服务运行正常，或使用「粘贴 JSON」模式。");
  }

  const rawData = data.users ? data.users[0] : data;
  const userId = rawData.id || rawData.user_id || rawData.tracking_properties?.user_id;

  if (userId && jwt) {
    const [xpSummaries, lbHistory] = await Promise.all([
      fetchXpSummaries(userId, jwt),
      fetchLeaderboardHistory(userId, jwt)
    ]);

    if (xpSummaries.length > 0) rawData._xpSummaries = xpSummaries;
    if (lbHistory) rawData._leaderboardHistory = lbHistory;
  }

  return transformDuolingoData(rawData);
}
