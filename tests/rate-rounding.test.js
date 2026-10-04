const {test}=require('node:test');
const assert=require('node:assert/strict');
const service=require('../js/services/capaSuitePricingService');
test('commercial prices round to the nearest five cents',()=>{
 for(const [input,expected] of [[171.33,171.35],[87.33,87.35],[112.83,112.85],[108.1,108.1],[74.15,74.15],[171.31,171.3]]) assert.equal(service.roundRate(input),expected);
});
