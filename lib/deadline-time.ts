export const deadlineTimeZone = 'America/Vancouver';

const calendar = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: deadlineTimeZone,
});

function calendarDay(date: Date) {
  const parts = calendar.formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(value('year'), value('month') - 1, value('day')) / 86400000;
}

export function relativeLabel(date: Date, now: Date, closes = false) {
  if (date.getTime() <= now.getTime()) return closes ? 'Closed' : 'Due date passed';
  const days = calendarDay(date) - calendarDay(now);
  const verb = closes ? 'Closes' : 'Due';
  if (days === 0) return `${verb} today`;
  if (days === 1) return `${verb} tomorrow`;
  return `${days} days left`;
}

export function nextPendingDeadline<T extends { due: string; submitted?: boolean }>(items: readonly T[], now: Date): T | undefined {
  return items.filter((item) => !item.submitted && Date.parse(item.due) > now.getTime())
    .sort((a, b) => Date.parse(a.due) - Date.parse(b.due))[0];
}
