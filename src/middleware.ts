import type { MiddlewareHandler } from 'astro';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(gzip);

const MIN_COMPRESS_SIZE = 1024;
const MAX_COMPRESS_SIZE = 3 * 1024 * 1024;

const COMPRESSIBLE_TYPES = new Set([
  'application/json',
  'application/javascript',
  'text/javascript',
  'text/css',
  'image/svg+xml',
  'application/xml',
  'application/xhtml+xml',
]);

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.duolingo.com https://*.openai.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isCompressible(contentType: string | null): boolean {
  if (!contentType) return false;
  const type = contentType.split(';', 1)[0].trim().toLowerCase();
  return type.startsWith('text/') || COMPRESSIBLE_TYPES.has(type);
}

function appendVary(headers: Headers, value: string): void {
  const existing = headers.get('Vary');
  if (!existing) {
    headers.set('Vary', value);
    return;
  }
  const parts = existing.split(',').map((s) => s.trim().toLowerCase());
  if (!parts.includes(value.toLowerCase())) {
    headers.set('Vary', `${existing}, ${value}`);
  }
}

function isInCompressRange(size: number): boolean {
  return size >= MIN_COMPRESS_SIZE && size <= MAX_COMPRESS_SIZE;
}

export const onRequest: MiddlewareHandler = async function (context, next) {
  const { request } = context;
  const response = withSecurityHeaders(await next());
  const method = request.method;

  if (method !== 'GET' && method !== 'HEAD') return response;

  const acceptEncoding = request.headers.get('accept-encoding') ?? '';
  if (!acceptEncoding.toLowerCase().includes('gzip')) return response;
  if (response.headers.has('Content-Encoding')) return response;
  if (!isCompressible(response.headers.get('Content-Type'))) return response;

  const contentLength = Number(response.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && !isInCompressRange(contentLength)) {
    return response;
  }

  if (method === 'HEAD') return response;

  const body = new Uint8Array(await response.arrayBuffer());
  if (!isInCompressRange(body.byteLength)) {
    return new Response(body, response);
  }

  const gzipped = await gzipAsync(body, { level: 6 });
  if (gzipped.byteLength >= body.byteLength * 0.95) {
    return new Response(body, response);
  }

  const headers = new Headers(response.headers);
  headers.set('Content-Encoding', 'gzip');
  headers.set('Content-Length', String(gzipped.byteLength));
  appendVary(headers, 'Accept-Encoding');

  return new Response(gzipped, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
