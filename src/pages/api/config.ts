import type { APIRoute } from 'astro';
import { getEnv, jsonResponse } from '../../utils/api-helpers';
import { isSameOrigin } from '../../utils/auth-helpers';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  // 添加来源检查，防止跨域信息泄露
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }

  const username = getEnv('DUOLINGO_USERNAME');
  const jwt = getEnv('DUOLINGO_JWT');

  const configured =
    username !== '' &&
    jwt !== '' &&
    username !== 'your_duolingo_username' &&
    jwt !== 'your_jwt_token_here';

  return jsonResponse({ configured });
};
