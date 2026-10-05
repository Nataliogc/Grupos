const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const board=require('../js/services/boardPricingService');
const targets=require('../js/services/groupTargetsService');
const mesa=require('../js/services/mesachefService');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/GestionGrupos.jsx'),'utf8');
const start=source.indexOf('    const getGroupBoardPriceSummary =');
const end=source.indexOf('    // Helper para calcular con precisión',start);
const summary=vm.runInNewContext(source.slice(start,end)+'\ngetGroupBoardPriceSummary',{
  window:{BoardPricingService:board,GroupTargetsService:targets,MesaChefService:mesa},parseRoomingListSafe:raw=>raw?JSON.parse(raw):[],expandRoomListByDays:rows=>rows
});
const group=(rooms,extra={})=>({hotel:'Cumbria',records:[{Entrada:'2026-10-10',RoomingList_JSON:JSON.stringify(rooms),...extra}]});
test('PC muestra desayuno, almuerzo y cena por persona con importes oficiales',()=>{
  const result=summary(group([{dateIn:'2026-10-10',regime:'PC'}]),{});
  assert.equal(result.length,1);
  assert.deepEqual([result[0].breakfast,result[0].lunch,result[0].dinner],[true,true,true]);
  assert.deepEqual([result[0].prices.breakfast,result[0].prices.lunch,result[0].prices.dinner],[8,19,19]);
});
test('programacion de dos almuerzos omite cena y conserva el desayuno de PC',()=>{
  const result=summary(group([{dateIn:'2026-10-10',regime:'PC'}],{MealSchedule_JSON:JSON.stringify([{fecha:'2026-10-10',jornada:'almuerzo',pax:17},{fecha:'2026-10-11',jornada:'almuerzo',pax:17}])}),{});
  assert.deepEqual([result[0].breakfast,result[0].lunch,result[0].dinner],[true,true,false]);
});
test('separa hoteles y años y no añade comidas a HA',()=>{
  const result=summary(group([{dateIn:'2026-12-31',hotel:'Cumbria',regime:'MP',mpMeal:'cena'},{dateIn:'2027-01-01',hotel:'Guadiana',regime:'PC'},{dateIn:'2026-10-10',regime:'HA'}]),{});
  assert.equal(result.length,2);
  assert.equal(result[0].lunch,false);
  assert.equal(result[0].dinner,true);
  assert.equal(result[1].prices.breakfast,8.5);
  assert.equal(summary(group([{dateIn:'2026-10-10',regime:'HA'}]),{}).length,0);
});
