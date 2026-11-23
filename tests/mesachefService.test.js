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
    const withOrder={...group,ServiceOrder_JSON:JSON.stringify({savedAt:'revision-1',grupo:'Grupo',notasText:'Notas',planRows:[{fecha:'2027-02-03',dia:'Mié 03/02',serv:'Cena',menu:'Menú 1',hora:'20:30'}],incidenciaRows:[]})};
    await service.syncGroupToMesachef(withOrder);
    assert.equal(data.get(dinnerKey).ordenServicio.planServicios[0].menu,'Menú 1');
    data.set(dinnerKey,{...data.get(dinnerKey),ordenServicio:{...data.get(dinnerKey).ordenServicio,notas:'Cambio en sala'}});
    await service.syncGroupToMesachef(withOrder);
    assert.equal(data.get(dinnerKey).ordenServicio.notas,'Cambio en sala');
    await service.syncGroupToMesachef({...withOrder,ServiceOrder_JSON:JSON.stringify({...JSON.parse(withOrder.ServiceOrder_JSON),savedAt:'revision-2',notasText:'Notas nuevas'})});
    assert.equal(data.get(dinnerKey).ordenServicio.notas,'Notas nuevas');

    data.set(dinnerKey, {...data.get(dinnerKey), salon:'Salón Guadiana', salonOverride:'Salón Guadiana'});
    await service.syncGroupToMesachef({...group, Com_Estado_Interno:'CONFIRMADO'});
    assert.equal(data.get(dinnerKey).salon, 'Salón Guadiana');
    assert.equal(data.get(dinnerKey).estado, 'confirmada');
    assert.equal(data.get(dinnerKey).desvinculado, undefined);
    assert.equal(data.get('reservas_salones/nexus_213521_2027-02-03_almuerzo').salon, 'Eventos Grupos Alarcos');
    // Adding a description preserves the original meal and its room.
    await service.syncGroupToMesachef({...group, MealSchedule_JSON:JSON.stringify([
      {fecha:'2027-02-03',jornada:'cena',pax:12,nombre:'Buffet',hora:'17:30'}
    ])});
    assert.equal(data.get(dinnerKey).salon, 'Salón Guadiana');
    assert.equal(data.get(dinnerKey).estado, 'presupuesto');
    assert.equal(data.get(dinnerKey).servicios[0].hora, '17:30');
    assert.equal(data.has('reservas_salones/nexus_213521_2027-02-03_cena_buffet'), false);
    await service.syncGroupToMesachef(group);
    const moved = {...group, MealSchedule_JSON:JSON.stringify([{fecha:'2027-02-03',jornada:'cena',pax:12,salon:'Mercurio'}])};
    await service.syncGroupToMesachef(moved);
    assert.equal(data.get(dinnerKey).salon,'Mercurio');
    assert.equal(data.get(dinnerKey).salonOverride,'Mercurio');
    data.set(dinnerKey,{...data.get(dinnerKey),salon:'Otro',salonOverride:'Otro'});
    await service.syncGroupToMesachef(moved);
    assert.equal(data.get(dinnerKey).salonOverride,'Otro');
    await service.syncGroupToMesachef(group);
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

    // Prueba de getActualMesaChefServices y respeto a cambios de fecha desde MesaChef
    data.set('reservas_salones/nexus_213521_2027-02-05_almuerzo', {
      reservaId: '213521',
      fecha: '2027-02-05',
      estado: 'confirmada',
      detalles: { jornada: 'almuerzo', pax_adultos: 15, hora: '14:00' },
      salon: 'Eventos Restaurante'
    });
    const actualServices = await service.getActualMesaChefServices('213521');
    assert.equal(actualServices.length, 1); // el del 2027-02-05 (manual no tiene fecha/jornada)
    const feb5 = actualServices.find(s => s.fecha === '2027-02-05');
    assert.ok(feb5);
    assert.equal(feb5.jornada, 'almuerzo');
    assert.equal(feb5.pax, 15);
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
  for (const rows of [[row,row],[{...row,pax:0}],[{...row,pax:1.5}],[{...row,jornada:'turno_invalido'}],[{...row,fecha:''}]]) {
    assert.throws(()=>service.prepareSalonDocuments({...group,MealSchedule_JSON:JSON.stringify(rows)}));
  }
  assert.throws(()=>service.getMealSchedule({...group,MealSchedule_JSON:'malformed'}));
});
test('programacion ordena automaticamente las comidas por fecha y turno',()=>{
  const unordered = [
    { fecha: '2026-11-12', jornada: 'almuerzo', pax: 37 },
    { fecha: '2026-11-10', jornada: 'cena', pax: 37 },
    { fecha: '2026-11-11', jornada: 'cena', pax: 37 },
    { fecha: '2026-11-11', jornada: 'almuerzo', pax: 37 }
  ];
  const sorted = service.getMealSchedule({ ...group, MealSchedule_JSON: JSON.stringify(unordered) });
  assert.deepEqual(sorted.map(r => [r.fecha, r.jornada]), [
    ['2026-11-10', 'cena'],
    ['2026-11-11', 'almuerzo'],
    ['2026-11-11', 'cena'],
    ['2026-11-12', 'almuerzo']
  ]);
});
test('programacion admite servicios adicionales (desayuno, merienda, coffee_break, especial) hacia MesaChef', () => {
  const sched = [
    { fecha: '2027-02-02', jornada: 'desayuno', pax: 20, hora: '08:30' },
    { fecha: '2027-02-02', jornada: 'almuerzo', pax: 20, hora: '14:00' },
    { fecha: '2027-02-02', jornada: 'merienda', pax: 15, hora: '17:30' },
    { fecha: '2027-02-02', jornada: 'especial', nombre: 'Cóctel bienvenida', pax: 25, hora: '20:30' }
  ];
  const docs = service.prepareSalonDocuments({ ...group, MealSchedule_JSON: JSON.stringify(sched) });
  assert.equal(docs.length, 4);
  assert.deepEqual(docs.map(d => [d.detalles.jornada, d.detalles.pax_adultos, d.detalles.hora]), [
    ['desayuno', 20, '08:30'],
    ['almuerzo', 20, '14:00'],
    ['merienda', 15, '17:30'],
    ['especial', 25, '20:30']
  ]);
  assert.equal(docs[0].servicios[0].concepto, 'Desayuno Grupo (programado)');
  assert.equal(docs[1].servicios[0].concepto, 'Almuerzo Grupo (programado)');
  assert.equal(docs[2].servicios[0].concepto, 'Merienda Grupo (programado)');
  assert.equal(docs[3].servicios[0].concepto, 'Cóctel bienvenida Grupo (programado)');
  assert.ok(docs[0].id.includes('_desayuno'));
  assert.ok(docs[1].id.includes('_almuerzo'));
  assert.ok(docs[2].id.includes('_merienda'));
  assert.ok(docs[3].id.includes('_especial'));
});
test('comidas por encima de las incluidas se marcan como extras pendientes de valorar',()=>{
  const docs=service.prepareSalonDocuments({...group,MealSchedule_JSON:JSON.stringify([{fecha:'2027-02-04',jornada:'cena',pax:35}])});
  assert.equal(docs[0].detalles.pax_extra,6);
  assert.equal(docs[0].detalles.incluido,false);
  assert.equal(docs[0].servicios[0].total,0);
});

