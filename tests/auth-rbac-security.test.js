'use strict';

/**
 * Fase 1 regression tests: Firebase Auth, 4 roles (admin, direction, reception, commercial),
 * demo@hotel.com block, revoked tokens, existing user linking, independent configurable
 * canConvertBudget permission, PIN removal, and Usuarios.html / navigation.js hardening.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

const root = path.join(__dirname, '..');

function loadNexusUsersWithMock() {
  const members = new Map();
  const authUsers = new Map();
  const revokedUids = new Set();
  let uidSeq = 1;

  const makeDoc = (id) => ({
    id,
    ref: { id },
    get: async () => ({
      exists: members.has(id),
      ref: { id },
      data: () => (members.has(id) ? { ...members.get(id) } : undefined),
      updateTime: {
        ts: members.get(id)?._v || 1,
        isEqual(other) { return other && other.ts === this.ts; }
      }
    }),
    set: async (data) => { members.set(id, { ...data, _v: (members.get(id)?._v || 0) + 1 }); },
    create: async (data) => {
      if (members.has(id)) throw Object.assign(new Error('exists'), { code: 'already-exists' });
      members.set(id, { ...data, _v: 1 });
    },
    delete: async () => { members.delete(id); }
  });

  const db = {
    collection: (name) => {
      assert.equal(name, 'access_members');
      return { doc: (id) => makeDoc(id) };
    },
    runTransaction: async (fn) => {
      const tx = {
        get: async (docRef) => makeDoc(docRef.id).get(),
        update: (docRef, data) => {
          const cur = members.get(docRef.id) || {};
          members.set(docRef.id, { ...cur, ...data, _v: (cur._v || 0) + 1 });
        }
      };
      return fn(tx);
    }
  };

  const auth = {
    getUser: async (uid) => {
      const u = authUsers.get(uid);
      if (!u) throw Object.assign(new Error('not found'), { code: 'auth/user-not-found' });
      return { ...u };
    },
    getUserByEmail: async (email) => {
      for (const u of authUsers.values()) {
        if ((u.email || '').toLowerCase() === email.toLowerCase()) return { ...u };
      }
      throw Object.assign(new Error('not found'), { code: 'auth/user-not-found' });
    },
    listUsers: async () => ({ users: [...authUsers.values()].map(u => ({ ...u })), pageToken: undefined }),
    createUser: async ({ email, displayName, disabled }) => {
      for (const u of authUsers.values()) {
        if ((u.email || '').toLowerCase() === email.toLowerCase()) {
          throw Object.assign(new Error('exists'), { code: 'auth/email-already-exists' });
        }
      }
      const uid = 'uid-' + (++uidSeq);
      const record = { uid, email, displayName, disabled: !!disabled, tokensValidAfterTime: null };
      authUsers.set(uid, record);
      return { ...record };
    },
    updateUser: async (uid, changes) => {
      const cur = authUsers.get(uid);
      if (!cur) throw Object.assign(new Error('not found'), { code: 'auth/user-not-found' });
      Object.assign(cur, changes);
    },
    deleteUser: async (uid) => { authUsers.delete(uid); },
    revokeRefreshTokens: async (uid) => {
      revokedUids.add(uid);
      const cur = authUsers.get(uid);
      if (cur) cur.tokensValidAfterTime = new Date(Date.now() + 5000).toUTCString();
    },
    generatePasswordResetLink: async (email) => `https://example.test/reset?email=${encodeURIComponent(email)}`
  };

  class HttpsError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  }

  const targetPath = require.resolve('../functions/nexus-users');
  delete require.cache[targetPath];

  const originalLoad = Module._load;
  Module._load = function (name, ...args) {
    if (name === 'firebase-admin') {
      return {
        apps: [true],
        firestore: Object.assign(() => db, { FieldValue: { serverTimestamp: () => 'SERVER_TS' } }),
        auth: () => auth
      };
    }
    if (name === 'firebase-functions/v2/https') {
      return { onCall: (_, fn) => fn, HttpsError };
    }
    return originalLoad.call(this, name, ...args);
  };
  let mod;
  try {
    mod = require('../functions/nexus-users');
  } finally {
    Module._load = originalLoad;
  }
  return { mod, members, authUsers, revokedUids };
}

test('Fase 1: nexus-users enforces admin-only access, revoked tokens, demo block, 4 roles, hotels and canConvertBudget', async () => {
  const { mod, members, authUsers, revokedUids } = loadNexusUsersWithMock();

  // Seed admin, existing unlinked Firebase user, and demo@hotel.com
  authUsers.set('admin-1', { uid: 'admin-1', email: 'admin@nexus.test', displayName: 'Admin', disabled: false, tokensValidAfterTime: null });
  members.set('admin-1', { email: 'admin@nexus.test', name: 'Admin', role: 'admin', hotels: ['cumbria', 'guadiana'], canConvertBudget: true, active: true, _v: 1 });

  authUsers.set('existing-1', { uid: 'existing-1', email: 'rec@nexus.test', displayName: 'Recepción', disabled: false, tokensValidAfterTime: null });
  authUsers.set('demo-1', { uid: 'demo-1', email: 'demo@hotel.com', displayName: 'Demo', disabled: false, tokensValidAfterTime: null });

  const nowSec = Math.floor(Date.now() / 1000);
  const adminReq = (data = {}) => ({ auth: { uid: 'admin-1', token: { email: 'admin@nexus.test', auth_time: nowSec } }, data });

  // 1. Unauthenticated caller rejected
  await assert.rejects(mod.nexusListUsers({ auth: null, data: {} }), { code: 'unauthenticated' });

  // 2. Existing Firebase user is visible and can be linked as reception without duplicating
  const list1 = await mod.nexusListUsers(adminReq());
  const existingEntry = list1.users.find(u => u.email === 'rec@nexus.test');
  assert.ok(existingEntry && existingEntry.linked === false);

  const linkRes = await mod.nexusLinkUser(adminReq({
    email: 'rec@nexus.test', name: 'Recepción Guadiana', role: 'reception',
    hotels: ['guadiana'], canConvertBudget: true
  }));
  assert.equal(linkRes.ok, true);
  assert.equal(linkRes.uid, 'existing-1');
  assert.equal(members.get('existing-1').role, 'reception');
  assert.deepEqual(members.get('existing-1').hotels, ['guadiana']);
  assert.equal(members.get('existing-1').canConvertBudget, true);

  // 3. Non-admin (reception) is rejected server-side
  await assert.rejects(mod.nexusListUsers({
    auth: { uid: 'existing-1', token: { email: 'rec@nexus.test', auth_time: nowSec } }, data: {}
  }), { code: 'permission-denied' });

  // 4. demo@hotel.com cannot be linked or created
  await assert.rejects(mod.nexusLinkUser(adminReq({
    email: 'demo@hotel.com', name: 'Demo', role: 'commercial', hotels: ['cumbria'], canConvertBudget: false
  })), { code: 'failed-precondition' });
  await assert.rejects(mod.nexusCreateUser(adminReq({
    email: 'demo@hotel.com', name: 'Demo', role: 'commercial', hotels: ['cumbria'], canConvertBudget: false
  })), { code: 'permission-denied' });

  // 5. Create commercial with configurable canConvertBudget=false and single hotel
  const created = await mod.nexusCreateUser(adminReq({
    email: 'com@nexus.test', name: 'Comercial Cumbria', role: 'commercial',
    hotels: ['cumbria'], canConvertBudget: false
  }));
  assert.equal(created.role, 'commercial');
  assert.deepEqual(created.hotels, ['cumbria']);
  assert.equal(created.canConvertBudget, false);
  assert.ok(created.setupLink.includes('com%40nexus.test'));

  // 6. Toggle canConvertBudget and revoke user (triggers revokeRefreshTokens)
  await mod.nexusUpdateUser(adminReq({
    uid: created.uid, canConvertBudget: true, hotels: ['cumbria', 'guadiana'], paymentScopes: ['cumbria/grupos']
  }));
  assert.equal(members.get(created.uid).canConvertBudget, true);
  assert.deepEqual(members.get(created.uid).paymentScopes, ['cumbria/grupos']);

  await mod.nexusUpdateUser(adminReq({ uid: created.uid, active: false }));
  assert.equal(revokedUids.has(created.uid), true);
  assert.equal(authUsers.get(created.uid).disabled, true);

  // 7. Revoked admin token is rejected by requireAdmin
  authUsers.get('admin-1').tokensValidAfterTime = new Date((nowSec + 60) * 1000).toUTCString();
  await assert.rejects(mod.nexusListUsers(adminReq()), { code: 'unauthenticated' });
});

test('Fase 1: authorize-request accepts reception and rejects demo, inactive and revoked tokens', async () => {
  const { authorizeRequest } = require('../functions/authorize-request');
  const auth = {
    verifyIdToken: async (tok, checkRevoked) => {
      assert.equal(checkRevoked, true);
      if (tok === 'revoked') throw new Error('auth/id-token-revoked');
      if (tok === 'demo') return { uid: 'd', email: 'demo@hotel.com' };
      return { uid: 'r', email: 'rec@nexus.test' };
    }
  };
  let member = { active: true, role: 'reception', hotels: ['guadiana'] };
  const db = { collection: () => ({ doc: () => ({ get: async () => ({ data: () => member }) }) }) };

  assert.equal((await authorizeRequest('Bearer ok', auth, db)).status, 200);
  assert.equal((await authorizeRequest('Bearer revoked', auth, db)).status, 401);
  assert.equal((await authorizeRequest('Bearer demo', auth, db)).status, 403);
  member = { active: false, role: 'reception' };
  assert.equal((await authorizeRequest('Bearer ok', auth, db)).status, 403);
});

test('Fase 1: shared PIN removed from Configuracion and plaintext password storage removed from navigation.js', () => {
  const cfgJsx = fs.readFileSync(path.join(root, 'src', 'Configuracion.jsx'), 'utf8');
  const cfgJs = fs.readFileSync(path.join(root, 'js', 'Configuracion.js'), 'utf8');
  const navJs = fs.readFileSync(path.join(root, 'js', 'navigation.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const usuariosHtml = fs.readFileSync(path.join(root, 'Usuarios.html'), 'utf8');

  assert.doesNotMatch(cfgJsx, /pin:\s*["']1234["']/);
  assert.doesNotMatch(cfgJs, /pin:\s*["']1234["']/);
  assert.doesNotMatch(cfgJsx, /PIN de Acceso/);
  assert.doesNotMatch(cfgJs, /PIN de Acceso/);
  assert.match(cfgJsx, /delete dataToSave\.system\.pin/);

  assert.doesNotMatch(navJs, /pass:\s*["']1234["']/);
  assert.match(navJs, /reauthenticateWithCredential/);
  assert.match(navJs, /updatePassword/);

  assert.doesNotMatch(indexHtml, /pin:\s*["']1234["']/);
  assert.match(usuariosHtml, /m\?\.role!=='admin'/);
  assert.match(usuariosHtml, /value="reception"/);
  assert.match(usuariosHtml, /canConvertBudget/);
});

test('Fase 2: Gemini client never reads geminiApiKey or calls Google AI directly; Configuracion strips geminiApiKey', async (t) => {
  const geminiJs = fs.readFileSync(path.join(root, 'js', 'gemini.js'), 'utf8');
  const cfgJsx = fs.readFileSync(path.join(root, 'src', 'Configuracion.jsx'), 'utf8');
  const cfgJs = fs.readFileSync(path.join(root, 'js', 'Configuracion.js'), 'utf8');

  assert.doesNotMatch(geminiJs, /geminiApiKey/);
  assert.doesNotMatch(geminiJs, /generativelanguage\.googleapis\.com/);
  assert.doesNotMatch(geminiJs, /firebaseConfig\.apiKey/);
  assert.match(geminiJs, /analizarGruposIA/);

  assert.doesNotMatch(cfgJsx, /Gemini API Key/);
  assert.doesNotMatch(cfgJs, /Gemini API Key/);
  assert.match(cfgJsx, /delete dataToSave\.system\.geminiApiKey/);

  // Test callGemini runtime behavior: rejects unauthenticated, sends Bearer token when authenticated
  const { callGemini } = require('../js/gemini');
  globalThis.firebase = { auth: () => ({ currentUser: null }) };
  const unauthRes = await callGemini('Hola');
  assert.equal(unauthRes.ok, false);
  assert.equal(unauthRes.status, 401);

  let capturedAuth = '';
  let capturedUrl = '';
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    capturedUrl = url;
    capturedAuth = init.headers.Authorization;
    return { ok: true, status: 200, text: async () => JSON.stringify({ ok: true, text: 'Respuesta IA' }) };
  });
  globalThis.firebase = { auth: () => ({ currentUser: { getIdToken: async () => 'fake-id-token-123' } }) };
  const authRes = await callGemini('Resume este grupo');
  assert.equal(authRes.ok, true);
  assert.equal(authRes.text, 'Respuesta IA');
  assert.equal(capturedAuth, 'Bearer fake-id-token-123');
  assert.match(capturedUrl, /analizarGruposIA/);
  delete globalThis.firebase;
});
