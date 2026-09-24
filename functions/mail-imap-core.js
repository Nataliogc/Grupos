const { createHash } = require('node:crypto');
const { MAILBOXES } = require('./mail-core');
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const digest = value => createHash('sha256').update(value).digest('hex');

function parseAccounts(raw) {
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.length > MAILBOXES.length) throw new Error('invalid-config');
  const seen = new Set();
  return data.filter(a => a.enabled === true).map(a => {
    const mailbox = String(a.mailbox || '').trim().toLowerCase();
    if (!MAILBOXES.includes(mailbox) || seen.has(mailbox)) throw new Error('invalid-config');
    seen.add(mailbox);
    if (typeof a.host !== 'string' || !/^[a-z0-9.-]+$/i.test(a.host) || !a.host.includes('.')) throw new Error('invalid-config');
    if (typeof a.user !== 'string' || !a.user.trim() || typeof a.password !== 'string' || !a.password) throw new Error('invalid-config');
    if (a.port !== undefined && a.port !== 993) throw new Error('invalid-config');
    if (a.secure === false) throw new Error('invalid-config');
    return { mailbox, host: a.host.toLowerCase(), user: a.user, password: a.password, folder: 'INBOX' };
  });
}

function planRange(state, mailbox, sourceKey) {
  const validity = String(mailbox.uidValidity || '');
  const next = Number(mailbox.uidNext);
  if (!validity || !Number.isSafeInteger(next) || next < 1) throw new Error('invalid-server-state');
  if (!state.uidValidity) return { initialize: true, uidValidity: validity, lastUid: next - 1, sourceKey };
  if (state.uidValidity !== validity || state.sourceKey !== sourceKey) throw new Error('mailbox-changed');
  if (!Number.isSafeInteger(state.lastUid) || state.lastUid < 0 || state.lastUid >= next) throw new Error('invalid-cursor');
  const end = Math.min(state.lastUid + 100, next - 1);
  return { initialize: false, start: state.lastUid + 1, end, uidValidity: validity };
}

function messageIds(value) {
  const values = Array.isArray(value) ? value : [value || ''];
  return [...new Set(values.flatMap(v => String(v).match(/<[^<>\s]{1,990}>/g) || []))].slice(-40);
}

function parsedMessage(parsed, account, uidValidity, uid, internalDate) {
  const own = messageIds(parsed.messageId)[0];
  const references = messageIds(parsed.references);
  const parent = messageIds(parsed.inReplyTo);
  const providerId = own || `imap:${uidValidity}:${uid}`;
  const originalText = String(parsed.text || '').trim();
  const attachments = (parsed.attachments || []).slice(0, 100).map(a => ({
    filename: String(a.filename || 'Adjunto sin nombre').slice(0, 240),
    contentType: String(a.contentType || 'application/octet-stream').slice(0, 100),
    size: Number(a.size) || 0
  }));
  const date = internalDate || parsed.date;
  if (!date || !Number.isFinite(new Date(date).getTime())) throw new Error('invalid-message-date');
  return {
    mailbox: account.mailbox, providerId,
    threadId: references[0] || parent[0] || providerId,
    messageId: own || '', references: [...new Set([...references, ...parent])],
    from: String(parsed.from?.text || 'Remitente no disponible').slice(0, 1000),
    replyTo: String(parsed.replyTo?.value?.[0]?.address || parsed.from?.value?.[0]?.address || '').slice(0, 320),
    internetMessageId: own || '',
    subject: String(parsed.subject || '(Sin asunto)').slice(0, 1000),
    body: originalText.slice(0, 160000) || (attachments.length ? 'Correo sin texto. Contiene adjuntos; consúltalos en Outlook.' : 'Correo sin texto legible. Consulta el original en Outlook.'),
    truncated: originalText.length > 160000,
    attachments, attachmentCount: (parsed.attachments || []).length,
    receivedAt: new Date(date).toISOString()
  };
}

// Dependencies are injected to exercise crash recovery without a real mailbox.
async function syncAccount(account, deps) {
  const { store, createClient, parse, ingest, now = () => Date.now() } = deps;
  const lease = await store.acquire(account.mailbox);
  if (!lease) return { status: 'busy' };
  let client, lock;
  try {
    client = createClient(account);
    await client.connect();
    lock = await client.getMailboxLock(account.folder, { readOnly: true });
    const sourceKey = digest(`${account.host}:${account.user}:${account.folder}`);
    const state = await store.read(account.mailbox);
    const plan = planRange(state, client.mailbox, sourceKey);
    if (plan.initialize) {
      await store.patch(account.mailbox, { uidValidity: plan.uidValidity, lastUid: plan.lastUid, sourceKey, status: 'ready', activatedAt: new Date(now()).toISOString(), lastSuccessAt: new Date(now()).toISOString(), errorCode: '' });
      return { status: 'initialized', imported: 0 };
    }
    let imported = 0, issues = 0, lastUid = state.lastUid;
    const started = now();
    if (plan.start <= plan.end) {
      // Finish the metadata fetch before issuing any other IMAP command.
      const messages = await client.fetchAll(`${plan.start}:${plan.end}`, { uid: true, size: true, internalDate: true }, { uid: true });
      messages.sort((a, b) => a.uid - b.uid);
      for (const meta of messages) {
        if (meta.uid < plan.start || meta.uid > plan.end) throw new Error('invalid-server-state');
        if (now() - started > 90000) break;
        if (!Number.isFinite(meta.size) || meta.size > MAX_SOURCE_BYTES) {
          await store.issue(account.mailbox, plan.uidValidity, meta.uid, 'message-too-large');
          issues++;
        } else {
          // Bounded download; an unexpected network error must not advance the cursor.
          const download = await client.download(String(meta.uid), undefined, { uid: true, maxBytes: MAX_SOURCE_BYTES + 1 });
          if (!download?.content) throw new Error('message-unavailable');
          const chunks = []; let bytes = 0;
          for await (const chunk of download.content) {
            bytes += chunk.length;
            if (bytes > MAX_SOURCE_BYTES) { download.content.destroy(); throw new Error('message-size-changed'); }
            chunks.push(chunk);
          }
          let message;
          try {
            const parsed = await parse(Buffer.concat(chunks));
            message = parsedMessage(parsed, account, plan.uidValidity, meta.uid, meta.internalDate);
          } catch {
            await store.issue(account.mailbox, plan.uidValidity, meta.uid, 'message-unreadable');
            issues++;
          }
          if (message) { await ingest(message); imported++; }
        }
        lastUid = meta.uid;
        // Durable checkpoint only after ingestion or a durable incident record.
        await store.patch(account.mailbox, { lastUid });
      }
      if (messages.length === 0 || lastUid === messages[messages.length - 1].uid) lastUid = plan.end;
    }
    await store.patch(account.mailbox, { lastUid, status: 'ready', lastSuccessAt: new Date(now()).toISOString(), errorCode: '' });
    return { status: 'ready', imported, issues };
  } catch (error) {
    const known = ['mailbox-changed', 'invalid-cursor', 'invalid-server-state', 'message-unavailable', 'message-size-changed'];
    const errorCode = error.authenticationFailed ? 'authentication-failed' : known.includes(error.message) ? error.message : 'connection-or-sync-failed';
    await store.patch(account.mailbox, { status: 'error', errorCode, lastErrorAt: new Date(now()).toISOString() });
    return { status: 'error', errorCode };
  } finally {
    try { lock?.release(); } finally { client?.close(); await store.release(account.mailbox, lease); }
  }
}
module.exports = { MAX_SOURCE_BYTES, parseAccounts, planRange, parsedMessage, messageIds, syncAccount };
