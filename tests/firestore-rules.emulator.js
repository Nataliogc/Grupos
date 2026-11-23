'use strict';

/**
 * Automated Firebase Auth + Firestore Security Rules validation suite.
 * Runs exclusively against local Firebase Emulators (projectId: demo-nexus-validation).
 * Never connects to production.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const PROJECT_ID = 'demo-nexus-validation';
const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';

if (!process.env.FIRESTORE_EMULATOR_HOST) process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_HOST;
if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_HOST;

const admin = require(path.join(__dirname, '..', 'functions', 'node_modules', 'firebase-admin'));

const BASE_DOC_URL = `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const AUTH_BASE_URL = `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toDocBody(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return { fields };
}

async function clearEmulators() {
  await fetch(`http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://${AUTH_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: 'DELETE' });
}

async function signUpAndSignIn(email, password) {
  const signUp = await fetch(`${AUTH_BASE_URL}/accounts:signUp?key=fake-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await signUp.json();
  assert.ok(signUp.ok && data.localId && data.idToken, `Auth emulator signUp failed for ${email}: ${JSON.stringify(data)}`);
  return { uid: data.localId, idToken: data.idToken, refreshToken: data.refreshToken, email };
}

async function signIn(email, password) {
  const res = await fetch(`${AUTH_BASE_URL}/accounts:signInWithPassword?key=fake-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}

async function fsGet(docPath, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${BASE_DOC_URL}/${docPath}`, { method: 'GET', headers });
}

async function fsCreate(collectionPath, docId, data, token) {
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const url = `${BASE_DOC_URL}/${collectionPath}?documentId=${encodeURIComponent(docId)}`;
  return fetch(url, { method: 'POST', headers, body: JSON.stringify(toDocBody(data)) });
}

async function fsPatch(docPath, data, token) {
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const mask = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(`\`${k}\``)}`).join('&');
  const url = `${BASE_DOC_URL}/${docPath}?${mask}`;
  return fetch(url, { method: 'PATCH', headers, body: JSON.stringify(toDocBody(data)) });
}

async function fsDelete(docPath, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(`${BASE_DOC_URL}/${docPath}`, { method: 'DELETE', headers });
}

async function fsRunQuery(structuredQuery, token) {
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  return fetch(`${BASE_DOC_URL}:runQuery`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ structuredQuery })
  });
}

let app;
let adminDb;
let adminAuth;
const users = {};

before(async () => {
  app = admin.initializeApp({ projectId: PROJECT_ID }, 'emulator-validation');
  adminDb = app.firestore();
  adminAuth = app.auth();
  await clearEmulators();

  // Create fictitious accounts in Auth Emulator
  users.admin = await signUpAndSignIn('admin@nexus.test', 'TestPass123!');
  users.directionAll = await signUpAndSignIn('dir.all@nexus.test', 'TestPass123!');
  users.directionNoConvert = await signUpAndSignIn('dir.noconv@nexus.test', 'TestPass123!');
  users.commercialCumbria = await signUpAndSignIn('com.cumbria@nexus.test', 'TestPass123!');
  users.commercialCumbriaConv = await signUpAndSignIn('com.cumbria.conv@nexus.test', 'TestPass123!');
  users.receptionGuadiana = await signUpAndSignIn('rec.guadiana@nexus.test', 'TestPass123!');
  users.receptionGuadianaConv = await signUpAndSignIn('rec.guadiana.conv@nexus.test', 'TestPass123!');
  users.unlinked = await signUpAndSignIn('unlinked@nexus.test', 'TestPass123!');
  users.inactive = await signUpAndSignIn('inactive@nexus.test', 'TestPass123!');
  users.demo = await signUpAndSignIn('demo@hotel.com', 'TestPass123!');

  // Seed memberships via Admin SDK (bypasses rules)
  await adminDb.collection('access_members').doc(users.admin.uid).set({
    email: users.admin.email, name: 'Admin Test', role: 'admin', active: true,
    hotels: ['cumbria', 'guadiana'], canConvertBudget: true, paymentScopes: ['cumbria/grupos', 'guadiana/grupos']
  });
  await adminDb.collection('access_members').doc(users.directionAll.uid).set({
    email: users.directionAll.email, name: 'Dir All', role: 'direction', active: true,
    hotels: ['cumbria', 'guadiana'], canConvertBudget: true
  });
  await adminDb.collection('access_members').doc(users.directionNoConvert.uid).set({
    email: users.directionNoConvert.email, name: 'Dir NoConv', role: 'direction', active: true,
    hotels: ['cumbria', 'guadiana'], canConvertBudget: false
  });
  await adminDb.collection('access_members').doc(users.commercialCumbria.uid).set({
    email: users.commercialCumbria.email, name: 'Com Cumbria', role: 'commercial', active: true,
    hotels: ['cumbria'], canConvertBudget: false
  });
  await adminDb.collection('access_members').doc(users.commercialCumbriaConv.uid).set({
    email: users.commercialCumbriaConv.email, name: 'Com Cumbria Conv', role: 'commercial', active: true,
    hotels: ['cumbria'], canConvertBudget: true
  });
  await adminDb.collection('access_members').doc(users.receptionGuadiana.uid).set({
    email: users.receptionGuadiana.email, name: 'Rec Guadiana', role: 'reception', active: true,
    hotels: ['guadiana'], canConvertBudget: false
  });
  await adminDb.collection('access_members').doc(users.receptionGuadianaConv.uid).set({
    email: users.receptionGuadianaConv.email, name: 'Rec Guadiana Conv', role: 'reception', active: true,
    hotels: ['guadiana'], canConvertBudget: true
  });
  await adminDb.collection('access_members').doc(users.inactive.uid).set({
    email: users.inactive.email, name: 'Inactive', role: 'admin', active: false,
    hotels: ['cumbria', 'guadiana'], canConvertBudget: true
  });
  // Even if demo@hotel.com somehow had an active admin membership, rules MUST block it!
  await adminDb.collection('access_members').doc(users.demo.uid).set({
    email: 'demo@hotel.com', name: 'Demo', role: 'admin', active: true,
    hotels: ['cumbria', 'guadiana'], canConvertBudget: true
  });

  // Seed sample groups, deposits, settings, and server-only docs via Admin SDK
  await adminDb.collection('groups').doc('GRP-CUM-1001').set({
    Reserva: '77001', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 5000, Com_Pagado: 1500,
    Estado: 'Confirmada', Observaciones: 'Grupo Cumbria'
  });
  await adminDb.collection('groups').doc('GRP-GUA-2001').set({
    Reserva: '88001', Hotel_Asignado: 'Sercotel Guadiana', Com_Total: 3200, Com_Pagado: 960,
    Estado: 'Confirmada', Observaciones: 'Grupo Guadiana'
  });
  await adminDb.collection('groups').doc('PRES-CUM-101').set({
    Reserva: 'PRES-CUM-101', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 2000, Com_Pagado: 0,
    Estado: 'Presupuesto', Observaciones: 'Presupuesto Cumbria'
  });
  await adminDb.collection('groups').doc('PRES-GUA-201').set({
    Reserva: 'PRES-GUA-201', Hotel_Asignado: 'Sercotel Guadiana', Com_Total: 1800, Com_Pagado: 0,
    Estado: 'Presupuesto', Observaciones: 'Presupuesto Guadiana'
  });
  await adminDb.collection('agency_deposits').doc('agencia_demo').set({
    agencyName: 'Agencia Demo', balance: 1000
  });
  await adminDb.collection('agency_deposits').doc('agencia_demo').collection('movements').doc('mov1').set({
    amount: 1000, type: 'deposit'
  });
  await adminDb.collection('settings').doc('main').set({ common: { services: [] } });
  await adminDb.collection('settings').doc('users').set({ legacy: true });
  await adminDb.collection('paygold_transactions').doc('cumbria_grupos_1001GRP00101').set({
    orderId: '1001GRP00101', amountRequested: 1500, bankStatus: 'PENDIENTE'
  });
});

after(async () => {
  await clearEmulators();
  await app.delete();
});

test('Fase 1 (Emulator): sign-in, token verification and refresh token revocation', async () => {
  const loginRes = await signIn('admin@nexus.test', 'TestPass123!');
  assert.equal(loginRes.ok, true);
  const decoded = await adminAuth.verifyIdToken(loginRes.data.idToken, true);
  assert.equal(decoded.uid, users.admin.uid);

  // Revoke tokens for a temporary test user and verify checkRevoked=true rejects the old token
  const temp = await signUpAndSignIn('revoked@nexus.test', 'TestPass123!');
  await adminAuth.verifyIdToken(temp.idToken, true);
  await new Promise(r => setTimeout(r, 1100));
  await adminAuth.revokeRefreshTokens(temp.uid);
  await assert.rejects(adminAuth.verifyIdToken(temp.idToken, true), /revoked/i);
});

test('Fase 2 (Emulator): rejects unauthenticated, demo@hotel.com, unlinked, and inactive users', async () => {
  for (const token of [null, users.demo.idToken, users.unlinked.idToken, users.inactive.idToken]) {
    const r1 = await fsGet('groups/GRP-CUM-1001', token);
    assert.equal(r1.status, 403);
    const r2 = await fsPatch('groups/GRP-CUM-1001', { Observaciones: 'hack' }, token);
    assert.equal(r2.status, 403);
    const r3 = await fsGet('settings/main', token);
    assert.equal(r3.status, 403);
  }
  // Demo user cannot even read own access_members doc
  assert.equal((await fsGet(`access_members/${users.demo.uid}`, users.demo.idToken)).status, 403);
  // Active staff can read own access_members doc, cannot read others or write own
  assert.equal((await fsGet(`access_members/${users.commercialCumbria.uid}`, users.commercialCumbria.idToken)).status, 200);
  assert.equal((await fsGet(`access_members/${users.admin.uid}`, users.commercialCumbria.idToken)).status, 403);
  assert.equal((await fsPatch(`access_members/${users.commercialCumbria.uid}`, { role: 'admin' }, users.commercialCumbria.idToken)).status, 403);
});

test('Fase 2 (Emulator): enforces strict hotel separation between Guadiana and Cumbria', async () => {
  // Cumbria-only commercial can read Cumbria group, DENIED on Guadiana group
  assert.equal((await fsGet('groups/GRP-CUM-1001', users.commercialCumbria.idToken)).status, 200);
  assert.equal((await fsGet('groups/GRP-GUA-2001', users.commercialCumbria.idToken)).status, 403);
  // Guadiana-only reception can read Guadiana group, DENIED on Cumbria group
  assert.equal((await fsGet('groups/GRP-GUA-2001', users.receptionGuadiana.idToken)).status, 200);
  assert.equal((await fsGet('groups/GRP-CUM-1001', users.receptionGuadiana.idToken)).status, 403);
  // Cumbria-only commercial cannot create quote for Guadiana
  const crossCreate = await fsCreate('groups', 'PRES-CROSS-1', {
    Reserva: 'PRES-CROSS-1', Hotel_Asignado: 'Sercotel Guadiana', Com_Total: 500
  }, users.commercialCumbria.idToken);
  assert.equal(crossCreate.status, 403);
  // Cumbria-only commercial cannot move a Cumbria quote to Guadiana
  const crossMove = await fsPatch('groups/PRES-CUM-101', { Hotel_Asignado: 'Sercotel Guadiana' }, users.commercialCumbria.idToken);
  assert.equal(crossMove.status, 403);
  // Multi-hotel admin/direction can read both hotels
  assert.equal((await fsGet('groups/GRP-CUM-1001', users.directionAll.idToken)).status, 200);
  assert.equal((await fsGet('groups/GRP-GUA-2001', users.directionAll.idToken)).status, 200);
});

test('Fase 2 (Emulator): protects financial fields, payments and confirmed reservations by profile', async () => {
  // Commercial can update operational notes on confirmed reservation in their hotel
  assert.equal((await fsPatch('groups/GRP-CUM-1001', { Observaciones: 'Nota comercial' }, users.commercialCumbria.idToken)).status, 200);
  // Commercial CANNOT modify financial or PayGold fields on confirmed reservation
  for (const field of [
    { Com_Total: 1 }, { Com_Pagado: 5000 }, { PaymentPlan_JSON: '[]' },
    { PayGold_UltimoEstado: 'PAGADO' }, { Enlace_TPV: 'https://evil.test' }, { Reserva: '99999' }
  ]) {
    assert.equal((await fsPatch('groups/GRP-CUM-1001', field, users.commercialCumbria.idToken)).status, 403);
  }
  // Commercial CANNOT delete a confirmed reservation
  assert.equal((await fsDelete('groups/GRP-CUM-1001', users.commercialCumbria.idToken)).status, 403);
  // Commercial CAN create, price-edit, and delete a quote in their hotel
  assert.equal((await fsCreate('groups', 'PRES-CUM-NEW', {
    Reserva: 'PRES-CUM-NEW', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 1200
  }, users.commercialCumbria.idToken)).status, 200);
  assert.equal((await fsPatch('groups/PRES-CUM-NEW', { Com_Total: 1350 }, users.commercialCumbria.idToken)).status, 200);
  assert.equal((await fsDelete('groups/PRES-CUM-NEW', users.commercialCumbria.idToken)).status, 200);

  // Reception can update operational notes on confirmed reservation in their hotel
  assert.equal((await fsPatch('groups/GRP-GUA-2001', { Observaciones: 'Check-in OK' }, users.receptionGuadiana.idToken)).status, 200);
  // Reception CANNOT modify financial fields on confirmed reservation OR on quote
  assert.equal((await fsPatch('groups/GRP-GUA-2001', { Com_Total: 10 }, users.receptionGuadiana.idToken)).status, 403);
  assert.equal((await fsPatch('groups/PRES-GUA-201', { Com_Total: 10 }, users.receptionGuadiana.idToken)).status, 403);
  // Reception CANNOT create or delete quotes or reservations
  assert.equal((await fsCreate('groups', 'PRES-REC-1', {
    Reserva: 'PRES-REC-1', Hotel_Asignado: 'Sercotel Guadiana', Com_Total: 500
  }, users.receptionGuadiana.idToken)).status, 403);
  assert.equal((await fsDelete('groups/PRES-GUA-201', users.receptionGuadiana.idToken)).status, 403);

  // Direction & Admin CAN modify financial fields on confirmed reservations
  assert.equal((await fsPatch('groups/GRP-CUM-1001', { Com_Total: 5100 }, users.directionAll.idToken)).status, 200);
  assert.equal((await fsPatch('groups/GRP-GUA-2001', { Com_Pagado: 1000 }, users.admin.idToken)).status, 200);
});

test('Fase 1 & 2 (Emulator): budget-to-reservation conversion is an independent configurable permission', async () => {
  // Commercial WITHOUT canConvertBudget CANNOT convert quote (create or update)
  assert.equal((await fsCreate('groups', '77901', {
    Reserva: '77901', Presupuesto_Origen: 'PRES-CUM-101', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 2000
  }, users.commercialCumbria.idToken)).status, 403);
  assert.equal((await fsPatch('groups/PRES-CUM-101', { Reserva: '77901' }, users.commercialCumbria.idToken)).status, 403);
  assert.equal((await fsPatch('groups/PRES-CUM-101', { convertedToReservation: true }, users.commercialCumbria.idToken)).status, 403);

  // Direction WITHOUT canConvertBudget CANNOT convert quote (proves independence from role!)
  assert.equal((await fsCreate('groups', '77902', {
    Reserva: '77902', Presupuesto_Origen: 'PRES-CUM-101', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 2000
  }, users.directionNoConvert.idToken)).status, 403);
  assert.equal((await fsPatch('groups/PRES-CUM-101', { convertedToReservation: true }, users.directionNoConvert.idToken)).status, 403);

  // Commercial WITH canConvertBudget CAN convert quote in authorized hotel (Cumbria)
  assert.equal((await fsCreate('groups', '77903', {
    Reserva: '77903', Presupuesto_Origen: 'PRES-CUM-101', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 2000
  }, users.commercialCumbriaConv.idToken)).status, 200);
  assert.equal((await fsPatch('groups/PRES-CUM-101', { convertedToReservation: true }, users.commercialCumbriaConv.idToken)).status, 200);
  // Still CANNOT convert for unauthorized hotel (Guadiana) or tamper with confirmed reservation financials
  assert.equal((await fsCreate('groups', '88903', {
    Reserva: '88903', Presupuesto_Origen: 'PRES-GUA-201', Hotel_Asignado: 'Sercotel Guadiana', Com_Total: 1800
  }, users.commercialCumbriaConv.idToken)).status, 403);
  assert.equal((await fsPatch('groups/77903', { Com_Pagado: 2000 }, users.commercialCumbriaConv.idToken)).status, 403);

  // Reception WITH canConvertBudget CAN convert quote in authorized hotel (Guadiana)
  assert.equal((await fsCreate('groups', '88904', {
    Reserva: '88904', sourceQuoteId: 'PRES-GUA-201', Hotel_Asignado: 'Sercotel Guadiana', Com_Total: 1800
  }, users.receptionGuadianaConv.idToken)).status, 200);
});

test('Fase 2 (Emulator): module compatibility (agency_deposits, pinned_modules, settings/users, server-only & Admin SDK)', async () => {
  // agency_deposits & movements: staff can read, only admin/direction can write
  assert.equal((await fsGet('agency_deposits/agencia_demo', users.commercialCumbria.idToken)).status, 200);
  assert.equal((await fsGet('agency_deposits/agencia_demo/movements/mov1', users.receptionGuadiana.idToken)).status, 200);
  assert.equal((await fsPatch('agency_deposits/agencia_demo', { balance: 99999 }, users.commercialCumbria.idToken)).status, 403);
  assert.equal((await fsPatch('agency_deposits/agencia_demo', { balance: 99999 }, users.receptionGuadiana.idToken)).status, 403);
  assert.equal((await fsPatch('agency_deposits/agencia_demo', { balance: 1500 }, users.directionAll.idToken)).status, 200);

  // settings/main: staff can read, only admin/direction can write
  assert.equal((await fsGet('settings/main', users.receptionGuadiana.idToken)).status, 200);
  assert.equal((await fsPatch('settings/main', { test: 1 }, users.commercialCumbria.idToken)).status, 403);
  assert.equal((await fsPatch('settings/main', { test: 1 }, users.admin.idToken)).status, 200);

  // settings/pinned_modules_<uid>: any staff can write ONLY their own doc
  const ownPinsDoc = `pinned_modules_${users.commercialCumbria.uid.toLowerCase()}`;
  const otherPinsDoc = `pinned_modules_${users.admin.uid.toLowerCase()}`;
  assert.equal((await fsCreate('settings', ownPinsDoc, { pins: { 'Admin.html#inicio': true } }, users.commercialCumbria.idToken)).status, 200);
  assert.equal((await fsCreate('settings', otherPinsDoc, { pins: { 'Admin.html#inicio': true } }, users.commercialCumbria.idToken)).status, 403);

  // settings/users is ALWAYS blocked for ALL clients including admin
  assert.equal((await fsGet('settings/users', users.admin.idToken)).status, 403);
  assert.equal((await fsPatch('settings/users', { hacked: true }, users.admin.idToken)).status, 403);

  // Server-only paygold_transactions is ALWAYS blocked for ALL clients including admin
  assert.equal((await fsGet('paygold_transactions/cumbria_grupos_1001GRP00101', users.admin.idToken)).status, 403);
  assert.equal((await fsPatch('paygold_transactions/cumbria_grupos_1001GRP00101', { bankStatus: 'COBRADO' }, users.admin.idToken)).status, 403);

  // Admin SDK (Cloud Functions) bypasses rules cleanly
  await adminDb.collection('paygold_transactions').doc('cumbria_grupos_1001GRP00101').update({ bankStatus: 'COBRADO' });
  const txSnap = await adminDb.collection('paygold_transactions').doc('cumbria_grupos_1001GRP00101').get();
  assert.equal(txSnap.data().bankStatus, 'COBRADO');
});

test('Fase 2 (Emulator): hotel-scoped queries return only authorized hotel data and reject cross-hotel/unfiltered queries', async () => {
  const cumbriaNames = ['Cumbria Spa&Hotel', 'Cumbria Spa & Hotel', 'Cumbria', 'Hotel Cumbria'];
  const guadianaNames = ['Sercotel Guadiana', 'Guadiana', 'Hotel Guadiana'];
  const hotelInQuery = (names) => ({
    from: [{ collectionId: 'groups' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'Hotel_Asignado' },
        op: 'IN',
        value: { arrayValue: { values: names.map(s => ({ stringValue: s })) } }
      }
    }
  });
  const unfilteredQuery = { from: [{ collectionId: 'groups' }] };

  // Cumbria-only commercial: Cumbria query succeeds and returns ONLY Cumbria docs
  const cumOk = await fsRunQuery(hotelInQuery(cumbriaNames), users.commercialCumbria.idToken);
  assert.equal(cumOk.status, 200);
  const cumDocs = (await cumOk.json()).filter(r => r.document).map(r => r.document.fields.Hotel_Asignado.stringValue);
  assert.ok(cumDocs.length >= 2);
  assert.ok(cumDocs.every(h => /cumbria/i.test(h)));

  // Cumbria-only commercial: unfiltered or Guadiana query DENIED (403)
  assert.equal((await fsRunQuery(unfilteredQuery, users.commercialCumbria.idToken)).status, 403);
  assert.equal((await fsRunQuery(hotelInQuery(guadianaNames), users.commercialCumbria.idToken)).status, 403);

  // Guadiana-only reception: Guadiana query succeeds and returns ONLY Guadiana docs
  const guaOk = await fsRunQuery(hotelInQuery(guadianaNames), users.receptionGuadiana.idToken);
  assert.equal(guaOk.status, 200);
  const guaDocs = (await guaOk.json()).filter(r => r.document).map(r => r.document.fields.Hotel_Asignado.stringValue);
  assert.ok(guaDocs.length >= 2);
  assert.ok(guaDocs.every(h => /guadiana/i.test(h)));

  // Guadiana-only reception: unfiltered or Cumbria query DENIED (403)
  assert.equal((await fsRunQuery(unfilteredQuery, users.receptionGuadiana.idToken)).status, 403);
  assert.equal((await fsRunQuery(hotelInQuery(cumbriaNames), users.receptionGuadiana.idToken)).status, 403);

  // Multi-hotel direction: unfiltered query succeeds and returns docs from both hotels
  const allOk = await fsRunQuery(unfilteredQuery, users.directionAll.idToken);
  assert.equal(allOk.status, 200);
  const allHotels = (await allOk.json()).filter(r => r.document).map(r => r.document.fields.Hotel_Asignado.stringValue);
  assert.ok(allHotels.some(h => /cumbria/i.test(h)));
  assert.ok(allHotels.some(h => /guadiana/i.test(h)));
});

test('Fase 2 & 3 (Emulator): negative economic protection blocks alt fields, nested objects, status tampering, forged payments and settings secrets', async () => {
  // 1. Alternative economic fields on confirmed reservation -> DENIED
  for (const payload of [
    { importeAlternativo: 1 },
    { precioFinal: 10 },
    { descuentoEspecial: 99 },
    { RoomingList_JSON: '[{"price":1}]' },
    { DailyDistribution_JSON: '{"2026-12-01":{"pvp":1}}' }
  ]) {
    assert.equal((await fsPatch('groups/GRP-CUM-1001', payload, users.commercialCumbria.idToken)).status, 403);
    assert.equal((await fsPatch('groups/GRP-GUA-2001', payload, users.receptionGuadiana.idToken)).status, 403);
  }

  // 2. Nested economic/payment objects on confirmed reservation -> DENIED
  for (const nested of [
    { payment: { paid: 9999, status: 'paid' } },
    { pricing: { total: 1, override: true } },
    { financials: { discount: 100 } }
  ]) {
    assert.equal((await fsPatch('groups/GRP-CUM-1001', nested, users.commercialCumbria.idToken)).status, 403);
    assert.equal((await fsPatch('groups/GRP-GUA-2001', nested, users.receptionGuadiana.idToken)).status, 403);
  }

  // 3. Unexpected status transitions on confirmed reservation -> DENIED
  for (const statusPayload of [
    { Estado: 'Presupuesto' },
    { Com_Estado_Interno: 'Pagado' },
    { isBudget: true },
    { status: 'cancelled' }
  ]) {
    assert.equal((await fsPatch('groups/GRP-CUM-1001', statusPayload, users.commercialCumbria.idToken)).status, 403);
    assert.equal((await fsPatch('groups/GRP-GUA-2001', statusPayload, users.receptionGuadiana.idToken)).status, 403);
  }

  // 4. Forged payment fields on quote create, quote update, or quote conversion -> DENIED
  assert.equal((await fsCreate('groups', 'PRES-FORGE-1', {
    Reserva: 'PRES-FORGE-1', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 1000, Com_Pagado: 1000
  }, users.commercialCumbria.idToken)).status, 403);
  assert.equal((await fsCreate('groups', 'PRES-FORGE-2', {
    Reserva: 'PRES-FORGE-2', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 1000, PayGold_UltimoEstado: 'PAGADO'
  }, users.commercialCumbria.idToken)).status, 403);
  assert.equal((await fsCreate('groups', '77999', {
    Reserva: '77999', Presupuesto_Origen: 'PRES-CUM-101', Hotel_Asignado: 'Cumbria Spa&Hotel', Com_Total: 2000, Com_Pagado: 2000
  }, users.commercialCumbriaConv.idToken)).status, 403);

  // 5. Writing geminiApiKey, pin, or users into settings/main -> DENIED even for admin!
  for (const forbidden of [
    { system: { geminiApiKey: 'AIzaFakeKey123' } },
    { system: { pin: '1234' } },
    { system: { users: [{ email: 'x@y.z', pass: '1234' }] } }
  ]) {
    assert.equal((await fsPatch('settings/main', forbidden, users.admin.idToken)).status, 403);
  }
});

test('Nexus Verify (Emulator): verify_documents y verify_audit_logs bloquean toda lectura/escritura cliente (incluso admin)', async () => {
  await adminDb.collection('verify_documents').doc('hash_demo_123').set({
    hotel: 'guadiana', status: 'VALID', amountCents: 100000
  });
  await adminDb.collection('verify_audit_logs').doc('audit_demo_123').set({
    eventType: 'ISSUE', hotel: 'guadiana', result: 'ok'
  });

  for (const token of [null, users.commercialCumbria.idToken, users.directionAll.idToken, users.admin.idToken]) {
    assert.equal((await fsGet('verify_documents/hash_demo_123', token)).status, 403);
    assert.equal((await fsPatch('verify_documents/hash_demo_123', { status: 'REVOKED' }, token)).status, 403);
    assert.equal((await fsCreate('verify_documents', 'hash_forged', { status: 'VALID' }, token)).status, 403);
    assert.equal((await fsGet('verify_audit_logs/audit_demo_123', token)).status, 403);
    assert.equal((await fsCreate('verify_audit_logs', 'audit_forged', { eventType: 'FAKE' }, token)).status, 403);
  }
});
