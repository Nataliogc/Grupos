const {test}=require('node:test');const assert=require('node:assert/strict');const service=require('../js/services/capaSuitePricingService');
test('daily events include start and end nights and exclude unrelated dates',()=>{
 global.localStorage={getItem:key=>key==='custom_events'?JSON.stringify([{start:'2026-11-06',end:'2026-11-08',desc:'Congreso'},{start:'2026-11-07',desc:'Concierto'}]):null};
 assert.equal(service.getDayEvents('2026-11-06').events.length,1);
 assert.equal(service.getDayEvents('2026-11-07').events.length,2);
 assert.equal(service.getDayEvents('2026-11-08').events.length,1);
 assert.equal(service.getDayEvents('2026-11-09').events.length,0);
 assert.equal(service.getDayEvents('2026-11-09').known,true);
});
test('missing event data is distinguished from an empty synchronized calendar',()=>{
 global.localStorage={getItem:()=>null};assert.equal(service.getDayEvents('2026-11-06').known,false);
 global.localStorage={getItem:()=> '[]'};assert.equal(service.getDayEvents('2026-11-06').known,true);
});
