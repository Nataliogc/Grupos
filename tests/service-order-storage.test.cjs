
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const html=fs.readFileSync('Orden Servicio.html','utf8');
test('regreso a reserva no depende del almacenamiento disponible',()=>{
 const source=html.slice(html.indexOf('        function goBackToReserva()'),html.indexOf('        let originalTitleBeforePrint'));
 const context=vm.createContext({currentReservaId:'81271',localStorage:{setItem(){throw Error('QuotaExceededError');}},window:{location:{href:''}}});
 vm.runInContext(source,context);context.goBackToReserva();
 assert.equal(context.window.location.href,'Gestion-de-Grupos.html?reserva=81271');
});
test('sin espacio local la orden sigue disponible para guardar en la base de datos',()=>{
 const source=html.slice(html.indexOf('        function saveStateToCache()'),html.indexOf('        function discardUnsavedViewChanges()'));
 const context=vm.createContext({currentReservaId:'81271',isDiscardingChanges:false,lastLocalCacheSaved:true,sanitizeText:v=>v,
 document:{getElementById:()=>({innerText:'texto',innerHTML:'texto'}),querySelectorAll:()=>[]},
 localStorage:{setItem(){throw Error('QuotaExceededError');}},
 window:{NexusDraftStorage:{setItem:()=>false,getItem:()=>null}}});
 vm.runInContext(source,context);const order=context.saveStateToCache();
 assert.equal(order.grupo,'texto');assert.equal(context.lastLocalCacheSaved,false);
});
test('sin NexusDraftStorage y con localStorage lleno no lanza excepcion y permite guardar',()=>{
 const source=html.slice(html.indexOf('        function saveStateToCache()'),html.indexOf('        function discardUnsavedViewChanges()'));
 const context=vm.createContext({currentReservaId:'81271',isDiscardingChanges:false,lastLocalCacheSaved:true,sanitizeText:v=>v,
 document:{getElementById:()=>({innerText:'texto',innerHTML:'texto'}),querySelectorAll:()=>[]},
 localStorage:{setItem(){throw Error('QuotaExceededError');},getItem:()=>null},
 window:{}});
 vm.runInContext(source,context);const order=context.saveStateToCache();
 assert.equal(order.grupo,'texto');assert.equal(context.lastLocalCacheSaved,false);
});
test('cabecera sustituye puntos suspensivos por datos reales de la reserva',()=>{
 const elements={
   'informe-title':{innerText:''},'ref-val':{innerText:'...'},'grupo-val':{innerText:'...'},
   'agencia-val':{innerText:'...'},'pax-val':{innerText:'...'},'regimen-val':{innerText:'...'},
   'comercial-val':{innerText:'...'},'notas-val':{innerHTML:''},'notas-ul':{children:[],replaceChildren(){}}
 };
 const s={ref:'...',grupo:'...',agencia:'...',pax:'...',regimen:'...',comercial:'...'};
 const gName='FUTBOL ALBACETE BALOMPIE', gAgency='BCD Sports', gPax='34', gCom='Natalio', gReg='HA / -', currentReservaId='81271';
 const finalRef = (s.ref && s.ref !== '...' && s.ref.trim()) ? s.ref : currentReservaId;
 const finalGrupo = (s.grupo && s.grupo !== '...' && s.grupo.trim()) ? s.grupo : gName;
 const finalAgencia = (s.agencia && s.agencia !== '...' && s.agencia.trim()) ? s.agencia : gAgency;
 const finalPax = (s.pax && s.pax !== '...' && s.pax.trim()) ? s.pax : gPax;
 const finalRegimen = (s.regimen && s.regimen !== '...' && s.regimen.trim()) ? s.regimen : gReg;
 const finalComercial = (s.comercial && s.comercial !== '...' && s.comercial.trim()) ? s.comercial : gCom;
 assert.equal(finalRef, '81271');
 assert.equal(finalGrupo, 'FUTBOL ALBACETE BALOMPIE');
 assert.equal(finalAgencia, 'BCD Sports');
 assert.equal(finalPax, '34');
 assert.equal(finalRegimen, 'HA / -');
 assert.equal(finalComercial, 'Natalio');
});
