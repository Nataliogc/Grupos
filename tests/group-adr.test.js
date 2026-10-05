const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const board = require('../js/services/boardPricingService');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/GestionGrupos.jsx'), 'utf8');
const helpers = source.slice(source.indexOf('    const getRoomAccommodationAmount ='), source.indexOf('    // Intercepta la tecla'));
function metrics(items, config = {default:{breakfast:6,meal:16}}) {
  const ctx = {window:{BoardPricingService:board}, parseRoomingListSafe:JSON.parse,
    expandRoomListByDays:items=>items, calculateMaxDailyRooms:items=>items.filter(i=>!i.isService).reduce((n,i)=>n+i.qty,0),
    isPureServiceItem:i=>!!i.isService, getPaxByRoomType:()=>2,
    group:{RoomingList_JSON:JSON.stringify(items)}, config};
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
  assert.ok(Math.abs(result.lodgingTotal-790.2)<0.000001);
  assert.ok(Math.abs(result.adr-98.775)<0.000001);
});
test('ADR mantiene HA y descuenta manutencion por noche con precios configurados',()=>{
  const result=metrics([
    {type:'DOBLE',qty:1,pax:2,nights:2,regime:'MP',total:400},
    {type:'INDIVIDUAL',qty:1,pax:1,nights:1,regime:'HA',total:100}
  ],{default:{breakfast:8,meal:20}});
  assert.equal(result.roomNights,3);
  assert.equal(result.lodgingTotal,388);
  assert.equal(result.adr,388/3);
});
test('alojamiento de importe cero no recupera el total de servicios como ADR',()=>{
  const result=metrics([{type:'DOBLE',qty:1,pax:2,nights:1,regime:'HA',total:0},{type:'Autobus',isService:true,qty:1,total:400}]);
  assert.equal(result.adr,0);
});
