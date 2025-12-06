import type { UserData, DuolingoRawUser, Course, Achievement, DuolingoLanguageDataDetail, Skill, Certificate, InventoryItem, FriendRanking, NextLesson } from "../types";

const API_BASE_V1 = "https://www.duolingo.com/users";
const API_BASE_V2 = "https://www.duolingo.com/2017-06-30/users";
const PROXY_URL = "https://corsproxy.io/?";

const LEAGUE_TIERS = [
  "青铜 (Bronze)",
  "白银 (Silver)",
  "黄金 (Gold)",
  "蓝宝石 (Sapphire)",
  "红宝石 (Ruby)",
  "祖母绿 (Emerald)",
  "紫水晶 (Amethyst)",
  "珍珠 (Pearl)",
  "黑曜石 (Obsidian)",
  "钻石 (Diamond)"
];

export const transformDuolingoData = (rawData: DuolingoRawUser): UserData => {
  const rawAny = rawData as any;
  
  const username = rawData.username || "Unknown";
  const fullname = rawData.name || rawData.fullname || username;
  const rawPicture = rawData.picture || rawData.avatar || "//ssl.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";
  const avatarUrl = rawPicture.startsWith('//') ? `https:${rawPicture}` : rawPicture;
  
  const streak = rawData.site_streak !== undefined ? rawData.site_streak : rawData.streak;
  // 宝石：检查多个位置（顶层、tracking_properties）
  const gems = rawAny.gems || rawAny.tracking_properties?.gems || rawAny.lingots || rawAny.rupees || 0;
  
  // 计算总 XP：优先使用 total_xp 字段
  let totalXp = rawData.total_xp !== undefined ? rawData.total_xp : (rawData.totalXp || 0);
  // 优先从 languages 数组累加（包含所有语言的经验）
  if (totalXp === 0 && rawAny.languages && Array.isArray(rawAny.languages)) {
    totalXp = rawAny.languages.reduce((sum: number, lang: any) => {
      return sum + (lang.points || 0);
    }, 0);
  }
  // 备用：从 language_data 累加
  if (totalXp === 0 && rawData.language_data) {
    totalXp = Object.values(rawData.language_data).reduce((sum: number, lang: any) => {
      return sum + (lang.points || lang.level_progress || 0);
    }, 0);
  }
  // 最后备用：从 courses 数组累加
  if (totalXp === 0 && rawData.courses && Array.isArray(rawData.courses)) {
    totalXp = rawData.courses.reduce((acc, c) => acc + (c.xp || 0), 0);
  }
  // 每日目标
  const dailyGoal = rawAny.dailyGoal ?? rawAny.daily_goal ?? rawAny.xpGoal ?? 0;
  const creationTs = rawData.creation_date || rawData.creationDate;
  
  let courses: Course[] = [];
  
  // 优先从 languages 数组获取所有课程（包含完整的语言列表）
  if (rawAny.languages && Array.isArray(rawAny.languages)) {
    courses = rawAny.languages
      .filter((l: any) => l.learning || l.points > 0) // 正在学习或有经验值的课程
      .map((l: any) => ({
        id: l.language,
        title: l.language_string,
        xp: l.points || 0,
        crowns: l.crowns || 0,
        fromLanguage: 'en',
        learningLanguage: l.language,
      }));
  }
  
  // 如果 languages 没有数据，尝试从 language_data 获取
  if (courses.length === 0 && rawData.language_data) {
    courses = Object.entries(rawData.language_data).map(([langCode, langDetail]: [string, any]) => {
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
  
  // 最后尝试从 courses 数组获取
  if (courses.length === 0 && rawData.courses && Array.isArray(rawData.courses)) {
    courses = rawData.courses.map(c => ({
      title: c.title,
      xp: c.xp,
      fromLanguage: c.fromLanguage,
      learningLanguage: c.learningLanguage,
      crowns: c.crowns || 0,
      id: c.id
    }));
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
        // 已经是字符串格式
        dateKey = summary.date.replace(/\//g, '-'); // 转换 YYYY/MM/DD 为 YYYY-MM-DD
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
  
  if (creationTs) {
    let ts = creationTs;
    if (ts < 10000000000) ts *= 1000;
    const cDate = new Date(ts);
    if (!isNaN(cDate.getTime())) {
      creationDateStr = cDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      const diffTime = Math.abs(new Date().getTime() - cDate.getTime());
      accountAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  } else if (rawData.created) {
    const cDate = new Date(rawData.created);
    if (!isNaN(cDate.getTime())) {
      creationDateStr = cDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      const diffTime = Math.abs(new Date().getTime() - cDate.getTime());
      accountAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  // 检查 Plus/Super 会员状态 - 多种来源
  const hasInventoryPremium = rawAny.inventory?.premium_subscription || rawAny.inventory?.super_subscription;
  const hasItemPremium = rawAny.has_item_premium_subscription || rawAny.has_item_immersive_subscription;
  const isPlus = rawData.hasPlus || rawData.hasSuper || rawData.plusStatus === 'active' || rawAny.has_plus || rawAny.is_plus || !!hasInventoryPremium || !!hasItemPremium || false;

  const achievements: Achievement[] = (rawData.achievements || [])
    .filter(a => a.stars > 0)
    .map(a => ({
      name: a.name,
      stars: a.stars,
      totalStars: a.totalStars,
      description: a.description,
      icon: a.imageUrl
    }));

  const totalMinutes = Math.floor(totalXp / 6);
  const estimatedHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const estimatedLearningTime = `${estimatedHours}小时 ${remainingMinutes}分钟`;

  // 新增字段解析
  // 流利度评分 (0-1) - 尝试多个可能的字段
  let fluencyScore = rawAny.fluency_score ?? rawAny.fluencyScore;
  if (fluencyScore === undefined && rawData.language_data) {
    const currentLang = Object.values(rawData.language_data).find((l: any) => l.current_learning) as any;
    if (currentLang) {
      fluencyScore = currentLang.fluency_score ?? currentLang.fluency;
    }
  }
  
  // 当前等级和进度 - 尝试多个来源
  let currentLevel = 0;
  let levelProgress = 0;
  let levelPercent = 0;
  let levelLeft = 0;
  let numSkillsLearned = 0;
  let nextLesson: NextLesson | undefined;
  
  if (rawData.language_data) {
    const currentLang = Object.values(rawData.language_data).find((l: any) => l.current_learning) as any;
    if (currentLang) {
      // 过滤无效等级值（如 9999）
      const rawLevel = currentLang.level || 0;
      currentLevel = (rawLevel > 0 && rawLevel < 100) ? rawLevel : 0;
      levelProgress = currentLang.level_progress || 0;
      levelPercent = currentLang.level_percent || 0;
      levelLeft = currentLang.level_left || 0;
      numSkillsLearned = currentLang.num_skills_learned || 0;
      
      // 下一课程
      if (currentLang.next_lesson) {
        nextLesson = {
          skillTitle: currentLang.next_lesson.skill_title || '',
          skillUrl: currentLang.next_lesson.skill_url || '',
          lessonNumber: currentLang.next_lesson.lesson_number || 1
        };
      }
    }
  }
  // 从 courses 中获取（只使用有效的 level 值）
  if (currentLevel === 0 && rawAny.courses && rawAny.courses.length > 0) {
    const activeCourse = rawAny.courses.find((c: any) => c.learningLanguage === rawAny.learningLanguage) || rawAny.courses[0];
    if (activeCourse && activeCourse.level > 0 && activeCourse.level < 100) {
      currentLevel = activeCourse.level;
    }
  }
  // 从 currentCourse 获取
  if (currentLevel === 0 && rawAny.currentCourse && rawAny.currentCourse.level > 0 && rawAny.currentCourse.level < 100) {
    currentLevel = rawAny.currentCourse.level;
  }
  
  // 语言强度 - 尝试多个字段
  let languageStrength = rawAny.language_strength ?? rawAny.languageStrength;
  if (languageStrength === undefined && rawData.language_data) {
    const currentLang = Object.values(rawData.language_data).find((l: any) => l.current_learning) as any;
    if (currentLang) {
      languageStrength = currentLang.strength ?? currentLang.language_strength;
    }
  }
  
  // 技能数据 - 尝试多个位置
  const skills: Skill[] = [];
  let skillsSource = rawAny.skills;
  
  // 尝试从 language_data 中获取技能
  if (!skillsSource && rawData.language_data) {
    const currentLang = Object.values(rawData.language_data).find((l: any) => l.current_learning) as any;
    if (currentLang && currentLang.skills) {
      skillsSource = currentLang.skills;
    }
  }
  
  if (skillsSource && Array.isArray(skillsSource)) {
    skillsSource.forEach((s: any) => {
      if (s.learned || s.accessible) {
        skills.push({
          name: s.title || s.name || s.shortName || 'Unknown',
          strength: s.strength ?? (s.finishedLevels ? s.finishedLevels / (s.levels || 5) : 0),
          learned: s.learned ?? s.accessible ?? false,
          mastered: s.mastered ?? ((s.strength >= 1) || (s.finishedLevels >= (s.levels || 5)))
        });
      }
    });
  }
  
  // 已学单词数 - 尝试多个来源
  let knownWords = rawAny.num_words_learned ?? rawAny.known_words ?? rawAny.learned_words ?? 0;
  if (!knownWords && rawData.language_data) {
    knownWords = Object.values(rawData.language_data).reduce((acc: number, l: any) => {
      return acc + (l.num_words || l.learned_words || l.known_words || 0);
    }, 0);
  }
  // 从 vocabulary 获取
  if (!knownWords && rawAny.vocabulary_overview) {
    knownWords = rawAny.vocabulary_overview.length;
  }
  
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
  
  // 学习时间（秒）
  if (rawAny.session_time !== undefined) {
    sessionTime = rawAny.session_time;
  } else if (rawAny.trackingProperties?.total_session_time) {
    sessionTime = rawAny.trackingProperties.total_session_time;
  }
  
  // 好友排行
  const friendsRanking: FriendRanking[] = [];
  const rankingSource = rawAny.points_ranking_data ?? rawAny.trackingProperties?.leaderboard_friends;
  if (rankingSource && Array.isArray(rankingSource)) {
    rankingSource.forEach((f: any, idx: number) => {
      friendsRanking.push({
        username: f.username || f.userId || '',
        displayName: f.display_name || f.displayName || f.fullname || f.username || '',
        xp: f.points_data?.total || f.total_xp || f.totalXp || f.xp || 0,
        rank: idx + 1
      });
    });
  }
  
  // 商店物品/道具
  const inventory: InventoryItem[] = [];
  const invSource = rawAny.inventory ?? rawAny.shopItems;
  if (invSource) {
    if (typeof invSource === 'object' && !Array.isArray(invSource)) {
      Object.entries(invSource).forEach(([name, qty]) => {
        if (typeof qty === 'number' && qty > 0) {
          inventory.push({ name, quantity: qty });
        }
      });
    } else if (Array.isArray(invSource)) {
      invSource.forEach((item: any) => {
        if (item.quantity > 0) {
          inventory.push({ name: item.name || item.id, quantity: item.quantity });
        }
      });
    }
  }
  
  // 证书
  const certificates: Certificate[] = [];
  if (rawAny.certificates && Array.isArray(rawAny.certificates)) {
    rawAny.certificates.forEach((c: any) => {
      certificates.push({
        language: c.language || c.language_string || 'Unknown',
        score: c.score || 0,
        date: c.datetime ? new Date(c.datetime).toLocaleDateString('zh-CN') : '未知'
      });
    });
  }

  // 前 3 名次数
  let podiumFinishes = 0;
  if (rawAny._leaderboardHistory?.leaderboard_history) {
    const history = rawAny._leaderboardHistory.leaderboard_history;
    if (Array.isArray(history)) {
      podiumFinishes = history.filter((h: any) => h.rank && h.rank <= 3).length;
    }
  }

  return {
    username, fullname, avatarUrl, streak, totalXp, gems,
    league: leagueName, leagueTier: tierIndex, courses, dailyXpHistory,
    dailyTimeHistory, yearlyXpHistory,
    learningLanguage, creationDate: creationDateStr, accountAgeDays,
    isPlus, dailyGoal, achievements, estimatedLearningTime,
    // 新增字段
    fluencyScore,
    currentLevel,
    levelProgress,
    levelPercent,
    levelLeft,
    languageStrength,
    skills: skills.length > 0 ? skills : undefined,
    numSkillsLearned: numSkillsLearned || (skills.length > 0 ? skills.filter(s => s.learned).length : undefined),
    knownWords: knownWords || undefined,
    xpToday,
    lessonsToday: lessonsToday || undefined,
    sessionTime: sessionTime || undefined,
    friendsRanking: friendsRanking.length > 0 ? friendsRanking : undefined,
    inventory: inventory.length > 0 ? inventory : undefined,
    certificates: certificates.length > 0 ? certificates : undefined,
    nextLesson,
    streakExtendedToday,
    streakExtendedTime,
    podiumFinishes
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
