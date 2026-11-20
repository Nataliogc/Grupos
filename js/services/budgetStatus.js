(function () {
    const isLockedBudget = (g) => {
      if (!g) return false;
      const intEst = String(g.Com_Estado_Interno || "").toUpperCase().trim();
      const extEst = String(g.Estado || "").toUpperCase().trim();
      const effective = intEst || extEst;

      const isConfirmed = effective.includes("CONFIRM") || g.splitCompleted === true || effective === "DESGLOSADO";
      const isTentativa = effective.includes("TENTA") || effective.includes("TANTEO") || effective.includes("BLOQ") || effective.includes("OPCI");

      const res = String(g.Reserva || "").trim();
      const hasPmsId = (res !== "" && !res.toUpperCase().startsWith("PRES-")) ||
                       Boolean(g.convertedToReservation || g.targetReservationId || g.idPms || g.id_pms || g.Reserva_PMS) ||
                       Boolean((g.Presupuesto_Origen || g.sourceQuoteId) && res !== "" && !res.toUpperCase().startsWith("PRES-") && res !== String(g.Presupuesto_Origen || g.sourceQuoteId));

      const isExplicitReadOnly = Boolean(g.isHistoricalBudget || g.isReadOnly);

      return Boolean(isConfirmed || isTentativa || hasPmsId || isExplicitReadOnly);
    };

    function isBudgetRecord(g) {
        const est = (g.Estado || "").toUpperCase();
        const intEst = (g.Com_Estado_Interno || "").toUpperCase();

        return String(g.Reserva || "").startsWith("PRES-") ||
          Boolean(g.Presupuesto_Origen) ||
          Boolean(g.sourceQuoteId) ||
          est.includes("PRESUPUESTO") ||
          intEst.includes("PRESUPUESTO") ||
          intEst.includes("ENVIADO") ||
          intEst.includes("SEGUIMIENTO") ||
          intEst.includes("PENDIENTE");
    }
    function isActiveBudget(g, today) {
        if (!isBudgetRecord(g) || isLockedBudget(g) || g.excludeFromStatistics === true) return false;
        const status = String(g.Com_Estado_Interno || "").trim().toUpperCase() || String(g.Estado || "").trim().toUpperCase();
        if (["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA", "CADUCADO", "DESGLOSADO"].some(v => status.includes(v))) return false;
        if (["PRESUPUESTO", "PENDIENTE", "ENVIADO", "SEGUIMIENTO"].some(v => status.includes(v))) return true;
        let departure = g.Salida || g.Entrada;
        if (g.isMultiSegment && Array.isArray(g.segments) && g.segments.length) {
            departure = g.segments.filter(s => s.in && s.out && s.in < s.out).map(s => s.out).sort().pop();
        }
        return !departure || departure >= today;
    }
    window.NexusBudgetStatus = {isActiveBudget, isLockedBudget, isBudgetRecord};
})();
