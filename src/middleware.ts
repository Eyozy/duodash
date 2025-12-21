import type { MiddlewareHandler } from 'astro';
import { gzipSync } from 'node:zlib';

const MIN_BYTES_TO_COMPRESS = 1024;
const MAX_BYTES_TO_COMPRESS = 3 * 1024 * 1024;

function isCompressible(contentType: string | null) {
  if (!contentType) return false;
  const type = contentType.split(';', 1)[0].trim().toLowerCase();
  return (
    type.startsWith('text/') ||
    type === 'application/json' ||
    type === 'application/javascript' ||
    type === 'text/javascript' ||
    type === 'text/css' ||
    type === 'image/svg+xml' ||
    type === 'application/xml' ||
    type === 'application/xhtml+xml'
  );
}

function appendVary(headers: Headers, value: string) {
  const existing = headers.get('Vary');
  if (!existing) {
    headers.set('Vary', value);
    return;
  }
  const parts = existing.split(',').map(s => s.trim().toLowerCase());
  if (!parts.includes(value.toLowerCase())) {
    headers.set('Vary', `${existing}, ${value}`);
  }
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();

  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') return response;

  const acceptEncoding = context.request.headers.get('accept-encoding') || '';
  if (!acceptEncoding.toLowerCase().includes('gzip')) return response;
  if (response.headers.has('Content-Encoding')) return response;

  const contentType = response.headers.get('Content-Type');
  if (!isCompressible(contentType)) return response;

  const contentLengthHeader = response.headers.get('Content-Length');
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null;
  if (contentLength !== null && Number.isFinite(contentLength)) {
    if (contentLength < MIN_BYTES_TO_COMPRESS || contentLength > MAX_BYTES_TO_COMPRESS) return response;
  }

  if (context.request.method === 'HEAD') {
    return response;
  }

  const body = new Uint8Array(await response.arrayBuffer());
  if (body.byteLength < MIN_BYTES_TO_COMPRESS || body.byteLength > MAX_BYTES_TO_COMPRESS) return response;

  const gzipped = gzipSync(body, { level: 6 });
  // 不值得压缩：收益太小
  if (gzipped.byteLength >= body.byteLength * 0.95) return response;

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
