const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/services/capaSuitePricingService');
const grid = {
 HA: { DOBLE: 62, 'DOBLE DE USO INDIVIDUAL': 62, 'DOBLE + SUPLETORIA': 82, 'CUÁDRUPLE': 101 },
 HD: { DOBLE: 78, 'DOBLE DE USO INDIVIDUAL': 70, 'DOBLE + SUPLETORIA': 106, 'CUÁDRUPLE': 125 },
 MP: { DOBLE: 116, 'DOBLE DE USO INDIVIDUAL': 89, 'DOBLE + SUPLETORIA': 163, 'CUÁDRUPLE': 201 },
 PC: { DOBLE: 154, 'DOBLE DE USO INDIVIDUAL': 108, 'DOBLE + SUPLETORIA': 220, 'CUÁDRUPLE': 258 }
};
function compare(discount, board, catalogue = grid, hotel = 'Guadiana', date = '2026-10-10') {
 global.localStorage = { getItem: k => k === 'revenue_data_v2' ? JSON.stringify({ [date]: { hotels: { [hotel]: { price: 231 } } } }) : null };
 return service.getTariffComparison(hotel, date, board, discount, catalogue).recommendedPricesByRoom;
}
test('5% discounts double accommodation only and preserves fixed catalogue supplements', () => {
 assert.equal(compare(5, 'HA')['DOBLE + SUPLETORIA'], 239.45);
 assert.equal(compare(5, 'HA')['CUÁDRUPLE'], 258.45);
 assert.equal(compare(5, 'HD')['DOBLE DE USO INDIVIDUAL'], 227.45);
 assert.equal(compare(5, 'HD').DOBLE, 235.45);
 assert.equal(compare(5, 'MP')['DOBLE + SUPLETORIA'], 320.45);
 assert.equal(compare(5, 'PC')['CUÁDRUPLE'], 415.45);
});
test('supplements remain fixed as commercial discount changes', () => {
 const zero = compare(0, 'PC');
 const twenty = compare(20, 'PC');
 for (const room of ['DOBLE', 'DOBLE DE USO INDIVIDUAL', 'DOBLE + SUPLETORIA', 'CUÁDRUPLE']) {
   assert.ok(Math.abs(zero[room] - twenty[room] - 46.2) < 0.001);
 }
});
test('uses supplied hotel/year catalogue rather than default ratios', () => {
 const yearly = { HA: { DOBLE: 65, 'DOBLE + SUPLETORIA': 86.5 }, HD: { DOBLE: 82, 'DOBLE + SUPLETORIA': 112 } };
 assert.equal(compare(5, 'HD', yearly, 'Guadiana', '2027-10-10')['DOBLE + SUPLETORIA'], 266.45);
 const cumbria = { HA: { DOBLE: 60, 'DOBLE + SUPLETORIA': 80 }, HD: { DOBLE: 76, 'DOBLE + SUPLETORIA': 104 } };
 assert.equal(compare(5, 'HD', cumbria, 'Cumbria')['DOBLE + SUPLETORIA'], 263.45);
});
