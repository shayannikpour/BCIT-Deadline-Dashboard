'use client';
import { useState } from 'react';
import { CheckCircle2, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deadlines } from '@/lib/deadlines';
import type { usePersonal } from '@/lib/use-personal';
type Props = ReturnType<typeof usePersonal>;
const inputStyle =
  'min-w-0 rounded-xl border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export default function PersonalPanel({
  personal,
  loading,
  busy,
  error,
  act,
  reload,
}: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const completedDeadlines = deadlines
    .filter((deadline) => personal.completed.includes(deadline.id))
    .sort(
      (a, b) => new Date(b.due).getTime() - new Date(a.due).getTime(),
    );
  return (
    <section
      className="mb-8 rounded-3xl border bg-card p-5 sm:p-6"
      aria-labelledby="personal-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="personal-heading" className="text-xl font-semibold">
            My dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {personal.user
              ? `Signed in as ${personal.user.username} · Your progress and to-dos are private.`
              : 'Browse all deadlines freely. Create an account to save your own progress and to-dos.'}
          </p>
        </div>
        {personal.user && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={async () => {
              if (await act({ action: 'logout' })) {
                setTitle('');
                setPassword('');
              }
            }}
          >
            Sign out
          </Button>
        )}
      </div>
      {error && (
        <div
          className="mt-4 flex flex-wrap items-center gap-3 text-sm text-red-700"
          role="alert"
        >
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || loading}
            onClick={() => void reload()}
          >
            Retry loading
          </Button>
        </div>
      )}
      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Loading your dashboard…
        </p>
      ) : personal.user ? (
        <>
          <div className="mt-6 rounded-2xl border bg-background p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Completed course items</h3>
                  <p className="text-xs text-muted-foreground">
                    Deadlines you checked off on the main dashboard.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {completedDeadlines.length}
              </span>
            </div>
            {completedDeadlines.length ? (
              <ul className="mt-4 divide-y">
                {completedDeadlines.map((deadline) => (
                  <li
                    key={deadline.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <input
                      type="checkbox"
                      checked
                      disabled={busy}
                      className="mt-1 size-4 shrink-0 accent-primary"
                      aria-label={`Mark ${deadline.title} unfinished`}
                      onChange={() =>
                        void act({
                          action: 'complete',
                          id: deadline.id,
                          done: false,
                        })
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug line-through decoration-emerald-600/50">
                        {deadline.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {deadline.courseShort} · {deadline.type}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing checked off yet. Mark an item done on the main dashboard
                and it will appear here.
              </p>
            )}
          </div>

          <div className="mt-4 rounded-2xl border bg-background p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <ListTodo className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">Personal items</h3>
                <p className="text-xs text-muted-foreground">
                  Add anything else you want to remember.
                </p>
              </div>
            </div>
          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await act({ action: 'addTodo', title })) setTitle('');
            }}
          >
            <label className="sr-only" htmlFor="personal-todo">
              New personal to-do
            </label>
            <input
              id="personal-todo"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a personal to-do"
              className={`${inputStyle} flex-1`}
              disabled={busy}
            />
            <Button type="submit" disabled={busy || !title.trim()}>
              Add to-do
            </Button>
          </form>
          <ul className="mt-4 divide-y">
            {personal.todos.map((todo) => (
              <li key={todo.id} className="flex items-center gap-3 py-3">
                <label className="flex min-w-0 flex-1 items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 accent-primary"
                    checked={todo.done}
                    disabled={busy}
                    onChange={(e) =>
                      void act({
                        action: 'toggleTodo',
                        id: todo.id,
                        done: e.target.checked,
                      })
                    }
                  />
                  <span
                    className={`break-words ${todo.done ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {todo.title}
                  </span>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  aria-label={`Delete ${todo.title}`}
                  onClick={() =>
                    void act({ action: 'deleteTodo', id: todo.id })
                  }
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
          {personal.todos.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              No personal to-dos yet.
            </p>
          )}
          </div>
        </>
      ) : (
        <form
          className="mt-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await act({ action: mode, username, password }))
              setPassword('');
          }}
        >
          <div
            className="mb-4 flex gap-2"
            role="group"
            aria-label="Account options"
          >
            <Button
              type="button"
              variant={mode === 'signup' ? 'secondary' : 'ghost'}
              aria-pressed={mode === 'signup'}
              disabled={busy}
              onClick={() => setMode('signup')}
            >
              Create account
            </Button>
            <Button
              type="button"
              variant={mode === 'login' ? 'secondary' : 'ghost'}
              aria-pressed={mode === 'login'}
              disabled={busy}
              onClick={() => setMode('login')}
            >
              Sign in
            </Button>
          </div>
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-1.5 text-sm" htmlFor="username">
              Username
              <input
                id="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                pattern="[a-zA-Z0-9_]{3,24}"
                minLength={3}
                maxLength={24}
                required
                className={inputStyle}
                value={username}
                disabled={busy}
                onChange={(e) => setUsername(e.target.value)}
                aria-describedby="account-help"
              />
            </label>
            <label className="grid gap-1.5 text-sm" htmlFor="password">
              Password
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                required
                className={inputStyle}
                value={password}
                disabled={busy}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="account-help"
              />
            </label>
            <Button type="submit" disabled={busy}>
              {busy
                ? 'Please wait…'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Sign in'}
            </Button>
          </div>
          <p id="account-help" className="mt-3 text-xs text-muted-foreground">
            Usernames: 3–24 letters, numbers or underscores. No email needed;
            keep your password safe, as email recovery is unavailable.
          </p>
        </form>
      )}
    </section>
  );
}
