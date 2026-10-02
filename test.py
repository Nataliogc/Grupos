import sys
with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if "onClick={() => setActiveHotel('commercials')}" in l:
        print(f"Sidebar button at {i}")
        for j in range(i-2, i+4):
            print(f"{j}: {lines[j].strip()}")
        break
