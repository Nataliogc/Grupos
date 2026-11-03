(function (root) {
  "use strict";
  function isServiceItem(item) {
    const name = String(item.type || item.roomType || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
    return item.isService === true || item.isService === 'true' || /DESAYUNO|ALMUERZO|COMIDA|MERIENDA|CENA|COCTEL|COFFEE|BUFFET|MENU|BREAK|SALA|SALON|SPA|PARKING|TRASLADO/.test(name);
  }
  function getHeaderPax(group, toDate = value => String(value || '').split('T')[0]) {
    const record = group.records?.[0] || group;
    let items = group.RoomingList_JSON || record.RoomingList_JSON;
    try { items = typeof items === 'string' ? JSON.parse(items) : items; } catch { items = null; }
    const daily = {};
    if (Array.isArray(items)) items.forEach(item => {
      if (!item || isServiceItem(item)) return;
      const name = String(item.type || item.roomType || '').toUpperCase();
      const qty = Number(item.qty ?? item.quantity ?? item.cantidad ?? 1);
      const perRoom = Number(item.pax) || (/IND|DUI|SGL|SINGLE/.test(name) ? 1 : /TRI|TPL/.test(name) ? 3 : /CUA|QUAD/.test(name) ? 4 : /DOB|DBL|TWIN|MATRI/.test(name) ? 2 : 0);
      const date = toDate(item.dateIn || item.date || item.fecha);
      if (!date || !Number.isFinite(qty) || qty <= 0 || perRoom <= 0) return;
      const nights = Math.min(366, Math.max(1, parseInt(item.nights,10) || 1));
      for (let i=0;i<nights;i++) {
        const day = new Date(date + 'T12:00:00Z');
        if (isNaN(day.getTime())) break;
        day.setUTCDate(day.getUTCDate()+i);
        const key=day.toISOString().slice(0,10);
        daily[key]=(daily[key] || 0)+qty*perRoom;
      }
    });
    const peak = Math.max(0,...Object.values(daily));
    if (peak > 0) return peak;
    const declared = Number(group.totalPax || record['Pax.'] || record.Pax);
    return declared > 0 ? declared : null;
  }
  function readSchedule(record) {
    const raw = record.MealSchedule_JSON;
    if (raw == null || raw === "") return null;
    const rows = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(rows)) throw new Error("Programación de comidas inválida.");
    return rows;
  }
  function getScheduleLabel(meal) {
    if (meal.nombre && String(meal.nombre).trim()) return String(meal.nombre).trim();
    const j = String(meal.jornada || '').toLowerCase();
    if (j === 'almuerzo') return 'Almuerzo';
    if (j === 'cena') return 'Cena';
    if (j === 'desayuno') return 'Desayuno';
    if (j === 'merienda') return 'Merienda';
    if (j === 'coffee_break') return 'Coffee Break';
    if (j === 'coctel') return 'Cóctel';
    if (j === 'sala' || j === 'salon') return 'Alquiler de Sala / Salón';
    if (j === 'especial') return 'Especial';
    return j.charAt(0).toUpperCase() + j.slice(1);
  }
  function serviceMatchesMeal(servName, meal, normalize) {
    const s = normalize(servName);
    const mLabel = normalize(getScheduleLabel(meal));
    if (s === mLabel) return true;
    const j = String(meal.jornada || '').toLowerCase();
    const isMeetingRoom = text => /sala|sal[oó]n|charla|reuni[oó]n|montaje/.test(text);
    if ((j === 'sala' || j === 'salon' || isMeetingRoom(mLabel)) && isMeetingRoom(s)) return true;
    if ((j === 'merienda' || mLabel.includes('merienda')) && s.includes('merienda')) return true;
    if ((j === 'coffee_break' || j === 'coffee' || /coffee|break/.test(mLabel)) && /coffee|break/.test(s)) return true;
    if ((j === 'coctel' || /coctel|cocktail/.test(mLabel)) && /coctel|cocktail/.test(s)) return true;
    if ((j === 'desayuno' || mLabel.includes('desayuno')) && s.includes('desayuno')) return true;
    if ((j === 'almuerzo' || j === 'comida' || /almuerzo|comida/.test(mLabel)) && /almuerzo|comida/.test(s)) return true;
    if ((j === 'cena' || mLabel.includes('cena')) && s.includes('cena')) return true;
    return false;
  }
  function reconcileMealPlan(rows, schedule, formatDay, entryDate) {
    if (schedule === null) return rows;
    const normalize = text => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const isMeal = row => /almuerzo|comida|cena/.test(normalize(row.serv));
    const entry = String(entryDate || schedule[0]?.fecha || "");
    const yearMatch = entry.match(/^(\d{4})-/) || entry.match(/(\d{4})$/);
    const year = Number(yearMatch?.[1]) || 2026;
    const entryMonth = /^\d{4}-/.test(entry) ? Number(entry.slice(5,7)) : Number(entry.split('/')[1]);
    const dateOf = row => {
      if (row.fecha) return row.fecha;
      const match = String(row.dia || "").match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
      if (!match) return "";
      const month = Number(match[2]);
      const rowYear = Number(match[3]) || (month < entryMonth ? year + 1 : year);
      return `${rowYear}-${String(month).padStart(2,'0')}-${match[1].padStart(2,'0')}`;
    };
    const result = rows.filter(row => {
      if (isMeal(row)) return false;
      const rowD = dateOf(row);
      const isReplacedBySchedule = schedule.some(m => {
        const sameDay = !rowD || !m.fecha || rowD === m.fecha;
        return sameDay && serviceMatchesMeal(row.serv, m, normalize);
      });
      return !isReplacedBySchedule;
    }).map(row => ({ ...row, fecha: dateOf(row) }));
    schedule.forEach(meal => {
      const label = getScheduleLabel(meal);
      const previous = rows.find(row => {
        const sameDay = !row.fecha || !meal.fecha || dateOf(row) === meal.fecha;
        return sameDay && serviceMatchesMeal(row.serv, meal, normalize);
      });
      const rowHour = (meal.hora && meal.hora !== '---' && meal.hora !== '___:___ h')
        ? meal.hora
        : (previous?.hora || "___:___ h");
      const j = String(meal.jornada || '').toLowerCase();
      const isMeetingRoom = j === 'sala' || j === 'salon' || /sala|sal[oó]n/.test(label.toLowerCase());
      const isSalonText = text => /^(sal[oó]n|mercurio|marte|jupiter|venus|saturno|neptuno|urano|pluton)\b/i.test(String(text || '').trim()) || (meal.salon && String(text || '').trim().toLowerCase() === String(meal.salon).trim().toLowerCase());
      const previousMenu = (!isMeetingRoom && previous?.menu && !isSalonText(previous.menu)) ? previous.menu : "";
      const rowMenu = meal.menu || previousMenu || "";
      result.push({
        fecha: meal.fecha,
        dia: formatDay(meal.fecha),
        serv: label,
        pax: String(meal.pax),
        menu: rowMenu,
        hora: rowHour
      });
    });
    const order = { desayuno: 0, coffee_break: 1, 'coffee break': 1, almuerzo: 2, comida: 2, sala: 3, salon: 3, merienda: 4, cena: 5, coctel: 6, especial: 7 };
    return result.sort((a,b) => (a.fecha || "9999").localeCompare(b.fecha || "9999") || (order[normalize(a.serv)] ?? 7) - (order[normalize(b.serv)] ?? 7));
  }
  const api = {readSchedule,reconcileMealPlan,getScheduleLabel,isServiceItem,getHeaderPax,serviceMatchesMeal};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ServiceOrderPlanService = api;
})(typeof window !== "undefined" ? window : globalThis);
