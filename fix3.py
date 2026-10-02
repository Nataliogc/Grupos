import sys
with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if "setActiveHotel('clauses')" in l:
        lines[i] = "                            <button onClick={() => setActiveHotel('clauses')} className={w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all }>\n"
        break

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
