import sys

with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{/* Global Clauses' in line:
        start = i
    if ') : activeHotel === \'commercials\' ? (' in line:
        # Actually it's right before commercials block
        if start != -1:
            end_idx = i - 1
            break

if start == -1 or end_idx == -1:
    print("Not found")
    sys.exit(1)

# Ensure end_idx is correct
for j in range(end_idx, start, -1):
    if '))} ' in lines[j] or '))}' in lines[j]:
        end_idx = j
        break

print(f"Removing {start} to {end_idx}")
del lines[start:end_idx+1]

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done")