test('conserva los comensales personalizados aunque cambie la ocupación del grupo', () => {
  const customSched = [
    { fecha: '2026-11-20', jornada: 'cena', pax: 62 },
    { fecha: '2026-11-22', jornada: 'almuerzo', pax: 62 }
  ];
  const group66 = {
    ...group,
    Entrada: '2026-11-20',
    Salida: '2026-11-22',
    totalPax: 66,
    'Pax.': '66',
    RoomingList_JSON: JSON.stringify([
      { dateIn: '2026-11-20', qty: 6, pax: 1, type: 'INDIVIDUAL', regime: 'MP' },
      { dateIn: '2026-11-20', qty: 30, pax: 2, type: 'DOBLE', regime: 'MP' }
    ])
  };
  const synced = service.syncMealSchedulePax(customSched, group66);
  assert.deepEqual(synced.map(r => r.pax), [62, 62]);
});


test('cada orden de MesaChef importa solo menu, hora e incidencias de su fecha y comida',()=>{
 const record={...group,Entrada:'2026-10-10',Salida:'2026-10-11',RoomingList_JSON:JSON.stringify([room('2026-10-10',1,17,'PC')]),MealSchedule_JSON:JSON.stringify([{fecha:'2026-10-10',jornada:'almuerzo',pax:17},{fecha:'2026-10-11',jornada:'almuerzo',pax:17}]),ServiceOrder_JSON:JSON.stringify({
  savedAt:'2026-10-05T19:00:00Z',grupo:'INES FRONTON',notasText:'Llegan en autobús. Preparar agua.',
  planRows:[{fecha:'2026-10-10',dia:'Sáb 10/10',serv:'Almuerzo',pax:'34',menu:'Menú A',hora:'14:30 h'},{fecha:'2026-10-11',dia:'Dom 11/10',serv:'Almuerzo',pax:'17',menu:'Menú B',hora:'13:15'}],
  incidenciaRows:[{tipo:'Celíaco',numPax:'1',detalle:'Sin gluten',serv:'Almuerzo'},{tipo:'Vegetariano',numPax:'2',detalle:'Sin carne',serv:'Cena'},{tipo:'Alergia',numPax:'1',detalle:'Sin frutos secos',serv:'Todos'},{tipo:'---',numPax:'---',detalle:'---',serv:'---'}]
 })};
 const docs=service.prepareSalonDocuments(record);
 assert.deepEqual(docs.map(d=>[d.detalles.hora,d.ordenServicio.planServicios[0].menu,d.ordenServicio.planServicios[0].pax]),[['14:30','Menú A','17'],['13:15','Menú B','17']]);
 assert.ok(docs.every(d=>d.ordenServicio.incidencias.length===2));
 assert.equal(docs[0].ordenServicio.notas,'Llegan en autobús. Preparar agua.');
 assert.equal(docs[1].servicios[0].hora,'13:15');
});

