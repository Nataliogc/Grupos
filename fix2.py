import sys
with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

bad_str = "className={w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all }"
good_str = "className={w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all }"

code = code.replace(bad_str, good_str)

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Fixed")
