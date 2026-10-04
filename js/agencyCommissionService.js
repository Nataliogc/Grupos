(function (root) {
  const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
  function roomBase({ subtotal, unitPrice, roomType, board, services, breakfast, lunch, dinner }) {
    if (!(subtotal > 0) || !(unitPrice > 0)) return 0;
    const type = String(roomType).toLowerCase();
    const pax = /individual|dui/.test(type) ? 1 : /niño|nino/.test(type) ? 2.5 : /suple|triple/.test(type) ? 3 : /cuádruple|cuadruple/.test(type) ? 4 : 2;
    const code = String(board || 'HA').split(' ')[0].toUpperCase();
    const meals = { Desayuno: /^(AD|HD|MP|PC|BB|HB|FB)$/.test(code) ? breakfast * pax : 0,
      Almuerzo: /^(PC|FB)$/.test(code) ? lunch * pax : 0,
      Cena: /^(MP|PC|HB|FB)$/.test(code) ? dinner * pax : 0 };
    const food = Object.values(meals).reduce((a, b) => a + b, 0);
    // Keep the split within the actual agreed room rate, even for discounted offers.
    const ratio = food > unitPrice ? unitPrice / food : 1;
    let selected = services.includes('Alojamiento') ? Math.max(0, unitPrice - food) : 0;
    for (const service of Object.keys(meals)) if (services.includes(service)) selected += meals[service] * ratio;
    return subtotal * Math.min(1, selected / unitPrice);
  }
  function settle(gross, base, group) {
    const commissionBase = money(Math.max(0, Math.min(gross, base)));
    const commissionAmount = money(commissionBase * Math.max(0, Math.min(100, Number(group.agencyCommissionPercent) || 0)) / 100);
    const applied = group.agencyIsClient !== false;
    return { grossTotal: money(gross), commissionBase, commissionAmount,
      commissionDeduction: applied ? commissionAmount : 0,
      total: money(Math.max(0, gross - (applied ? commissionAmount : 0))) };
  }
  const service = { roomBase, settle };
  if (typeof module !== 'undefined') module.exports = service;
  root.AgencyCommissionService = service;
})(typeof window !== 'undefined' ? window : globalThis);
