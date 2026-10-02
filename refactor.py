import sys

with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{/* CLÁUSULAS */}' in line:
        start = i
    if 'Resetear Todos los Grupos</button>' in line:
        # The button is at 1404. We want to include up to 1408. So + 4 lines.
        # Let's count divs properly
        end_idx = i + 5
        break

if start == -1 or end_idx == -1:
    print("Not found")
    sys.exit(1)

extracted = "".join(lines[start:end_idx])
extracted = extracted.replace("activeHotel", "'common'")
extracted = extracted.replace("mt-12 pt-10 border-t border-slate-100", "mt-0")

# Remove from original lines
del lines[start:end_idx]

system_idx = -1
for i, line in enumerate(lines):
    if ") : activeHotel === 'system' ? (" in line:
        system_idx = i
        break

new_branch = """                                ) : activeHotel === 'clauses' ? (
                                    <div className="max-w-4xl space-y-8 animate-fade-in">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 uppercase">Textos Legales</h3>
                                            <p className="text-xs text-slate-400">Configuración global de las cláusulas para todos los presupuestos y confirmaciones.</p>
                                        </div>
""" + extracted + """                                    </div>\n"""

lines.insert(system_idx, new_branch)

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done")
