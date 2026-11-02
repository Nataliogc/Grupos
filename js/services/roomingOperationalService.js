(function (root) {
  function parse(value) {
    if (Array.isArray(value)) return value;
    try { var result = JSON.parse(value || '[]'); return Array.isArray(result) ? result : []; } catch (_) { return []; }
  }
  function money(value) {
    var text = String(value == null ? 0 : value).replace(/[^\d.,-]/g, '');
    if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
    return Number(text) || 0;
  }
  function paidAmount(record) {
    var rows = parse(record.PaymentPlan_JSON);
    var paid = rows.filter(function (r) { return /^(cobrado|pagado)$/i.test(String(r.status || '').trim()); });
    return paid.length ? paid.reduce(function (sum, r) { return sum + money(r.amount); }, 0) : money(record.Com_Pagado);
  }
  function contractedServices(items, isAccommodation) {
    return parse(items).filter(function (item) { return !isAccommodation(item); }).map(function (item, index) {
      var date = item.date || item.dateIn || item.checkIn || item.fecha || '';
      var name = item.type || item.description || item.concept || 'Servicio';
      return { servicio: name, serviceType: name, serviceDate: date,
        serviceId: 'economic|' + (item.id || index) + '|' + date,
        origin: 'auto', regimen: '-', paxHab: (money(item.quantity || item.qty || item.pax) || 1) + ' pax',
        hora: item.hora || item.time || 'PENDIENTE',
        notas: item.observ || item.notes || 'Servicio contratado. Confirmar horario con el grupo.' };
    });
  }
  var api = { paidAmount: paidAmount, contractedServices: contractedServices };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RoomingOperationalService = api;
})(typeof window !== 'undefined' ? window : globalThis);
