import type { UserData, DuolingoRawUser, Course, DuolingoLanguageDataDetail } from "../types";

const API_BASE_V1 = "https://www.duolingo.com/users";
const API_BASE_V2 = "https://www.duolingo.com/2017-06-30/users";
const PROXY_URL = "https://corsproxy.io/?";

const LEAGUE_TIERS = [
  "青铜",
  "白银",
  "黄金",
  "蓝宝石",
  "红宝石",
  "祖母绿",
  "紫水晶",
  "珍珠",
  "黑曜石",
  "钻石"
];

export const transformDuolingoData = (rawData: DuolingoRawUser): UserData => {
  const rawAny = rawData;

  const streak = rawData.site_streak !== undefined ? rawData.site_streak : rawData.streak;

  // 宝石：优先检查 gems 相关字段 (App 数据)，最后才用 lingots (Web 数据)
  const gems = rawData.gemsTotalCount || rawData.totalGems || rawData.gems || rawData.tracking_properties?.gems || rawData.lingots || rawData.rupees || 0;

  // 计算总 XP：优先使用 total_xp 字段
  let totalXp = rawData.total_xp !== undefined ? rawData.total_xp : (rawData.totalXp || 0);
  // 优先从 languages 数组累加（包含所有语言的经验）
  if (totalXp === 0 && rawData.languages && Array.isArray(rawData.languages)) {
    totalXp = rawData.languages.reduce((sum, lang) => {
      return sum + (lang.points || 0);
    }, 0);
  }
  // 备用：从 language_data 累加
  if (totalXp === 0 && rawData.language_data) {
    totalXp = Object.values(rawData.language_data).reduce((sum, lang) => {
      return sum + (lang.points || 0);
    }, 0);
  }
  // 最后备用：从 courses 数组累加
  if (totalXp === 0 && rawData.courses && Array.isArray(rawData.courses)) {
    totalXp = rawData.courses.reduce((acc, c) => acc + (c.xp || 0), 0);
  }
  // 每日目标
  const dailyGoal = rawData.dailyGoal ?? rawData.daily_goal ?? rawData.xpGoal ?? 0;
  const creationTs = rawData.creation_date || rawData.creationDate;

  let courses: Course[] = [];

  // 1. 优先尝试从 courses 数组获取 (V2 API)
  if (rawData.courses && Array.isArray(rawData.courses) && rawData.courses.length > 0) {
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

  // 2. 检查 V1 API 的 languages 数组，合并缺失的课程
  if (rawAny.languages && Array.isArray(rawAny.languages)) {
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

    // 合并：如果 courses 中还没有这个语言，则添加
    v1Courses.forEach((v1c: any) => {
      const exists = courses.some(c =>
        c.title === v1c.title ||
        c.learningLanguage === v1c.learningLanguage ||
        (c.id && v1c.id && c.id.includes(v1c.id)) // 尝试 ID 包含匹配
      );
      if (!exists) {
        courses.push(v1c);
      }
    });
  }

  // 3. 如果还是没有，尝试从 language_data 获取
  if (courses.length === 0 && rawData.language_data) {
    courses = Object.entries(rawData.language_data)
      .filter(([_, langDetail]: [string, any]) => {
        const xp = langDetail.points || langDetail.level_progress || 0;
        return xp > 0 || langDetail.current_learning;
      })
      .map(([langCode, langDetail]: [string, any]) => {
        let crowns = langDetail.crowns || 0;
        if (crowns === 0 && langDetail.skills && Array.isArray(langDetail.skills)) {
          crowns = langDetail.skills.reduce((acc: number, skill: any) => {
            const skillCrowns = skill.levels_finished || skill.crowns || skill.finishedLevels || 0;
            return acc + skillCrowns;
          }, 0);
        }
        return {
          id: langDetail.learning_language || langCode,
          title: langDetail.language_string,
          xp: langDetail.points || langDetail.level_progress || 0,
          crowns: crowns,
          fromLanguage: langDetail.from_language || 'en',
          learningLanguage: langDetail.learning_language || langCode,
        };
      });
  }

  let learningLanguage = "None";
  if (rawData.language_data) {
    const current = Object.values(rawData.language_data).find(l => l.current_learning);
    if (current) learningLanguage = current.language_string;
    else if (courses.length > 0) learningLanguage = courses[0].title;
  } else if (rawData.currentCourse) {
    learningLanguage = rawData.currentCourse.title;
  } else if (courses.length > 0) {
    learningLanguage = courses[0].title;
  }

  // 解析每日 XP 和学习时间数据
  const xpByDate = new Map<string, number>();
  const timeByDate = new Map<string, number>();

  // 辅助函数：获取本地日期字符串 YYYY-MM-DD
  const toLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 优先使用 xp_summaries API 的数据（更准确）
  if (rawAny._xpSummaries && rawAny._xpSummaries.length > 0) {
    rawAny._xpSummaries.forEach((summary: any) => {
      // date 可能是 Unix 时间戳（秒）或字符串
      let dateKey: string;
      if (typeof summary.date === 'number') {
        // Unix 时间戳转换为本地日期
        const d = new Date(summary.date * 1000);
        dateKey = toLocalDateKey(d);
      } else if (typeof summary.date === 'string') {
        dateKey = summary.date.replace(/\//g, '-');
      } else {
        return;
      }

      const gainedXp = summary.gainedXp ?? summary.gained_xp ?? 0;
      xpByDate.set(dateKey, gainedXp);

      // totalSessionTime 是秒，转换为分钟
      const sessionTimeSeconds = summary.totalSessionTime ?? summary.total_session_time ?? 0;
      const minutes = Math.round(sessionTimeSeconds / 60);
      timeByDate.set(dateKey, minutes > 0 ? minutes : Math.ceil(gainedXp / 3));
    });
  } else if (rawData.calendar && rawData.calendar.length > 0) {
    // 备用：使用 calendar 数据
    rawData.calendar.forEach(event => {
      const date = new Date(event.datetime);
      const dateKey = toLocalDateKey(date);

      const currentXp = xpByDate.get(dateKey) || 0;
      xpByDate.set(dateKey, currentXp + (event.improvement || 0));

      const currentTime = timeByDate.get(dateKey) || 0;
      const estimatedTime = Math.ceil((event.improvement || 10) / 3);
      timeByDate.set(dateKey, currentTime + estimatedTime);
    });
  } else if (rawData.language_data) {
    // 最后备用：从 language_data.calendar 获取
    Object.values(rawData.language_data).forEach((lang: any) => {
      if (lang.calendar && Array.isArray(lang.calendar)) {
        lang.calendar.forEach((event: any) => {
          const date = new Date(event.datetime);
          const dateKey = toLocalDateKey(date);

          const currentXp = xpByDate.get(dateKey) || 0;
          xpByDate.set(dateKey, currentXp + (event.improvement || 0));

          const currentTime = timeByDate.get(dateKey) || 0;
          const estimatedTime = Math.ceil((event.improvement || 10) / 3);
          timeByDate.set(dateKey, currentTime + estimatedTime);
        });
      }
    });
  }

  // 生成最近 7 天的数据（使用本地时区）
  const dailyXpHistory: { date: string; xp: number }[] = [];
  const dailyTimeHistory: { date: string; time: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = toLocalDateKey(d);
    const dayLabel = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    const xp = xpByDate.get(dateKey) || 0;
    const time = timeByDate.get(dateKey) || 0;

    dailyXpHistory.push({ date: dayLabel, xp });
    dailyTimeHistory.push({ date: dayLabel, time });
  }

  // 生成年度热力图数据（包含 XP 和实际学习时间）
  const yearlyXpHistory: { date: string; xp: number; time?: number }[] = [];
  xpByDate.forEach((xp, date) => {
    const time = timeByDate.get(date);
    yearlyXpHistory.push({ date, xp, time });
  });

  // 段位解析 - 尝试多个字段
  let tierIndex = -1;

  if (rawAny.tier !== undefined && rawAny.tier >= 0 && rawAny.tier <= 10) {
    tierIndex = rawAny.tier;
  } else if (rawAny.trackingProperties?.league_tier !== undefined) {
    tierIndex = rawAny.trackingProperties.league_tier;
  } else if (rawAny.trackingProperties?.leaderboard_league !== undefined) {
    tierIndex = rawAny.trackingProperties.leaderboard_league;
  } else if (rawAny.tracking_properties?.league_tier !== undefined) {
    tierIndex = rawAny.tracking_properties.league_tier;
  } else if (rawAny.tracking_properties?.leaderboard_league !== undefined) {
    tierIndex = rawAny.tracking_properties.leaderboard_league;
  } else if (rawData.language_data) {
    // 从 language_data 中获取
    const currentLang = Object.values(rawData.language_data).find((l: any) => l.current_learning) as any;
    if (currentLang?.tier !== undefined) {
      tierIndex = currentLang.tier;
    }
  }
  const leagueName = (tierIndex >= 0 && tierIndex < LEAGUE_TIERS.length)
    ? LEAGUE_TIERS[tierIndex] : "暂无数据";

  let creationDateStr = "未知";
  let accountAgeDays = 0;

  const calcDaysSince = (createdAt: Date) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfCreatedDay = new Date(createdAt);
    startOfCreatedDay.setHours(0, 0, 0, 0);

    const diffMs = startOfToday.getTime() - startOfCreatedDay.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  if (creationTs) {
    let ts = creationTs;
    if (ts < 10000000000) ts *= 1000;
    const cDate = new Date(ts);
    if (!isNaN(cDate.getTime())) {
      creationDateStr = cDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      accountAgeDays = calcDaysSince(cDate);
    }
  } else if (rawData.created) {
    const cDate = new Date(rawData.created);
    if (!isNaN(cDate.getTime())) {
      creationDateStr = cDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      accountAgeDays = calcDaysSince(cDate);
    }
  }

  // 检查 Plus/Super 会员状态 - 多种来源
  const hasInventoryPremium = rawAny.inventory?.premium_subscription || rawAny.inventory?.super_subscription;
  const hasItemPremium = rawAny.has_item_premium_subscription || rawAny.has_item_immersive_subscription;
  const isPlus = rawData.hasPlus || rawData.hasSuper || rawData.plusStatus === 'active' || rawAny.has_plus || rawAny.is_plus || !!hasInventoryPremium || !!hasItemPremium || false;


  // 基于显示的课程计算预估投入时间，确保数据和列表一致
  const visibleTotalXp = courses.reduce((acc, c) => acc + c.xp, 0);
  const totalMinutes = Math.floor(visibleTotalXp / 6);
  const estimatedHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const estimatedLearningTime = `${estimatedHours}小时 ${remainingMinutes}分钟`;

  // 今日 XP - 尝试多个来源
  let xpToday = 0;
  let lessonsToday = 0;
  let sessionTime = 0;
  const streakExtendedToday = rawAny.streak_extended_today ?? rawAny.streakExtendedToday ?? false;

  // 获取连胜保持时间
  let streakExtendedTime: string | undefined;
  if (streakExtendedToday) {
    // 尝试从 streakData 获取
    if (rawAny.streakData?.currentStreak?.lastExtendedDate) {
      const extendedDate = new Date(rawAny.streakData.currentStreak.lastExtendedDate);
      streakExtendedTime = extendedDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    // 尝试从今日最后一次学习事件获取
    else if (rawData.calendar && rawData.calendar.length > 0) {
      const todayStr = new Date().toDateString();
      const todayEvents = rawData.calendar
        .filter(e => new Date(e.datetime).toDateString() === todayStr)
        .sort((a, b) => a.datetime - b.datetime);
      if (todayEvents.length > 0) {
        const firstEvent = new Date(todayEvents[0].datetime);
        streakExtendedTime = firstEvent.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }
    }
    // 尝试从 xpGains 获取
    else if (rawAny.xpGains && Array.isArray(rawAny.xpGains)) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayGains = rawAny.xpGains
        .filter((g: any) => new Date(g.time * 1000) >= todayStart)
        .sort((a: any, b: any) => a.time - b.time);
      if (todayGains.length > 0) {
        const firstGain = new Date(todayGains[0].time * 1000);
        streakExtendedTime = firstGain.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      }
    }
  }

  if (rawAny.xp_today !== undefined) {
    xpToday = rawAny.xp_today;
  } else if (rawAny.streakData?.currentStreak?.endDate) {
    const streakEndDate = new Date(rawAny.streakData.currentStreak.endDate).toDateString();
    if (streakEndDate === new Date().toDateString()) {
      xpToday = rawAny.streakData.currentStreak.lastExtendedDate ? 1 : 0;
    }
  } else if (rawData.calendar && rawData.calendar.length > 0) {
    const todayStr = new Date().toDateString();
    const todayEvents = rawData.calendar.filter(e => new Date(e.datetime).toDateString() === todayStr);
    xpToday = todayEvents.reduce((acc, e) => acc + (e.improvement || 0), 0);
    lessonsToday = todayEvents.length;
  }

  // 从 xpGains 获取
  if (xpToday === 0 && rawAny.xpGains && Array.isArray(rawAny.xpGains)) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayGains = rawAny.xpGains.filter((g: any) => new Date(g.time * 1000) >= todayStart);
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

// 使用本地 API 代理获取数据
const fetchFromProxy = async (target: string, params: Record<string, string>, jwt: string): Promise<any> => {
  const url = new URL('/api/duo', window.location.origin);
  url.searchParams.set('target', target);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: HeadersInit = {};
  if (jwt) headers['x-duo-jwt'] = jwt;

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) return null;
  return await response.json();
};

// 获取完整 XP 历史记录
const fetchXpSummaries = async (userId: number, jwt: string): Promise<any[]> => {
  try {
    const data = await fetchFromProxy('xp_summaries', { userId: userId.toString() }, jwt);
    return data?.summaries || [];
  } catch (e) {
    return [];
  }
};

// 获取排行榜历史
const fetchLeaderboardHistory = async (userId: number, jwt: string): Promise<any> => {
  try {
    return await fetchFromProxy('leaderboard_history', { userId: userId.toString() }, jwt);
  } catch (e) {
    return null;
  }
};

export const fetchDuolingoData = async (username: string, jwt: string): Promise<UserData> => {
  const unpackUser = (data: any) => (data.users ? data.users[0] : data);
  let rawData: any = null;

  // 1. 尝试通过本地代理获取用户数据
  try {
    const data = await fetchFromProxy('users', { username }, jwt);
    if (data) rawData = unpackUser(data);
  } catch (e) {
    // Silent fail
  }

  if (!rawData) {
    throw new Error("连接失败。请确保本地服务运行正常，或使用「粘贴 JSON」模式。");
  }

  // 获取用户 ID 用于其他 API
  const userId = rawData.id || rawData.user_id || rawData.tracking_properties?.user_id;

  if (userId && jwt) {
    // 1. 获取 XP Summaries
    const xpSummaries = await fetchXpSummaries(userId, jwt);
    if (xpSummaries.length > 0) {
      rawData._xpSummaries = xpSummaries;
    }

    // 2. 获取排行榜历史
    const lbHistory = await fetchLeaderboardHistory(userId, jwt);
    if (lbHistory) {
      rawData._leaderboardHistory = lbHistory;
    }
  }

  return transformDuolingoData(rawData);
};
