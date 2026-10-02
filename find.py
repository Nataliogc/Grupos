import sys
with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if ") : activeHotel ===" in l:
        print(f"{i}: {l.strip()}")
