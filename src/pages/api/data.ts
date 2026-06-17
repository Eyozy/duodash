import type { APIRoute } from 'astro';
import type { CacheEntry, UserData } from '../../types';
import { transformDuolingoData } from '../../services/duolingoService';
import { getEnv, jsonResponse, createAuthChecker, sanitizeErrorMessage } from '../../utils/api-utils';
import { CACHE_TTL_MS } from '../../constants/config';
import { isFreshSameDayCache, resolveTimeZone } from '../../utils/dateUtils';

export const prerender = false;

const DUOLINGO_BASE_URL = 'https://www.duolingo.com';
const MAX_CACHE_SIZE = 100;
const DEFAULT_TIMEOUT = 8000;

const cache = new Map<string, CacheEntry<UserData>>();

const checkToken = createAuthChecker(() => getEnv('API_SECRET_TOKEN'));

async function fetchWithTimeout(url: string, headers: HeadersInit, timeoutMs = DEFAULT_TIMEOUT): Promise<{ data: unknown; status: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) {
      return { data: null, status: res.status };
    }
    return { data: await res.json(), status: res.status };
  } catch {
    return { data: null, status: 0 };
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET: APIRoute = async ({ request }) => {
  if (!checkToken(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const requestedTimeZone = resolveTimeZone(request.headers.get('x-user-timezone') || undefined);
  const username = getEnv('DUOLINGO_USERNAME');
  const jwt = getEnv('DUOLINGO_JWT');

  if (!username || !jwt) {
    return jsonResponse({ error: 'Not configured' }, 400);
  }

  const cacheKey = `user:${username}:tz:${requestedTimeZone}`;
  const cached = cache.get(cacheKey);

  // 检查缓存是否失效（过期或跨天）
  if (cached) {
    if (isFreshSameDayCache(cached.timestamp, CACHE_TTL_MS, Date.now(), requestedTimeZone)) {
      return jsonResponse({ data: cached.data, cached: true }, 200, { cacheControl: 'private, max-age=60' });
    }
  }

  try {
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Authorization': `Bearer ${jwt}`,
      'Cookie': `jwt_token=${jwt}`
    };

    // 1) 用旧接口查 userId（仅取 id 字段）
    const lookupResult = await fetchWithTimeout(
      `${DUOLINGO_BASE_URL}/2017-06-30/users?username=${encodeURIComponent(username)}`,
      headers,
      10000
    );

    if (lookupResult.status === 401 || lookupResult.status === 403) {
      return jsonResponse({
        error: 'JWT Token 已过期或无效，请重新获取 Duolingo JWT Token',
        code: 'JWT_EXPIRED'
      }, 401);
    }

    const lookupRaw = lookupResult.data as { users?: any[] } | any;
    const lookupUser = lookupRaw?.users?.[0] || lookupRaw;
    const userId = lookupUser?.id || lookupUser?.user_id;

    if (!userId) {
      return jsonResponse({ error: 'Failed to resolve user ID' }, 500);
    }

    // 2) 用新接口获取完整用户数据（含数学/音乐等非语言课程）
    const mainResult = await fetchWithTimeout(
      `${DUOLINGO_BASE_URL}/2023-05-23/users/${userId}`,
      headers,
      10000
    );

    if (mainResult.status === 401 || mainResult.status === 403) {
      return jsonResponse({
        error: 'JWT Token 已过期或无效，请重新获取 Duolingo JWT Token',
        code: 'JWT_EXPIRED'
      }, 401);
    }

    let userData = mainResult.data as any;

    if (!userData) {
      return jsonResponse({ error: 'Failed to fetch user data' }, 500);
    }

    // 3) 获取 xp_summaries（获取完整历史数据）
    const xpResult = await fetchWithTimeout(
      `${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/xp_summaries?startDate=1970-01-01`,
      headers,
      12000
    );
    const xpData = xpResult.data as { summaries?: unknown[] } | null;
    if (xpData?.summaries) {
      userData._xpSummaries = xpData.summaries;
    }

    const transformed = transformDuolingoData(userData, requestedTimeZone);

    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });

    return jsonResponse({ data: transformed }, 200, { cacheControl: 'private, max-age=60' });
  } catch (error: unknown) {
    return jsonResponse({ error: sanitizeErrorMessage(error) }, 500);
  }
};
