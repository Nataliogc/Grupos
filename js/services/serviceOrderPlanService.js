(function (root) {
  "use strict";
  function readSchedule(record) {
    const raw = record.MealSchedule_JSON;
    if (raw == null || raw === "") return null;
    const rows = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(rows)) throw new Error("Programación de comidas inválida.");
    return rows;
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
    const result = rows.filter(row=>!isMeal(row)).map(row=>({...row,fecha:dateOf(row)}));
    schedule.forEach(meal => {
      const label = meal.jornada === "almuerzo" ? "Almuerzo" : "Cena";
      const previous = rows.find(row => dateOf(row) === meal.fecha && normalize(row.serv) === normalize(label));
      result.push({fecha:meal.fecha, dia:formatDay(meal.fecha), serv:label, pax:String(meal.pax), menu:previous?.menu || "", hora:previous?.hora || "___:___ h"});
    });
    const order = {desayuno:0,almuerzo:1,cena:2};
    return result.sort((a,b)=>(a.fecha || "9999").localeCompare(b.fecha || "9999") || (order[normalize(a.serv)] ?? 3)-(order[normalize(b.serv)] ?? 3));
  }
  const api = {readSchedule,reconcileMealPlan};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ServiceOrderPlanService = api;
})(typeof window !== "undefined" ? window : globalThis);
