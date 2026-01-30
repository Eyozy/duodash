/**
 * 公共 API 工具函数
 * 用于消除 API 端点之间的代码重复
 */

/**
 * 获取环境变量，兼容 process.env 和 import.meta.env
 */
export function getEnv(key: string): string {
  return process.env[key] || (import.meta.env as Record<string, string>)[key] || '';
}

/**
 * 创建 JSON 响应
 */
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

// 重新导出 auth-helpers 的函数
export { createAuthChecker, timingSafeEqual } from './auth-helpers';
