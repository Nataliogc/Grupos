const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPayload, encodePayload, address } = require('../js/services/outlookReply');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const item = { mailbox: 'grupos@hotelguadiana.es', subject: 'Petición habitación' };
const message = { from: 'Agencia <agencia@example.com>', replyTo: 'reservas@example.com', body: 'Hola,\n¿Hay habitación? <b>Literal</b>', receivedAt: '2026-09-24T12:00:00Z', internetMessageId: '<original@example.com>' };

test('reply uses Reply-To, preserves Unicode and original body, and threads by Message-ID', () => {
  const payload = buildPayload(item, message);
  assert.equal(payload.to, 'reservas@example.com');
  assert.equal(payload.subject, 'RE: Petición habitación');
  assert.equal(payload.body, message.body);
  assert.equal(payload.internetMessageId, message.internetMessageId);
  assert.deepEqual(JSON.parse(Buffer.from(encodePayload(payload), 'base64url').toString('utf8')), payload);
  assert.equal(buildPayload(item, { ...message, subject: 'RE: Consulta' }).subject, 'RE: Consulta');
  assert.equal(buildPayload(item, { ...message, replyTo: '' }).to, 'agencia@example.com');
});
test('header injection, ambiguous recipients and abbreviated messages are rejected', () => {
  for (const bad of ['a@example.com\r\nBcc:b@example.com', 'a@example.com;b@example.com', 'No disponible', '"& calc.exe"']) assert.throws(() => address(bad));
  assert.throws(() => buildPayload(item, { ...message, truncated: true }), /abreviado/);
  assert.throws(() => buildPayload(item, null), /cargue/);
  assert.equal(buildPayload(item, { ...message, internetMessageId: '<a>\r\nBcc:b@example.com' }).internetMessageId, '');
});
test('long replies remain intact for file handoff', () => {
  const payload = buildPayload(item, { ...message, body: 'á'.repeat(160000) });
  assert.ok(encodePayload(payload).length > 6000);
  assert.equal(payload.body.length, 160000);
});
test('Windows handler validates URI and long-file payload without opening Outlook', { skip: process.platform !== 'win32' }, () => {
  const script = path.resolve(__dirname, '../outlook/NexusOutlook.ps1');
  const run = args => spawnSync('powershell.exe', ['-NoProfile', '-File', script, ...args, '-ValidateOnly'], { encoding: 'utf8' });
  const payload = buildPayload(item, message);
  let result = run(['-PayloadUri', 'nexus-outlook://reply/' + encodePayload(payload)]);
  assert.equal(result.status, 0, result.stderr);
  result = run(['-PayloadUri', 'nexus-outlook://reply/bad?command=calc']);
  assert.notEqual(result.status, 0);
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-reply-test-'));
  const filename = path.join(folder, 'reply.nexusreply');
  try {
    fs.writeFileSync(filename, JSON.stringify(buildPayload(item, { ...message, body: 'á'.repeat(160000) })));
    result = run(['-ReplyFile', filename]);
    assert.equal(result.status, 0, result.stderr);
    fs.writeFileSync(filename, JSON.stringify({ ...payload, to: 'a@example.com\r\nBcc:b@example.com' }));
    assert.notEqual(run(['-ReplyFile', filename]).status, 0);
  } finally { fs.unlinkSync(filename); fs.rmdirSync(folder); }
});
