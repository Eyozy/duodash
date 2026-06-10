import crypto from 'node:crypto';

export function getEnv(key: string): string {
  return process.env[key] || (import.meta.env as Record<string, string>)[key] || '';
}

export function jsonResponse(
  data: unknown,
  status = 200,
  options?: { cacheControl?: string }
): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };
  if (options?.cacheControl) {
    headers['Cache-Control'] = options.cacheControl;
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = 128;
  const aPadded = a.padEnd(maxLen, '\0');
  const bPadded = b.padEnd(maxLen, '\0');
  try {
    const result = crypto.timingSafeEqual(Buffer.from(aPadded), Buffer.from(bPadded));
    return result && a.length === b.length;
  } catch {
    return false;
  }
}

export function createAuthChecker(getSecretToken: () => string) {
  return function checkToken(request: Request): boolean {
    const secretToken = getSecretToken();

    try {
      const url = new URL(request.url);
      const urlToken = url.searchParams.get('token');
      if (urlToken) {
        if (!secretToken) return false;
        return timingSafeEqual(urlToken, secretToken);
      }
    } catch {
      // 忽略 URL 解析错误
    }

    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      if (!secretToken) return false;
      const token = authHeader.substring(7);
      return timingSafeEqual(token, secretToken);
    }

    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const requestOrigin = origin || referer;

    if (requestOrigin) {
      try {
        const requestUrl = new URL(requestOrigin);
        const currentUrl = new URL(request.url);
        const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
        const isSameHost =
          requestUrl.hostname === currentUrl.hostname ||
          (isLocalhost && process.env.NODE_ENV === 'development');
        if (isSameHost) return true;
      } catch {
        // URL 解析失败，忽略
      }
    }

    if (!secretToken) {
      console.warn('API_SECRET_TOKEN is not configured. Access denied for safety.');
    }
    return false;
  };
}
