import assert from 'node:assert/strict';
import test from 'node:test';
import { deadlines } from './deadlines.ts';

test('Marketing Essentials has a quiz due every Sunday through the Fall term', () => {
  const quizzes = deadlines.filter((item) =>
    item.id.startsWith('mktg-weekly-quiz-'),
  );

  assert.equal(quizzes.length, 12);
  assert.equal(quizzes[0].due, '2026-09-27T23:59:00-07:00');
  assert.equal(quizzes.at(-1).due, '2026-12-13T23:59:00-08:00');
  assert.ok(quizzes.every((item) => new Date(item.due).getDay() === 0));
  assert.ok(quizzes.every((item) => item.type === 'Quiz'));
});
