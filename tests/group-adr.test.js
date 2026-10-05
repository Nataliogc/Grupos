const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const board = require('../js/services/boardPricingService');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/GestionGrupos.jsx'), 'utf8');
const helpers = source.slice(source.indexOf('    const getRoomAccommodationAmount ='), source.indexOf('    // Intercepta la tecla'));
function metrics(items, config = {}) {
  const ctx = {window:{BoardPricingService:board}, parseRoomingListSafe:JSON.parse,
    expandRoomListByDays:items=>items, calculateMaxDailyRooms:items=>items.filter(i=>!i.isService).reduce((n,i)=>n+i.qty,0),
    isPureServiceItem:i=>!!i.isService, getPaxByRoomType:()=>2,
    group:{Hotel_Asignado:"Cumbria",Entrada:"2026-10-10",RoomingList_JSON:JSON.stringify(items)}, config};
  vm.createContext(ctx);
  return vm.runInContext(helpers+'\ncalculateGroupAdrAndRoomNights(group, 9999, config)',ctx);
}
test('ADR descuenta desayuno y dos comidas de PC para 17 personas y 8 habitaciones',()=>{
  const result=metrics([
    {type:'INDIVIDUAL',qty:1,pax:1,nights:1,regime:'PC',total:125.6},
    {type:'DOBLE',qty:5,pax:2,nights:1,regime:'PC',total:846},
    {type:'TRIPLE',qty:2,pax:3,nights:1,regime:'PC',total:464.6},
    {type:'Autobus',isService:true,qty:1,total:400}
  ]);
  assert.equal(result.roomNights,8);
  assert.ok(Math.abs(result.lodgingTotal-654.2)<0.000001);
  assert.ok(Math.abs(result.adr-81.775)<0.000001);
});
test('ADR mantiene HA y descuenta manutencion por noche con precios oficiales',()=>{
  const result=metrics([
    {type:'DOBLE',qty:1,pax:2,nights:2,regime:'MP',total:400},
    {type:'INDIVIDUAL',qty:1,pax:1,nights:1,regime:'HA',total:100}
  ],{2026:{cumbria:{_desglose:{breakfast:8,lunch:20,dinner:22}}}});
  assert.equal(result.roomNights,3);
  assert.equal(result.lodgingTotal,388);
  assert.equal(result.adr,388/3);
});
test('alojamiento de importe cero no recupera el total de servicios como ADR',()=>{
  const result=metrics([{type:'DOBLE',qty:1,pax:2,nights:1,regime:'HA',total:0},{type:'Autobus',isService:true,qty:1,total:400}]);
  assert.equal(result.adr,0);
});


test('estadisticas usan solo alojamiento y conservan ingresos cero sin recuperar la pension',()=>{
 const targets=require('../js/services/groupTargetsService');
 const start=source.indexOf('    const calculateLodgingRevenue =');
 const end=source.indexOf('    const parseDateToComparable',start);
 const context={window:{BoardPricingService:board,GroupTargetsService:targets},parseRoomingListSafe:JSON.parse,parseNum:v=>Number(v)||0,
  getPaxByRoomType:()=>1,isPureServiceItem:i=>!!i.isService,expandRoomListByDays:items=>items,calculateMaxDailyRooms:()=>1};
 const calculate=vm.runInNewContext(source.slice(start,end)+helpers+'\ncalculateLodgingRevenue',context);
 const row={Entrada:'2026-10-10',Hotel_Asignado:'Cumbria','Régimen':'PC',Noches:1,'Pax.':1,'Importe(*)':50};
 assert.equal(calculate(row,{}),4);
 assert.equal(calculate({...row,Entrada:'2027-01-01',Hotel_Asignado:'Guadiana'},{}),2.5);
 assert.equal(calculate({...row,RoomingList_JSON:JSON.stringify([{type:'INDIVIDUAL',qty:1,pax:1,nights:1,regime:'PC',total:46},{isService:true,type:'Autobus',total:400}])},{}),0);
});
