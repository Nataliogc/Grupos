const fs = require('fs');
const path = require('path');

const presPath = 'c:/Users/comun/Documents/GitHub/Grupos/src/Presupuestos.jsx';
let content = fs.readFileSync(presPath, 'utf8');

// 1. Guard against editing in handleSave
const searchSave = 'const handleSave = async (e) => {\r\n        e.preventDefault();\r\n        const now = new Date();';
const searchSaveLF = 'const handleSave = async (e) => {\n        e.preventDefault();\n        const now = new Date();';

const injectSave = `const handleSave = async (e) => {
        e.preventDefault();
        const uidToCheck = formData.uid || (groups.find(g => g.Reserva === formData.Reserva)?.uid);
        const oldRec = uidToCheck ? groups.find(g => g.uid === uidToCheck || g.Reserva === uidToCheck) : null;
        const isHistoricalReadOnly = Boolean(
          formData.convertedToReservation ||
          formData.targetReservationId ||
          formData.isHistoricalBudget ||
          formData.isReadOnly ||
          (oldRec && (oldRec.convertedToReservation || oldRec.targetReservationId || oldRec.isHistoricalBudget || oldRec.isReadOnly || oldRec.Com_Estado_Interno === "CONFIRMADO"))
        );

        if (isHistoricalReadOnly && formData.uid) {
          const resNum = formData.convertedToReservation || (oldRec && oldRec.convertedToReservation) || formData.Reserva;
          alert("⚠️ Este presupuesto ya está confirmado y asignado a la Reserva PMS Nº " + resNum + ".\\n\\nLa referencia única y válida es el número de reserva del PMS. Este presupuesto queda bloqueado exclusivamente en modo de consulta y no se puede modificar.");
          return;
        }

        const now = new Date();`;

if (content.includes(searchSave)) {
  content = content.replace(searchSave, injectSave.replace(/\n/g, '\r\n'));
  console.log("Updated handleSave (CRLF)");
} else if (content.includes(searchSaveLF)) {
  content = content.replace(searchSaveLF, injectSave);
  console.log("Updated handleSave (LF)");
} else {
  console.warn("Could not find searchSave in Presupuestos.jsx");
}

// 2. Banner in editor
const searchBanner = '            <div className="grid grid-cols-1 gap-8">\r\n              {/* Bloque 1: Información Básica */}';
const searchBannerLF = '            <div className="grid grid-cols-1 gap-8">\n              {/* Bloque 1: Información Básica */}';

const injectBanner = `            {Boolean(formData.convertedToReservation || formData.targetReservationId || formData.isHistoricalBudget || formData.isReadOnly || (formData.Com_Estado_Interno === 'CONFIRMADO' && formData.uid)) && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
                    🔒
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">
                      Presupuesto Confirmado — Modo Solo Consulta
                    </h4>
                    <p className="text-xs text-amber-800 font-medium mt-0.5">
                      Este presupuesto está confirmado y vinculado a la <strong>Reserva PMS Nº {formData.convertedToReservation || formData.targetReservationId || formData.Reserva}</strong>.
                      La referencia oficial del grupo es este número de reserva del PMS. Este presupuesto queda protegido y bloqueado contra modificación.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-200 text-amber-900 px-3 py-1.5 rounded-full shrink-0">
                  Mera Consulta
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              {/* Bloque 1: Información Básica */}`;

if (content.includes(searchBanner)) {
  content = content.replace(searchBanner, injectBanner.replace(/\n/g, '\r\n'));
  console.log("Updated editor banner (CRLF)");
} else if (content.includes(searchBannerLF)) {
  content = content.replace(searchBannerLF, injectBanner);
  console.log("Updated editor banner (LF)");
} else {
  console.warn("Could not find searchBanner in Presupuestos.jsx");
}

fs.writeFileSync(presPath, content, 'utf8');
console.log("Presupuestos.jsx saved!");
