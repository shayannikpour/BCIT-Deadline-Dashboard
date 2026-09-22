import {
  pbkdf2Sync,
  randomBytes,
  createHash,
  timingSafeEqual,
} from 'node:crypto';

type Statement = {
  bind(...args: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
};
export type Database = {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown>;
};
const cookieName = 'bcit_session';
const sessionLifetime = 60 * 60 * 24 * 30;
const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const passwordHash = (password: string, salt: string) =>
  pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
const json = (value: unknown, status = 200, cookie?: string) =>
  Response.json(value, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      Vary: 'Cookie',
      ...(cookie ? { 'Set-Cookie': cookie } : {}),
    },
  });
function sessionCookie(token: string, request: Request, age = sessionLifetime) {
  return `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
function sessionToken(request: Request) {
  return (
    request.headers
      .get('cookie')
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1) ?? ''
  );
}
async function userFor(db: Database, request: Request) {
  const token = sessionToken(request);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return db
    .prepare(
      'SELECT users.id, users.username FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ? AND expires > ?',
    )
    .bind(digest(token), Date.now())
    .first<{ id: string; username: string }>();
}
async function state(db: Database, user: { id: string; username: string }) {
  const [checks, todos] = await Promise.all([
    db
      .prepare('SELECT deadline_id FROM completed WHERE user_id = ?')
      .bind(user.id)
      .all<{ deadline_id: string }>(),
    db
      .prepare(
        'SELECT id, title, done FROM todos WHERE user_id = ? ORDER BY created DESC, id',
      )
      .bind(user.id)
      .all<{ id: string; title: string; done: number }>(),
  ]);
  return {
    user: { username: user.username },
    completed: checks.results.map((r) => r.deadline_id),
    todos: todos.results.map((t) => ({ ...t, done: !!t.done })),
  };
}
export async function handlePersonal(
  request: Request,
  db: Database,
  deadlineIds: readonly string[],
) {
  try {
    if (request.method === 'GET') {
      const user = await userFor(db, request);
      return json(
        user ? await state(db, user) : { user: null, completed: [], todos: [] },
      );
    }
    if (request.method !== 'POST')
      return json({ error: 'Method not allowed.' }, 405);
    if (
      request.headers.get('origin') !== new URL(request.url).origin ||
      !request.headers.get('content-type')?.startsWith('application/json')
    )
      return json({ error: 'Request not allowed.' }, 403);
    const raw = await request.text();
    if (raw.length > 4096) return json({ error: 'Request is too large.' }, 413);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'Invalid request.' }, 400);
    }
    if (!body || typeof body !== 'object')
      return json({ error: 'Invalid request.' }, 400);
    const action = body.action;
    if (action === 'signup' || action === 'login') {
      const username =
        typeof body.username === 'string'
          ? body.username.trim().toLowerCase()
          : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!/^[a-z0-9_]{3,24}$/.test(username) || password.length === 0)
        return json(
          {
            error:
              'Use a username of 3–24 letters, numbers or underscores and enter a password.',
          },
          400,
        );
      const now = Date.now();
      const ip = request.headers.get('cf-connecting-ip') ?? 'local';
      // Limit both per-address attempts and attempts against one account, across Workers.
      const keys = [digest(`ip:${ip}:${action}`), digest(`user:${username}`)];
      await db.batch(
        keys.map((key) =>
          db
            .prepare(
              'INSERT INTO auth_attempts (key, count, expires) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN expires <= ? THEN 1 ELSE count + 1 END, expires = CASE WHEN expires <= ? THEN excluded.expires ELSE expires END',
            )
            .bind(key, now + 900000, now, now),
        ),
      );
      for (const key of keys) {
        const row = await db
          .prepare('SELECT count FROM auth_attempts WHERE key = ?')
          .bind(key)
          .first<{ count: number }>();
        if (row && row.count > (key === keys[0] ? 30 : 10))
          return json(
            { error: 'Too many attempts. Please try again in 15 minutes.' },
            429,
          );
      }
      let user = await db
        .prepare(
          'SELECT id, username, password_hash, salt FROM users WHERE username = ?',
        )
        .bind(username)
        .first<{
          id: string;
          username: string;
          password_hash: string;
          salt: string;
        }>();
      if (action === 'signup') {
        if (user)
          return json({ error: 'That username is already taken.' }, 409);
        const salt = randomBytes(16).toString('hex');
        user = {
          id: crypto.randomUUID(),
          username,
          salt,
          password_hash: passwordHash(password, salt),
        };
        try {
          await db
            .prepare(
              'INSERT INTO users (id, username, password_hash, salt) VALUES (?, ?, ?, ?)',
            )
            .bind(user.id, username, user.password_hash, salt)
            .run();
        } catch (error) {
          if (String(error).includes('UNIQUE'))
            return json({ error: 'That username is already taken.' }, 409);
          throw error;
        }
      } else {
        const actual = passwordHash(
          password,
          user?.salt ?? '00000000000000000000000000000000',
        );
        if (
          !user ||
          !timingSafeEqual(
            Buffer.from(actual, 'hex'),
            Buffer.from(user.password_hash, 'hex'),
          )
        )
          return json({ error: 'Incorrect username or password.' }, 401);
      }
      const token = randomBytes(32).toString('hex');
      await db.batch([
        db
          .prepare('DELETE FROM sessions WHERE expires <= ? OR token_hash = ?')
          .bind(now, digest(sessionToken(request))),
        db.prepare('DELETE FROM auth_attempts WHERE expires <= ?').bind(now),
        db
          .prepare(
            'INSERT INTO sessions (token_hash, user_id, expires) VALUES (?, ?, ?)',
          )
          .bind(digest(token), user.id, now + sessionLifetime * 1000),
      ]);
      return json(await state(db, user), 200, sessionCookie(token, request));
    }
    if (action === 'logout') {
      await db
        .prepare('DELETE FROM sessions WHERE token_hash = ?')
        .bind(digest(sessionToken(request)))
        .run();
      return json(
        { user: null, completed: [], todos: [] },
        200,
        sessionCookie('', request, 0),
      );
    }
    const user = await userFor(db, request);
    if (!user)
      return json({ error: 'Please sign in to save your changes.' }, 401);
    if (action === 'complete') {
      if (!deadlineIds.includes(body.id) || typeof body.done !== 'boolean')
        return json({ error: 'Invalid deadline.' }, 400);
      await (
        body.done
          ? db.prepare(
              'INSERT OR IGNORE INTO completed (user_id, deadline_id) VALUES (?, ?)',
            )
          : db.prepare(
              'DELETE FROM completed WHERE user_id = ? AND deadline_id = ?',
            )
      )
        .bind(user.id, body.id)
        .run();
    } else if (action === 'addTodo') {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (!title || title.length > 200)
        return json({ error: 'Enter a to-do of 1–200 characters.' }, 400);
      const count = await db
        .prepare('SELECT COUNT(*) AS n FROM todos WHERE user_id = ?')
        .bind(user.id)
        .first<{ n: number }>();
      if (count && count.n >= 200)
        return json(
          {
            error:
              'You can keep up to 200 personal to-dos. Delete a few before adding more.',
          },
          400,
        );
      await db
        .prepare(
          'INSERT INTO todos (user_id, id, title, created) VALUES (?, ?, ?, ?)',
        )
        .bind(user.id, crypto.randomUUID(), title, Date.now())
        .run();
    } else if (action === 'toggleTodo' || action === 'deleteTodo') {
      if (
        typeof body.id !== 'string' ||
        (action === 'toggleTodo' && typeof body.done !== 'boolean')
      )
        return json({ error: 'Invalid to-do.' }, 400);
      await (
        action === 'deleteTodo'
          ? db
              .prepare('DELETE FROM todos WHERE user_id = ? AND id = ?')
              .bind(user.id, body.id)
          : db
              .prepare('UPDATE todos SET done = ? WHERE user_id = ? AND id = ?')
              .bind(body.done ? 1 : 0, user.id, body.id)
      ).run();
    } else return json({ error: 'Unknown action.' }, 400);
    return json(await state(db, user));
  } catch (error) {
    console.error(
      'Personal dashboard storage failed',
      error instanceof Error ? error.message : 'unknown',
    );
    return json(
      {
        error:
          'Your personal dashboard is temporarily unavailable. Please try again.',
      },
      503,
    );
  }
}
