const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../src/Presupuestos.jsx'), 'utf8');
const start = source.indexOf('const calculateTotal = (rawGroupData) => {');
const end = source.indexOf('const parsePaymentPlan', start);
const calculateTotal = vm.runInNewContext(source.slice(start, end) + '\ncalculateTotal;', {
  normalizeGroupData: data => data,
  generateDates: () => ['2026-10-06', '2026-10-07', '2026-10-08']
});
const group = {
  roomCounts: { triple: 5, dui: 23, doble: 3 },
  dailyConfig: Object.fromEntries(['2026-10-06', '2026-10-07', '2026-10-08'].map(date => [date, {
    prices: { triple: 167.4, dui: 91.9, doble: 118.9 }
  }])),
  extraCharges: [{ date: '2026-10-08', price: 403 }],
  Suplementos: 3,
  agencyCommissionPercent: 12,
  agencyCommissionServices: ['Alojamiento', 'Desayuno']
};
test('legacy supplements do not increase the client total; current extras remain', () => {
  assert.equal(Math.round(calculateTotal(group) * 100), 1032520);
  assert.equal(calculateTotal(group), calculateTotal({ ...group, Suplementos: 0 }));
});
test('global discounts still reduce the client total', () => {
  assert.equal(Math.round(calculateTotal({ ...group, Descuentos: 25 }) * 100), 1030020);
});
