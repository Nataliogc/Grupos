const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateSignature } = require('../functions/redsys-core/core/redsys-crypto');
const { processRedsysNotification } = require('../functions/redsys-core/core/webhook-handler');
const { resolvePayGoldAmount } = require('../functions/paygold-amount');
const { HOTELS } = require('../functions/redsys-core/core/hotels-config');
const key = Buffer.alloc(24, 7).toString('base64');
const orderId = '1234GRUPO001';
const referenceId = 'GRP-5432';

function fixture() {
  let row = { orderId, referenceId, app: 'grupos', hotel: 'cumbria', amountRequested: 100 };
  let deliveries = 0;
  let queue = Promise.resolve();
  const snapshot = () => ({ exists: true, data: () => ({ ...row }) });
  const db = {
    collection: () => ({ doc: () => ({ get: async () => snapshot(), set: async fields => Object.assign(row,fields) }) }),
    runTransaction(fn) {
      const result = queue.then(() => fn({ get: async () => snapshot(), set: async fields => Object.assign(row,fields), set: (_, value) => { row = value; } }));
      queue = result.catch(() => {});
      return result;
    }
  };
  async function notify(changes = {}, badSignature = false) {
    const params = { Ds_Order: orderId, Ds_Amount: '10000', Ds_Response: '0000',
      Ds_MerchantCode: HOTELS.cumbria.merchantCode, Ds_AuthorisationCode: 'unit-123',
      Ds_MerchantData: JSON.stringify({ app:'grupos', referenceId }), ...changes };
    const encoded = Buffer.from(JSON.stringify(params)).toString('base64');
    return processRedsysNotification({ body: { Ds_MerchantParameters: encoded,
      Ds_Signature: badSignature ? 'invalid' : calculateSignature(encoded, orderId, key) },
      db, logger: { warn() {}, error() {}, info() {} }, dispatcher: async () => { deliveries++; } });
  }
  return { notify, deliveries: () => deliveries };
}
test('bank notifications and concurrent redelivery', async t => {
  t.mock.method(HOTELS.cumbria, 'getSecretKey', () => key);
  t.mock.method(HOTELS.guadiana, 'getSecretKey', () => key);
  const f = fixture();
  assert.equal((await f.notify({}, true)).status, 403);
  assert.equal((await f.notify({Ds_Amount:'9999'})).status, 409);
  assert.equal((await f.notify({Ds_MerchantCode:HOTELS.guadiana.merchantCode})).status, 409);
  assert.equal((await f.notify({Ds_MerchantData:JSON.stringify({app:'grupos',referenceId:'GRP-other'})})).status, 409);
  assert.equal(f.deliveries(), 0);
  const results = await Promise.all([f.notify(), f.notify()]);
  assert.deepEqual(results.map(r => r.status), [200,200]);
  assert.equal(results.filter(r => r.idempotent).length, 1);
  assert.equal((await f.notify()).idempotent, true);
  assert.equal(f.deliveries(), 1);
});
test('payment amounts reflect the hotel, outstanding balance and posted payments', async () => {
  const row = { Hotel_Asignado:'Cumbria Spa&Hotel', Com_Total:100, Com_Pagado:40 };
  const db = {collection: () => ({where: () => ({get: async () => ({docs:[{data:()=>row}]})})})};
  const amount = (hotel, value) => resolvePayGoldAmount(db,'grupos',hotel,referenceId,value);
  assert.equal(await amount('cumbria', 60), 60);
  assert.equal(await resolvePayGoldAmount(db,'grupos','cumbria','PRES-draft',60),null);
  assert.equal(await amount('guadiana', 60), null);
  assert.equal(await amount('cumbria', 61), null);
  assert.equal(await amount('cumbria', 5), null);
});
test('server permissions reject anonymous, revoked and out-of-scope payment attempts', async () => {
  const {authorizeRequest, permitsPayment} = require('../functions/authorize-request');
  let email = 'agent@example.test';
  const auth = {verifyIdToken: async (token, revoked) => {
    assert.equal(revoked, true);
    if (token !== 'fixture') throw new Error('invalid');
    return {email,uid:'agent'};
  }};
  const member = {active:true,role:'commercial',paymentScopes:['cumbria/grupos']};
  const db = {collection: () => ({doc: () => ({get: async () => ({data: () => member})})})};
  const access = header => authorizeRequest(header,auth,db);
  assert.equal((await access('')).status,401);
  assert.equal((await access('Bearer other')).status,401);
  assert.equal((await access('Bearer fixture')).status,200);
  assert.equal(permitsPayment(member,'cumbria','grupos'),true);
  assert.equal(permitsPayment(member,'guadiana','grupos'),false);
  assert.equal(permitsPayment(member,'cumbria','spa'),false);
  email = 'demo@hotel.com';
  assert.equal((await access('Bearer fixture')).status,403);
  email = 'agent@example.test';
  member.active = false;
  assert.equal((await access('Bearer fixture')).status,403);
});

