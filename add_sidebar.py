import sys
with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

insert_idx = -1
for i, l in enumerate(lines):
    if "Catálogo de Servicios" in l or "Catǭlogo de Servicios" in l:
        # found the button for Catálogo de Servicios
        insert_idx = i + 2 # skip the closing button tag
        break

if insert_idx != -1:
    new_btn = """                            <button onClick={() => setActiveHotel('clauses')} className={w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all }>
                                <LucideIcon name="file-text" className="w-5 h-5" />
                                Textos Legales
                            </button>
"""
    lines.insert(insert_idx, new_btn)
    with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Done")
else:
    print("Not found")
