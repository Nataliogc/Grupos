const test = require("node:test");
const assert = require("node:assert/strict");

// Extracted logic from Fac Prof.html
function toInputDate(val) {
    if (!val) return "";
    const s = String(val).trim();
    if (s.includes("-")) {
        const parts = s.split("-");
        if (parts[0].length === 4) return s;
        if (parts.length === 3) return `${parts[2].padStart(4, "20")}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    if (s.includes("/")) {
        const parts = s.split("/");
        if (parts.length === 3) return `${parts[2].padStart(4, "20")}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return s;
}

function calculatePaxFromItems(itemsList) {
    if (!itemsList || itemsList.length === 0) return 0;
    const dailyPax = {};
    itemsList.forEach(item => {
        if (!item) return;
        if (item.isService === true || item.isService === "true") return;
        if (item.isAccommodation === false) return;
        if (item.excludeFromOccupancy === true) return;
        const concepto = String(item.concepto || item.type || item.roomType || '').trim();
        // Ignorar conceptos de restauración, salas y servicios adicionales/extras/check-out
        if (/almuerzo|cena|desayuno|coffee|menú|menu|salon|salón|parking|garaje|audiovisual|extra|cocktail|cóctel|transfer|autobus|autobús|late(\s+|-)?check-?out|early(\s+|-)?check-?in|salida(\s+tard[ií]a|\s+tarde)|check-?out|checkout|checkin|suplemento|visita|gu[ií]a|tasa|salida|entrada|tour|bar|bebida/i.test(concepto)) {
            return;
        }
        const cant = parseFloat(item.cant || 1) || 1;
        const dias = parseInt(item.dias || 1) || 1;

        let paxPerRoom = 0;
        if (/individual|dui|sgl|single|uso individual/i.test(concepto)) {
            paxPerRoom = 1;
        } else if (/triple|tpl/i.test(concepto)) {
            paxPerRoom = 3;
        } else if (/cuadruple|cuádruple|cpl|familiar/i.test(concepto)) {
            paxPerRoom = 4;
        } else if (/doble|dbl|twin|matrimonial/i.test(concepto)) {
            paxPerRoom = 2;
        } else if (/suite|junior/i.test(concepto)) {
            paxPerRoom = 2;
        } else if (/^(hab\b|habitaci)/i.test(concepto)) {
            paxPerRoom = 2;
        }
        if (paxPerRoom <= 0) return;

        const dateStr = toInputDate(item.fecha);
        if (dateStr) {
            const startDate = new Date(dateStr + 'T12:00:00');
            for (let d = 0; d < dias; d++) {
                const cur = new Date(startDate);
                cur.setDate(cur.getDate() + d);
                const iso = cur.toISOString().split('T')[0];
                if (!dailyPax[iso]) dailyPax[iso] = 0;
                dailyPax[iso] += (cant * paxPerRoom);
            }
        }
    });
    const values = Object.values(dailyPax);
    return values.length > 0 ? Math.max(...values) : 0;
}

test("calculatePaxFromItems excludes Late check-out and computes correct 20 pax for 9 Doble + 2 DUI", () => {
    const items = [
        { fecha: "01/01/2027", cant: "9", concepto: "Doble", dias: "1", precio: 152.30 },
        { fecha: "01/01/2027", cant: "2", concepto: "Doble de uso individual", dias: "1", precio: 106.30 },
        { fecha: "01/01/2027", cant: "11", concepto: "Late check-out (-)", dias: "1", precio: 18.00 }
    ];

    const pax = calculatePaxFromItems(items);
    assert.equal(pax, 20, "Total pax should be 20 (9*2 + 2*1), NOT 42!");
});

test("isPureServiceItem correctly recognizes Late check-out as a service", () => {
    const isPureServiceItem = (item) => {
      if (!item) return false;
      if (item.isService === true || item.isService === "true") return true;
      if (item.isAccommodation === false) return true;
      if (item.excludeFromOccupancy === true) return true;
      if (item.itemCategory === "service" || item.category === "service") return true;
      const t = String(item.type || item.roomType || item.product || item.concept || "").trim().toLowerCase();
      if (/^(servicio|extra|suplemento):/i.test(t)) return true;
      if (/almuerzo|cena|desayuno|buffet|coffee|sal[oó]n|coctel|men[uú]|traslado|transfer|gu[ií]a|audiovisual|parking|garaje|spa|masaje|tasa|late(\s+|-)?check-?out|early(\s+|-)?check-?in|salida(\s+tard[ií]a|\s+tarde)|check-?out/i.test(t)) {
        const isExplicitRoom = /^(hab\.?|habitaci[oó]n|doble|dbl|dui|twin|individual|single|triple|tpl|cu[aá]druple|cuad|suite|junior|apartamento|familiar)\b/i.test(t);
        if (!isExplicitRoom) return true;
      }
      return false;
    };

    assert.equal(isPureServiceItem({ type: "Late check-out (-)" }), true);
    assert.equal(isPureServiceItem({ type: "DOBLE" }), false);
    assert.equal(isPureServiceItem({ type: "DOBLE DE USO INDIVIDUAL" }), false);
});
