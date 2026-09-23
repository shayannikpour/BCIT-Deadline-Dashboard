export type Exam = {
  id: string;
  courseShort: string;
  title: string;
  due: string;
  details: readonly string[];
  note: string;
};

export const exams: readonly Exam[] = [
  {
    id: 'mktg-1102-midterm-one',
    courseShort: 'MKTG 1102',
    title: 'Midterm Exam 1',
    due: '2026-10-01T08:30:00-07:00',
    details: [
      '30–40 multiple-choice questions',
      'Chapters 1, 2, 15 & 3',
      '50 minutes · Closed book · Learning Hub',
    ],
    note: 'MKTG 2243 meets at 9:30 a.m. after the exam.',
  },
  {
    id: 'opmt-1110-test-one',
    courseShort: 'OPMT 1110',
    title: 'Test 1',
    due: '2026-10-06T08:30:00-07:00',
    details: [
      'Modules 1–6 · Worth 15%',
      'Written answers — show your work',
      'Book with Accessibility Services as soon as possible',
    ],
    note: 'Erika’s class begins at 9:30 a.m.',
  },
];
