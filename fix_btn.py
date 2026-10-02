import sys
with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    code = f.read()
    
# Replace the bad line
code = code.replace(
    "className={w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all }",
    "className={w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all }"
)

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed")
