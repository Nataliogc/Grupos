const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('js/utils.js', 'utf8').split('/**')[0];
test('handoff initialization is safe outside the browser', () => {
  assert.doesNotThrow(() => vm.runInNewContext(code, {}));
});
function storage(fail = false) {
  const data = new Map();
  return { data, getItem: k => data.get(k) ?? null,
    removeItem: k => data.delete(k),
    setItem(k, v) { if (fail) throw new Error('QuotaExceededError'); data.set(k, v); } };
}
function load(localStorage, sessionStorage) {
  const context = { window: {}, localStorage, sessionStorage };
  vm.runInNewContext(code, context);
  return context.window.NexusSelectedGroupStorage;
}
test('full persistent storage still transfers the complete group across pages', () => {
  const local = storage(true), session = storage();
  local.data.set('selectedGroup', 'old'); local.data.set('draft', 'keep');
  const fullGroup = JSON.stringify({ id: '80753', records: [{ RoomingList_JSON: 'large rooming' }] });
  load(local, session).setItem('selectedGroup', fullGroup);
  assert.equal(load(local, session).getItem('selectedGroup'), fullGroup);
  assert.equal(local.getItem('draft'), 'keep');
});
test('falls back to persistent storage when session quota is full', () => {
  const local = storage(), session = storage(true);
  session.data.set('selectedGroup', 'stale');
  const api = load(local, session);
  api.setItem('selectedGroup', 'current');
  assert.equal(api.getItem('selectedGroup'), 'current');
  api.removeItem('selectedGroup');
  assert.equal(api.getItem('selectedGroup'), null);
});
test('reads legacy selections and reports failure if both stores are full', () => {
  const local = storage(true), session = storage(true);
  local.data.set('selectedGroup', 'legacy');
  const api = load(local, session);
  assert.equal(api.getItem('selectedGroup'), 'legacy');
  assert.throws(() => api.setItem('selectedGroup', 'new'), /No hay espacio/);
  assert.equal(api.getItem('selectedGroup'), null);
});
