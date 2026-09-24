const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const { simpleParser } = require('../functions/node_modules/mailparser');
const { parseAccounts, planRange, parsedMessage, syncAccount, MAX_SOURCE_BYTES } = require('../functions/mail-imap-core');
const { createHash } = require('node:crypto');
const account = { mailbox: 'grupos@hotelguadiana.es', host: 'imap.example.com', user: 'user', password: 'test-only', folder: 'INBOX' };
const sourceKey = createHash('sha256').update('imap.example.com:user:INBOX').digest('hex');
const initial = { uidValidity: '123', lastUid: 5, sourceKey };

test('only explicitly enabled hotel accounts and TLS port 993 are accepted', () => {
  assert.equal(parseAccounts(JSON.stringify([{ ...account, enabled: false }])).length, 0);
  assert.equal(parseAccounts(JSON.stringify([{ ...account, enabled: true }]))[0].folder, 'INBOX');
  for (const change of [{ mailbox: 'other@example.com' }, { port: 143 }, { secure: false }, { password: '' }, { host: 'http://host' }]) {
    assert.throws(() => parseAccounts(JSON.stringify([{ ...account, enabled: true, ...change }])));
  }
  assert.throws(() => parseAccounts(JSON.stringify([{ ...account, enabled: true }, { ...account, enabled: true }])));
});
test('first activation starts with new messages and UID changes never reset silently', () => {
  assert.equal(planRange({}, { uidValidity: 123n, uidNext: 50 }, sourceKey).lastUid, 49);
  assert.throws(() => planRange(initial, { uidValidity: 124n, uidNext: 50 }, sourceKey), /mailbox-changed/);
  assert.throws(() => planRange(initial, { uidValidity: 123n, uidNext: 50 }, 'other'), /mailbox-changed/);
  assert.equal(planRange(initial, { uidValidity: 123n, uidNext: 1000 }, sourceKey).end, 105);
});
test('real MIME parsing handles HTML, attachment-only messages and References', async () => {
  const raw = 'From: Agencia <client@example.com>\r\nSubject: Consulta\r\nMessage-ID: <two@example.com>\r\nIn-Reply-To: <one@example.com>\r\nReferences: <root@example.com> <one@example.com>\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<p>Hola <b>grupo</b></p>';
  const result = parsedMessage(await simpleParser(raw), account, '123', 6, new Date('2026-09-24'));
  assert.equal(result.threadId, '<root@example.com>');
  assert.match(result.body, /Hola grupo/);
  assert.equal(result.providerId, '<two@example.com>');
  assert.equal(result.replyTo, 'client@example.com');
  assert.equal(result.internetMessageId, '<two@example.com>');
  const attachment = parsedMessage({ attachments: [{ filename: 'grupo.pdf', size: 100 }] }, account, '123', 7, new Date());
  assert.match(attachment.body, /adjuntos/);
  assert.equal(attachment.attachmentCount, 1);
  assert.equal(attachment.subject, '(Sin asunto)');
  assert.equal(parsedMessage({ text: 'x'.repeat(160001) }, account, '123', 8, new Date()).truncated, true);
});

function harness(options = {}) {
  let state = { ...initial, ...options.state }, held = options.held || false;
  const issues = [], ingested = [], calls = [];
  const messages = options.messages || [{ uid: 6, size: 10, internalDate: new Date() }, { uid: 7, size: 10, internalDate: new Date() }];
  return {
    state: () => state, issues, ingested, calls,
    deps: {
      now: () => 1000000,
      store: {
        acquire: async () => { if (held) return null; held = true; return 'lease'; },
        release: async () => { held = false; calls.push('release'); },
        read: async () => state,
        patch: async (_, data) => { state = { ...state, ...data }; },
        issue: async (_, validity, uid, code) => { issues.push({ validity, uid, code }); }
      },
      createClient: () => ({
        mailbox: { uidValidity: options.validity || 123n, uidNext: 8 },
        connect: async () => { if (options.authenticationFailure) throw Object.assign(new Error('sensitive detail'), { authenticationFailed: true }); },
        getMailboxLock: async (folder, args) => { assert.equal(folder, 'INBOX'); assert.equal(args.readOnly, true); return { release: () => calls.push('unlock') }; },
        fetchAll: async (range, query, args) => { assert.equal(range, '6:7'); assert.equal(args.uid, true); return messages; },
        download: async uid => { if (Number(uid) === options.failUid) throw new Error('network error with secrets'); return { content: Readable.from([Buffer.from(`body ${uid}`)]) }; },
        close: () => calls.push('close')
      }),
      parse: async raw => { if (options.parseFailure) throw new Error('bad mime'); return { messageId: `<${raw.toString()}@example.com>`, text: raw.toString() }; },
      ingest: async msg => { if (options.ingestFailure) throw new Error('db down'); ingested.push(msg); }
    }
  };
}
test('sync checkpoints successful messages and leaves network failures for retry', async () => {
  const h = harness({ failUid: 7 });
  const result = await syncAccount(account, h.deps);
  assert.equal(result.status, 'error');
  assert.equal(h.state().lastUid, 6);
  assert.equal(h.ingested.length, 1);
  assert.equal(h.state().errorCode, 'connection-or-sync-failed');
  assert.deepEqual(h.calls, ['unlock', 'close', 'release']);
});
test('failed database write does not advance the cursor', async () => {
  const h = harness({ ingestFailure: true });
  await syncAccount(account, h.deps);
  assert.equal(h.state().lastUid, 5);
});
test('oversized or unreadable messages leave a durable incident and allow later mail', async () => {
  const h = harness({ messages: [{ uid: 6, size: MAX_SOURCE_BYTES + 1 }, { uid: 7, size: 10, internalDate: new Date() }] });
  assert.equal((await syncAccount(account, h.deps)).status, 'ready');
  assert.equal(h.issues[0].uid, 6);
  assert.equal(h.ingested.length, 1);
  assert.equal(h.state().lastUid, 7);
  const bad = harness({ parseFailure: true });
  await syncAccount(account, bad.deps);
  assert.equal(bad.issues.length, 2);
  assert.equal(bad.state().lastUid, 7);
});
test('overlapping sync skips safely and changed mailboxes require intervention', async () => {
  const busy = harness({ held: true });
  assert.equal((await syncAccount(account, busy.deps)).status, 'busy');
  assert.equal(busy.calls.length, 0);
  const changed = harness({ validity: 124n });
  await syncAccount(account, changed.deps);
  assert.equal(changed.state().errorCode, 'mailbox-changed');
  assert.equal(changed.state().lastUid, 5);
});
test('authentication failure stores only a safe code', async () => {
  const h = harness({ authenticationFailure: true });
  await syncAccount(account, h.deps);
  assert.equal(h.state().errorCode, 'authentication-failed');
  assert.doesNotMatch(JSON.stringify(h.state()), /sensitive detail/);
});
