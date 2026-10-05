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

test('el desglose de tres días prevalece sobre la salida antigua de cabecera', () => {
  const docs = service.prepareSalonDocuments({...group, Salida:'2027-02-02'});
  assert.deepEqual(docs.map(d => [d.fecha,d.detalles.jornada,d.detalles.pax_adultos]), [
    ['2027-02-02','cena',5], ['2027-02-03','almuerzo',12], ['2027-02-03','cena',12]
  ]);
});

test('las líneas determinan las comidas aunque la cabecera tenga otras fechas, pax y régimen', () => {
  const docs = service.prepareSalonDocuments({...group, Entrada:'2026-01-01', Salida:'2028-12-31', 'Pax.':999, 'Régimen':'PC'});
  assert.deepEqual(docs.map(d => [d.fecha,d.detalles.jornada,d.detalles.pax_adultos]), [
    ['2027-02-02','cena',5], ['2027-02-03','almuerzo',12], ['2027-02-03','cena',12]
  ]);
});

test('no inventa comidas de cabecera en huecos o líneas sin régimen', () => {
  const docs = service.prepareSalonDocuments({...group, 'Régimen':'PC', RoomingList_JSON:JSON.stringify([
    room('2027-02-01',1,2,'MP'), room('2027-02-03',1,2,'')
  ])});
  assert.deepEqual(docs.map(d=>[d.fecha,d.detalles.jornada]), [['2027-02-01','cena']]);
});
test('regímenes mixtos cuentan solo los comensales de cada comida', () => {
  const docs = service.prepareSalonDocuments({...group, RoomingList_JSON: JSON.stringify([
    room('2027-02-02', 2, 2, 'PC'), room('2027-02-02', 3, 1, 'MP'), room('2027-02-02', 5, 2, 'HA')
  ])});
  assert.deepEqual(docs.filter(d => d.fecha === '2027-02-02').map(d => d.detalles.pax_adultos), [4,7]);
});
test('guarda cambios, cancela servicios obsoletos y protege desvinculados', async () => {
  const data = new Map();
  let beforeCommit = null;
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
      return {set:(r,v)=>writes.push([r,v]),update:(r,v)=>writes.push([r,v]),commit:async()=>{ await new Promise(resolve => setTimeout(resolve, writes.some(([,v]) => v.estado === "confirmada") ? 25 : 0)); if (beforeCommit) { const hook = beforeCommit; beforeCommit = null; hook(); } writes.forEach(([r,v])=>data.set(r.key,{...data.get(r.key),...v})); }};
    }
  }};
  try {
    assert.equal((await service.syncGroupToMesachef(group)).success,true);
    assert.equal(data.get(old).estado,'cancelada');
    assert.equal(data.get('mesachef_grupos/213521').totalServicios,3);
    const custom = {...group, MealSchedule_JSON:JSON.stringify([
      {fecha:'2027-02-02',jornada:'almuerzo',pax:5},
      {fecha:'2027-02-04',jornada:'almuerzo',pax:12}
    ])};
    assert.equal((await service.syncGroupToMesachef(custom)).success,true);
    assert.equal(data.get('reservas_salones/nexus_213521_2027-02-02_cena').estado,'cancelada');
    assert.equal(data.get('reservas_salones/nexus_213521_2027-02-04_almuerzo').detalles.pax_adultos,12);
    assert.equal(data.get('reservas_salones/manual').estado,'confirmada');
    await service.syncGroupToMesachef({...custom, MealSchedule_JSON:'[]'});
    assert.equal(data.get('mesachef_grupos/213521').totalServicios,0);
    await service.syncGroupToMesachef(group);

    const dinnerKey = 'reservas_salones/nexus_213521_2027-02-03_cena';
    data.set(dinnerKey, {...data.get(dinnerKey), salon:'Salón Guadiana', salonOverride:'Salón Guadiana'});
    await service.syncGroupToMesachef({...group, Com_Estado_Interno:'CONFIRMADO'});
    assert.equal(data.get(dinnerKey).salon, 'Salón Guadiana');
    assert.equal(data.get(dinnerKey).estado, 'confirmada');
    assert.equal(data.get(dinnerKey).desvinculado, undefined);
    assert.equal(data.get('reservas_salones/nexus_213521_2027-02-03_almuerzo').salon, 'Eventos Grupos Alarcos');
    // A legacy room move without metadata is respected too.
    const legacyKey = 'reservas_salones/nexus_213521_2027-02-02_cena';
    data.set(legacyKey, {...data.get(legacyKey), salon:'Puerta del Carmen'});
    await service.syncGroupToMesachef(group);
    assert.equal(data.get(legacyKey).salon, 'Puerta del Carmen');
    // Simulate MesaChef changing location after Groups has read its snapshot.
    beforeCommit = () => data.set(legacyKey, {...data.get(legacyKey), salon:'Puerta de Alarcos', salonOverride:'Puerta de Alarcos'});
    await service.syncGroupToMesachef({...group, Com_Estado_Interno:'CONFIRMADO'});
    assert.equal(data.get(legacyKey).salon, 'Puerta de Alarcos');
    const lunchKey = 'reservas_salones/nexus_213521_2027-02-03_almuerzo';
    data.set(lunchKey, {...data.get(lunchKey), salon:'Restaurante', salonOverride:'Restaurante'});
    await service.syncGroupToMesachef(group);
    assert.equal(data.get('reservas_restaurante/salon_nexus_213521_2027-02-03_almuerzo').pax, 12);
    await service.syncGroupToMesachef({...group, Hotel_Asignado:'Cumbria'});
    assert.equal(data.get(dinnerKey).hotel, 'Cumbria');
    assert.equal(data.get(dinnerKey).salon, 'Eventos Restaurante');
    assert.equal(data.get(dinnerKey).salonOverride, null);
    assert.equal(data.get(legacyKey).salon, 'Eventos Restaurante');
    assert.equal(data.get('reservas_restaurante/salon_nexus_213521_2027-02-03_almuerzo').estado, 'cancelada');
    await service.syncGroupToMesachef(group);
    assert.equal(data.get(dinnerKey).salon, 'Eventos Grupos Alarcos');
    // Reapply the local locations for the cancellation tests below.
    data.set(dinnerKey, {...data.get(dinnerKey), salon:'Salón Guadiana', salonOverride:'Salón Guadiana'});
    data.set(lunchKey, {...data.get(lunchKey), salon:'Restaurante', salonOverride:'Restaurante'});
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


test('PC de una noche permite almuerzos de entrada y salida sin cena', () => {
  const docs = service.prepareSalonDocuments({...group, Entrada:'2026-10-10', Salida:'2026-10-11', DailyDistribution_JSON:'{}', RoomingList_JSON:JSON.stringify([
    {...room('2026-10-10',1,1,'PC'),pcMeal:'dos_almuerzos'},
    {...room('2026-10-10',5,2,'PC'),pcMeal:'dos_almuerzos'},
    {...room('2026-10-10',2,3,'PC'),pcMeal:'dos_almuerzos'}
  ])});
  assert.deepEqual(docs.map(d=>[d.fecha,d.detalles.jornada,d.detalles.pax_adultos]), [
    ['2026-10-10','almuerzo',17],['2026-10-11','almuerzo',17]
  ]);
  assert.ok(docs.every(d=>d.servicios[0].concepto === 'Almuerzo Grupo PC'));
});

test('PC con dos almuerzos respeta las otras habitaciones y no añade cena en salida', () => {
  const docs = service.prepareSalonDocuments({...group, DailyDistribution_JSON:'{}', RoomingList_JSON:JSON.stringify([
    {...room('2027-02-01',1,3,'PC'),pcMeal:'dos_almuerzos'},
    room('2027-02-01',1,2,'PC'), room('2027-02-02',1,2,'HA')
  ])});
  assert.deepEqual(docs.map(d=>[d.fecha,d.detalles.jornada,d.detalles.pax_adultos]), [
    ['2027-02-01','almuerzo',5],['2027-02-01','cena',2],['2027-02-02','almuerzo',3]
  ]);
});


test('programacion personalizada mueve cena a almuerzo de salida sin duplicar comidas',()=>{
  const record={...group, Entrada:'2026-10-10',Salida:'2026-10-11',DailyDistribution_JSON:'{}',RoomingList_JSON:JSON.stringify([room('2026-10-10',8,2,'PC')]),MealSchedule_JSON:JSON.stringify([
    {fecha:'2026-10-10',jornada:'almuerzo',pax:16},{fecha:'2026-10-11',jornada:'almuerzo',pax:16}
  ])};
  assert.deepEqual(service.prepareSalonDocuments(record).map(d=>[d.fecha,d.detalles.jornada,d.detalles.pax_adultos]),[
    ['2026-10-10','almuerzo',16],['2026-10-11','almuerzo',16]
  ]);
  assert.equal(service.getAutomaticMealDocuments(record)[1].detalles.jornada,'cena');
  assert.equal(service.prepareSalonDocuments({...record,MealSchedule_JSON:'[]'}).length,0);
  assert.equal(service.prepareSalonDocuments({...record,MealSchedule_JSON:null})[1].detalles.jornada,'cena');
});
test('programacion rechaza filas duplicadas, turnos y comensales invalidos',()=>{
  const row={fecha:'2027-02-02',jornada:'almuerzo',pax:10};
  for (const rows of [[row,row],[{...row,pax:0}],[{...row,pax:1.5}],[{...row,jornada:'desayuno'}],[{...row,fecha:''}]]) {
    assert.throws(()=>service.prepareSalonDocuments({...group,MealSchedule_JSON:JSON.stringify(rows)}));
  }
  assert.throws(()=>service.getMealSchedule({...group,MealSchedule_JSON:'malformed'}));
});
test('comidas por encima de las incluidas se marcan como extras pendientes de valorar',()=>{
  const docs=service.prepareSalonDocuments({...group,MealSchedule_JSON:JSON.stringify([{fecha:'2027-02-04',jornada:'cena',pax:35}])});
  assert.equal(docs[0].detalles.pax_extra,6);
  assert.equal(docs[0].detalles.incluido,false);
  assert.equal(docs[0].servicios[0].total,0);
});
