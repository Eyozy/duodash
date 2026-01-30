import crypto from 'node:crypto';

/**
 * 恒定时间比较，防止时序攻击
 * 使用固定长度填充确保长度差异不泄露信息
 */
export function timingSafeEqual(a: string, b: string): boolean {
  // 固定填充长度，防止长度泄露
  const maxLen = 128;
  const aPadded = a.padEnd(maxLen, '\0');
  const bPadded = b.padEnd(maxLen, '\0');

  try {
    const result = crypto.timingSafeEqual(
      Buffer.from(aPadded),
      Buffer.from(bPadded)
    );
    // 额外检查原始长度是否相等
    return result && a.length === b.length;
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
    // 无 origin/referer 时，仅在开发环境允许通过
    return process.env.NODE_ENV === 'development';
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

    // 0. 检查 URL query parameter (方便浏览器直接调试)
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

    // 1. 检查 Authorization header (Bearer token)
    // 只要提供了 Token，就必须验证其正确性
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      if (!secretToken) return false; // 服务端未配置 Token 但请求提供了，视为无效
      const token = authHeader.substring(7);
      return timingSafeEqual(token, secretToken);
    }

    // 2. 检查是否为同源请求 (允许前端应用直接调用)
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const requestOrigin = origin || referer;

    if (requestOrigin) {
      try {
        const requestUrl = new URL(requestOrigin);
        const currentUrl = new URL(request.url);
        
        // 允许相同 hostname，本地环回地址仅在开发环境信任
        const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
        const isSameHost =
          requestUrl.hostname === currentUrl.hostname ||
          (isLocalhost && process.env.NODE_ENV === 'development');

        if (isSameHost) {
          return true;
        }
      } catch {
        // URL 解析失败，忽略并继续
      }
    }

    // 3. 兜底：如果既没有有效 Token 也不符合同源策略
    if (!secretToken) {
      console.warn('API_SECRET_TOKEN is not configured. Access denied for safety.');
    }
    
    return false;
  };
}
