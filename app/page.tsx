'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  History,
  ListChecks,
  Search,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { relativeLabel } from '@/lib/deadline-time';

import { deadlines } from '@/lib/deadlines';
import { exams } from '@/lib/exams';
import { usePersonal } from '@/lib/use-personal';
import CalendarView from './calendar-view';
const checkedAt = '2026-09-17T15:46:00-07:00';
const courses = [...new Set(deadlines.map((item) => item.courseShort))].sort();
const filters = ['All', 'Assignment', 'Quiz'] as const;
const sortedDeadlines = [...deadlines].sort(
  (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime(),
);
const courseStyles: Record<string, string> = {
  'COMM 1100': 'bg-blue-50 text-blue-700 ring-blue-100',
  'MKTG 2243': 'bg-rose-50 text-rose-700 ring-rose-100',
  'OPMT 1110': 'bg-violet-50 text-violet-700 ring-violet-100',
  'MKTG 1102': 'bg-amber-50 text-amber-700 ring-amber-100',
  'BSYS 1000': 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'ECON 2100': 'bg-sky-50 text-sky-700 ring-sky-100',
};
const dateFormat = new Intl.DateTimeFormat('en-CA', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'America/Vancouver',
});
const timeFormat = new Intl.DateTimeFormat('en-CA', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Vancouver',
});

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const account = usePersonal();
  const completed = useMemo(
    () => new Set(account.personal.completed),
    [account.personal.completed],
  );
  const [now, setNow] = useState(() => new Date(checkedAt));
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      setNow(new Date());
      // Align with minute boundaries, including midnight and posted due times.
      timer = setTimeout(refresh, 60000 - (Date.now() % 60000) + 5);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [showPastDue, setShowPastDue] = useState(true);
  const [query, setQuery] = useState('');
  const visible = useMemo(
    () =>
      sortedDeadlines.filter((item) => {
        const matchesType = filter === 'All' || item.type === filter;
        const haystack =
          `${item.title} ${item.course} ${item.courseShort} ${item.platform ?? 'Learning Hub'}`.toLowerCase();
        const matchesCourse =
          courseFilter === 'All' || item.courseShort === courseFilter;
        const matchesDueDate =
          showPastDue || new Date(item.due).getTime() >= now.getTime();
        return (
          matchesType &&
          matchesCourse &&
          matchesDueDate &&
          haystack.includes(query.toLowerCase())
        );
      }),
    [filter, query, courseFilter, showPastDue, now],
  );
  const weekItems = useMemo(() => {
    const start = now.getTime();
    const end = start + 7 * 24 * 60 * 60 * 1000;
    return sortedDeadlines
      .filter((item) => {
        const due = new Date(item.due).getTime();
        return due >= start && due <= end && !completed.has(item.id);
      })
      .slice(0, 5);
  }, [now, completed]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px 40px 0px' });

    page.querySelectorAll('[data-reveal]').forEach((card) => {
      if (!card.classList.contains('is-visible')) observer.observe(card);
    });
    page.classList.add('motion-ready');
    return () => observer.disconnect();
  }, [visible]);

  return (
    <main ref={pageRef} className="dashboard-shell min-h-screen text-foreground">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <header className="dashboard-header flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="brand-mark grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                BCIT Course Desk
              </p>
              <h1 className="text-lg font-semibold tracking-tight">
                Big D&apos;s Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarView />
            <Link
              href="/account"
              className={buttonVariants({
                size: 'lg',
                className: 'h-10 rounded-xl px-4',
              })}
            >
              {account.personal.user ? 'My dashboard' : 'Sign up'}
            </Link>
          </div>
        </header>

        <section className="overview-grid grid gap-5 pb-8 pt-6 lg:grid-cols-[1.18fr_0.82fr] lg:pt-8">
          <div data-reveal className="relative overflow-hidden rounded-[28px] bg-primary p-5 text-primary-foreground shadow-[0_18px_55px_rgb(19_55_64/12%)] sm:p-7">
            <div aria-hidden="true" className="week-orbit absolute -right-14 -top-16 size-52 rounded-full border border-white/10" />
            <div aria-hidden="true" className="week-orb absolute -right-3 -top-4 size-28 rounded-full bg-white/[0.04]" />
            <div className="relative flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white/10">
                <ListChecks className="size-5 text-[#e9ff9e]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Your next 7 days
                </p>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  This week’s work
                </h2>
              </div>
            </div>
            <div className="relative mt-5 divide-y divide-white/10">
              {weekItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid gap-2 py-3.5 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <span className="rounded-full bg-white/10 px-2 py-1 font-semibold text-white/90">
                        {item.courseShort}
                      </span>
                      <span>{item.type === 'Quiz' ? 'Quiz' : 'Coursework'}</span>
                    </div>
                    <p className="mt-2 font-semibold leading-snug text-white group-hover:text-[#e9ff9e]">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-white/70 sm:justify-end">
                    <span>{dateFormat.format(new Date(item.due))}</span>
                    <span className="rounded-full bg-[#e9ff9e] px-2 py-1 text-[#273c10]">
                      {relativeLabel(new Date(item.due), now, item.closes)}
                    </span>
                  </div>
                </a>
              ))}
              {weekItems.length === 0 && (
                <p className="py-8 text-sm text-white/70">
                  No unfinished quizzes or coursework are due in the next seven days.
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {exams.map((exam) => {
              const due = new Date(exam.due);
              return (
                <article
                  key={exam.id}
                  data-reveal
                  className="exam-card rounded-[24px] border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                      <BookOpenCheck className="size-5" />
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      {relativeLabel(due, now)}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-muted-foreground">
                    {exam.courseShort} · Upcoming exam
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    {exam.title}
                  </h2>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4 text-muted-foreground" />
                      {dateFormat.format(due)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4 text-muted-foreground" />
                      {timeFormat.format(due)}
                    </span>
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                    {exam.details.map((detail) => (
                      <li key={detail} className="flex gap-2">
                        <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                    {exam.note}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
        <section>
          <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Today · {dateFormat.format(now)}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Course deadlines
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Days remaining update automatically · Vancouver time
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <label className="flex h-10 min-w-64 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
                <Search className="size-4 text-muted-foreground" />
                <span className="sr-only">Search deadlines</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search course or task"
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </label>
              <div
                className="flex rounded-xl border bg-card p-1 shadow-sm"
                aria-label="Filter deadlines"
              >
                {filters.map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant={filter === item ? 'secondary' : 'ghost'}
                    onClick={() => setFilter(item)}
                    aria-pressed={filter === item}
                    className="rounded-lg px-3"
                  >
                    {item === 'Assignment'
                      ? 'Assignments'
                      : item === 'Quiz'
                        ? 'Quizzes'
                        : item}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant={showPastDue ? 'outline' : 'secondary'}
                onClick={() => setShowPastDue((current) => !current)}
                aria-pressed={!showPastDue}
                className="h-10 rounded-xl px-3 shadow-sm"
              >
                <History className="size-4" />
                {showPastDue ? 'Hide past due' : 'Show past due'}
              </Button>
            </div>
          </div>
          <div
            className="flex flex-wrap items-center gap-2 border-b py-4"
            role="group"
            aria-label="Filter by class"
          >
            <span className="mr-1 text-xs font-semibold text-muted-foreground">
              Class
            </span>
            {['All', ...courses].map((course) => (
              <button
                key={course}
                type="button"
                aria-pressed={courseFilter === course}
                onClick={() => setCourseFilter(course)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${course === 'All' ? 'bg-muted text-foreground' : courseStyles[course]} ${courseFilter === course ? 'ring-2 ring-current shadow-sm' : 'ring-1 hover:brightness-95'}`}
              >
                {course !== 'All' && (
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-current"
                  />
                )}
                {course === 'All' ? 'All classes' : course}
                {courseFilter === course && (
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                )}
              </button>
            ))}
          </div>
          <p className="pt-4 text-xs text-muted-foreground" role="status">
            {visible.length} {visible.length === 1 ? 'deadline' : 'deadlines'}
            {courseFilter !== 'All' ? ` · ${courseFilter}` : ''}
          </p>
          <div className="deadline-list">
            {visible.map((item) => {
              const due = new Date(item.due);
              const isCompleted = completed.has(item.id);
              return (
                <article
                  key={item.id}
                  data-reveal
                  className="deadline-card group grid gap-3 py-5 sm:grid-cols-[116px_minmax(0,1fr)_160px_34px] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {dateFormat.format(due)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.sourceTime ?? timeFormat.format(due)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {item.closes ? 'Closes' : 'Due'}
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${courseStyles[item.courseShort]}`}
                      >
                        {item.courseShort}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.type} · {item.platform ?? 'Learning Hub'}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.course}
                    </p>
                  </div>
                  <div className="space-y-2 sm:text-right">
                    {account.personal.user && (
                      <label className="flex items-center gap-2 text-sm sm:justify-end">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={isCompleted}
                          disabled={account.busy}
                          onChange={(event) =>
                            void account.act({
                              action: 'complete',
                              id: item.id,
                              done: event.target.checked,
                            })
                          }
                          aria-label={`Mark ${item.title} complete`}
                        />
                        Done
                      </label>
                    )}
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'}`}
                    >
                      {isCompleted
                        ? 'Completed'
                        : relativeLabel(due, now, item.closes)}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${item.title} in ${item.platform ?? 'Learning Hub'}`}
                    className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </article>
              );
            })}
            {visible.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No deadlines match this view.
              </p>
            )}
          </div>
        </section>
        <p className="mt-6 text-xs text-muted-foreground">
          Connect and Cengage MindTap dates were added from supplied
          screenshots. Connect times retain the PDT label shown there, including
          December; 11:59 PM PDT equals 10:59 PM Vancouver standard time in
          December. SimNet dates were interpreted as Vancouver local time
          because the screenshots omitted the time zone.
        </p>
        <footer className="mt-8 flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Learning Hub last checked Sep 17, 3:46 PM PDT.</p>
          <p>
            Course data refreshed on request · Countdowns update automatically
          </p>
        </footer>
      </div>
    </main>
  );
}
