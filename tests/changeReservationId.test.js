const assert = require('node:assert/strict');
const { changeReservationId } = require('../src/services/changeReservationId');
const normalizeId = value => String(value || '').trim();
function fixture(initial) {
  const data = new Map(Object.entries(initial));
  const ref = id => ({ id });
  const snap = id => ({ id, ref: ref(id), exists: data.has(id), data: () => data.get(id) });
  const db = {
    collection: () => ({ doc: ref, get: async () => ({ docs: [...data.keys()].map(snap) }) }),
    runTransaction: async fn => {
      const writes = [];
      const result = await fn({
        get: async ref => snap(ref.id),
        set: (ref, value) => writes.push(() => data.set(ref.id, value)),
        delete: ref => writes.push(() => data.delete(ref.id)),
        update: (ref, value) => writes.push(() => data.set(ref.id, { ...data.get(ref.id), ...value }))
      });
      writes.forEach(write => write());
      return result;
    }
  };
  return { data, run: newId => changeReservationId({ db, oldId: '123', newId, normalizeId, timestamp: () => 'now' }) };
}
(async () => {
  const original = { Reserva: '123', PaymentPlan_JSON: '[{"paid":150}]', RoomingList_JSON: '[{"name":"Ana"}]', tracking: '[]' };
  const f = fixture({ 123: original, detail: { Reserva: '123', extra: 20 }, parent: { Reserva: 'PRES1', childReservationIds: ['123'] } });
  const result = await f.run('456');
  assert.equal(result.records.length, 2);
  assert.equal(f.data.get('456').PaymentPlan_JSON, original.PaymentPlan_JSON);
  assert.equal(f.data.get('456').RoomingList_JSON, original.RoomingList_JSON);
  assert.equal(f.data.get('456__detail').extra, 20);
  assert.deepEqual(f.data.get('parent').childReservationIds, ['456']);
  assert.equal(f.data.has('123'), false);
  assert.equal(f.data.has('detail'), false);
  assert.match(f.data.get('456').tracking, /123.*456/);
  for (const newId of ['', '123', '456']) {
    const conflict = fixture({ 123: original, 456: { Reserva: '456' } });
    await assert.rejects(conflict.run(newId));
    assert.deepEqual(conflict.data.get('123'), original);
    assert.equal(conflict.data.size, 2);
  }
  console.log('OK: preserves records, payments, rooming and series links; rejects empty, unchanged and occupied IDs.');
})().catch(error => { console.error(error); process.exitCode = 1; });
