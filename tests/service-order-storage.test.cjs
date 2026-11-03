
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
