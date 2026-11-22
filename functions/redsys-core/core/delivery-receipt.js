'use strict';

// The receipt and the destination balance must commit together, including on remote retries.
async function applyOnce(db, ref, payment, update) {
  const {hotel, app, orderId, isAuthorized} = payment;
  if (!['cumbria','guadiana'].includes(hotel) || !['grupos','mesachef','spa'].includes(app) ||
      typeof orderId !== 'string' || !/^\d{4}[a-z0-9]{0,8}$/i.test(orderId) || typeof isAuthorized !== 'boolean') {
    throw new Error('Identidad de pago incorrecta');
  }
  const receipt = db.collection('paygold_receipts').doc([hotel,app,orderId].join('_'));
  return db.runTransaction(async tx => {
    const previous = await tx.get(receipt);
    if (previous.exists && (previous.data().authorized || !isAuthorized)) {
      return {success: true, idempotent: true, docId: ref.id};
    }
    const current = await tx.get(ref);
    if (!current.exists) throw new Error('Reserva no encontrada');
    const result = update(current.data(), data => tx.update(ref, data));
    tx.set(receipt, {authorized: isAuthorized, destination: ref.path});
    return result;
  });
}
module.exports = {applyOnce};
