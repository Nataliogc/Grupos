const { test } = require('node:test');
const assert = require('node:assert/strict');
const targets = require('../js/services/groupTargetsService');
test('official tariffs distinguish both hotel and year', () => {
 const expected = [ ['guadiana',2026,62,70],['cumbria',2026,60,68],['guadiana',2027,65,73.5],['cumbria',2027,63,71] ];
 for (const [hotel,year,ha,hd] of expected) {
  const grid=targets.getTariffsForHotelAndYear(null,hotel,year);
  assert.equal(grid.HA.individual,ha);
  assert.equal(grid.HD.individual,hd);
 }
});
