const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/GestionGrupos.jsx'), 'utf8');
const start = source.indexOf('          if (row.RoomingList_JSON && row.RoomingList_JSON !== "[]" && !groups[key].processedJSONs.has("rl_"');
const end = source.indexOf('          let planPaid = 0;', start);
function aggregate(items, excelTotal) {
  const context = {
    row: { RoomingList_JSON: JSON.stringify(items) }, key: 'group',
    groups: { group: {totalRevenue: excelTotal, totalCommission: 0, processedJSONs: new Set()} },
    getEconomicRoomingItems: JSON.parse
  };
  vm.runInNewContext(source.slice(start, end), context);
  return context.groups.group;
}
test('el pendiente usa el importe de ficha aunque el Excel sea superior', () => {
  const group = aggregate([{total: 2962.4}], 3137);
  assert.equal(group.totalRevenue, 2962.4);
  assert.equal(group.hasRoomingListOverride, true);
  const balance = group.totalRevenue - group.totalCommission - 3075.6;
  assert.equal(Math.max(0, balance), 0);
  assert.ok(Math.abs(-balance - 113.2) < 0.001);
});
test('incluye cargos y comisión una sola vez desde las líneas de ficha', () => {
  const group = aggregate([{total: 100, comision: {total_comision: 10}}, {total: 25}], 150);
  assert.equal(group.totalRevenue, 125);
  assert.equal(group.totalCommission, 10);
});
test('sin líneas económicas conserva el importe de origen', () => {
  assert.equal(aggregate([], 150).totalRevenue, 150);
});
