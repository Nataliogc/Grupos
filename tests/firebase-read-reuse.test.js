const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
test('persistent cache shares tabs and duplicate listeners share one subscription', () => {
 let enabled, starts=0, stops=0, emit;
 const db={settings:()=>{},enablePersistence:options=>{enabled=options;return Promise.resolve();}};
 const ctx={window:{firebaseConfig:{}},firebase:{apps:[{}],firestore:()=>db},console};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/firebase-init.js'),'utf8'),ctx);
 assert.equal(enabled.synchronizeTabs,true);
 const ref={path:'settings/main',onSnapshot:next=>{starts++;emit=next;return ()=>stops++;}};
 const received=[];
 const a=ctx.window.nexusListen(ref,s=>received.push(['a',s]));
 emit('first');
 const b=ctx.window.nexusListen(ref,s=>received.push(['b',s]));
 assert.equal(starts,1);
 assert.deepEqual(received,[['a','first'],['b','first']]);
 a();emit('second');assert.equal(stops,0);
 assert.deepEqual(received[2],['b','second']);
 b();assert.equal(stops,1);
 const c=ctx.window.nexusListen(ref,()=>{});assert.equal(starts,2);c();
});
test('unsupported persistence keeps database available', async () => {
 const db={settings:()=>{},enablePersistence:()=>Promise.reject({code:'unimplemented'})};
 const ctx={window:{firebaseConfig:{}},firebase:{apps:[{}],firestore:()=>db},console:{warn:()=>{}}};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/firebase-init.js'),'utf8'),ctx);
 await ctx.window.nexusPersistenceReady;
 assert.equal(ctx.window.db,db);
});
