const test = require('node:test');
const assert = require('node:assert/strict');
const board = require('../js/services/boardPricingService');
const targets = require('../js/services/groupTargetsService');

test('desglose oficial diferencia hotel y año sin aceptar la configuración antigua',()=>{
  for (const [hotel,date,breakfast,lunch,dinner] of [
    ['Guadiana','2026-10-10',8,19,19],['Cumbria','2026-10-10',8,19,19],
    ['Guadiana','2027-01-01',8.5,19.5,19.5],['Cumbria','2027-01-01',8,19,19]
  ]) {
    const prices=board.getPricingForHotelAndDate(hotel,date,{default:{breakfast:99,meal:99},[hotel]:{breakfast:99,meal:99}});
    assert.deepEqual([prices.breakfast,prices.lunch,prices.dinner],[breakfast,lunch,dinner]);
  }
});
test('PC a 50 euros asigna 8 al desayuno, 19 al almuerzo, 19 a la cena y 4 al alojamiento',()=>{
  const pricingConfig=board.getPricingForHotelAndDate('Guadiana','2026-10-10',{});
  const result=board.calculateDailyEconomicBreakdown({pax:1,regimen:'PC',dailyAmount:50,pricingConfig});
  assert.deepEqual([result.breakfastCost,result.lunchCost,result.dinnerCost,result.netAccommodationPrice],[8,19,19,4]);
  const discounted=board.calculateDailyEconomicBreakdown({pax:1,regimen:'PC',dailyAmount:45,pricingConfig});
  assert.deepEqual([discounted.breakfastCost,discounted.lunchCost,discounted.dinnerCost,discounted.netAccommodationPrice],[8,19,19,-1]);
});
test('almuerzo y cena conservan sus distintos importes oficiales y admiten cero',()=>{
  const catalog={2027:{cumbria:{_desglose:{breakfast:0,lunch:17,dinner:23}}},2026:{cumbria:{_desglose:{breakfast:7,lunch:15,dinner:21}}}};
  const pricingConfig=targets.getOfficialBoardPrices(catalog,'Cumbria Spa&Hotel','01/01/2027');
  const result=board.calculateDailyEconomicBreakdown({pax:2,regimen:'PC',dailyAmount:100,pricingConfig});
  assert.deepEqual([result.breakfastCost,result.lunchCost,result.dinnerCost,result.netAccommodationPrice],[0,34,46,20]);
  const dinner=board.calculateDailyEconomicBreakdown({pax:2,regimen:'MP',mpMeal:'cena',dailyAmount:100,pricingConfig});
  assert.equal(dinner.mealCost,46);
  assert.equal(targets.getOfficialBoardPrices(catalog,'Cumbria','2026-12-31').dinner,21);
});
test('catálogos antiguos sin desglose se deducen de sus tarifas oficiales por régimen',()=>{
  const prices=targets.getOfficialBoardPrices({2026:{guadiana:{HA:{doble:60},HD:{doble:74},MP:{doble:110},PC:{doble:154}}}},'Guadiana','2026-10-10');
  assert.deepEqual([prices.breakfast,prices.lunch,prices.dinner],[7,18,22]);
});


test('comision de ficha recalcula el desglose oficial de la fecha de cada linea y conserva los servicios seleccionados',()=>{
  const fs=require('node:fs'),vm=require('node:vm');
  const source=fs.readFileSync(require('node:path').join(__dirname,'../src/GestionGrupos.jsx'),'utf8');
  const start=source.indexOf('      const calculateDefaultCommission =');
  const end=source.indexOf('      const openFicha =',start);
  const ctx={window:{BoardPricingService:board},officialTariffsCatalog:{},selectedGroupFicha:{arrival:'2026-10-10',hotel:'Guadiana'},getPaxByRoomType:()=>1};
  const calculate=vm.runInNewContext(source.slice(start,end)+'\ngetOfficialRoomCommission',ctx);
  const item={price:50,regime:'PC',qty:1,nights:1,type:'INDIVIDUAL',hotel:'Cumbria',pax:1,dateIn:'2027-01-01',comision:{porcentaje:10,desglose:{Alojamiento:{valor:40,comisionable:true},Desayuno:{valor:1,comisionable:false},Almuerzo:{valor:1,comisionable:false},Cena:{valor:1,comisionable:false}}}};
  const result=calculate(item);
  assert.deepEqual(Object.values(result.desglose).map(row=>row.valor),[4,8,19,19]);
  assert.equal(result.comision_unitaria,0.4);
  const guadiana=calculate({...item,hotel:'Guadiana'});
  assert.deepEqual(Object.values(guadiana.desglose).map(row=>row.valor),[2.5,8.5,19.5,19.5]);
});
