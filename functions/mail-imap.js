const { randomUUID } = require('node:crypto');
const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret, defineString } = require('firebase-functions/params');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { syncAccount, parseAccounts } = require('./mail-imap-core');
const { ingestMessage } = require('./mail');
const { MAILBOXES } = require('./mail-core');

const configSecret = defineSecret('MAIL_IMAP_CONFIG');
const enabled = defineString('MAIL_IMAP_ENABLED', { default: 'false' });
const db = admin.firestore();
const ref = mailbox => db.collection('mailSync').doc(mailbox);
const store = {
  acquire: mailbox => db.runTransaction(async tx => {
    const doc = await tx.get(ref(mailbox));
    if ((doc.data()?.leaseUntil || 0) > Date.now()) return null;
    const token = randomUUID();
    tx.set(ref(mailbox), { leaseToken: token, leaseUntil: Date.now() + 12 * 60 * 1000, lastAttemptAt: new Date().toISOString() }, { merge: true });
    return token;
  }),
  read: async mailbox => (await ref(mailbox).get()).data() || {},
  patch: (mailbox, data) => ref(mailbox).set(data, { merge: true }),
  release: (mailbox, token) => db.runTransaction(async tx => {
    const doc = await tx.get(ref(mailbox));
    if (doc.data()?.leaseToken === token) tx.set(ref(mailbox), { leaseUntil: 0, leaseToken: '' }, { merge: true });
  }),
  issue: (mailbox, validity, uid, code) => ref(mailbox).collection('issues').doc(`${validity}-${uid}`).set({ uid, uidValidity: validity, code, at: new Date().toISOString(), resolved: false })
};

exports.syncGroupMail = onSchedule({
  schedule: 'every 5 minutes', region: 'us-central1', timeoutSeconds: 540,
  memory: '512MiB', maxInstances: 1, secrets: [configSecret], retryCount: 0
}, async () => {
  if (enabled.value() !== 'true') {
    for (const mailbox of MAILBOXES) await store.patch(mailbox, { status: 'disabled' });
    return;
  }
  let accounts;
  try { accounts = parseAccounts(configSecret.value()); }
  catch {
    for (const mailbox of MAILBOXES) await store.patch(mailbox, { status: 'error', errorCode: 'invalid-config', lastErrorAt: new Date().toISOString() });
    return;
  }
  for (const mailbox of MAILBOXES.filter(m => !accounts.some(a => a.mailbox === m))) await store.patch(mailbox, { status: 'disabled' });
  // Process independently: a failed hotel must not prevent the other from receiving mail.
  for (const account of accounts) {
    await syncAccount(account, {
      store, ingest: ingestMessage,
      parse: source => simpleParser(source, { skipHtmlToText: false, skipTextToHtml: true, skipImageLinks: true, maxHtmlLengthToParse: 500000 }),
      createClient: a => {
        const client = new ImapFlow({ host: a.host, port: 993, secure: true, tls: { rejectUnauthorized: true }, auth: { user: a.user, pass: a.password }, logger: false, disableAutoIdle: true, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000 });
        // Do not log protocol errors, which may include credentials or message contents.
        client.on('error', () => {});
        return client;
      }
    });
  }
});
