const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('js/utils.js', 'utf8').split('/**')[0];
function storage(fail = false) {
  const data = new Map();
  return { data, getItem: k => data.get(k) ?? null, removeItem: k => data.delete(k),
    setItem(k, v) { if (fail) throw new Error('QuotaExceededError'); data.set(k, v); } };
}
function load(localStorage, sessionStorage) {
  const ctx = { window: {}, localStorage, sessionStorage };
  vm.runInNewContext(code, ctx);
  return ctx.window.NexusDraftStorage;
}
test('full local storage saves and restores the rooming in the same tab', () => {
  const local = storage(true), session = storage();
  local.data.set('roomingServicios_80152', 'old');
  local.data.set('otherReservation', 'keep');
  assert.equal(load(local, session).setItem('roomingServicios_80152', 'new'), true);
  assert.equal(load(local, session).getItem('roomingServicios_80152'), 'new');
  assert.equal(local.getItem('otherReservation'), 'keep');
});
test('exhaustion preserves the previous draft and returns failure without throwing', () => {
  const local = storage(true), session = storage(true);
  local.data.set('draft', 'old');
  const api = load(local, session);
  assert.equal(api.setItem('draft', 'new'), false);
  assert.equal(api.getItem('draft'), 'old');
});
test('persistent recovery clears stale fallback and deletion removes both copies', () => {
  const local = storage(), session = storage();
  session.data.set('draft', 'old');
  const api = load(local, session);
  assert.equal(api.setItem('draft', 'new'), true);
  assert.equal(api.getItem('draft'), 'new');
  api.removeItem('draft');
  assert.equal(api.getItem('draft'), null);
});
