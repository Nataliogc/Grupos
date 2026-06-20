const fs = require('fs');
const path = 'C:/Users/comun/Documents/GitHub/Grupos/src/GestionGrupos.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = '{/* Tabla de Resultados - Clean UI */}';
const bannerCode = `
                            {(() => {
                              const extraCharges = selectedGroupFicha?.extraCharges || [];
                              if (!extraCharges.length) return null;
                              
                              const rl = typeof window.roomingCore !== "undefined" && window.roomingCore.getGroupEconomicItems
                                ? window.roomingCore.getGroupEconomicItems(selectedGroupFicha)
                                : parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");
                              
                              const rlIds = new Set(rl.map(item => item.id || item.sourceBudgetItemId));
                              const pending = extraCharges.filter(ec => !rlIds.has(ec.id));
                              
                              if (pending.length > 0) {
                                const pendingTotal = pending.reduce((acc, ec) => acc + (parseFloat(ec.price) || 0), 0);
                                return (
                                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex gap-3 items-start">
                                      <div className="text-amber-500 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-amber-800 text-sm">Hay {pendingTotal.toLocaleString('es-ES', {minimumFractionDigits: 2})} € en cargos del presupuesto pendientes de incorporar</h4>
                                        <ul className="mt-1 text-xs text-amber-700 list-disc list-inside">
                                          {pending.map((p, i) => (
                                            <li key={i}>{p.concept || p.type}: {(parseFloat(p.price) || 0).toLocaleString('es-ES', {minimumFractionDigits: 2})} €</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        // This is a complex update because we need to append them to the persisted RoomingList_JSON array
                                        // so that they become persisted in the UI data.
                                        const currentRL = parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");
                                        const newRL = [...currentRL, ...pending.map(ec => ({
                                          id: ec.id,
                                          type: ec.concept || ec.type || "Extra",
                                          dateIn: ec.date || "Varias",
                                          qty: ec.units || ec.qty || 1,
                                          price: ec.unitPrice !== undefined ? ec.unitPrice : ec.price,
                                          total: ec.price !== undefined ? ec.price : 0,
                                          isService: true,
                                          isEconomicItem: true,
                                          isEconomicRepresentation: true,
                                          isAccommodation: false,
                                          hotel: selectedGroupFicha?.records[0]?.["Hotel_Asignado"] || selectedGroupFicha?.records[0]?.["Hotel"]
                                        }))];
                                        updateGroupMetadata(selectedGroupFicha.id, {
                                          RoomingList_JSON: JSON.stringify(newRL)
                                        });
                                      }}
                                      className="whitespace-nowrap px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                    >
                                      SINCRONIZAR CARGOS DEL PRESUPUESTO
                                    </button>
                                  </div>
                                );
                              }
                              return null;
                            })()}
`;

if (content.includes(targetStr) && !content.includes('Hay {pendingTotal.toLocaleString(')) {
    content = content.replace(targetStr, bannerCode + targetStr);
    fs.writeFileSync(path, content);
    console.log("Banner added.");
} else {
    console.log("Banner already present or target string missing.");
}
