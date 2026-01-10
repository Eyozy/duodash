import crypto from 'node:crypto';

/**
 * 恒定时间比较，防止时序攻击
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    );
  } catch {
    return false;
  }
}

/**
 * 检查请求是否来自同源
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const requestOrigin = origin || referer;

  if (!requestOrigin) {
    // 无 origin/referer 时，可能是服务端渲染或直接请求，允许通过
    return true;
  }

  try {
    const requestUrl = new URL(requestOrigin);
    const currentUrl = new URL(request.url);
    return (
      requestUrl.hostname === currentUrl.hostname ||
      requestUrl.hostname === 'localhost' ||
      requestUrl.hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

/**
 * 创建认证检查器
 */
export function createAuthChecker(getSecretToken: () => string) {
  return function checkToken(request: Request): boolean {
    const secretToken = getSecretToken();

    // 如果未配置令牌，允许来自同源的前端请求
    if (!secretToken) {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');

      // 简单的同源检查：允许同源请求
      const requestOrigin = origin || referer;
      if (requestOrigin) {
        try {
          const requestUrl = new URL(requestOrigin);
          const currentUrl = new URL(request.url);
          // 允许相同 origin 或 localhost
          return (
            requestUrl.hostname === currentUrl.hostname ||
            requestUrl.hostname === 'localhost' ||
            requestUrl.hostname === '127.0.0.1'
          );
        } catch {
          return false;
        }
      }

      // 无 origin 时拒绝（非浏览器请求）
      console.warn('API_SECRET_TOKEN is not configured. Access denied for safety.');
      return false;
    }

    // 仅检查 Authorization header (Bearer token)，不再支持 URL 参数传递 token
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return timingSafeEqual(token, secretToken);
    }

    return false;
  };
}
