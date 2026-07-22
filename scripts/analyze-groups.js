const fs = require('fs');
const { Firestore } = require('@google-cloud/firestore');
const { OAuth2Client } = require('google-auth-library');

async function main() {
    // 1. Obtener token de firebase-tools.json
    const configPath = 'C:\\Users\\comun\\.config\\configstore\\firebase-tools.json';
    if (!fs.existsSync(configPath)) {
        console.error("No se pudo encontrar firebase-tools.json en la ruta del sistema.");
        process.exit(1);
    }

    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const tokenInfo = configData.tokens;
    if (!tokenInfo || (!tokenInfo.access_token && !tokenInfo.refresh_token)) {
        console.error("No se encontraron tokens válidos en firebase-tools.json. Por favor ejecuta: firebase login");
        process.exit(1);
    }

    // 2. Inicializar cliente OAuth2
    const auth = new OAuth2Client();
    auth.setCredentials({
        access_token: tokenInfo.access_token,
        refresh_token: tokenInfo.refresh_token
    });

    const projectId = 'gest-grupos-hotel';
    console.log(`Conectando al proyecto Firebase: ${projectId} usando credenciales de Firebase CLI...`);

    // 3. Inicializar Firestore con el authClient
    const db = new Firestore({
        projectId: projectId,
        authClient: auth
    });

    // 4. Obtener documentos de groups
    const snapshot = await db.collection('groups').get();
    console.log(`Total documentos en 'groups': ${snapshot.size}`);

    let tempIds = 0;
    let unnamed = 0;
    let oldDates1900 = 0;
    let desestimadoOld = 0;
    let caducadoOld = 0;
    let emptyRecords = 0;
    let notActivoWithoutRooming = 0;
    
    const candidates = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        
        // El campo exacto en Firestore es "Nombre del Grupo" o "grupo" o "name"
        const name = data["Nombre del Grupo"] || data.name || data.grupo || data.Grupo || '';
        const estado = (data.Estado || data.estado || '').toUpperCase();
        
        let entrada = data.Entrada || data.entrada || data.fechaEntrada || '';
        let salida = data.Salida || data.salida || data.fechaSalida || '';
        
        const isTemp = id.startsWith('TEMP-');
        const isUnnamed = !name || !name.trim() || name.toLowerCase() === 'sin nombre';
        
        let is1900 = false;
        if (entrada.includes('1900') || salida.includes('1900') || (typeof entrada === 'string' && entrada.endsWith('/1900'))) {
            is1900 = true;
        }

        // Check if old dates (e.g., year <= 2024)
        let isOldDate = false;
        let yearEntrada = null;
        if (entrada && typeof entrada === 'string') {
            const parts = entrada.split('/');
            if (parts.length === 3) {
                yearEntrada = parseInt(parts[2], 10);
            } else if (entrada.includes('-')) {
                const partsDash = entrada.split('-');
                if (partsDash.length >= 3) {
                    yearEntrada = parseInt(partsDash[0], 10);
                }
            }
        }
        if (yearEntrada && yearEntrada <= 2024 && yearEntrada > 1900) {
            isOldDate = true;
        }

        const isDesestimado = estado === 'DESESTIMADO' || estado === 'ANULADA';
        const isCaducado = estado === 'CADUCADO';
        const isActivo = estado === 'ACTIVO' || estado === 'CONFIRMADA';
        
        const roomingList = data.RoomingList_JSON ? JSON.parse(data.RoomingList_JSON) : [];
        const extraCharges = data.extraCharges || [];
        const isEmpty = roomingList.length === 0 && extraCharges.length === 0;

        let deleteReason = [];
        if (isTemp) {
            tempIds++;
            deleteReason.push('ID temporal (TEMP-*)');
        }
        if (isUnnamed) {
            unnamed++;
            deleteReason.push('Sin Nombre');
        }
        if (is1900) {
            oldDates1900++;
            deleteReason.push('Fecha en 1900');
        }
        if (isDesestimado && (isOldDate || is1900)) {
            desestimadoOld++;
            deleteReason.push('Desestimado/Anulado antiguo (<= 2024)');
        }
        if (isCaducado && (isOldDate || is1900)) {
            caducadoOld++;
            deleteReason.push('Caducado antiguo (<= 2024)');
        }
        if (isEmpty && !isActivo) {
            notActivoWithoutRooming++;
            deleteReason.push('Vacío y estado no activo');
        }

        if (deleteReason.length > 0) {
            candidates.push({
                id,
                name,
                estado,
                entrada,
                salida,
                reasons: deleteReason,
                isEmpty
            });
        }
    });

    console.log(`\nCANDIDATOS DETECTADOS PARA LIMPIEZA:`);
    console.log(`- ID temporal (TEMP-*): ${tempIds}`);
    console.log(`- Sin nombre ("Sin Nombre" o vacío): ${unnamed}`);
    console.log(`- Fecha en 1900: ${oldDates1900}`);
    console.log(`- Desestimados/Anulados antiguos (<= 2024): ${desestimadoOld}`);
    console.log(`- Caducados antiguos (<= 2024): ${caducadoOld}`);
    console.log(`- Vacíos y no activos: ${notActivoWithoutRooming}`);
    console.log(`Total candidatos únicos a limpiar: ${candidates.length}\n`);

    console.log("Muestra de 15 candidatos a limpiar:");
    candidates.slice(0, 15).forEach(c => {
        console.log(`- [${c.id}] Name: "${c.name}", Estado: ${c.estado}, Entrada: ${c.entrada}, Razones: ${c.reasons.join(', ')}`);
    });

    // Guardar el análisis a un archivo JSON local en la misma carpeta
    const outputPath = 'c:\\Users\\comun\\Documents\\GitHub\\Grupos\\scripts\\last-analysis.json';
    fs.writeFileSync(outputPath, JSON.stringify(candidates, null, 2));
    console.log(`\nDetalle completo de candidatos guardado en: ${outputPath}`);
}

main().catch(console.error);