test('si el grupo no tiene hora programada no pasa hora y pone ---, solo pasa hora si esta registrada en grupos',()=>{
  // 1. Grupo estándar sin horas registradas: todas las comidas llevan '---'
  const docsDefault = service.prepareSalonDocuments(group);
  assert.ok(docsDefault.length > 0);
  assert.ok(docsDefault.every(d => d.detalles.hora === '---'), 'Todas las comidas deben tener hora "---"');
  assert.ok(docsDefault.every(d => d.servicios[0].hora === '---'), 'Todos los servicios deben tener hora "---"');

  // 2. Grupo con orden de servicio pero sin hora válida (placeholder '___:___ h' o vacía): pone '---'
  const withBlankOrder = {
    ...group,
    ServiceOrder_JSON: JSON.stringify({
      savedAt: 'rev-blank',
      planRows: [
        { fecha: '2027-02-02', serv: 'Cena', hora: '___:___ h' },
        { fecha: '2027-02-03', serv: 'Almuerzo', hora: '' },
        { fecha: '2027-02-03', serv: 'Cena', hora: 'PENDIENTE' }
      ]
    })
  };
  const docsBlank = service.prepareSalonDocuments(withBlankOrder);
  assert.ok(docsBlank.every(d => d.detalles.hora === '---'));
  assert.ok(docsBlank.every(d => d.servicios[0].hora === '---'));
  assert.ok(docsBlank.every(d => d.ordenServicio.planServicios[0].hora === '---'));

  // 3. Grupo con hora registrada en Orden de Servicio: se pone la hora registrada
  const withRegisteredHour = {
    ...group,
    ServiceOrder_JSON: JSON.stringify({
      savedAt: 'rev-hora',
      planRows: [
        { fecha: '2027-02-02', serv: 'Cena', hora: '21:30' },
        { fecha: '2027-02-03', serv: 'Almuerzo', hora: '14:15 h' }
      ]
    })
  };
  const docsWithHour = service.prepareSalonDocuments(withRegisteredHour);
  const cena02 = docsWithHour.find(d => d.fecha === '2027-02-02' && d.detalles.jornada === 'cena');
  const lunch03 = docsWithHour.find(d => d.fecha === '2027-02-03' && d.detalles.jornada === 'almuerzo');
  const cena03 = docsWithHour.find(d => d.fecha === '2027-02-03' && d.detalles.jornada === 'cena');
  assert.equal(cena02.detalles.hora, '21:30');
  assert.equal(cena02.servicios[0].hora, '21:30');
  assert.equal(lunch03.detalles.hora, '14:15');
  assert.equal(lunch03.servicios[0].hora, '14:15');
  assert.equal(cena03.detalles.hora, '---'); // Esta cena no tenía hora registrada

  // 4. Grupo con hora registrada en RoomingList_JSON o MealSchedule_JSON
  const withRoomingHour = {
    ...group,
    RoomingList_JSON: JSON.stringify([
      { dateIn: '2027-02-02', nights: 1, qty: 1, pax: 2, regime: 'MP', hora: '21:00' },
      { dateIn: '2027-02-03', nights: 1, qty: 1, pax: 2, regime: 'PC' }
    ])
  };
  const docsRooming = service.prepareSalonDocuments(withRoomingHour);
  const rCena02 = docsRooming.find(d => d.fecha === '2027-02-02' && d.detalles.jornada === 'cena');
  const rCena03 = docsRooming.find(d => d.fecha === '2027-02-03' && d.detalles.jornada === 'cena');
  assert.equal(rCena02.detalles.hora, '21:00');
  assert.equal(rCena03.detalles.hora, '---');

  // 5. extractRegisteredHour helper unit testing
  assert.equal(service.extractRegisteredHour('21:00'), '21:00');
  assert.equal(service.extractRegisteredHour('14:30 h'), '14:30');
  assert.equal(service.extractRegisteredHour('9:15'), '09:15');
  assert.equal(service.extractRegisteredHour('___:___ h'), null);
  assert.equal(service.extractRegisteredHour('---'), null);
  assert.equal(service.extractRegisteredHour(''), null);
  assert.equal(service.extractRegisteredHour(null), null);
  assert.equal(service.extractRegisteredHour('PENDIENTE'), null);
});


 test('comida y merienda mantienen cantidades independientes; sala y fecha desconocida no se inventan', () => {
  const record = { totalPax:10, RoomingList_JSON:JSON.stringify([
    {isService:true,type:'COMIDA PREPARTIDO',qty:34,dateIn:'2027-11-05'},
    {isService:true,type:'MERIENDA DE PARTIDO',qty:25,dateIn:'2027-11-05'},
    {isService:true,type:'SALA CHARLA (GRATUIDAD)',qty:1,dateIn:'2027-11-05'}
  ])};
  const rows = [
    {fecha:'2027-11-05',jornada:'almuerzo',pax:10},
    {fecha:'2027-11-05',jornada:'merienda',pax:10},
    {fecha:'2027-11-05',jornada:'sala',pax:34},
    {fecha:'2027-11-04',jornada:'merienda',pax:25}
  ];
  assert.deepEqual(service.syncMealSchedulePax(rows,record).map(r=>r.pax),[34,25,34,25]);
  assert.equal(service.getServicePaxForSchedule(record,rows[2]),null);
  assert.equal(service.getServicePaxForSchedule(record,rows[3]),null);
  assert.equal(rows[0].pax,10);
 });

