'use strict';

/**
 * Fase 3 & Fase 4 regression tests:
 * - Redsys / PayGold createPayGold auth, scope, server-side amount verification, missing secrets
 * - Redsys signature verification, wrong merchant/reference, idempotency, concurrency
 * - External integration contracts: MesaChef, Gest-Spa, Redsys Cumbria, Redsys Guadiana
 * - Cross-project dispatcher & internal receiver HMAC + anti-replay
 * - Absence of literal Redsys/internal secrets in codebase
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { generateServiceAuthToken, verifyServiceAuthToken } = require('../functions/redsys-core/core/redsys-crypto');
const { HOTELS, identifyHotelByMerchantCode } = require('../functions/redsys-core/core/hotels-config');
const { createInternalReceiver } = require('../functions/redsys-core/endpoints/internal-receiver');
const { dispatchPaymentNotification } = require('../functions/redsys-core/dispatchers/cross-project-dispatcher');
const { applySpaPayment } = require('../functions/redsys-core/adapters/gestspa-adapter');
const { applyMesaChefPayment } = require('../functions/redsys-core/adapters/mesachef-adapter');
const { applyGruposPayment } = require('../functions/redsys-core/adapters/grupos-adapter');
const { resolvePayGoldAmount } = require('../functions/paygold-amount');
const { decodeAndVerifyResponse, signPayload } = require('../functions/redsys');

const fakeKey = Buffer.alloc(24, 9).toString('base64');
const fakeInterSecret = 'test-inter-service-secret-fixture-only';

test('Grupos registra una sola vez el pago íntegro y cierra el tramo', async () => {
  const db = makeTransactionalDb([['groups/grupo', {
    Reserva: 80404, Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 1292,
    PaymentPlan_JSON: JSON.stringify([{ amount: 1292, status: 'Pendiente' }])
  }]]);
  const notification = {
    hotel: 'cumbria', hotelName: 'Cumbria', app: 'grupos', referenceId: '80404',
    orderId: '1001GRP40401', authCode: 'TEST', amountEuros: 1292, isAuthorized: true
  };
  const apply = () => applyGruposPayment({ db, notification });
  await Promise.all([apply(), apply()]);
  const row = db.store.get('groups/grupo');
  assert.equal(row.Com_Pagado, 1292);
  assert.equal(row.PayGold_UltimoEstado, 'PAGADO');
  assert.equal(JSON.parse(row.PaymentPlan_JSON)[0].status, 'Cobrado');
  assert.equal(JSON.parse(row.tracking).length, 1);
});

function makeTransactionalDb(initialEntries = []) {
  const store = new Map(initialEntries);
  let queue = Promise.resolve();
  const getRef = (col, id) => ({
    id,
    path: `${col}/${id}`,
    get: async () => ({ exists: store.has(`${col}/${id}`), id, ref: getRef(col, id), data: () => (store.has(`${col}/${id}`) ? { ...store.get(`${col}/${id}`) } : undefined) }),
    set: async (data, opts) => {
      const k = `${col}/${id}`;
      store.set(k, opts?.merge && store.has(k) ? { ...store.get(k), ...data } : { ...data });
    },
    update: async (data) => {
      const k = `${col}/${id}`;
      store.set(k, { ...(store.get(k) || {}), ...data });
    }
  });
  return {
    store,
    collection: (col) => ({
      doc: (id) => getRef(col, id),
      where: (field, op, value) => ({
        limit: () => ({
          get: async () => {
            const docs = [];
            for (const [k, v] of store.entries()) {
              if (k.startsWith(col + '/') && v[field] === value) {
                const id = k.slice(col.length + 1);
                docs.push({ id, ref: getRef(col, id), data: () => ({ ...v }) });
              }
            }
            return { empty: docs.length === 0, docs };
          }
        }),
        get: async () => {
          const docs = [];
          for (const [k, v] of store.entries()) {
            if (k.startsWith(col + '/') && v[field] === value) {
              const id = k.slice(col.length + 1);
              docs.push({ id, ref: getRef(col, id), data: () => ({ ...v }) });
            }
          }
          return { empty: docs.length === 0, docs };
        }
      })
    }),
    runTransaction: (fn) => {
      const run = queue.then(() => fn({
        get: async (ref) => ({ exists: store.has(ref.path), id: ref.id, data: () => (store.has(ref.path) ? { ...store.get(ref.path) } : undefined) }),
        set: (ref, data) => { store.set(ref.path, { ...data }); },
        update: (ref, data) => { store.set(ref.path, { ...(store.get(ref.path) || {}), ...data }); }
      }));
      queue = run.catch(() => {});
      return run;
    }
  };
}

test('Fase 3: Redsys decodeAndVerifyResponse enforces timing-safe signature validation', () => {
  const signed = signPayload({
    DS_MERCHANT_ORDER: '1001GRP00101',
    DS_MERCHANT_AMOUNT: '15000',
    DS_MERCHANT_MERCHANTCODE: HOTELS.cumbria.merchantCode,
    Ds_Response: '9998',
    Ds_UrlPago2Fases: 'https://example.test/pay'
  }, fakeKey);

  const ok = decodeAndVerifyResponse(signed, fakeKey);
  assert.equal(ok.ok, true);
  assert.equal(ok.signatureValid, true);

  assert.throws(() => decodeAndVerifyResponse({ ...signed, Ds_Signature: 'A'.repeat(44) }, fakeKey), /Firma bancaria incorrecta/);
  assert.throws(() => decodeAndVerifyResponse({ ...signed, Ds_Signature: '' }, fakeKey), /Firma bancaria incorrecta/);
});

test('Fase 3 & 4: Inter-service HMAC token enforces signature and anti-replay nonce', () => {
  const payload = { app: 'grupos', hotel: 'guadiana', orderId: '1002GRP00201', amountEuros: 250 };
  const token = generateServiceAuthToken(payload, fakeInterSecret);
  assert.equal(verifyServiceAuthToken(payload, token, fakeInterSecret), true);
  // Replaying the exact same nonce MUST fail
  assert.equal(verifyServiceAuthToken(payload, token, fakeInterSecret), false);
  // Tampered payload MUST fail
  const token2 = generateServiceAuthToken(payload, fakeInterSecret);
  assert.equal(verifyServiceAuthToken({ ...payload, amountEuros: 1 }, token2, fakeInterSecret), false);
  // Expired timestamp MUST fail
  const oldToken = generateServiceAuthToken(payload, fakeInterSecret, { timestamp: Date.now() - 10 * 60 * 1000 });
  assert.equal(verifyServiceAuthToken(payload, oldToken, fakeInterSecret), false);
});

test('Fase 4: Gest-Spa adapter isolates to Cumbria and updates payment idempotently', async () => {
  const db = makeTransactionalDb([
    ['reservas_spa/SPA-100', { precio_total: 120, payment: { paid: 0, history: [] } }]
  ]);
  // Guadiana MUST be rejected for Gest-Spa
  await assert.rejects(applySpaPayment({
    db,
    notification: { hotel: 'guadiana', app: 'spa', orderId: '1003SPA10001', referenceId: 'SPA-100', amountEuros: 120, isAuthorized: true, authCode: 'A1', hotelName: 'Guadiana', fuc: HOTELS.guadiana.merchantCode, responseCode: '0000', bankDescription: 'OK' },
    logger: { info() {}, warn() {}, error() {} }
  }), /Hotel incorrecto para Gest-Spa/);

  // Cumbria succeeds once and duplicate delivery is idempotent
  const notif = { hotel: 'cumbria', app: 'spa', orderId: '1003SPA10001', referenceId: 'SPA-100', amountEuros: 120, isAuthorized: true, authCode: 'A1', hotelName: 'Cumbria', fuc: HOTELS.cumbria.merchantCode, responseCode: '0000', bankDescription: 'OK' };
  const [r1, r2] = await Promise.all([
    applySpaPayment({ db, notification: notif, logger: { info() {}, warn() {}, error() {} } }),
    applySpaPayment({ db, notification: notif, logger: { info() {}, warn() {}, error() {} } })
  ]);
  assert.equal([r1, r2].filter(r => r.idempotent).length, 1);
  assert.equal(db.store.get('reservas_spa/SPA-100').payment.paid, 120);
  assert.equal(db.store.get('reservas_spa/SPA-100').pagado, true);
});

test('Fase 4: MesaChef adapter validates hotel affinity and updates restaurant booking idempotently', async () => {
  const db = makeTransactionalDb([
    ['reservas_restaurante/RES-2026-55', { paygoldRef: 'RES-2026-55', hotel: 'Sercotel Guadiana', total: 400, fianzaAcordada: 100, fianzaPagada: 0, estado: 'pendiente' }]
  ]);
  // Wrong hotel (cumbria for a guadiana booking) MUST fail
  await assert.rejects(applyMesaChefPayment({
    db,
    notification: { hotel: 'cumbria', app: 'mesachef', modulo: 'restaurante', orderId: '1004RES05501', referenceId: 'RES-2026-55', amountEuros: 100, isAuthorized: true, authCode: 'M1', hotelName: 'Cumbria', fuc: HOTELS.cumbria.merchantCode, responseCode: '0000', bankDescription: 'OK' },
    logger: { info() {}, warn() {}, error() {} }
  }), /Hotel incorrecto/);

  // Matching hotel (guadiana) succeeds and confirms booking once
  const notif = { hotel: 'guadiana', app: 'mesachef', modulo: 'restaurante', orderId: '1004RES05501', referenceId: 'RES-2026-55', amountEuros: 100, isAuthorized: true, authCode: 'M1', hotelName: 'Sercotel Guadiana', fuc: HOTELS.guadiana.merchantCode, responseCode: '0000', bankDescription: 'OK' };
  const res1 = await applyMesaChefPayment({ db, notification: notif, logger: { info() {}, warn() {}, error() {} } });
  const res2 = await applyMesaChefPayment({ db, notification: notif, logger: { info() {}, warn() {}, error() {} } });
  assert.equal(res1.success, true);
  assert.equal(res2.idempotent, true);
  assert.equal(db.store.get('reservas_restaurante/RES-2026-55').fianzaPagada, 100);
  assert.equal(db.store.get('reservas_restaurante/RES-2026-55').estado, 'confirmada');
});

test('Fase 4: Internal receiver & cross-project dispatcher contract (Guadiana -> Grupos)', async () => {
  const db = makeTransactionalDb([
    ['groups/77593', { Reserva: '77593', Hotel_Asignado: 'Sercotel Guadiana', Com_Total: 1000, Com_Pagado: 0, PaymentPlan_JSON: JSON.stringify([{ amount: 300, status: 'Pendiente' }, { amount: 700, status: 'Pendiente' }]) }]
  ]);
  const receiver = createInternalReceiver({
    db,
    localProjectId: 'gest-grupos-hotel',
    secretKey: fakeInterSecret,
    logger: { info() {}, warn() {}, error() {} }
  });

  const payload = {
    hotel: 'guadiana', hotelName: 'Sercotel Guadiana', fuc: HOTELS.guadiana.merchantCode,
    app: 'grupos', modulo: 'grupos', orderId: '1005GRP59301', referenceId: '77593',
    amountEuros: 300, responseCode: '0000', authCode: 'GUA1', isAuthorized: true, bankDescription: 'Autorizado'
  };

  // Dispatch from mesa-chef-prod -> gest-grupos-hotel via mocked HTTPS calling internal receiver
  process.env.INTER_SERVICE_AUTH_SECRET = fakeInterSecret;
  try {
    const dispatchRes = await dispatchPaymentNotification({
      route: { app: 'grupos', modulo: 'grupos', targetProject: 'gest-grupos-hotel' },
      payload,
      localProjectId: 'mesa-chef-prod',
      customFetch: async (_url, init) => {
        let statusCode = 200;
        let jsonBody = null;
        await receiver(
          { method: init.method, headers: init.headers, body: JSON.parse(init.body) },
          { status(c) { statusCode = c; return this; }, json(b) { jsonBody = b; return this; } }
        );
        return { ok: statusCode >= 200 && statusCode < 300, status: statusCode, json: async () => jsonBody };
      },
      logger: { info() {}, warn() {}, error() {} }
    });
    assert.equal(dispatchRes.success, true);
    assert.equal(dispatchRes.method, 'https_remote');
    assert.equal(db.store.get('groups/77593').Com_Pagado, 300);
    assert.equal(db.store.get('groups/77593').PayGold_UltimoEstado, 'COBRADO');
  } finally {
    delete process.env.INTER_SERVICE_AUTH_SECRET;
  }
});

test('Fase 3 & 4: FUC hotel mapping and absence of literal secrets in functions/', () => {
  assert.equal(identifyHotelByMerchantCode('168271567'), 'cumbria');
  assert.equal(identifyHotelByMerchantCode('168355840'), 'guadiana');
  assert.equal(identifyHotelByMerchantCode('999999999'), null);

  const functionsDir = path.join(__dirname, '..', 'functions');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.name === 'node_modules') return [];
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : (e.name.endsWith('.js') ? [full] : []);
  });
  for (const file of walk(functionsDir)) {
    const src = fs.readFileSync(file, 'utf8');
    // Ensure no hardcoded 24-byte base64 Redsys secret keys or inter-service fallback secrets exist
    assert.doesNotMatch(src, /REDSYS_SECRET_KEY_(CUMBRIA|GUADIANA)\s*\|\|\s*['"][^'"]+['"]/, `Hardcoded Redsys fallback in ${file}`);
    assert.doesNotMatch(src, /INTER_SERVICE_AUTH_SECRET\s*\|\|\s*['"][^'"]+['"]/, `Hardcoded inter-service fallback in ${file}`);
  }
});
