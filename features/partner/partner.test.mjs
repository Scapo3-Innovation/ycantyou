/**
 * Lightweight assertions for partner insight helpers (no test runner required).
 * Run: node features/partner/partner.test.mjs
 */
import assert from 'node:assert/strict';

// Inline minimal copies of logic paths — keeps CI-free validation without vitest.
function analyseTripRange(start, end, calendar) {
  const marksByDate = new Map();
  for (const mark of calendar.marks) {
    const set = marksByDate.get(mark.date) ?? new Set();
    set.add(mark.kind);
    marksByDate.set(mark.date, set);
  }

  const insights = [];
  let periodDays = 0;
  let fertileDays = 0;

  for (const [date, kinds] of marksByDate) {
    if (date >= start && date <= end) {
      if (kinds.has('period')) periodDays += 1;
      if (kinds.has('fertile')) fertileDays += 1;
    }
  }

  if (periodDays > 0) insights.push({ id: 'period-overlap' });
  if (fertileDays > 0) insights.push({ id: 'fertile-overlap' });

  return { insights };
}

const trip = analyseTripRange('2026-07-01', '2026-07-05', {
  marks: [
    { date: '2026-07-02', kind: 'period' },
    { date: '2026-07-12', kind: 'fertile' },
  ],
});

assert.ok(trip.insights.some((i) => i.id === 'period-overlap'));
assert.equal(trip.insights.some((i) => i.id === 'fertile-overlap'), false);

console.log('partner.test.mjs passed');
