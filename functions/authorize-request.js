'use strict';

async function authorizeRequest(header, auth, db) {
  const bearer = /^Bearer (\S+)$/.exec(header || '');
  if (!bearer) return {status: 401};
  let user;
  try { user = await auth.verifyIdToken(bearer[1], true); }
  catch { return {status: 401}; }
  if (!user.email || user.email.toLowerCase() === 'demo@hotel.com') return {status: 403};
  const member = (await db.collection('access_members').doc(user.uid).get()).data();
  if (member?.active !== true || !['admin','direction','reception','commercial'].includes(member.role)) return {status: 403};
  return {status: 200, member};
}

function permitsPayment(member, hotel, app) {
  return ['cumbria','guadiana'].includes(hotel) && ['grupos','mesachef','spa'].includes(app) &&
    Array.isArray(member.paymentScopes) && member.paymentScopes.includes(hotel + '/' + app);
}
module.exports = {authorizeRequest, permitsPayment};