test('redelivery at a destination changes its balance only once', async () => {
  const { applyOnce } = require('../functions/redsys-core/core/delivery-receipt');
  const records = new Map([['groups/1',{paid:20}]]);
  let queue = Promise.resolve();
  const db = {
    collection: name => ({doc: id => ({path:name+'/'+id})}),
    runTransaction(fn) {
      const result = queue.then(() => fn({
        get: async ref => ({exists:records.has(ref.path), data:()=>records.get(ref.path)}),
        update: (ref,data)=>records.set(ref.path,{...records.get(ref.path),...data}),
        set: (ref,data)=>records.set(ref.path,data)
      }));
      queue = result.catch(()=>{});
      return result;
    }
  };
  const apply = () => applyOnce(db,{id:'1',path:'groups/1'},
    {app:'grupos',hotel:'cumbria',orderId,isAuthorized:true},
    (row,write)=>{ write({paid:row.paid+100}); return {success:true}; });
  const results = await Promise.all([apply(),apply()]);
  assert.equal(results.filter(r=>r.idempotent).length,1);
  assert.equal(records.get('groups/1').paid,120);
});
test('PayGold keeps the registered order and rejects unsigned or mismatched REST responses', async t => {
  const redsys = require('../functions/redsys');
  t.mock.getter(redsys.REDSYS_CONFIG.cumbria,'secretKey',()=>key);
  let change = {};
  let omitSignature = false;
  t.mock.method(globalThis,'fetch',async (_,options) => {
    const sent = JSON.parse(Buffer.from(JSON.parse(options.body).Ds_MerchantParameters,'base64'));
    assert.equal(sent.DS_MERCHANT_ORDER,orderId);
    const response = {Ds_Order:orderId,Ds_Response:'9998',Ds_Amount:'10000',
      Ds_MerchantCode:HOTELS.cumbria.merchantCode,Ds_UrlPago2Fases:'https://example.test/payment',...change};
    const envelope = Buffer.from(JSON.stringify(response)).toString('base64');
    return {ok:true,json:async()=>({Ds_MerchantParameters:envelope,
      Ds_Signature:omitSignature ? undefined : calculateSignature(envelope,response.Ds_Order,key)})};
  });
  const create = () => redsys.createPayGoldRequest({hotel:'cumbria',app:'grupos',orderId,referenceId,amountEuros:100});
  assert.equal((await create()).orderId,orderId);
  omitSignature = true;
  await assert.rejects(create,/Firma/);
  omitSignature = false;
  change = {Ds_Amount:'1'};
  await assert.rejects(create,/pedido/);
});
test('a pending group balance cannot override a zero total or a settled deposit', async () => {
  const row = {Hotel_Asignado:'Sercotel Guadiana', Com_Total:'1.250,00', Com_Pagado:'250,00',
    PaymentPlan_JSON:JSON.stringify([{amount:250,status:'Cobrado'}, {amount:1000,status:'Pendiente'}])};
  const db = {collection:()=>({where:()=>({get:async()=>({docs:[{data:()=>row}]})})})};
  const resolve = amount => resolvePayGoldAmount(db,'grupos','guadiana',referenceId,amount);
  assert.equal(await resolve(1000),1000);
  assert.equal(await resolve(250),null);
  row.Com_Total = 0;
  assert.equal(await resolve(1000),null);
});
test('missing bank and internal keys stop payment processing', async t => {
  const {createInternalReceiver} = require('../functions/redsys-core/endpoints/internal-receiver');
  t.mock.method(HOTELS.cumbria, 'getSecretKey', () => undefined);
  const f = fixture();
  assert.equal((await f.notify()).status,500);
  assert.equal(f.deliveries(),0);
  const handle = createInternalReceiver({db:{},localProjectId:'gest-grupos-hotel',secretKey:''});
  let status;
  await handle({method:'POST'}, {status(value){status=value;return this;},json(){}});
  assert.equal(status,503);
});
