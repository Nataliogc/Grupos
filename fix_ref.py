import sys
with open('src/GestionGrupos.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if "const [customBudgetIdInput, setCustomBudgetIdInput] = useState(\"\");" in l:
        del lines[i]
        break

for i, l in enumerate(lines):
    if "const [highlightSyncCharges" in l:
        lines.insert(i + 1, 'const [customBudgetIdInput, setCustomBudgetIdInput] = useState("");\n')
        break

with open('src/GestionGrupos.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
