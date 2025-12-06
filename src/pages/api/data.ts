import type { APIRoute } from 'astro';

export const prerender = false;

const DUOLINGO_BASE_URL = 'https://www.duolingo.com';

const fetchDuolingoApi = async (apiUrl: string, jwt: string): Promise<any> => {
  const headers: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
  };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const response = await fetch(apiUrl, { headers });
  if (!response.ok) return null;
  return await response.json();
};

export const GET: APIRoute = async () => {
  const username = import.meta.env.DUOLINGO_USERNAME || '';
  const jwt = import.meta.env.DUOLINGO_JWT || '';

  if (!username || !jwt) {
    return new Response(JSON.stringify({ error: 'Not configured' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 获取用户数据 - 尝试 V1 API
    let userData = await fetchDuolingoApi(`${DUOLINGO_BASE_URL}/users/${username}`, jwt);
    
    // 如果 V1 失败，尝试 V2
    if (!userData) {
      const v2Data = await fetchDuolingoApi(
        `${DUOLINGO_BASE_URL}/2017-06-30/users?username=${username}`, 
        jwt
      );
      if (v2Data?.users?.[0]) {
        userData = v2Data.users[0];
      }
    }

    if (!userData) {
      return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取用户 ID
    const userId = userData.id || userData.user_id || userData.tracking_properties?.user_id;

    // 获取 XP Summaries
    let xpSummaries: any[] = [];
    if (userId) {
      const xpData = await fetchDuolingoApi(
        `${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/xp_summaries?startDate=1970-01-01`,
        jwt
      );
      if (xpData?.summaries) {
        xpSummaries = xpData.summaries;
      }
    }

    // 获取排行榜历史
    let leaderboardHistory = null;
    if (userId) {
      leaderboardHistory = await fetchDuolingoApi(
        `${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/leaderboard_history`,
        jwt
      );
    }

    // 合并数据
    if (xpSummaries.length > 0) {
      userData._xpSummaries = xpSummaries;
    }
    if (leaderboardHistory) {
      userData._leaderboardHistory = leaderboardHistory;
    }

    // 清理敏感信息
    const sanitizedData = sanitizeUserData(userData);

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
  
  // 删除敏感字段
  const sensitiveFields = [
    'email', 'phone', 'googleId', 'facebookId', 'appleId', 'twitterId',
    'username', 'name', 'fullname', 'bio', 'location', 'profileCountry',
    'timezone', 'betaStatus', 'inviteURL', 'privacySettings', 
    'notificationSettings', 'emailVerified', 'hasPhoneNumber',
    'tracking_properties', 'acquisitionSurveyReason', 'canUseModerationTools',
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
