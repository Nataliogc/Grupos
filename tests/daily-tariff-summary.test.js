const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/Presupuestos.jsx'), 'utf8');
const helper = source.slice(source.indexOf('    const getCapaSuiteStayTariffSummary ='), source.indexOf('    // --- UTILS'));
function summarize(config) {
  const rates = { HA: 62, HD: 78, MP: 116 };
  const context = {
    window: { CapaSuitePricingService: { getStayTariffSummary: () => { throw Error('Must use daily regimes'); } } },
    toInputDate: d => d, getOfficialTariffsGrid: () => ({}),
    getCapaSuiteTariffComparison: (h, d, b) => ({ boardCode: b, hotelDayPrice: 100, officialDoble: rates[b], recDoble: rates[b] + 10, discountPercent: 15 })
  };
  vm.createContext(context);
  vm.runInContext(helper + '\nthis.summarize = getCapaSuiteStayTariffSummary;', context);
  return context.summarize('Guadiana', ['2026-10-10', '2026-10-11', '2026-10-12'], 'HD', 15, config);
}
test('all HA nights show 62 even when the general regime is HD', () => {
  const result = summarize(Object.fromEntries(['2026-10-10', '2026-10-11', '2026-10-12'].map(d => [d, { board: 'HA' }])));
  assert.equal(result.avgOfficialRate, 62);
  assert.equal(result.avgRecommendedRate, 72);
});
test('mixed nights average each daily regime and fall back only for unconfigured nights', () => {
  const result = summarize({ '2026-10-10': { board: 'HA' }, '2026-10-11': { board: 'MP' } });
  assert.equal(result.avgOfficialRate, 85.33);
  assert.equal(result.avgRecommendedRate, 95.33);
  assert.equal(result.comparisons[2].boardCode, 'HD');
});
