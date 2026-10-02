import sys
with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

notice_html = """                                                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                                                    <LucideIcon name="info" className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <h5 className="text-sm font-bold text-indigo-900">¿Buscas las Cláusulas?</h5>
                                                        <p className="text-xs text-indigo-700 mt-1">
                                                            Los textos legales y condiciones de presupuestos/confirmaciones ahora son compartidos por todos los hoteles. 
                                                            Puedes encontrarlos y editarlos en la nueva pestaña <button onClick={() => setActiveHotel('clauses')} className="font-bold underline cursor-pointer">Textos Legales</button> del menú principal.
                                                        </p>
                                                    </div>
                                                </div>
"""

# We insert this at the end of the form for guadiana/cumbria.
# To find it, let's search for "Entidad Bancaria" block end, or just the end of the grid.
for i, l in enumerate(lines):
    if "placeholder=\"Nombre del Banco\" />" in l:
        # this is inside <div className="grid grid-cols-1 gap-4">
        # 3 lines down is the end of the div
        lines.insert(i + 3, notice_html)
        # Wait, there are two! One for guadiana/cumbria (fallback branch)
        # So we just do it for all occurrences (it's in the fallback branch)

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
