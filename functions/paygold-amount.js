'use strict';

const hotels = {
  cumbria: ['cumbria', 'cumbria spa&hotel', 'cumbria spa & hotel'],
  guadiana: ['guadiana', 'sercotel guadiana', 'hotel guadiana']
};
function matchesHotel(name, hotel) {
  return Object.hasOwn(hotels, hotel) && hotels[hotel].includes(String(name || '').trim().toLowerCase());
}

function cents(value) {
  let text = String(value ?? '').trim();
  if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(text)) text = text.replace(/\./g, '');
  text = text.replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return NaN;
  const result = Math.round(Number(text) * 100);
  return Number.isSafeInteger(result) ? result : NaN;
}

function paid(p) {
  return ['pagado','cobrado'].includes(String(p.status).trim().toLowerCase());
}

function groupFinances(row) {
  const rawPlan = row.PaymentPlan_JSON || [];
  const plan = Array.isArray(rawPlan) ? rawPlan : JSON.parse(rawPlan);
  if (!Array.isArray(plan)) throw new Error('Plan de pagos incorrecto');
  const planTotal = plan.reduce((sum,p) => sum + cents(p.amount), 0);
  const storedTotal = [row.Com_Total, row.Total, row.total, row['Importe(*)']].find(value => value != null && value !== '');
  const total = storedTotal === undefined ? planTotal : cents(storedTotal);
  const received = Math.max(cents(row.Com_Pagado || 0), plan.filter(paid).reduce((sum,p) => sum + cents(p.amount), 0));
  if (!Number.isSafeInteger(total) || !Number.isSafeInteger(received))
    throw new Error('Importes de grupo incorrectos');
  return {plan, total, received};
}

async function resolvePayGoldAmount(db, app, hotel, ref, selection) {
  const selected = cents(selection);
  if (!(selected > 0)) return null;
  if (app === 'spa') {
    if (hotel !== 'cumbria') return null;
    const { findSpaDoc } = require('./redsys-core/adapters/gestspa-adapter');
    const { getSpaFirestore } = require('./redsys-core/core/firebase-clients');
    const result = await findSpaDoc(getSpaFirestore(), '', ref);
    if (!result) return null;
    const row = result.doc.data();
    const total = cents(row.precio_total ?? row.precio ?? row['Importe(*)']);
    const received = row.payment?.paid ?? row.paid_amount ?? row.pagado ?? 0;
    const balance = total - (received === true ? total : cents(received === false ? 0 : received));
    return balance === selected ? balance / 100 : null;
  }
  if (app === 'mesachef') {
    const collections = { RES:'reservas_restaurante', EVT:'reservas_salones', GE:'participantes_eventos' };
    const collection = collections[ref.split('-')[0]];
    if (!collection) return null;
    const { findMesaChefDoc } = require('./redsys-core/adapters/mesachef-adapter');
    const { getMesaChefFirestore } = require('./redsys-core/core/firebase-clients');
    const doc = await findMesaChefDoc(getMesaChefFirestore(), collection, '', ref);
    const row = doc?.data();
    if (!row || !matchesHotel(row.hotel ?? row.Hotel_Asignado, hotel)) return null;
    const received = cents(row.fianzaPagada ?? row.senalPagada ?? row.totalPagado ?? 0);
    const balance = cents(row.total ?? row.totalReserva ?? row.precioTotal ?? row.importe) - received;
    const deposit = cents(row.fianzaAcordada ?? row.senalAcordada ?? row.campoPaygoldAmount ?? row.fianza ?? row.senal) - received;
    return selected <= balance && [balance, deposit].includes(selected) ? selected / 100 : null;
  }
  if (app !== 'grupos' || /^PRES-/i.test(ref)) return null;
  const snapshot = await db.collection('groups').where('Reserva', '==', ref).get();
  const rows = snapshot.docs.map(doc => doc.data()).filter(row => matchesHotel(row.Hotel_Asignado, hotel));
  if (rows.length !== 1) return null;
  const row = rows[0];
  const {plan, total, received} = groupFinances(row);
  const balance = total - received;
  const instalment = plan.find(p => !paid(p) && cents(p.amount) > 0);
  const allowed = [balance, cents(instalment?.amount)];
  if (!received) allowed.push(Math.round(total * 0.30));
  const approved = allowed.find(amount => amount === selected && amount <= balance);
  return approved === undefined ? null : approved / 100;
}
module.exports = { resolvePayGoldAmount, matchesHotel, groupFinances, cents, paid };
