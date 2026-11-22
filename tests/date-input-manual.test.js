const { test } = require('node:test');
const assert = require('node:assert/strict');
const NexusUtils = require('../js/utils');

test('isCompleteDate correctly identifies complete 4-digit valid years', () => {
  assert.equal(NexusUtils.isCompleteDate('0002-09-04'), false);
  assert.equal(NexusUtils.isCompleteDate('0020-09-04'), false);
  assert.equal(NexusUtils.isCompleteDate('0202-09-04'), false);
  assert.equal(NexusUtils.isCompleteDate(''), false);
  assert.equal(NexusUtils.isCompleteDate(null), false);
  assert.equal(NexusUtils.isCompleteDate('2026-09-04'), true);
  assert.equal(NexusUtils.isCompleteDate('2025-12-31'), true);
});

test('generateDates does not freeze on extreme or incomplete year ranges', () => {
  const start = Date.now();
  // Case that previously hung the browser with 731,579 iterations:
  const dates = NexusUtils.generateDates('0002-09-04', '2005-09-02');
  const elapsed = Date.now() - start;
  assert.deepEqual(dates, []);
  assert.ok(elapsed < 100, `Execution should be instant, took ${elapsed}ms`);

  // Excessive range guard (> 366 days)
  const excessiveDates = NexusUtils.generateDates('2025-01-01', '2027-01-01');
  assert.deepEqual(excessiveDates, []);

  // Normal valid stay
  const normalDates = NexusUtils.generateDates('2026-09-04', '2026-09-07');
  assert.deepEqual(normalDates, ['2026-09-04', '2026-09-05', '2026-09-06']);
});

test('toInputDate handles Date objects and normalizes string dates with 4-digit years', () => {
  assert.equal(NexusUtils.toInputDate('2026-09-04'), '2026-09-04');
  assert.equal(NexusUtils.toInputDate('04/09/2026'), '2026-09-04');
  const d = new Date(2026, 8, 4); // September is month 8 (0-indexed)
  assert.equal(NexusUtils.toInputDate(d), '2026-09-04');
});

test('calcStayDays and addStayDays prevent abnormal durations when typing year manually', () => {
  const fs = require('fs');
  const src = fs.readFileSync('src/Presupuestos.jsx', 'utf8');
  // Evaluate the helper functions in a sandboxed context
  const fnSection = src.slice(
    src.indexOf('    const isCompleteDate ='),
    src.indexOf('    const {isLockedBudget,')
  );
  const sandbox = { NexusUtils, generateDates: NexusUtils.generateDates, toInputDate: NexusUtils.toInputDate };
  const fn = new Function('sandbox', `with(sandbox) { ${fnSection} return { isCompleteDate, calcStayDays, addStayDays }; }`);
  const { isCompleteDate, calcStayDays, addStayDays } = fn(sandbox);

  // Incomplete year 0002 should not calculate 731,579 days
  assert.equal(calcStayDays('0002-09-04', '2005-09-02'), 0);
  assert.equal(calcStayDays('2026-09-04', '2026-09-07'), 3);

  // addStayDays should not create broken dates when given year 0002
  assert.equal(addStayDays('0002-09-04', 3), '');
  // addStayDays should correctly add days with 4-digit year format
  assert.equal(addStayDays('2026-09-04', 3), '2026-09-07');
});
