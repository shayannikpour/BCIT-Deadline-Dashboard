'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, BookOpenCheck, CalendarDays, CheckCircle2, Clock3, GraduationCap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DeadlineType = 'Assignment' | 'Quiz';
type Deadline = { id: string; title: string; course: string; courseShort: string; type: DeadlineType; due: string; url: string };

const deadlines: Deadline[] = [
  { id: 'comm-intro', title: 'Self-Introduction Video', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Assignment', due: '2026-09-11T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1230765' },
  { id: 'mktg-linkedin', title: 'Assignment #1 LinkedIn Report', course: 'Professional Sales Skills & CRM', courseShort: 'MKTG 2243', type: 'Assignment', due: '2026-09-25T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1239803' },
  { id: 'comm-plagiarism', title: 'What is plagiarism? What is the big deal?', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Quiz', due: '2026-09-27T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/quizzing/quizzing.d2l?ou=1230765' },
  { id: 'comm-meeting-summary', title: 'Meeting Summary (ungraded practice)', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Assignment', due: '2026-10-02T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1230765' },
  { id: 'comm-outline', title: 'Presentation Outline', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Assignment', due: '2026-10-04T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1230765' },
  { id: 'comm-request', title: 'Information Meeting Request (ungraded practice)', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Assignment', due: '2026-10-09T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1230765' },
  { id: 'comm-info-summary', title: 'Information Meeting Summary', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Assignment', due: '2026-10-18T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1230765' },
  { id: 'comm-routine-one', title: 'Routine Message 1', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Quiz', due: '2026-10-23T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/quizzing/quizzing.d2l?ou=1230765' },
  { id: 'mktg-sales-meeting', title: 'Assignment #2 Sales Meeting and Self Evaluation', course: 'Professional Sales Skills & CRM', courseShort: 'MKTG 2243', type: 'Assignment', due: '2026-10-23T23:59:00-07:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1239803' },
  { id: 'comm-midterm', title: 'Routine Message (Midterm)', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Quiz', due: '2026-11-02T10:20:00-08:00', url: 'https://learn.bcit.ca/d2l/lms/quizzing/quizzing.d2l?ou=1230765' },
  { id: 'comm-persuasive-one', title: 'Persuasive Message 1', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Quiz', due: '2026-11-14T00:59:00-08:00', url: 'https://learn.bcit.ca/d2l/lms/quizzing/quizzing.d2l?ou=1230765' },
  { id: 'comm-presentation', title: 'Presentation', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Assignment', due: '2026-11-16T00:59:00-08:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1230765' },
  { id: 'mktg-interview', title: 'Assignment #3 Industry Interview', course: 'Professional Sales Skills & CRM', courseShort: 'MKTG 2243', type: 'Assignment', due: '2026-11-21T00:59:00-08:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1239803' },
  { id: 'comm-final', title: 'Persuasive Message (Final)', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Quiz', due: '2026-11-23T10:20:00-08:00', url: 'https://learn.bcit.ca/d2l/lms/quizzing/quizzing.d2l?ou=1230765' },
  { id: 'comm-feedback', title: 'Presentation Feedback', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Assignment', due: '2026-11-28T00:59:00-08:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1230765' },
  { id: 'opmt-review', title: 'Course Review', course: 'Business Mathematics', courseShort: 'OPMT 1110', type: 'Quiz', due: '2026-12-08T00:59:00-08:00', url: 'https://learn.bcit.ca/d2l/lms/quizzing/quizzing.d2l?ou=1230837' },
  { id: 'comm-exit', title: 'Exit Interview', course: 'Business Communication 1', courseShort: 'COMM 1100', type: 'Assignment', due: '2026-12-12T00:59:00-08:00', url: 'https://learn.bcit.ca/d2l/lms/dropbox/dropbox.d2l?ou=1230765' },
];

const filters = ['All', 'Assignment', 'Quiz'] as const;
const courseStyles: Record<string, string> = {
  'COMM 1100': 'bg-blue-50 text-blue-700 ring-blue-100',
  'MKTG 2243': 'bg-orange-50 text-orange-700 ring-orange-100',
  'OPMT 1110': 'bg-violet-50 text-violet-700 ring-violet-100',
};
const dateFormat = new Intl.DateTimeFormat('en-CA', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Vancouver' });
const timeFormat = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Vancouver' });

function relativeLabel(date: Date) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((target.getTime() - start.getTime()) / 86400000);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days > 1 && days <= 7) return `${days} days left`;
  return dateFormat.format(date);
}

export default function Home() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [query, setQuery] = useState('');
  const visible = useMemo(() => deadlines.filter((item) => {
    const matchesType = filter === 'All' || item.type === filter;
    const haystack = `${item.title} ${item.course} ${item.courseShort}`.toLowerCase();
    return matchesType && haystack.includes(query.toLowerCase());
  }), [filter, query]);
  const next = deadlines[0];
  const assignments = deadlines.filter((item) => item.type === 'Assignment').length;
  const quizzes = deadlines.filter((item) => item.type === 'Quiz').length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-border/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm"><GraduationCap className="size-5" /></div>
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">BCIT Course Desk</p><h1 className="text-lg font-semibold tracking-tight">Deadline dashboard</h1></div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129/12%)]" />Checked Sep 10 at 7:09 PM</div>
        </header>

        <section className="grid gap-5 pb-8 pt-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-primary p-7 text-primary-foreground shadow-[0_18px_55px_rgb(19_55_64/12%)] sm:p-9">
            <div className="absolute -right-14 -top-16 size-52 rounded-full border border-white/10" /><div className="absolute -right-3 -top-4 size-28 rounded-full bg-white/[0.04]" />
            <p className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Next up</p>
            <div className="relative max-w-xl">
              <span className="inline-flex rounded-full bg-[#e9ff9e] px-3 py-1 text-xs font-semibold text-[#273c10]">Due tomorrow</span>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-[42px]">{next.title}</h2>
              <p className="mt-3 text-sm text-white/65">{next.courseShort} · {next.course}</p>
              <div className="mt-7 flex flex-wrap items-center gap-4 text-sm"><span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-[#e9ff9e]" />{dateFormat.format(new Date(next.due))}</span><span className="inline-flex items-center gap-2"><Clock3 className="size-4 text-[#e9ff9e]" />{timeFormat.format(new Date(next.due))}</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <div className="rounded-[24px] border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><BookOpenCheck className="size-5 text-primary" /><span className="text-xs text-muted-foreground">Fall 2026</span></div><p className="mt-7 text-3xl font-semibold tracking-tight">{assignments}</p><p className="mt-1 text-sm text-muted-foreground">Assignments posted</p></div>
            <div className="rounded-[24px] border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><CheckCircle2 className="size-5 text-[#7c5cff]" /><span className="text-xs text-muted-foreground">9 courses checked</span></div><p className="mt-7 text-3xl font-semibold tracking-tight">{quizzes}</p><p className="mt-1 text-sm text-muted-foreground">Quizzes with dates</p></div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Fall 2026</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Upcoming deadlines</h2></div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex h-10 min-w-64 items-center gap-2 rounded-xl border bg-card px-3 text-sm shadow-sm focus-within:ring-2 focus-within:ring-ring/30"><Search className="size-4 text-muted-foreground" /><span className="sr-only">Search deadlines</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course or task" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" /></label>
              <div className="flex rounded-xl border bg-card p-1 shadow-sm" aria-label="Filter deadlines">{filters.map((item) => <Button key={item} size="sm" variant={filter === item ? 'secondary' : 'ghost'} onClick={() => setFilter(item)} className="rounded-lg px-3">{item === 'Assignment' ? 'Assignments' : item === 'Quiz' ? 'Quizzes' : item}</Button>)}</div>
            </div>
          </div>
          <div className="divide-y">
            {visible.map((item) => {
              const due = new Date(item.due);
              return <article key={item.id} className="group grid gap-3 py-5 sm:grid-cols-[116px_minmax(0,1fr)_160px_34px] sm:items-center">
                <div><p className="text-sm font-semibold">{dateFormat.format(due)}</p><p className="mt-0.5 text-xs text-muted-foreground">{timeFormat.format(due)}</p></div>
                <div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${courseStyles[item.courseShort]}`}>{item.courseShort}</span><span className="text-xs font-medium text-muted-foreground">{item.type}</span></div><h3 className="mt-2 font-semibold tracking-tight">{item.title}</h3><p className="mt-0.5 text-sm text-muted-foreground">{item.course}</p></div>
                <div className="sm:text-right"><span className="inline-flex rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">{relativeLabel(due)}</span></div>
                <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.title} in Learning Hub`} className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>
              </article>;
            })}
            {visible.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No deadlines match this view.</p>}
          </div>
        </section>
        <footer className="mt-8 flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>Current-term deadlines only. Stale 2025 items were excluded.</p><p>Next automatic check: Sep 11 at 6:00 PM PDT</p></footer>
      </div>
    </main>
  );
}