test('adaptMealScheduleToRecord adapta la programación existente al cambiar el régimen a PC', () => {
  const existingSchedule = [
    { fecha: '2026-11-20', jornada: 'cena', pax: 62, salon: 'Eventos Restaurante' },
    { fecha: '2026-11-22', jornada: 'almuerzo', pax: 62, salon: 'Eventos Restaurante' }
  ];
  const groupPc = {
    ...group,
    Entrada: '2026-11-20',
    Salida: '2026-11-22',
    Hotel_Asignado: 'CUMBRIA SPA&HOTEL',
    totalPax: 66,
    'Pax.': '66',
    'Régimen': 'PC',
    RoomingList_JSON: JSON.stringify([
      { dateIn: '2026-11-20', qty: 6, pax: 1, type: 'INDIVIDUAL', regime: 'PC' },
      { dateIn: '2026-11-20', qty: 30, pax: 2, type: 'DOBLE', regime: 'PC' },
      { dateIn: '2026-11-21', qty: 6, pax: 1, type: 'INDIVIDUAL', regime: 'PC' },
      { dateIn: '2026-11-21', qty: 30, pax: 2, type: 'DOBLE', regime: 'PC' }
    ])
  };

  const adapted = service.adaptMealScheduleToRecord(existingSchedule, groupPc);
  assert.equal(adapted.length, 4);
  assert.deepEqual(adapted.map(r => [r.fecha, r.jornada, r.pax]), [
    ['2026-11-20', 'cena', 66],
    ['2026-11-21', 'almuerzo', 66],
    ['2026-11-21', 'cena', 66],
    ['2026-11-22', 'almuerzo', 66]
  ]);
  assert.ok(adapted.every(r => r.salon === 'Eventos Restaurante'));
  assert.equal(adapted.reduce((sum, r) => sum + r.pax, 0), 264);
});

