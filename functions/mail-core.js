const crypto = require('node:crypto');
const MAILBOXES = ['grupos@hotelguadiana.es', 'grupos@encumbria.es'];
const STATES = ['Nueva', 'En gestión', 'Pendiente del cliente', 'Presupuestada', 'Ganada', 'Perdida'];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function normalizeMessage(input) {
  const mailbox = String(input.mailbox || '').trim().toLowerCase();
  if (!MAILBOXES.includes(mailbox)) throw new Error('Buzón no autorizado');
  for (const key of ['providerId', 'threadId', 'from', 'subject', 'body', 'receivedAt']) {
    if (typeof input[key] !== 'string' || !input[key].trim()) throw new Error(`Falta ${key}`);
  }
  if (!Number.isFinite(Date.parse(input.receivedAt))) throw new Error('Fecha no válida');
  if (input.body.length > 200000 || input.subject.length > 1000) throw new Error('Mensaje demasiado grande');
  return {
    mailbox, messageKey: hash(`${mailbox}:${input.providerId}`),
    requestKey: hash(`${mailbox}:${input.threadId}`),
    from: input.from.slice(0, 1000), subject: input.subject,
    body: input.body, receivedAt: new Date(input.receivedAt).toISOString(),
    replyTo: typeof input.replyTo === 'string' && !/[\r\n]/.test(input.replyTo) ? input.replyTo.slice(0, 320) : '',
    internetMessageId: /^<[^<>\s]{1,990}>$/.test(input.internetMessageId || '') ? input.internetMessageId : '',
    truncated: input.truncated === true,
    attachmentCount: Number.isSafeInteger(input.attachmentCount) ? input.attachmentCount : 0,
    attachments: Array.isArray(input.attachments) ? input.attachments.slice(0, 100).map(a => ({ filename: String(a.filename || '').slice(0, 240), contentType: String(a.contentType || '').slice(0, 100), size: Math.max(0, Number(a.size) || 0) })) : []
  };
}
module.exports = { MAILBOXES, STATES, normalizeMessage, hash };
