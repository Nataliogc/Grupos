const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { normalizeMessage } = require('../functions/mail-core');
const base = { mailbox: 'grupos@hotelguadiana.es', providerId: 'message-1', threadId: 'thread-1', from: 'client@example.com', subject: 'Petición', body: '20 habitaciones', receivedAt: '2026-09-24T10:00:00Z' };
test('message identity is stable and isolated by mailbox; replies share the request', () => {
  const first = normalizeMessage(base);
  assert.equal(first.messageKey, normalizeMessage({ ...base, mailbox: ' GRUPOS@HOTELGUADIANA.ES ' }).messageKey);
  const reply = normalizeMessage({ ...base, providerId: 'message-2' });
  assert.equal(first.requestKey, reply.requestKey);
  assert.notEqual(first.messageKey, reply.messageKey);
  assert.notEqual(first.requestKey, normalizeMessage({ ...base, mailbox: 'grupos@encumbria.es' }).requestKey);
});
test('untrusted input rejects unknown mailbox, missing identity and oversized messages', () => {
  for (const change of [{ mailbox: 'other@example.com' }, { providerId: '' }, { threadId: '' }, { receivedAt: 'invalid' }, { body: 'x'.repeat(200001) }]) {
    assert.throws(() => normalizeMessage({ ...base, ...change }));
  }
});
// In-memory transactional store checks handler authorization and write behavior without production access.
const records = new Map();
let eventId = 0;
const ref = path => ({ path, id: path.split('/').pop(), collection: name => collection(`${path}/${name}`), get: async () => snapshot(path) });
const snapshot = path => ({ exists: records.has(path), data: () => records.get(path) });
const collection = path => ({ doc: id => ref(`${path}/${id || ++eventId}`) });
const db = { collection, runTransaction: async fn => {
  const pending = [];
  const result = await fn({ get: async r => snapshot(r.path), create: (r, data) => pending.push(() => { assert.equal(records.has(r.path), false); records.set(r.path, data); }), update: (r, data) => pending.push(() => records.set(r.path, { ...records.get(r.path), ...data })) });
  pending.forEach(write => write()); return result;
} };
const originalLoad = Module._load;
Module._load = function(name, ...args) {
  if (name === 'firebase-admin') return { apps: [true], firestore: () => db };
  if (name === 'firebase-functions/v2/https') return { onCall: (_, fn) => fn, HttpsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  return originalLoad.call(this, name, ...args);
};
const mail = require('../functions/mail');
Module._load = originalLoad;
test('ingestion, deduplication, reply retention and assignment authorization', async () => {
  const result = await mail.ingestMessage(base);
  const key = `mailRequests/${result.id}`;
  assert.equal(records.get(key).status, 'Nueva');
  assert.equal((await mail.ingestMessage(base)).duplicate, true);
  assert.equal(records.get(key).version, 1);
  records.set('mailMembers/alice', { active: true, role: 'commercial', name: 'Alice', mailboxes: [base.mailbox] });
  records.set('mailMembers/bob', { active: true, role: 'commercial', name: 'Bob', mailboxes: [base.mailbox] });
  records.set('mailMembers/admin', { active: true, role: 'admin', name: 'Admin', mailboxes: [base.mailbox] });
  const request = (uid, version, action, value) => ({ auth: uid ? { uid } : null, data: { id: result.id, version, action, value } });
  await assert.rejects(mail.mailUpdate(request(null, 1, 'assign', 'alice')), { code: 'unauthenticated' });
  await assert.rejects(mail.mailUpdate(request('unknown', 1, 'assign', 'unknown')), { code: 'permission-denied' });
  await mail.mailUpdate(request('alice', 1, 'assign', 'alice'));
  await assert.rejects(mail.mailUpdate(request('bob', 1, 'assign', 'bob')), { code: 'aborted' });
  await assert.rejects(mail.mailUpdate(request('bob', 2, 'assign', 'bob')), { code: 'permission-denied' });
  await assert.rejects(mail.mailUpdate(request('bob', 2, 'status', 'Ganada')), { code: 'permission-denied' });
  await mail.mailUpdate(request('alice', 2, 'note', 'Llamar mañana'));
  await mail.ingestMessage({ ...base, providerId: 'message-2', body: 'Nueva respuesta' });
  assert.equal(records.get(key).assignee, 'alice');
  assert.equal(records.get(key).version, 4);
  await mail.mailUpdate(request('admin', 4, 'assign', 'bob'));
  assert.equal(records.get(key).assignee, 'bob');
  records.set('mailMembers/other', { active: true, role: 'commercial', mailboxes: ['grupos@encumbria.es'] });
  await assert.rejects(mail.mailUpdate(request('other', 5, 'status', 'Ganada')), { code: 'permission-denied' });
  await assert.rejects(mail.mailUpdate(request('admin', 5, 'assign', 'other')), { code: 'invalid-argument' });
  assert.equal(records.get(key).version, 5);
  assert.equal([...records.keys()].filter(k => k.includes('/events/')).length, 3);
});