test('preserveExistingSchedule nunca recalcula servicios, fechas, salas, horas ni pax existentes en MesaChef', async () => {
  const data = new Map();
  const ref = (collection, id) => ({ key: collection + '/' + id });
  global.window = {
    db: {
      collection: collection => ({
        doc: id => ref(collection, id),
        where: (field, op, value) => ({
          get: async () => {
            const docs = [...data]
              .filter(([k, v]) => k.startsWith(collection + '/') && v[field] === value)
              .map(([k, v]) => ({ id: k.split('/')[1], ref: { key: k }, data: () => v }));
            return { forEach: fn => docs.forEach(fn) };
          }
        })
      }),
      batch: () => {
        const writes = [];
        return {
          set: (r, v) => writes.push([r, v]),
          update: (r, v) => writes.push([r, v]),
          commit: async () => {
            writes.forEach(([r, v]) => data.set(r.key, { ...data.get(r.key), ...v }));
          }
        };
      }
    }
  };
  try {
    // Escenario real del usuario: estancia 20-22/11 PC, pero el almuerzo del 21 se movió al 22
    const pcGroup = {
      Reserva: '998877',
      Entrada: '2026-11-20',
      Salida: '2026-11-22',
      Hotel_Asignado: 'CUMBRIA SPA&HOTEL',
      'Nombre del Grupo': 'Grupo Congreso',
      'Régimen': 'PC',
      Com_Estado_Interno: 'TENTATIVA',
      RoomingList_JSON: JSON.stringify([
        room('2026-11-20', 32, 2, 'PC'),
        room('2026-11-21', 32, 2, 'PC')
      ]),
      MealSchedule_JSON: JSON.stringify([
        { fecha: '2026-11-20', jornada: 'almuerzo', pax: 60, hora: '14:00', salon: 'Eventos Restaurante' },
        { fecha: '2026-11-20', jornada: 'cena', pax: 64, hora: '21:00', salon: 'Eventos Restaurante' },
        { fecha: '2026-11-21', jornada: 'cena', pax: 64, hora: '21:00', salon: 'Eventos Restaurante' },
        { fecha: '2026-11-22', jornada: 'almuerzo', pax: 60, hora: '14:30', salon: 'Salón Especial' }
      ])
    };

    // 1. Primera sincronización (sin documentos previos en MesaChef): crea los 4 servicios
    const initRes = await service.syncGroupToMesachef(pcGroup, { preserveExistingSchedule: true });
    assert.equal(initRes.success, true);
    assert.equal(data.has('reservas_salones/nexus_998877_2026-11-21_almuerzo'), false);
    assert.equal(data.has('reservas_salones/nexus_998877_2026-11-22_almuerzo'), true);

    // 2. Usuario de MesaChef modifica hora, salón y pax del almuerzo del 22
    const lunch22Key = 'reservas_salones/nexus_998877_2026-11-22_almuerzo';
    data.set(lunch22Key, {
      ...data.get(lunch22Key),
      horaOverride: '15:15',
      salonOverride: 'Restaurante',
      salon: 'Restaurante',
      detalles: { ...data.get(lunch22Key).detalles, pax_adultos: 58, hora: '15:15' }
    });

    // 3. En Grupos cambia el estado a CONFIRMADO y cambian ocupación/pax sin guardar programación explícita (incluso con MealSchedule_JSON null)
    const bgRes = await service.syncGroupToMesachef({
      ...pcGroup,
      MealSchedule_JSON: null,
      Com_Estado_Interno: 'CONFIRMADO',
      RoomingList_JSON: JSON.stringify([
        room('2026-11-20', 35, 2, 'PC'),
        room('2026-11-21', 35, 2, 'PC')
      ])
    }, { preserveExistingSchedule: true });
    assert.equal(bgRes.success, true);
    assert.equal(bgRes.preservedSchedule, true);

    // El almuerzo del 21 NO se ha regenerado, el del 22 conserva fecha, hora, salón y pax de MesaChef, y el estado sí pasó a confirmada
    assert.equal(data.has('reservas_salones/nexus_998877_2026-11-21_almuerzo'), false);
    assert.equal(data.get(lunch22Key).estado, 'confirmada');
    assert.equal(data.get(lunch22Key).fecha, '2026-11-22');
    assert.equal(data.get(lunch22Key).detalles.pax_adultos, 58);
    assert.equal(data.get(lunch22Key).horaOverride, '15:15');
    assert.equal(data.get(lunch22Key).salonOverride, 'Restaurante');

    // 4. getActualMesaChefServices recoge todos los cambios de MesaChef (horario, salón, personas) sin ensuciar nombre
    const pulled = await service.getActualMesaChefServices('998877');
    assert.equal(pulled.length, 4);
    const pulled22 = pulled.find(s => s.fecha === '2026-11-22' && s.jornada === 'almuerzo');
    assert.ok(pulled22);
    assert.equal(pulled22.pax, 58);
    assert.equal(pulled22.hora, '15:15');
    assert.equal(pulled22.salon, 'Restaurante');
    assert.equal(pulled22.nombre, undefined);

    // 5. Guardado explícito desde Grupos (explicitScheduleSave: true) sí pasa los cambios del usuario a MesaChef
    const explicitSchedule = pulled.map(r =>
      (r.fecha === '2026-11-22' && r.jornada === 'almuerzo')
        ? { ...r, pax: 62, hora: '13:45', salon: 'Eventos Restaurante' }
        : r
    );
    const explicitRes = await service.syncGroupToMesachef({
      ...pcGroup,
      Com_Estado_Interno: 'CONFIRMADO',
      MealSchedule_JSON: JSON.stringify(explicitSchedule)
    }, { explicitScheduleSave: true });
    assert.equal(explicitRes.success, true);
    assert.equal(data.get(lunch22Key).detalles.pax_adultos, 62);
    assert.equal(data.get(lunch22Key).detalles.hora, '13:45');
    assert.equal(data.get(lunch22Key).horaOverride, null);
    assert.equal(data.get(lunch22Key).salon, 'Eventos Restaurante');
    assert.equal(data.get(lunch22Key).salonOverride, 'Eventos Restaurante');
  } finally {
    delete global.window;
  }
});

