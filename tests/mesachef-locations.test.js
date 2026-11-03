const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/services/mesachefService');
test('consulta el salón de cada servicio sin modificar MesaChef', async () => {
  const docs = [
    {id:'nexus_81271_2026-11-04_almuerzo', data:()=>({salon:'Salón Mercurio'})},
    {id:'nexus_81271_2026-11-04_merienda', data:()=>({salon:'Eventos Restaurante',salonOverride:'Salón Mercurio'})},
    {id:'cancelado', data:()=>({salon:'Otro',estado:'cancelada'})}
  ];
  global.window = {db:{collection: name => {
    assert.equal(name,'reservas_salones');
    return {where:(field,op,id)=> {
      assert.deepEqual([field,op,id],['reservaId','==','81271']);
      return {get:async()=>({forEach:fn=>docs.forEach(fn)})};
    }};
  }}};
  try {
    assert.deepEqual(await service.getServiceLocations('81271'), {
      'nexus_81271_2026-11-04_almuerzo': 'Salón Mercurio',
      'nexus_81271_2026-11-04_merienda': 'Salón Mercurio' 
    });
  } finally {delete global.window;}
});

test('carga todos los salones activos solo del hotel elegido desde el catálogo real', async () => {
 global.window={db:{collection:name=>{
  assert.equal(name,'master_data');return {doc:id=>{
   assert.equal(id,'CONFIG_SALONES');return {get:async()=>({exists:true,data:()=>({
    Cumbria:[{name:'Eventos Restaurante'},{name:'Mercurio'},{name:'Inactivo',active:false}],
    Guadiana:[{name:'Alarcos'}]
   })})};
  }};
 }}};
 try {
  assert.deepEqual(await service.getAvailableSalons('Cumbria Spa&Hotel'),['Eventos Restaurante','Mercurio']);
  assert.deepEqual(await service.getAvailableSalons('Sercotel Guadiana'),['Alarcos']);
 }finally{delete global.window;}
});
