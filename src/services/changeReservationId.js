/* Move complete reservation documents together, without merging another group. */
(function (root) {
  async function changeReservationId({ db, oldId, newId, normalizeId, timestamp }) {
    const previous = normalizeId(oldId);
    const next = normalizeId(newId);
    if (!next || /[/\\]/.test(next) || next === "." || next === "..") {
      throw new Error("Introduce un localizador válido, sin barras.");
    }
    if (previous === next) throw new Error("El nuevo localizador coincide con el actual.");
    const collection = db.collection("groups");
    const snapshot = await collection.get();
    const sources = snapshot.docs.filter(doc => normalizeId(doc.data().Reserva || doc.id) === previous);
    if (!sources.length) throw new Error("No se encuentra la reserva original. Actualiza la página.");
    if (snapshot.docs.some(doc => normalizeId(doc.data().Reserva || doc.id) === next)) {
      throw new Error("Ese localizador ya pertenece a otro grupo. No se ha modificado nada.");
    }
    const primary = sources.find(doc => doc.id === previous) || sources[0];
    const destinations = sources.map(doc => collection.doc(doc === primary ? next : `${next}__${doc.id}`));
    const related = snapshot.docs.filter(doc => !sources.includes(doc) && (
      ["parentSeriesId", "sourceQuoteId"].some(key => normalizeId(doc.data()[key]) === previous) ||
      (doc.data().childReservationIds || []).some(id => normalizeId(id) === previous)
    ));
    if (sources.length * 2 + related.length > 450) throw new Error("La reserva contiene demasiados registros para cambiarla en una sola operación.");
    return db.runTransaction(async transaction => {
      const current = await Promise.all(sources.map(doc => transaction.get(doc.ref)));
      const targets = await Promise.all(destinations.map(ref => transaction.get(ref)));
      const links = await Promise.all(related.map(doc => transaction.get(doc.ref)));
      if (targets.some(doc => doc.exists)) throw new Error("El localizador de destino ya existe. No se ha modificado nada.");
      if (current.some(doc => !doc.exists || normalizeId(doc.data().Reserva || doc.id) !== previous)) {
        throw new Error("La reserva ha cambiado. Actualiza la página e inténtalo de nuevo.");
      }
      const records = current.map((doc, index) => {
        const payload = { ...doc.data(), Reserva: next, updatedAt: timestamp() };
        delete payload._docId;
        if (normalizeId(payload.uid) === previous || payload.uid === doc.id) payload.uid = destinations[index].id;
        let tracking = payload.tracking || [];
        if (typeof tracking === "string") {
          try { tracking = JSON.parse(tracking); } catch (_) { tracking = [{ text: tracking }]; }
        }
        if (!Array.isArray(tracking)) tracking = [{ text: JSON.stringify(tracking) }];
        payload.tracking = JSON.stringify([...tracking, {
          id: Date.now(), date: new Date().toISOString(),
          text: `Cambio de localizador: ${previous} → ${next}`
        }]);
        transaction.set(destinations[index], payload);
        transaction.delete(doc.ref);
        return { ...payload, _docId: destinations[index].id };
      });
      links.forEach(doc => {
        if (!doc.exists) return;
        const value = doc.data();
        const updates = {};
        ["parentSeriesId", "sourceQuoteId"].forEach(key => {
          if (normalizeId(value[key]) === previous) updates[key] = next;
        });
        if (Array.isArray(value.childReservationIds)) {
          updates.childReservationIds = value.childReservationIds.map(id => normalizeId(id) === previous ? next : id);
        }
        if (Object.keys(updates).length) transaction.update(doc.ref, updates);
      });
      return { id: next, records };
    });
  }
  root.changeReservationId = changeReservationId;
})(typeof window === "undefined" ? module.exports : window);
