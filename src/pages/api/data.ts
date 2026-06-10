import type { APIRoute } from 'astro';
import type { CacheEntry, UserData } from '../../types';
import { transformDuolingoData } from '../../services/duolingoService';
import { getEnv, jsonResponse, createAuthChecker } from '../../utils/api-utils';
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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Authorization': `Bearer ${jwt}`
    };

    // 1) 先请求 V2 用户数据，拿到 userId 后再请求 xp_summaries
    const v2Url = `${DUOLINGO_BASE_URL}/2017-06-30/users?username=${encodeURIComponent(username)}`;
    const v2Result = await fetchWithTimeout(v2Url, headers, 10000);

    // 检查是否为 JWT 过期错误
    if (v2Result.status === 401 || v2Result.status === 403) {
      return jsonResponse({
        error: 'JWT Token 已过期或无效，请重新获取 Duolingo JWT Token',
        code: 'JWT_EXPIRED'
      }, 401);
    }

    const v2Raw = v2Result.data as { users?: any[] } | any;
    const v2Data = v2Raw?.users?.[0] || v2Raw;

    let userData = v2Data;
    if (!userData) {
      const v1Url = `${DUOLINGO_BASE_URL}/users/${encodeURIComponent(username)}`;
      const v1Result = await fetchWithTimeout(v1Url, headers, 10000);

      if (v1Result.status === 401 || v1Result.status === 403) {
        return jsonResponse({
          error: 'JWT Token 已过期或无效，请重新获取 Duolingo JWT Token',
          code: 'JWT_EXPIRED'
        }, 401);
      }

      userData = v1Result.data;
    }

    if (!userData) {
      return jsonResponse({ error: 'Failed to fetch user data' }, 500);
    }

    // 2) 获取 xp_summaries（获取完整历史数据）
    const userId = userData.id || userData.user_id || userData.tracking_properties?.user_id;
    if (userId) {
      const xpResult = await fetchWithTimeout(
        `${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/xp_summaries?startDate=1970-01-01`,
        headers,
        12000
      );
      const xpData = xpResult.data as { summaries?: unknown[] } | null;

      if (xpData?.summaries) {
        userData._xpSummaries = xpData.summaries;
      }
    }

    if (!userData || typeof userData !== 'object') {
      return jsonResponse({ error: 'Received invalid user data from Duolingo' }, 502);
    }

    const transformed = transformDuolingoData(userData, requestedTimeZone);

    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });

    return jsonResponse({ data: transformed }, 200, { cacheControl: 'private, max-age=60' });
  } catch (error: unknown) {
    // 错误消息脱敏：移除可能包含的敏感信息
    let message = error instanceof Error ? error.message : 'Unknown error';
    message = message.replace(/[a-zA-Z0-9_-]{20,}/g, '[REDACTED]');
    message = message.replace(/https?:\/\/[^\s]+/g, '[API_ENDPOINT]');
    if (message.length > 100) {
      message = message.substring(0, 100) + '...';
    }
    return jsonResponse({ error: message }, 500);
  }
};
