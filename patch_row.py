import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('Gestión de Grupos.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Replace absIndex-based optimistic update with ID-based lookup (more robust)
old_optimistic = """                                                                                    // OPTIMISTIC UPDATE: Quitar el diff inmediatamente usando el índice absoluto
                                                                                    // y asegurar que el objeto local tenga los nuevos valores
                                                                                    setData(prevData => {
                                                                                        const newData = [...prevData];
                                                                                        if (newData[absIndex]) {
                                                                                            newData[absIndex] = { ...newData[absIndex], _diff: null, _changes: null };
                                                                                        }
                                                                                        return newData;
                                                                                    });"""

new_optimistic = """                                                                                    // OPTIMISTIC UPDATE: buscar por ID de reserva (robusto, no por índice)
                                                                                    setData(prevData =>
                                                                                        prevData.map(r =>
                                                                                            normalizeId(r["Reserva"]) === reservaID
                                                                                                ? { ...r, _diff: null, _changes: null }
                                                                                                : r
                                                                                        )
                                                                                    );"""

if old_optimistic in content:
    content = content.replace(old_optimistic, new_optimistic, 1)
    print("Fix 1 OK: absIndex optimistic -> ID-based optimistic")
else:
    print("Fix 1 NOT FOUND")

# Fix 2: Add success log to individual commit
old_commit = """                                                                                    // log
                                                                                    batch.commit().then(() => {
                                                                                        // log
                                                                                        // Mantener el bloqueo unos segundos para evitar flasheos de onSnapshot
                                                                                        setTimeout(() => {
                                                                                            authorizingIds.current.delete(reservaID.trim());
                                                                                        }, 6000);"""

new_commit = """                                                                                    console.log('[Save] Haciendo commit para', reservaID, 'con Entrada:', cleanedRow['Entrada'], 'Pax:', cleanedRow['Pax.']);
                                                                                    batch.commit().then(() => {
                                                                                        console.log('✅ Reserva individual guardada en Firestore:', reservaID);
                                                                                        // Mantener el bloqueo 6s para que onSnapshot no restaure datos viejos
                                                                                        setTimeout(() => {
                                                                                            authorizingIds.current.delete(reservaID.trim());
                                                                                            console.log('🔓 authorizingId liberado:', reservaID);
                                                                                        }, 6000);"""

if old_commit in content:
    content = content.replace(old_commit, new_commit, 1)
    print("Fix 2 OK: added commit logs")
else:
    print("Fix 2 NOT FOUND - checking context...")
    idx = content.find("authorizingIds.current.delete(reservaID.trim());")
    print(f"  delete call found at: {idx}")
    if idx > 0:
        print(f"  context: {repr(content[idx-200:idx+100])}")

with open('Gestión de Grupos.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
