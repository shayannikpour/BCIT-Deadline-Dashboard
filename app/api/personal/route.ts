export const dynamic = 'force-dynamic';

const personalApi =
  'https://bcit-deadline-dashboard-shayan.shayannk.chatgpt.site/api/personal';

async function handle(request: Request) {
  const headers = new Headers();
  headers.set('Accept', 'application/json');
  headers.set('Origin', new URL(personalApi).origin);

  const cookie = request.headers.get('cookie');
  const contentType = request.headers.get('content-type');
  if (cookie) headers.set('Cookie', cookie);
  if (contentType) headers.set('Content-Type', contentType);

  const upstream = await fetch(personalApi, {
    method: request.method,
    headers,
    body: request.method === 'POST' ? await request.text() : undefined,
    cache: 'no-store',
  });

  const responseHeaders = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type':
      upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
    Vary: 'Cookie',
  });
  const cookieHeaders = (
    upstream.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.() ?? [upstream.headers.get('set-cookie') ?? ''];
  const sessionCookie = cookieHeaders.find((value) =>
    value.startsWith('bcit_session='),
  );
  if (sessionCookie) responseHeaders.set('Set-Cookie', sessionCookie);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
export const GET = handle;
export const POST = handle;
