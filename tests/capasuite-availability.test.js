const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/services/capaSuitePricingService');
function storage(data) { global.localStorage = { getItem: k => data[k] ? JSON.stringify(data[k]) : null }; }
test('subtracts OTB and manual allotments, including a shortfall for 24 rooms', () => {
  storage({ hotel_manager_db_v2: { guadiana: { 2026: { daily_otb: { '2026-10-10': { rooms: 85, cupos: 1 } } } } }, manual_cupos_v1: { Guadiana: { '2026-10-10': { cupos: 5 } } } });
  assert.equal(service.getDayAvailability('Sercotel Guadiana', '2026-10-10').available, 18);
});
test('zero and absent occupancy both leave the full hotel available', () => {
  storage({ hotel_manager_db_v2: { cumbria: { 2026: { daily_otb: { '2026-10-10': { rooms: 0 } } } } } });
  assert.equal(service.getDayAvailability('Cumbria', '2026-10-10').available, 59);
  assert.equal(service.getDayAvailability('Cumbria', '2026-10-11').available, 59);
});
test('sold-out flag overrides reported occupancy', () => {
  storage({ manual_cupos_v1: { Guadiana: { '2026-10-10': { isSoldOut: true } } } });
  assert.equal(service.getDayAvailability('Guadiana', '2026-10-10').available, 0);
});
test('calendar fallback uses OTB already including allotments', () => {
  storage({ revenue_data_v2: { data: [{ dateISO: '2026-10-10', occupancyData: { Guadiana: { otb: 100 } } }] }, manual_cupos_v1: { Guadiana: { '2026-10-10': { cupos: 5 } } } });
  assert.equal(service.getDayAvailability('Guadiana', '2026-10-10').available, 8);
});
test('price-only dates have zero occupied rooms', () => {
  storage({ hotel_manager_db_v2: { guadiana: { 2026: { daily_otb: { '2026-10-10': { price: 231 } } } } } });
  assert.equal(service.getDayAvailability('Guadiana', '2026-10-10').available, 108);
});

test('reads daily production occupancy when OTB is absent', () => {
 storage({ hotel_manager_db_v2: { cumbria: { 2027: { daily: { '2027-03-12': { rooms: 0 }, '2027-03-13': { rooms: 40 } } } } } });
 assert.equal(service.getDayAvailability('Cumbria', '2027-03-12').available, 59);
 assert.equal(service.getDayAvailability('Cumbria', '2027-03-13').available, 19);
});

test('absent occupancy still subtracts blocked allotments', () => {
  storage({ manual_cupos_v1: { Guadiana: { '2027-01-22': { cupos: 12 } } } });
  const day = service.getDayAvailability('Guadiana', '2027-01-22');
  assert.equal(day.occupied, 0);
  assert.equal(day.blocked, 12);
  assert.equal(day.available, 96);
});
test('an empty calendar allows a 50-room quote on January 22', () => {
  storage({});
  const day = service.getDayAvailability('Guadiana', '2027-01-22');
  assert.equal(day.available, 108);
  assert.ok(day.available >= 50);
});
