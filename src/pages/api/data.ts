import type { APIRoute } from 'astro';
import type { CacheEntry, UserData } from '../../types';
import { transformDuolingoData } from '../../services/duolingoService';

export const prerender = false;

const DUOLINGO_BASE_URL = 'https://www.duolingo.com';

// 服务端缓存：30 分钟 TTL
const cache = new Map<string, CacheEntry<UserData>>();
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟
const MAX_CACHE_SIZE = 100;

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
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 检查缓存
  const cacheKey = `user:${username}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return new Response(JSON.stringify({ data: cached.data, cached: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, max-age=60',
      }
    });
  }

  try {
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Authorization': `Bearer ${jwt}`
    };

    // 1) 优先请求 V2（字段更全且稳定），失败再降级到 V1
    const v2Url = `${DUOLINGO_BASE_URL}/2017-06-30/users?username=${username}`;
    const v2Raw = await fetchWithTimeout(v2Url, headers, 4500);
    const v2Data = v2Raw?.users?.[0] || v2Raw; // V2 returns { users: [...] } usually

    let userData = v2Data;
    if (!userData) {
      const v1Url = `${DUOLINGO_BASE_URL}/users/${username}`;
      const v1Data = await fetchWithTimeout(v1Url, headers, 4500);
      userData = v1Data;
    }

    if (!userData) {
      return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // 2. 获取用户 ID 并并行请求 XP Summaries (核心数据，必须有)
    const userId = userData.id || userData.user_id || userData.tracking_properties?.user_id;

    if (userId) {
      // 获取 xp_summaries 数据
      const [xpData] = await Promise.all([
        fetchWithTimeout(`${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/xp_summaries?startDate=1970-01-01`, headers, 5000)
      ]);

      if (xpData?.summaries) {
        userData._xpSummaries = xpData.summaries;
      }
    }

    // 在服务端完成 transform
    const transformed = transformDuolingoData(userData);

    // 写入缓存（限制大小）
    if (cache.size >= MAX_CACHE_SIZE) {
      // 删除最旧的条目
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });

    return new Response(JSON.stringify({ data: transformed }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, max-age=60',
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
};
