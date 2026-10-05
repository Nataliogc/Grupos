const test=require('node:test');
const assert=require('node:assert/strict');
const {readSchedule,reconcileMealPlan}=require('../js/services/serviceOrderPlanService');
const format=date=>({'2026-10-10':'Sáb 10/10','2026-10-11':'Dom 11/10','2027-01-01':'Vie 01/01','2026-12-31':'Jue 31/12'}[date] || date);
const rows=[{dia:'Sáb 10/10',serv:'Almuerzo',pax:'34',menu:'Menú grupo',hora:'14:00'},
  {dia:'Sáb 10/10',serv:'Cena',pax:'17',menu:'Cena',hora:'21:00'},
  {dia:'Dom 11/10',serv:'Desayuno',pax:'17',hora:'08:00'}];
const schedule=[{fecha:'2026-10-10',jornada:'almuerzo',pax:17},{fecha:'2026-10-10',jornada:'cena',pax:17},{fecha:'2026-10-11',jornada:'almuerzo',pax:17}];
test('la orden toma cada comida de la programacion sin sumar la PC ni cargos explicitos',()=>{
 const plan=reconcileMealPlan(rows,schedule,format,'2026-10-10');
 assert.deepEqual(plan.map(r=>[r.dia,r.serv,r.pax]),[
  ['Sáb 10/10','Almuerzo','17'],['Sáb 10/10','Cena','17'],['Dom 11/10','Desayuno','17'],['Dom 11/10','Almuerzo','17']
 ]);
 assert.equal(plan[0].menu,'Menú grupo');assert.equal(plan[0].hora,'14:00');
 assert.deepEqual(reconcileMealPlan(plan,schedule,format,'2026-10-10'),plan);
});
test('dos almuerzos eliminan la cena de una orden anterior, conservando desayuno y otros servicios',()=>{
 const source=[...rows,{dia:'Dom 11/10',serv:'Traslado',pax:'17',menu:'Autobús',hora:'16:00'}];
 const plan=reconcileMealPlan(source,schedule.filter(s=>s.jornada==='almuerzo'),format,'2026-10-10');
 assert.equal(plan.some(r=>r.serv==='Cena'),false);
 assert.equal(plan.find(r=>r.serv==='Desayuno').pax,'17');
 assert.equal(plan.find(r=>r.serv==='Traslado').menu,'Autobús');
});
test('programacion vacia elimina comidas, y sin personalizacion se conserva la orden',()=>{
 assert.equal(readSchedule({}),null);
 assert.equal(readSchedule({MealSchedule_JSON:null}),null);
 assert.deepEqual(readSchedule({MealSchedule_JSON:'[]'}),[]);
 assert.equal(reconcileMealPlan(rows,[],format,'2026-10-10').length,1);
 assert.equal(reconcileMealPlan(rows,null,format,'2026-10-10'),rows);
});
test('ordena fechas al cambiar de año con una orden antigua sin fecha ISO',()=>{
 const plan=reconcileMealPlan([{dia:'Vie 01/01',serv:'Desayuno',pax:'17'}],[{fecha:'2026-12-31',jornada:'cena',pax:17}],format,'2026-12-31');
 assert.deepEqual(plan.map(r=>r.fecha),['2026-12-31','2027-01-01']);
});
