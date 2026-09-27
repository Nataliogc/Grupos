const test = require('node:test');
const assert = require('node:assert/strict');
const {confirmBudget} = require('../src/services/splitSeriesReservation');
const mesa = require('../js/services/mesachefService');
test('desestimar y confirmar devuelve los datos persistidos para refrescar la ficha', async () => {
  let record = {Reserva:'213521', Com_Estado_Interno:'DESESTIMADO', Estado:'ANULADA', _diff:'cancelled', isCancelled:true};
  const db = {collection:()=>({doc:()=>({get:async()=>({exists:true,data:()=>record}),update:async updates=>{record={...record,...updates};}})})};
  const confirmed = await confirmBudget({budgetId:'213521',requestedStatus:'CONFIRMADO',db});
  const ficha = {...record,...confirmed.updates};
  assert.equal(ficha.Com_Estado_Interno,'CONFIRMADO');
  assert.equal(ficha.Estado,'Confirmado');
  assert.equal(ficha._diff,null);
  assert.equal(ficha.isCancelled,false);
  assert.equal(mesa.resolveMesachefStatus(ficha),'confirmada');
  const cancelled = await confirmBudget({budgetId:'213521',requestedStatus:'CANCELADO',db});
  assert.equal(cancelled.updates.Com_Estado_Interno,'CANCELADO');
  assert.equal(cancelled.updates.Estado,'ANULADA');
  assert.equal(mesa.resolveMesachefStatus({...ficha,...cancelled.updates}),'cancelada');
  assert.equal(record.Com_Estado_Interno,'CANCELADO');
});

test('fase comercial a Tentativa asigna reserva; Confirmado conserva el localizador',async()=>{
  const records=new Map([['PRES-1',{Reserva:'PRES-1',isBudget:true,Com_Estado_Interno:'PENDIENTE',Estado:'Presupuesto'}]]);
  const ref=id=>({id,get:async()=>({id,exists:records.has(id),data:()=>records.get(id)}),update:async v=>records.set(id,{...records.get(id),...v})});
  const db={collection:()=>({doc:ref}),batch:()=>{const writes=[];return {set:(r,v)=>writes.push(()=>records.set(r.id,v)),update:(r,v)=>writes.push(()=>records.set(r.id,{...records.get(r.id),...v})),commit:async()=>writes.forEach(f=>f())}}};
  await assert.rejects(confirmBudget({budgetId:'PRES-1',requestedStatus:'TENTATIVA',db}),/asignar un número/);
  const result=await confirmBudget({budgetId:'PRES-1',requestedStatus:'TENTATIVA',manualReservationId:'12345',db});
  assert.equal(result.newReservationId,'12345');
  assert.equal(records.get('12345').Com_Estado_Interno,'TENTATIVA');
  assert.equal(records.get('12345').isBudget,false);
  await confirmBudget({budgetId:'12345',requestedStatus:'CONFIRMADO',db});
  assert.equal(records.get('12345').Com_Estado_Interno,'CONFIRMADO');
  assert.equal(records.size,2);
  await assert.rejects(confirmBudget({budgetId:'12345',requestedStatus:'DESESTIMADO',db}),/fase actual/);
  await confirmBudget({budgetId:'12345',requestedStatus:'CANCELADO',db});
  assert.equal(records.get('12345').Estado,'ANULADA');
});
test('Excel: Grupo es confirmado y Grupo tanteo es tentativa en Mesa',()=>{
  assert.equal(mesa.resolveMesachefStatus({Reserva:'12345','Segment.':'GRUPO'}),'confirmada');
  assert.equal(mesa.resolveMesachefStatus({Reserva:'12345','Segment.':'GRUPO TANTEO'}),'presupuesto');
});