test('guardar horas en programacion conserva las horas aunque exista ServiceOrder_JSON sin hora o con hora antigua', async () => {
  const data = new Map();
  const ref = (collection, id) => ({ key: collection + '/' + id });
  global.window = {
    db: {
      collection: collection => ({
        doc: id => ref(collection, id),
        where: (field, op, value) => ({
          get: async () => {
            const docs = [...data]
              .filter(([k, v]) => k.startsWith(collection + '/') && v[field] === value)
              .map(([k, v]) => ({ id: k.split('/')[1], ref: { key: k }, data: () => v }));
            return { forEach: fn => docs.forEach(fn) };
          }
        })
      }),
      batch: () => {
        const writes = [];
        return {
          set: (r, v) => writes.push([r, v]),
          update: (r, v) => writes.push([r, v]),
          commit: async () => {
            writes.forEach(([r, v]) => data.set(r.key, { ...data.get(r.key), ...v }));
          }
        };
      }
    }
  };
  try {
    const baseGroup = {
      ...group,
      Reserva: '887766',
      Entrada: '2026-11-27',
      Salida: '2026-11-28',
      'Régimen': 'MP',
      RoomingList_JSON: JSON.stringify([room('2026-11-27', 35, 2, 'MP')]),
      ServiceOrder_JSON: JSON.stringify({
        savedAt: 'rev-sin-horas',
        grupo: 'Grupo Horas',
        notasText: 'Notas',
        planRows: [
          { fecha: '2026-11-27', dia: 'Vie 27/11', serv: 'Cena', pax: '67', menu: 'Menú Cena', hora: '___:___ h' },
          { fecha: '2026-11-28', dia: 'Sáb 28/11', serv: 'Desayuno', pax: '70', menu: 'Buffet', hora: '07:30' }
        ],
        incidenciaRows: []
      })
    };

    // 1. Guardado inicial sin horas
    await service.syncGroupToMesachef({
      ...baseGroup,
      MealSchedule_JSON: JSON.stringify([
        { fecha: '2026-11-27', jornada: 'cena', pax: 67, hora: '---', salon: 'Eventos Restaurante' },
        { fecha: '2026-11-28', jornada: 'desayuno', pax: 70, hora: '---', salon: 'Eventos Restaurante' }
      ])
    }, { explicitScheduleSave: true });

    // 2. El usuario recoge los servicios actuales (incluyendo sus doc IDs reales) y pone las horas
    const pulledBefore = await service.getActualMesaChefServices('887766');
    assert.equal(pulledBefore.length, 2);

    const editedSchedule = pulledBefore.map(r => ({
      ...r,
      hora: r.jornada === 'cena' ? '21:00' : '08:30'
    }));

    const saveRes = await service.syncGroupToMesachef({
      ...baseGroup,
      MealSchedule_JSON: JSON.stringify(editedSchedule)
    }, { explicitScheduleSave: true });
    assert.equal(saveRes.success, true);

    // 3. Al volver a entrar y consultar MesaChef, las horas guardadas permanecen intactas y los IDs no se duplican
    const pulledAfter = await service.getActualMesaChefServices('887766');
    assert.equal(pulledAfter.length, 2);
    const cena = pulledAfter.find(s => s.jornada === 'cena');
    const desayuno = pulledAfter.find(s => s.jornada === 'desayuno');
    assert.equal(cena.hora, '21:00');
    assert.equal(desayuno.hora, '08:30');
    assert.equal(cena.id, 'nexus_887766_2026-11-27_cena');
    assert.equal(desayuno.id, 'nexus_887766_2026-11-28_desayuno');

    // 4. Si en MesaChef quedara horaOverride: '---', getActualMesaChefServices sigue leyendo detalles.hora
    const cenaKey = 'reservas_salones/' + cena.id;
    data.set(cenaKey, { ...data.get(cenaKey), horaOverride: '---' });
    const pulledWithPlaceholderOverride = await service.getActualMesaChefServices('887766');
    assert.equal(pulledWithPlaceholderOverride.find(s => s.jornada === 'cena').hora, '21:00');
  } finally {
    delete global.window;
  }
});

