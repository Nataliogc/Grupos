const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/services/mesachefService');
const room = (date, qty, pax, regime) => ({ dateIn: date, nights: 1, qty, pax, regime });
const group = {
  Reserva: '213521', Entrada: '2027-02-01', Salida: '2027-02-04',
  'Nombre del Grupo': 'Prueba Grupo', 'Régimen': 'HA', Com_Estado_Interno: 'TENTATIVA',
  DailyDistribution_JSON: JSON.stringify({'2027-02-01': {regimen: 'PC', pax: 12}, '2027-02-02': {regimen: 'MP', pax: 4}}),
  RoomingList_JSON: JSON.stringify([
    room('2027-02-01', 1, 3, 'HA'), room('2027-02-01', 6, 2, 'HA'),
    room('2027-02-02', 1, 2, 'MP'), room('2027-02-02', 3, 1, 'MP'),
    room('2027-02-03', 6, 2, 'PC')
  ])
};
test('reproduce la ficha: HA no genera comidas, MP 5 pax, PC 12 pax', () => {
  const docs = service.prepareSalonDocuments(group);
  assert.deepEqual(docs.map(d => [d.fecha, d.detalles.jornada, d.detalles.pax_adultos]), [
    ['2027-02-02','cena',5], ['2027-02-03','almuerzo',12], ['2027-02-03','cena',12]
  ]);
  assert.ok(docs.every(d => d.estado === 'presupuesto'));
});
test('regímenes mixtos cuentan solo los comensales de cada comida', () => {
  const docs = service.prepareSalonDocuments({...group, RoomingList_JSON: JSON.stringify([
    room('2027-02-02', 2, 2, 'PC'), room('2027-02-02', 3, 1, 'MP'), room('2027-02-02', 5, 2, 'HA')
  ])});
  assert.deepEqual(docs.filter(d => d.fecha === '2027-02-02').map(d => d.detalles.pax_adultos), [4,7]);
});
test('guarda cambios, cancela servicios obsoletos y protege desvinculados', async () => {
  const data = new Map();
  const key = (collection,id) => collection+'/'+id;
  const ref = (collection,id) => ({key:key(collection,id)});
  const old = 'reservas_salones/nexus_213521_2027-02-01_almuerzo';
  data.set(old,{reservaId:'213521',estado:'presupuesto'});
  data.set('reservas_salones/manual',{reservaId:'213521',estado:'confirmada',desvinculado:true});
  global.window = {db:{
    collection: collection => ({
      doc: id => ref(collection,id),
      where: (field,op,value) => ({get: async () => {
        const docs = [...data].filter(([k,v]) => k.startsWith(collection+'/') && v[field] === value).map(([k,v]) => ({id:k.split('/')[1],ref:{key:k},data:()=>v}));
        return {forEach: fn => docs.forEach(fn)};
      }})
    }),
    batch: () => {
      const writes=[];
      return {set:(r,v)=>writes.push([r,v]),update:(r,v)=>writes.push([r,v]),commit:async()=>{ await new Promise(resolve => setTimeout(resolve, writes.some(([,v]) => v.estado === "confirmada") ? 25 : 0)); writes.forEach(([r,v])=>data.set(r.key,{...data.get(r.key),...v})); }};
    }
  }};
  try {
    assert.equal((await service.syncGroupToMesachef(group)).success,true);
    assert.equal(data.get(old).estado,'cancelada');
    assert.equal(data.get('mesachef_grupos/213521').totalServicios,3);
    const dinnerKey = 'reservas_salones/nexus_213521_2027-02-03_cena';
    data.set(dinnerKey, {...data.get(dinnerKey), salon:'Salón Guadiana', salonOverride:'Salón Guadiana'});
    await service.syncGroupToMesachef({...group, Com_Estado_Interno:'CONFIRMADO'});
    assert.equal(data.get(dinnerKey).salon, 'Salón Guadiana');
    assert.equal(data.get(dinnerKey).estado, 'confirmada');
    assert.equal(data.get(dinnerKey).desvinculado, undefined);
    assert.equal(data.get('reservas_salones/nexus_213521_2027-02-03_almuerzo').salon, 'Eventos Grupos Alarcos');
    const lunchKey = 'reservas_salones/nexus_213521_2027-02-03_almuerzo';
    data.set(lunchKey, {...data.get(lunchKey), salon:'Restaurante', salonOverride:'Restaurante'});
    await service.syncGroupToMesachef(group);
    assert.equal(data.get('reservas_restaurante/salon_nexus_213521_2027-02-03_almuerzo').pax, 12);
    // Una confirmación lenta no puede terminar después de la desestimación y reactivar servicios.
    const results = await Promise.all([
      service.syncGroupToMesachef({...group, Com_Estado_Interno:'CONFIRMADO'}),
      service.syncGroupToMesachef({...group, Com_Estado_Interno:'DESESTIMADO', Estado:'ANULADA'})
    ]);
    assert.ok(results.every(r=>r.success));
    assert.ok([...data].filter(([k])=>k.startsWith('reservas_salones/nexus_')).every(([,v])=>v.estado==='cancelada'));
    assert.equal(data.get('mesachef_grupos/213521').estado,'cancelada');
    assert.equal(data.get(dinnerKey).salon, 'Salón Guadiana');
    assert.equal(data.get('reservas_restaurante/salon_nexus_213521_2027-02-03_almuerzo').estado, 'cancelada');
    await service.syncGroupToMesachef({...group, Com_Estado_Interno:'DESESTIMADO', Estado:'ANULADA'});
    assert.ok([...data].filter(([k])=>k.startsWith('reservas_salones/nexus_')).every(([,v])=>v.estado==='cancelada'));
    // Reactivación explícita para comprobar después la retirada de todas las comidas.
    await service.syncGroupToMesachef(group);
    const noMeals = {...group, 'Régimen':'HA', DailyDistribution_JSON:'{}', RoomingList_JSON:JSON.stringify([room('2027-02-01',1,2,'HA')])};
    assert.equal((await service.syncGroupToMesachef(noMeals)).success,true);
    assert.equal(data.get('mesachef_grupos/213521').totalServicios,0);
    assert.ok([...data].filter(([k])=>k.startsWith('reservas_salones/nexus_')).every(([,v])=>v.estado==='cancelada'));
    assert.equal(data.get('reservas_salones/manual').estado,'confirmada');
  } finally { delete global.window; }
});

