'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deadlines } from '@/lib/deadlines';
import { exams } from '@/lib/exams';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthFormat = new Intl.DateTimeFormat('en-CA', {
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Vancouver',
});
const selectedDateFormat = new Intl.DateTimeFormat('en-CA', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'America/Vancouver',
});
const timeFormat = new Intl.DateTimeFormat('en-CA', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Vancouver',
});
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dueKey = (due: string) =>
  new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Vancouver',
  }).format(new Date(due));

type CalendarEntry = {
  id: string;
  title: string;
  courseShort: string;
  due: string;
  kind: 'Assignment' | 'Quiz' | 'Exam';
};

const entries: CalendarEntry[] = [
  ...deadlines.map((item) => ({
    id: item.id,
    title: item.title,
    courseShort: item.courseShort,
    due: item.due,
    kind: item.type,
  })),
  ...exams.map((exam) => ({
    id: exam.id,
    title: exam.title,
    courseShort: exam.courseShort,
    due: exam.due,
    kind: 'Exam' as const,
  })),
];

const kindStyle = {
  Assignment: 'bg-emerald-500',
  Quiz: 'bg-violet-500',
  Exam: 'bg-amber-500',
};

export default function CalendarView() {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(2026, 8, 1));
  const [selected, setSelected] = useState(() => new Date(2026, 8, 22));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const calendarDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [month]);

  const grouped = useMemo(() => {
    const result = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const key = dueKey(entry.due);
      const current = result.get(key) ?? [];
      current.push(entry);
      result.set(key, current);
    }
    return result;
  }, []);

  const selectedEntries = grouped.get(dateKey(selected)) ?? [];

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-10 rounded-xl px-3"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <CalendarDays className="size-4" />
        <span className="hidden sm:inline">Calendar</span>
        <span className="sr-only sm:hidden">Open calendar</span>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-heading"
            className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] bg-background shadow-2xl sm:max-h-[90vh] sm:rounded-[28px]"
          >
            <header className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Schedule
                </p>
                <h2 id="calendar-heading" className="text-xl font-semibold">
                  Calendar view
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                onClick={() => setOpen(false)}
                aria-label="Close calendar"
              >
                <X className="size-5" />
              </Button>
            </header>

            <div className="overflow-y-auto p-3 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Previous month"
                  onClick={() =>
                    setMonth(
                      (current) =>
                        new Date(current.getFullYear(), current.getMonth() - 1, 1),
                    )
                  }
                >
                  <ChevronLeft />
                </Button>
                <h3 className="text-lg font-semibold">{monthFormat.format(month)}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Next month"
                  onClick={() =>
                    setMonth(
                      (current) =>
                        new Date(current.getFullYear(), current.getMonth() + 1, 1),
                    )
                  }
                >
                  <ChevronRight />
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground sm:text-xs">
                {weekDays.map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 overflow-hidden rounded-2xl border bg-card">
                {calendarDays.map((day) => {
                  const key = dateKey(day);
                  const dayEntries = grouped.get(key) ?? [];
                  const selectedDay = key === dateKey(selected);
                  const currentMonth = day.getMonth() === month.getMonth();
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelected(day)}
                      aria-label={`${selectedDateFormat.format(day)}, ${dayEntries.length} items`}
                      aria-pressed={selectedDay}
                      className={`min-h-14 border-b border-r p-1 text-left transition last:border-r-0 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-24 sm:p-2 ${selectedDay ? 'bg-primary/10' : 'hover:bg-muted'} ${currentMonth ? 'text-foreground' : 'text-muted-foreground/45'}`}
                    >
                      <span className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${selectedDay ? 'bg-primary text-primary-foreground' : ''}`}>
                        {day.getDate()}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1 sm:hidden">
                        {dayEntries.slice(0, 4).map((entry) => (
                          <span key={entry.id} className={`size-1.5 rounded-full ${kindStyle[entry.kind]}`} />
                        ))}
                      </span>
                      <span className="mt-1 hidden space-y-1 sm:block">
                        {dayEntries.slice(0, 2).map((entry) => (
                          <span key={entry.id} className="flex items-center gap-1 truncate text-[10px] leading-tight">
                            <span className={`size-1.5 shrink-0 rounded-full ${kindStyle[entry.kind]}`} />
                            <span className="truncate">{entry.courseShort}</span>
                          </span>
                        ))}
                        {dayEntries.length > 2 && (
                          <span className="block text-[10px] text-muted-foreground">+{dayEntries.length - 2} more</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{selectedDateFormat.format(selected)}</h3>
                  <div className="flex gap-3 text-[11px] text-muted-foreground">
                    {(['Assignment', 'Quiz', 'Exam'] as const).map((kind) => (
                      <span key={kind} className="inline-flex items-center gap-1">
                        <span className={`size-2 rounded-full ${kindStyle[kind]}`} />
                        {kind}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedEntries.length ? (
                  <ul className="mt-3 divide-y">
                    {selectedEntries.map((entry) => (
                      <li key={entry.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${kindStyle[entry.kind]}`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug">{entry.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {entry.courseShort} · {entry.kind} · {timeFormat.format(new Date(entry.due))}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Nothing is scheduled for this day.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