test('buildMesachefInternalNote y extractServiceObservaciones manejan observaciones y notas de sistema', () => {
  const summary = '[Nexus Groups] Ref: 79257 | Programación de Desayuno | Pax: 70';
  assert.equal(service.buildMesachefInternalNote(summary, ''), summary);
  assert.equal(service.buildMesachefInternalNote(summary, '   '), summary);
  assert.equal(service.buildMesachefInternalNote('', 'Solo nota'), 'Solo nota');
  assert.equal(
    service.buildMesachefInternalNote(summary, '  2 celíacos sin gluten  '),
    '2 celíacos sin gluten\n' + summary
  );
  assert.equal(
    service.buildMesachefInternalNote(summary, 'Línea 1\nLínea 2'),
    'Línea 1\nLínea 2\n' + summary
  );

  // Extracción en distintos formatos
  assert.equal(service.extractServiceObservaciones({ notas: { interna: summary } }), '');
  assert.equal(
    service.extractServiceObservaciones({ notas: { interna: '2 celíacos\n' + summary } }),
    '2 celíacos'
  );
  assert.equal(
    service.extractServiceObservaciones({ notas: { interna: 'Línea 1\nLínea 2\n' + summary } }),
    'Línea 1\nLínea 2'
  );
  assert.equal(
    service.extractServiceObservaciones({ notas: { interna: 'Montaje en U | ' + summary } }),
    'Montaje en U'
  );
  assert.equal(
    service.extractServiceObservaciones({ notas: { interna: 'Nota directa editada en sala' } }),
    'Nota directa editada en sala'
  );
  assert.equal(
    service.extractServiceObservaciones({
      notas: { interna: 'Ver [Nexus Groups] antiguo\nSegunda línea\n' + summary }
    }),
    'Ver [Nexus Groups] antiguo\nSegunda línea'
  );
  assert.equal(
    service.extractServiceObservaciones({ notas: { interna: '' }, nexusObservaciones: 'Respaldo obs' }),
    'Respaldo obs'
  );
  assert.equal(service.extractServiceObservaciones(null), '');
});

test('prepareSalonDocuments antepone observaciones por servicio en notas.interna y conserva servicios sin observaciones', () => {
  const sched = [
    { fecha: '2026-11-27', jornada: 'cena', pax: 68, hora: '21:15', salon: 'Eventos Restaurante', observaciones: '  1 celíaco y 2 vegetarianos  ' },
    { fecha: '2026-11-28', jornada: 'desayuno', pax: 70, hora: '08:00', salon: 'Eventos Restaurante', observaciones: '' }
  ];
  const record = {
    ...group,
    Reserva: '79257',
    Entrada: '2026-11-27',
    Salida: '2026-11-28',
    'Régimen': 'MP',
    RoomingList_JSON: JSON.stringify([room('2026-11-27', 35, 2, 'MP')]),
    MealSchedule_JSON: JSON.stringify(sched)
  };
  const parsedSched = service.getMealSchedule(record);
  assert.equal(parsedSched[0].observaciones, '1 celíaco y 2 vegetarianos');
  assert.equal(parsedSched[1].observaciones, '');

  const docs = service.prepareSalonDocuments(record);
  assert.equal(docs.length, 2);

  const cenaDoc = docs.find(d => d.detalles.jornada === 'cena');
  const desDoc = docs.find(d => d.detalles.jornada === 'desayuno');

  assert.equal(cenaDoc.nexusObservaciones, '1 celíaco y 2 vegetarianos');
  assert.ok(cenaDoc.notas.interna.startsWith('1 celíaco y 2 vegetarianos\n[Nexus Groups] Ref: 79257'));

  assert.equal(desDoc.nexusObservaciones, '');
  assert.ok(desDoc.notas.interna.startsWith('[Nexus Groups] Ref: 79257'));
  assert.equal(desDoc.notas.interna.startsWith('\n'), false);
});

