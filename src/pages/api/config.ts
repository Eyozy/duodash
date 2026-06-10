import type { APIRoute } from 'astro';
import { getEnv, jsonResponse } from '../../utils/api-utils';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin') || request.headers.get('referer');
  if (origin) {
    try {
      const reqHost = new URL(origin).hostname;
      const selfHost = new URL(request.url).hostname;
      if (reqHost !== selfHost && reqHost !== 'localhost' && reqHost !== '127.0.0.1') {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }
    } catch {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }
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
