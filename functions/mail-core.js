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
    body: input.body, receivedAt: new Date(input.receivedAt).toISOString()
  };
}
module.exports = { MAILBOXES, STATES, normalizeMessage };