test('syncGroupToMesachef y getActualMesaChefServices sincronizan, actualizan, borran y preservan observaciones por servicio', async () => {
  const data = new Map();
  const ref = (collection, id) => ({ key: collection + '/' + id });
  global.window = {
    db: {
      collection: collection => ({
        doc: id => ref(collection, id),
        where: (field, op, value) => ({
          get: async () => {
            const docs = [...data]
              .filter(([k, v]) => k.startsWith(collection + '/') && v[field] === value)
              .map(([k, v]) => ({ id: k.split('/')[1], ref: { key: k }, data: () => v }));
            return { forEach: fn => docs.forEach(fn) };
          }
        })
      }),
      batch: () => {
        const writes = [];
        return {
          set: (r, v) => writes.push([r, v]),
          update: (r, v) => writes.push([r, v]),
          commit: async () => {
            writes.forEach(([r, v]) => data.set(r.key, { ...data.get(r.key), ...v }));
          }
        };
      }
    }
  };
  try {
    const baseGroup = {
      ...group,
      Reserva: '79257',
      Entrada: '2026-11-27',
      Salida: '2026-11-28',
      Hotel_Asignado: 'CUMBRIA SPA&HOTEL',
      'Nombre del Grupo': 'GRUPO MONTEROS DE JANDULA',
      'Régimen': 'MP',
      Com_Estado_Interno: 'TENTATIVA',
      RoomingList_JSON: JSON.stringify([room('2026-11-27', 35, 2, 'MP')])
    };

    // 1. Guardar observaciones distintas por servicio
    const initialRes = await service.syncGroupToMesachef({
      ...baseGroup,
      MealSchedule_JSON: JSON.stringify([
        { fecha: '2026-11-27', jornada: 'cena', pax: 68, hora: '21:15', salon: 'Eventos Restaurante', observaciones: 'Mesa presidencial para 6' },
        { fecha: '2026-11-28', jornada: 'desayuno', pax: 70, hora: '08:00', salon: 'Eventos Restaurante', observaciones: '' }
      ])
    }, { explicitScheduleSave: true });
    assert.equal(initialRes.success, true);

    const cenaKey = 'reservas_salones/nexus_79257_2026-11-27_cena';
    const desKey = 'reservas_salones/nexus_79257_2026-11-28_desayuno';
    assert.equal(data.get(cenaKey).nexusObservaciones, 'Mesa presidencial para 6');
    assert.ok(data.get(cenaKey).notas.interna.startsWith('Mesa presidencial para 6\n[Nexus Groups]'));
    assert.equal(data.get(desKey).nexusObservaciones, '');
    assert.ok(data.get(desKey).notas.interna.startsWith('[Nexus Groups]'));

    // 2. getActualMesaChefServices devuelve las observaciones exactas (sin propiedad si está vacía)
    const pulled1 = await service.getActualMesaChefServices('79257');
    assert.equal(pulled1.length, 2);
    const pulledCena1 = pulled1.find(s => s.jornada === 'cena');
    const pulledDes1 = pulled1.find(s => s.jornada === 'desayuno');
    assert.equal(pulledCena1.observaciones, 'Mesa presidencial para 6');
    assert.equal(Object.prototype.hasOwnProperty.call(pulledDes1, 'observaciones'), false);

    // 3. Editar SOLO la observación en uno de los servicios dispara escritura real en Firestore
    const editedOnlyObs = pulled1.map(r =>
      r.jornada === 'desayuno' ? { ...r, observaciones: 'Desayuno temprano con café preparado' } : r
    );
    const editRes = await service.syncGroupToMesachef({
      ...baseGroup,
      MealSchedule_JSON: JSON.stringify(editedOnlyObs)
    }, { explicitScheduleSave: true });
    assert.equal(editRes.success, true);
    assert.equal(Boolean(editRes.skipped), false);
    assert.equal(data.get(desKey).nexusObservaciones, 'Desayuno temprano con café preparado');
    assert.ok(data.get(desKey).notas.interna.startsWith('Desayuno temprano con café preparado\n[Nexus Groups]'));

    // 4. Borrar la observación de la cena limpia notas.interna y nexusObservaciones
    const clearedCena = editedOnlyObs.map(r =>
      r.jornada === 'cena' ? { ...r, observaciones: '' } : r
    );
    const clearRes = await service.syncGroupToMesachef({
      ...baseGroup,
      MealSchedule_JSON: JSON.stringify(clearedCena)
    }, { explicitScheduleSave: true });
    assert.equal(clearRes.success, true);
    assert.equal(Boolean(clearRes.skipped), false);
    assert.equal(data.get(cenaKey).nexusObservaciones, '');
    assert.ok(data.get(cenaKey).notas.interna.startsWith('[Nexus Groups]'));

    const pulledAfterClear = await service.getActualMesaChefServices('79257');
    assert.equal(Object.prototype.hasOwnProperty.call(pulledAfterClear.find(s => s.jornada === 'cena'), 'observaciones'), false);
    assert.equal(pulledAfterClear.find(s => s.jornada === 'desayuno').observaciones, 'Desayuno temprano con café preparado');

    // 5. Sincronización en segundo plano con preserveExistingSchedule preserva notas.interna y nexusObservaciones
    const bgRes = await service.syncGroupToMesachef({
      ...baseGroup,
      Com_Estado_Interno: 'CONFIRMADO',
      MealSchedule_JSON: JSON.stringify(pulledAfterClear)
    }, { preserveExistingSchedule: true });
    assert.equal(bgRes.success, true);
    assert.equal(bgRes.preservedSchedule, true);
    assert.equal(data.get(desKey).estado, 'confirmada');
    assert.equal(data.get(desKey).nexusObservaciones, 'Desayuno temprano con café preparado');
    assert.ok(data.get(desKey).notas.interna.startsWith('Desayuno temprano con café preparado\n[Nexus Groups]'));
  } finally {
    delete global.window;
  }
});
