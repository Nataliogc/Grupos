const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/services/capaSuitePricingService');
const rooms = ['DOBLE DE USO INDIVIDUAL','DOBLE','DOBLE + SUPLETORIA','CUÁDRUPLE'];
const catalogue = { HA:[62,62,82,101], HD:[70,78,106,125], MP:[89,116,163,201], PC:[108,154,220,258] };
const grid = Object.fromEntries(Object.entries(catalogue).map(([b, values])=>[b,Object.fromEntries(rooms.map((r,i)=>[r,values[i]]))]));
function verify(pvp,discount,expected) {
 global.localStorage = { getItem:k=>k==='revenue_data_v2'?JSON.stringify({'2026-11-02':{hotels:{Guadiana:{price:pvp}}}}):null };
 for (const [board, values] of Object.entries(expected)) {
  const result = service.getTariffComparison('Guadiana','2026-11-02',board,discount,grid).recommendedPricesByRoom;
  rooms.forEach((room,i)=>assert.equal(result[room],values[i],board+' '+room));
 }
}
test('matches all sixteen values in the supplied 68 EUR / 15% table',()=>verify(68,15,{
 HA:[57.8,57.8,75.7,92.6], HD:[65.8,73.8,99.7,116.6], MP:[84.8,111.8,156.7,192.6], PC:[103.8,149.8,213.7,249.6]
}));
test('also matches the earlier 231 EUR / 5% table when prices rise above the catalogue',()=>verify(231,5,{
 HA:[219.45,219.45,318.18,415.9], HD:[227.45,235.45,342.18,439.9], MP:[246.45,273.45,399.18,515.9], PC:[265.45,311.45,456.18,572.9]
}));
