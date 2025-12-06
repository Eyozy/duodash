
import type { APIRoute } from 'astro';

export const prerender = false;

const DUOLINGO_BASE_URL = 'https://www.duolingo.com';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const target = url.searchParams.get('target'); // 'users', 'xp_summaries', 'leaderboard_history'
  const username = url.searchParams.get('username');
  const userId = url.searchParams.get('userId');
  const jwt = request.headers.get('x-duo-jwt') || '';

  if (!target) {
    return new Response(JSON.stringify({ error: 'Missing target parameter' }), { status: 400 });
  }

  let apiUrl = '';
  if (target === 'users' && username) {
    // Try V1 first as it has more data
    apiUrl = `${DUOLINGO_BASE_URL}/users/${username}`;
  } else if (target === 'xp_summaries' && userId) {
    apiUrl = `${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/xp_summaries?startDate=1970-01-01`;
  } else if (target === 'leaderboard_history' && userId) {
    apiUrl = `${DUOLINGO_BASE_URL}/2017-06-30/users/${userId}/leaderboard_history`;
  } else {
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
  }

  try {
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://www.duolingo.com/',
      'Origin': 'https://www.duolingo.com',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    };
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }

    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      // If V1 fails for users, try V2
      if (target === 'users' && username) {
         const v2Url = `${DUOLINGO_BASE_URL}/2017-06-30/users?username=${username}`;
         const v2Response = await fetch(v2Url, { headers });
         if (v2Response.ok) {
            const data = await v2Response.json();
            return new Response(JSON.stringify(data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
         }
      }
      // leaderboard_history 可能不存在，返回空对象避免前端报错
      if (target === 'leaderboard_history') {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: `Upstream error: ${response.status}` }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
