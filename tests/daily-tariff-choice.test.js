const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/Presupuestos.jsx'), 'utf8');
const handler = source.slice(source.indexOf('      const handleDailyConfigChange ='), source.indexOf('      const handleToggleToDistribution ='));
function setup() {
  let state = { Hotel_Asignado: 'Guadiana', dailyConfig: { '2026-10-10': { board: 'HD', prices: { DOBLE: 78, DUI: 70 }, counts: { DOBLE: 3 }, gratuities: { DUI: 1 } } } };
  const grid = { HD: { DOBLE: 78, DUI: 70 }, MP: { DOBLE: 116, DUI: 89 }, PC: { DOBLE: 154, DUI: 108 } };
  const rec = { HD: { DOBLE: 210, DUI: 202 }, MP: { DOBLE: 248, DUI: 221 }, PC: { DOBLE: 286, DUI: 240 } };
  const context = { setFormData: fn => { state = fn(state); }, getRoomTypesForHotel: () => ['DOBLE', 'DUI'], toInputDate: d => d, getOfficialTariffsGrid: () => grid, getCapaSuiteTariffComparison: (h, d, b) => ({ recommendedPricesByRoom: rec[b.split(' ')[0]] }) };
  vm.createContext(context);
  vm.runInContext(handler + '\nthis.change = handleDailyConfigChange;', context);
  return { change: (...args) => context.change('2026-10-10', ...args), state: () => state };
}
test('row choice applies to all rooms and survives repeated board changes', () => {
  const app = setup();
  const original = app.state().dailyConfig['2026-10-10'];
  app.change('tariffMode', 'recommended');
  assert.equal(app.state().dailyConfig['2026-10-10'].prices.DOBLE, 210);
  assert.equal(app.state().dailyConfig['2026-10-10'].prices.DUI, 202);
  app.change('board', 'MP');
  assert.equal(app.state().dailyConfig['2026-10-10'].prices.DOBLE, 248);
  app.change('board', 'PC');
  assert.equal(app.state().dailyConfig['2026-10-10'].prices.DUI, 240);
  assert.equal(app.state().dailyConfig['2026-10-10'].tariffMode, 'recommended');
  assert.equal(original.prices.DOBLE, 78);
  assert.equal(app.state().dailyConfig['2026-10-10'].counts.DOBLE, 3);
  assert.equal(app.state().dailyConfig['2026-10-10'].gratuities.DUI, 1);
  app.change('tariffMode', 'official');
  app.change('board', 'HD');
  assert.equal(app.state().dailyConfig['2026-10-10'].prices.DOBLE, 78);
  assert.equal(app.state().dailyConfig['2026-10-10'].prices.DUI, 70);
  assert.equal(app.state().dailyConfig['2026-10-10'].tariffMode, 'official');
});
test('saved row choice takes priority over coincidental or manually edited prices', () => {
  const app = setup();
  app.change('tariffMode', 'recommended');
  app.change('prices', 78, 'DOBLE');
  app.change('prices', 70, 'DUI');
  app.change('board', 'MP');
  assert.equal(app.state().dailyConfig['2026-10-10'].prices.DOBLE, 248);
  assert.equal(app.state().dailyConfig['2026-10-10'].tariffMode, 'recommended');
});