test('MP con almuerzo genera solo almuerzo con etiqueta MP', () => {
  const docs = service.prepareSalonDocuments({...group, RoomingList_JSON: JSON.stringify([
    {...room('2027-02-01', 1, 3, 'MP'), mpMeal:'almuerzo'},
    {...room('2027-02-01', 6, 2, 'MP'), mpMeal:'almuerzo'}
  ]), DailyDistribution_JSON:'{}'});
  assert.deepEqual(docs.map(d=>[d.fecha,d.detalles.jornada,d.detalles.pax_adultos,d.servicios[0].concepto]),[
    ['2027-02-01','almuerzo',15,'Almuerzo Grupo MP']
  ]);
});
test('MP permite distintos turnos el mismo día y PC conserva ambas comidas', () => {
  const docs = service.prepareSalonDocuments({...group, DailyDistribution_JSON:'{}',RoomingList_JSON:JSON.stringify([
    {...room('2027-02-01',1,3,'MP'),mpMeal:'almuerzo'}, room('2027-02-01',6,2,'MP'), room('2027-02-01',1,2,'PC')
  ])});
  assert.deepEqual(docs.map(d=>[d.detalles.jornada,d.detalles.pax_adultos]),[['almuerzo',5],['cena',14]]);
});
test('MP de cabecera o distribución admite almuerzo sin desglose de habitaciones', () => {
  for (const extra of [{mpMeal:'almuerzo'}, {DailyDistribution_JSON:JSON.stringify({'2027-02-01':{regimen:'MP',mpMeal:'almuerzo',pax:15}})}]) {
    const docs = service.prepareSalonDocuments({...group, Salida:group.Entrada, 'Régimen':'MP','Pax.':15,RoomingList_JSON:'[]',DailyDistribution_JSON:'{}',...extra});
    assert.deepEqual(docs.map(d=>[d.detalles.jornada,d.detalles.pax_adultos]),[['almuerzo',15]]);
  }
});
