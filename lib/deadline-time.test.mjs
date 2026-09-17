import assert from 'node:assert/strict';
// Run with Node's TypeScript stripping for the shared date helpers.
import test from 'node:test';
import { nextPendingDeadline, relativeLabel } from './deadline-time.ts';

test('countdowns change at Vancouver midnight, not UTC midnight', () => {
  const due = new Date('2026-09-20T23:59:00-07:00');
  assert.equal(relativeLabel(due, new Date('2026-09-19T06:59:59Z')), '2 days left');
  assert.equal(relativeLabel(due, new Date('2026-09-19T07:00:00Z')), 'Due tomorrow');
  assert.equal(relativeLabel(due, new Date('2026-09-20T07:00:00Z'), true), 'Closes today');
});

test('calendar countdown survives both daylight saving transitions', () => {
  assert.equal(relativeLabel(new Date('2026-11-02T10:20:00-08:00'), new Date('2026-10-31T23:30:00-07:00')), '2 days left');
  assert.equal(relativeLabel(new Date('2027-03-15T10:00:00-07:00'), new Date('2027-03-13T23:30:00-08:00')), '2 days left');
});

test('distant dates count down too and elapsed dates are labeled correctly', () => {
  assert.equal(relativeLabel(new Date('2026-10-02T23:59:00-07:00'), new Date('2026-09-17T15:00:00-07:00')), '15 days left');
  const due = new Date('2026-09-20T23:59:00-07:00');
  assert.equal(relativeLabel(due, due, true), 'Closed');
  assert.equal(relativeLabel(due, due), 'Due date passed');
});

test('next up advances at expiry, skips submitted work, and handles an empty future', () => {
  const items = [
    { id: 'later', due: '2026-10-02T23:59:00-07:00' },
    { id: 'submitted', due: '2026-09-25T23:59:00-07:00', submitted: true },
    { id: 'quiz', due: '2026-09-20T23:59:00-07:00' },
  ];
  assert.equal(nextPendingDeadline(items, new Date('2026-09-20T23:58:59-07:00'))?.id, 'quiz');
  assert.equal(nextPendingDeadline(items, new Date('2026-09-20T23:59:00-07:00'))?.id, 'later');
  assert.equal(nextPendingDeadline(items, new Date('2026-12-31T00:00:00-08:00')), undefined);
});
