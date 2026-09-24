const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { MAILBOXES, STATES, normalizeMessage, hash } = require('./mail-core');
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const options = { region: 'us-central1' };
async function member(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Inicia sesión para acceder al correo.');
  const doc = await db.collection('mailMembers').doc(request.auth.uid).get();
  const data = doc.data();
  if (!data || data.active !== true || !['admin', 'commercial'].includes(data.role)) {
    throw new HttpsError('permission-denied', 'Tu usuario todavía no tiene acceso a peticiones.');
  }
  return { ...data, uid: request.auth.uid };
}
function canRead(user, item) {
  return Array.isArray(user.mailboxes) && user.mailboxes.includes(item.mailbox);
}
exports.mailInbox = onCall(options, async request => {
  const user = await member(request);
  const allowed = MAILBOXES.filter(m => (user.mailboxes || []).includes(m));
  if (!allowed.length) throw new HttpsError('permission-denied', 'No tienes buzones asignados.');
  const batches = await Promise.all(allowed.map(m => db.collection('mailRequests').where('mailbox', '==', m).orderBy('updatedAt', 'desc').limit(100).get()));
  const members = await db.collection('mailMembers').where('active', '==', true).get();
  const mailboxes = await Promise.all(allowed.map(async address => {
    const sync = (await db.collection('mailSync').doc(address).get()).data() || {};
    const issues = await db.collection('mailSync').doc(address).collection('issues').where('resolved', '==', false).limit(20).get();
    const recent = Date.parse(sync.lastSuccessAt || '') > Date.now() - 15 * 60 * 1000;
    return { address, status: sync.status || 'pending', connected: sync.status === 'ready' && recent, lastSuccessAt: sync.lastSuccessAt || null, errorCode: sync.errorCode || '', issues: issues.docs.map(d => ({ id: d.id, ...d.data() })) };
  }));
  return {
    user: { uid: user.uid, name: user.name, role: user.role },
    requests: batches.flatMap(s => s.docs.map(d => ({ ...d.data(), id: d.id }))).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)),
    members: members.docs.filter(d => (d.data().mailboxes || []).some(m => allowed.includes(m))).map(d => ({ uid: d.id, name: d.data().name || d.id, mailboxes: d.data().mailboxes || [] })),
    mailboxes
  };
});
exports.mailDetail = onCall(options, async request => {
  const user = await member(request);
  const id = validId(request.data?.id);
  const ref = db.collection('mailRequests').doc(id);
  const doc = await ref.get();
  if (!doc.exists || !canRead(user, doc.data())) throw new HttpsError('permission-denied', 'Petición no disponible.');
  const [messages, events] = await Promise.all([ref.collection('messages').orderBy('receivedAt').limit(200).get(), ref.collection('events').orderBy('at', 'desc').limit(100).get()]);
  return { messages: messages.docs.map(d => d.data()), events: events.docs.map(d => d.data()) };
});
function validId(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) throw new HttpsError('invalid-argument', 'Identificador no válido.');
  return value;
}
exports.mailUpdate = onCall(options, async request => {
  const user = await member(request);
  const { id, version, action, value } = request.data || {};
  const ref = db.collection('mailRequests').doc(validId(id));
  await db.runTransaction(async tx => {
    const doc = await tx.get(ref);
    const item = doc.data();
    if (!item || !canRead(user, item)) throw new HttpsError('permission-denied', 'Petición no disponible.');
    if (item.version !== version) throw new HttpsError('aborted', 'Otro usuario ha actualizado esta petición. Actualiza la bandeja.');
    const changes = {};
    if (action === 'assign') {
      if (typeof value !== 'string' || value.includes('/') || value.length > 128) throw new HttpsError('invalid-argument', 'Responsable no válido.');
      if (user.role !== 'admin' && (value !== user.uid || item.assignee)) throw new HttpsError('permission-denied', 'Solo dirección puede reasignar.');
      if (value) {
        const target = (await tx.get(db.collection('mailMembers').doc(value))).data();
        if (!target?.active || !canRead(target, item)) throw new HttpsError('invalid-argument', 'El comercial no tiene acceso a este buzón.');
      }
      changes.assignee = value;
    } else {
      if (user.role !== 'admin' && item.assignee !== user.uid) throw new HttpsError('permission-denied', 'Asigna primero la petición a tu usuario.');
      if (action === 'status' && STATES.includes(value)) changes.status = value;
      else if (action === 'note' && typeof value === 'string' && value.trim() && value.length <= 4000) { /* Stored in audit event. */ }
      else throw new HttpsError('invalid-argument', 'Cambio no válido.');
    }
    const at = new Date().toISOString();
    tx.update(ref, { ...changes, version: item.version + 1, updatedAt: at });
    tx.create(ref.collection('events').doc(), { at, actor: user.name || user.uid, actorUid: user.uid, action, value, previous: action === 'assign' ? item.assignee : action === 'status' ? item.status : null });
  });
  return { ok: true };
});
// Internal adapter boundary. Never expose ingestion as an unauthenticated HTTP endpoint.
// References resolve against a private index; subjects never determine conversation identity.
exports.ingestMessage = async input => {
  const message = normalizeMessage(input);
  const index = db.collection('mailMessageIndex').doc(message.messageKey);
  const ids = [...new Set([input.messageId, ...(input.references || [])].filter(v => typeof v === 'string' && v.length <= 1000 && v))].slice(0, 41);
  const links = ids.map(id => db.collection('mailThreadLinks').doc(hash(`${message.mailbox}:${id}`)));
  return db.runTransaction(async tx => {
    const indexed = await tx.get(index);
    if (indexed.exists) return { duplicate: true, id: indexed.data().requestKey };
    const linked = await Promise.all(links.map(link => tx.get(link)));
    const knownThread = linked.find(doc => doc.exists);
    if (knownThread) message.requestKey = knownThread.data().requestKey;
    const ref = db.collection('mailRequests').doc(message.requestKey);
    const messageRef = ref.collection('messages').doc(message.messageKey);
    const [existing, parent] = await Promise.all([tx.get(messageRef), tx.get(ref)]);
    if (existing.exists) {
      tx.create(index, { requestKey: ref.id });
      return { duplicate: true, id: ref.id };
    }
    const current = parent.data();
    const at = new Date().toISOString();
    tx.create(messageRef, message);
    tx.create(index, { requestKey: ref.id });
    links.forEach((link, i) => { if (!linked[i].exists) tx.create(link, { requestKey: ref.id }); });
    if (current) tx.update(ref, { updatedAt: at, needsReply: true, version: current.version + 1 });
    else tx.create(ref, { mailbox: message.mailbox, subject: message.subject, from: message.from, status: 'Nueva', assignee: '', needsReply: true, createdAt: at, updatedAt: at, version: 1 });
    return { duplicate: false, id: ref.id };
  });
};
