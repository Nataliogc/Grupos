import sys
with open("Gestión de Grupos.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

out = []
for i, line in enumerate(lines):
    if "2. Excluir Cancelados" in line:
        start = max(0, i - 5)
        end = min(len(lines), i + 20)
        out.extend(lines[start:end])
        break

with open("output.txt", "w", encoding="utf-8") as f:
    f.writelines(out)
