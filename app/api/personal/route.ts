import { env } from 'cloudflare:workers';
import { handlePersonal, type Database } from '@/lib/personal-server';
import { deadlines } from '@/lib/deadlines';
export const dynamic = 'force-dynamic';
function handle(request: Request) {
  return handlePersonal(
    request,
    (env as unknown as { DB: Database }).DB,
    deadlines.map((d) => d.id),
  );
}
export const GET = handle;
export const POST = handle;
