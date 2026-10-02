const fs = require('fs');
let lines = fs.readFileSync('src/Configuracion.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('{/* CLÁUSULAS */}'));
const endIdx = lines.findIndex(l => l.includes('Resetear Todos los Grupos</button>')) + 4; // up to </div>

let extracted = lines.slice(start, endIdx).join('\n');
extracted = extracted.replace(/activeHotel/g, "'common'");

lines.splice(start, endIdx - start); // remove the block

// Now find where to insert
const systemIdx = lines.findIndex(l => l.includes(") : activeHotel === 'system' ? ("));

const newBranch =                                 ) : activeHotel === 'clauses' ? (
                                    <div className="max-w-4xl space-y-8 animate-fade-in">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 uppercase">Textos Legales</h3>
                                            <p className="text-xs text-slate-400">Configuración global de las cláusulas para todos los presupuestos y confirmaciones.</p>
                                        </div>

                                    </div>;

lines.splice(systemIdx, 0, newBranch);

fs.writeFileSync('src/Configuracion.jsx', lines.join('\n'));
