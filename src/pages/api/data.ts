import type { APIRoute } from 'astro';

export const prerender = false;

const DUOLINGO_BASE_URL = 'https://www.duolingo.com';

// 服务端缓存：5 分钟 TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

// Helper to fetch with timeout
const fetchWithTimeout = async (url: string, headers: HeadersInit, timeoutMs: number = 3000): Promise<any> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    clearTimeout(id);
    return null;
  }
};

export const GET: APIRoute = async () => {
  // Vercel 运行时需要用 process.env
  const username = process.env.DUOLINGO_USERNAME || import.meta.env.DUOLINGO_USERNAME || '';
  const jwt = process.env.DUOLINGO_JWT || import.meta.env.DUOLINGO_JWT || '';

  if (!username || !jwt) {
    return new Response(JSON.stringify({ error: 'Not configured' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 检查缓存
  const cacheKey = `user:${username}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return new Response(JSON.stringify({ data: cached.data, cached: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Authorization': `Bearer ${jwt}`
    };

    // 1. 并行获取 V1 和 V2 用户数据 (4秒超时，确保 5秒内响应)
    const v1Url = `${DUOLINGO_BASE_URL}/users/${username}`;
    const v2Url = `${DUOLINGO_BASE_URL}/2017-06-30/users?username=${username}`;


    const [v1Data, v2Raw] = await Promise.all([
      fetchWithTimeout(v1Url, headers, 4000).then(res => res),
      fetchWithTimeout(v2Url, headers, 8000).then(res => res)
    ]);

    let v2Data = v2Raw?.users?.[0] || v2Raw; // V2 returns { users: [...] } usually

    if (!v1Data && !v2Data) {
      return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), { status: 500 });
    }

    // Merge User Data (Prioritize V2, append V1 unique languages)
    let userData = v2Data || v1Data;
    if (v1Data && v1Data.languages) {
      userData.languages = v1Data.languages;
    }
    if (v1Data && v1Data.language_data) {
      userData.language_data = v1Data.language_data;
    }
    if (v2Data && v2Data.courses) {
      userData.courses = v2Data.courses;
    }

    // 获取用户 ID
    const userId = userData.id || userData.user_id || userData.tracking_properties?.user_id;

    // 2. 并行获取 XP Summaries 和 Leaderboard History (8秒超时)
    if (userId) {
      const [xpData, leaderboardHistory] = await Promise.all([
        fetchWithTimeout(`${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/xp_summaries?startDate=1970-01-01`, headers, 8000),
        fetchWithTimeout(`${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/leaderboard_history`, headers, 8000)
      ]);

      if (xpData?.summaries) {
        userData._xpSummaries = xpData.summaries;
      }
      if (leaderboardHistory) {
        userData._leaderboardHistory = leaderboardHistory;
      }
    }

    // 清理敏感信息
    const sanitizedData = sanitizeUserData(userData);

    // 写入缓存
    cache.set(cacheKey, { data: sanitizedData, timestamp: Date.now() });

    return new Response(JSON.stringify({ data: sanitizedData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// 清理敏感信息，只保留需要展示的数据
function sanitizeUserData(raw: any): any {
  const sanitized = { ...raw };

  // 保留关键的 trackingProperties 数据到顶层（注意是驼峰命名）
  if (raw.trackingProperties) {
    // 段位数据在 leaderboard_league 字段中
    if (raw.trackingProperties.leaderboard_league !== undefined) {
      sanitized.tier = raw.trackingProperties.leaderboard_league;
    }
    if (raw.trackingProperties.total_session_time !== undefined) {
      sanitized.total_session_time = raw.trackingProperties.total_session_time;
    }
    if (raw.trackingProperties.gems !== undefined && !sanitized.gems) {
      sanitized.gems = raw.trackingProperties.gems;
    }
    // 新增字段提取
    if (raw.trackingProperties.num_sessions_completed !== undefined) {
      sanitized.numSessionsCompleted = raw.trackingProperties.num_sessions_completed;
    }
    if (raw.trackingProperties.num_item_streak_freeze !== undefined) {
      sanitized.streakFreezeCount = raw.trackingProperties.num_item_streak_freeze;
    }
  }

  // 提取 weeklyXp 和 monthlyXp（这些在顶层）
  if (raw.weeklyXp !== undefined) {
    sanitized.weeklyXp = raw.weeklyXp;
  }
  if (raw.monthlyXp !== undefined) {
    sanitized.monthlyXp = raw.monthlyXp;
  }

  // 删除敏感字段
  const sensitiveFields = [
    'email', 'phone', 'googleId', 'facebookId', 'appleId', 'twitterId',
    'username', 'name', 'fullname', 'bio', 'location', 'profileCountry',
    'timezone', 'betaStatus', 'inviteURL', 'privacySettings',
    'notificationSettings', 'emailVerified', 'hasPhoneNumber',
    'trackingProperties', 'acquisitionSurveyReason', 'canUseModerationTools',
    'hasObserver', 'observedBy', 'blockerUserIds', 'blockedUserIds',
    'id', 'user_id', 'learnerContext', 'picture', 'avatar',
  ];

  sensitiveFields.forEach(field => {
    delete sanitized[field];
  });

  // 清理好友排行数据
  if (sanitized.points_ranking_data) {
    sanitized.points_ranking_data = sanitized.points_ranking_data.map((friend: any, idx: number) => ({
      display_name: idx === 0 ? '你' : `用户 ${idx + 1}`,
      points_data: friend.points_data,
      rank: idx + 1
    }));
  }

  return sanitized;
}
