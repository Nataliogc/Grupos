const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../src/Presupuestos.jsx'), 'utf8');
const start = source.indexOf('const calculateTotal = (rawGroupData,');
const end = source.indexOf('const parsePaymentPlan', start);
const calculateTotal = vm.runInNewContext(source.slice(start, end) + '\ncalculateTotal;', {
  window: { AgencyCommissionService: require('../js/agencyCommissionService') },
  localStorage: { getItem: () => null },
  normalizeGroupData: data => data,
  generateDates: () => ['2026-10-06', '2026-10-07', '2026-10-08']
});
const group = {
  roomCounts: { triple: 5, dui: 23, doble: 3 },
  dailyConfig: Object.fromEntries(['2026-10-06', '2026-10-07', '2026-10-08'].map(date => [date, {
    board: { '2026-10-06': 'MP', '2026-10-07': 'PC', '2026-10-08': 'AD' }[date],
    prices: { triple: 167.4, dui: 91.9, doble: 118.9 }
  }])),
  extraCharges: [{ date: '2026-10-08', price: 403 }],
  Suplementos: 3,
  agencyCommissionPercent: 0,
  agencyCommissionServices: ['Alojamiento', 'Desayuno']
};
test('legacy supplements do not increase the client total; current extras remain', () => {
  assert.equal(Math.round(calculateTotal(group) * 100), 1032520);
  assert.equal(calculateTotal(group), calculateTotal({ ...group, Suplementos: 0 }));
});
test('global discounts still reduce the client total', () => {
  assert.equal(Math.round(calculateTotal({ ...group, Descuentos: 25 }) * 100), 1030020);
});

test('agency commission reduces the net total only for selected services', () => {
  const agency = { ...group, agencyCommissionPercent: 12 };
  const result = calculateTotal(agency, true);
  // MP excludes dinner; PC excludes lunch and dinner. 44 paying guests per day.
  assert.equal(result.commissionBase, 7348.2);
  assert.equal(result.commissionDeduction, 881.78);
  assert.equal(result.total, 9443.42);
  assert.equal(calculateTotal({ ...agency, agencyIsClient: false }), 10325.2);
});
test('selected extras contribute to the commission base', () => {
  const agency = { ...group, agencyCommissionPercent: 12, agencyCommissionServices: ['Salas'],
    extraCharges: [{ date: '2026-10-08', price: 403, commissionService: 'Salas' }] };
  assert.equal(calculateTotal(agency, true).commissionDeduction, 48.36);
});
test('rates-only documents have a complete zero breakdown', () => {
  assert.equal(calculateTotal({ isRatesOnly: true }, true).total, 0);
});
