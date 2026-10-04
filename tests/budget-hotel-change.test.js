const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/Presupuestos.jsx'),'utf8');
const handler=source.slice(source.indexOf('      const handleBudgetHotelChange ='),source.indexOf('      const handleDailyConfigChange ='));
test('hotel change recalculates catalogue and recommended prices rather than retaining old amounts',()=>{
 let state={Entrada:'2027-01-08',dailyConfig:{'2027-01-08':{board:'HA',prices:{DUI:63},tariffMode:'official'},'2027-01-09':{board:'HD',prices:{DUI:71},tariffMode:'recommended'}}};
 const ctx={setFormData:fn=>state=fn(state),remapBudgetRoomsForHotel:(p,h)=>({...p,Hotel_Asignado:h,dailyConfig:{...p.dailyConfig}}),getCurrentStayDates:()=>['2027-01-08','2027-01-09'],getRoomTypesForHotel:()=>['DUI'],toInputDate:d=>d,roundRate:v=>Math.round(v*20)/20,getOfficialTariffsGrid:()=>({HA:{DUI:65},HD:{DUI:73.5},MP:{DUI:93},PC:{DUI:112.5}}),getCapaSuiteTariffComparison:(h,d,b)=>({hotelDayPrice:64,hotelPriceInfo:{isEstimated:true},officialPricesByRoom:{DUI:b==='HA'?65:73.5},recommendedPricesByRoom:{DUI:b==='HA'?60:68.5}})};
 vm.createContext(ctx);vm.runInContext(handler+'\nhandleBudgetHotelChange("Guadiana");',ctx);
 assert.equal(state.dailyConfig['2027-01-08'].prices.DUI,65);assert.equal(state.dailyConfig['2027-01-09'].prices.DUI,68.5);assert.equal(state.ratesOnlyGrid.HD.DUI,73.5);assert.equal(state.hotelTariffNotice.estimated,true);assert.match(state.hotelTariffNotice.text,/Guadiana/);
});
