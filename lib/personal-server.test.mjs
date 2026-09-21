import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handlePersonal } from './personal-server.ts';
function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(
    readFileSync(
      new URL('../drizzle/0000_far_unicorn.sql', import.meta.url),
      'utf8',
    ),
  );
  const db = {
    prepare(sql) {
      let args = [];
      return {
        bind(...values) {
          args = values;
          return this;
        },
        async first() {
          return sqlite.prepare(sql).get(...args) ?? null;
        },
        async all() {
          return { results: sqlite.prepare(sql).all(...args) };
        },
        async run() {
          return sqlite.prepare(sql).run(...args);
        },
      };
    },
    async batch(statements) {
      return Promise.all(statements.map((s) => s.run()));
    },
  };
  const call = (body, cookie = '', origin = 'https://dashboard.test') =>
    handlePersonal(
      new Request(
        'https://dashboard.test/api/personal',
        body
          ? {
              method: 'POST',
              headers: { origin, cookie, 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            }
          : { headers: { cookie } },
      ),
      db,
      ['deadline-a', 'deadline-b'],
    );
  const signup = async (username) => {
    const response = await call({
      action: 'signup',
      username,
      password: 'a-long-test-password',
    });
    assert.equal(response.status, 200);
    return response.headers.get('set-cookie').split(';')[0];
  };
  return { sqlite, call, signup };
}
test('public visitors can read anonymous state but cannot write; foreign origins are rejected', async () => {
  const { call } = fixture();
  assert.deepEqual(await (await call()).json(), {
    user: null,
    completed: [],
    todos: [],
  });
  assert.equal(
    (await call({ action: 'addTodo', title: 'No access' })).status,
    401,
  );
  assert.equal(
    (
      await call(
        {
          action: 'signup',
          username: 'user',
          password: 'a-long-test-password',
        },
        '',
        'https://evil.test',
      )
    ).status,
    403,
  );
});
test('passwords are hashed, sessions persist, login validates passwords and logout revokes sessions', async () => {
  const { call, signup, sqlite } = fixture();
  const cookie = await signup('ALICE');
  const stored = sqlite.prepare('SELECT * FROM users').get();
  assert.notEqual(stored.password_hash, 'a-long-test-password');
  assert.equal(stored.username, 'alice');
  assert.equal(
    (await (await call(undefined, cookie)).json()).user.username,
    'alice',
  );
  assert.equal(
    (
      await call({
        action: 'signup',
        username: 'alice',
        password: 'a-long-test-password',
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await call({
        action: 'login',
        username: 'alice',
        password: 'wrong-password',
      })
    ).status,
    401,
  );
  const login = await call({
    action: 'login',
    username: 'alice',
    password: 'a-long-test-password',
  });
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Lax/);
  assert.match(login.headers.get('set-cookie'), /Secure/);
  await call({ action: 'logout' }, cookie);
  assert.equal((await (await call(undefined, cookie)).json()).user, null);
  sqlite.prepare('UPDATE sessions SET expires = 0').run();
  assert.equal(
    (
      await (
        await call(undefined, login.headers.get('set-cookie').split(';')[0])
      ).json()
    ).user,
    null,
  );
});
test('completion and personal tasks stay isolated by account and survive reloads', async () => {
  const { call, signup } = fixture();
  const alice = await signup('alice'),
    bob = await signup('bob');
  await call({ action: 'complete', id: 'deadline-a', done: true }, alice);
  const added = await (
    await call({ action: 'addTodo', title: 'Alice private task' }, alice)
  ).json();
  const id = added.todos[0].id;
  assert.deepEqual((await (await call(undefined, bob)).json()).todos, []);
  await call({ action: 'toggleTodo', id, done: true }, bob);
  await call({ action: 'deleteTodo', id }, bob);
  let a = await (await call(undefined, alice)).json();
  assert.equal(a.todos.length, 1);
  assert.equal(a.todos[0].done, false);
  assert.deepEqual(a.completed, ['deadline-a']);
  assert.deepEqual((await (await call(undefined, bob)).json()).completed, []);
  await call({ action: 'toggleTodo', id, done: true }, alice);
  assert.equal(
    (await (await call(undefined, alice)).json()).todos[0].done,
    true,
  );
  await call({ action: 'complete', id: 'deadline-a', done: false }, alice);
  assert.deepEqual((await (await call(undefined, alice)).json()).completed, []);
  await call({ action: 'deleteTodo', id }, alice);
  assert.deepEqual((await (await call(undefined, alice)).json()).todos, []);
  assert.equal(
    (await call({ action: 'complete', id: 'invented', done: true }, alice))
      .status,
    400,
  );
  assert.equal(
    (await call({ action: 'addTodo', title: ' ' }, alice)).status,
    400,
  );
});
test('repeated authentication attempts are limited', async () => {
  const { call, signup } = fixture();
  await signup('alice');
  for (let i = 0; i < 9; i++)
    await call({
      action: 'login',
      username: 'alice',
      password: 'wrong-password',
    });
  assert.equal(
    (
      await call({
        action: 'login',
        username: 'alice',
        password: 'wrong-password',
      })
    ).status,
    429,
  );
});
