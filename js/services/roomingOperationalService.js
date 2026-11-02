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
  function sortServices(rows) {
    function dateKey(row) {
      var value = String(row.serviceDate || row.fecha || '');
      var iso = value.match(/\d{4}-\d{2}-\d{2}/);
      if (iso) return iso[0];
      var local = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      return local ? local[3] + '-' + local[2].padStart(2, '0') + '-' + local[1].padStart(2, '0') : '9999-99-99';
    }
    function timeKey(row) {
      var match = String(row.hora || '').match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
      if (match) return Number(match[1]) * 60 + Number(match[2]);
      var name = String(row.serviceType || row.servicio || '').toLowerCase();
      if (name.includes('llegada')) return 0;
      if (name.includes('desayuno')) return 480;
      if (name.includes('salida')) return 720;
      if (name.includes('almuerzo') || name.includes('comida')) return 840;
      if (name.includes('cena')) return 1260;
      return 1080;
    }
    return rows.slice().sort(function (a, b) { return dateKey(a).localeCompare(dateKey(b)) || timeKey(a) - timeKey(b); });
  }
  var api = { paidAmount: paidAmount, contractedServices: contractedServices, sortServices: sortServices };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RoomingOperationalService = api;
})(typeof window !== 'undefined' ? window : globalThis);
