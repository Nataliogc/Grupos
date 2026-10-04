const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/Presupuestos.jsx'), 'utf8');
const handler = source.slice(source.indexOf('      const handleApplyAverageStayTariff ='), source.indexOf('      const handleCopyFirstDay'));
test('average records the exact dates and nights alongside the quoted prices', () => {
 const dates = ['2026-11-06','2026-11-07','2026-11-08'];
 let state = { Hotel_Asignado:'Guadiana', 'Régimen':'HD', dailyConfig:{} };
 const prices = [69.2,79.1,61.1];
 const ctx = { formData:state, getCurrentStayDates:()=>dates, getRoomTypesForHotel:()=>['DUI'], getCapaSuiteTariffComparison:(h,d)=>({recommendedPricesByRoom:{DUI:prices[dates.indexOf(d)]}}), setFormData:fn=>{state=fn(state);}, alert:()=>{} };
 vm.createContext(ctx); vm.runInContext(handler+'\nhandleApplyAverageStayTariff(10);',ctx);
 assert.equal(state.averageStayCondition.nights,3);
 assert.equal(JSON.stringify(state.averageStayCondition.dates),JSON.stringify(dates));
 assert.equal(state.dailyConfig[dates[0]].prices.DUI,69.8);
 dates.pop();
 assert.equal(state.averageStayCondition.dates.length,3);
 assert.notEqual(JSON.stringify(dates),JSON.stringify(state.averageStayCondition.dates));
});
