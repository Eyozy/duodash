import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  // Vercel 运行时需要用 process.env
  const username = process.env.DUOLINGO_USERNAME || import.meta.env.DUOLINGO_USERNAME || '';
  const jwt = process.env.DUOLINGO_JWT || import.meta.env.DUOLINGO_JWT || '';
  
  const hasCredentials = !!(
    username && 
    jwt && 
    username !== 'your_duolingo_username' && 
    jwt !== 'your_jwt_token_here'
  );

  return new Response(JSON.stringify({ 
    configured: hasCredentials 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
