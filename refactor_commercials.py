import sys
with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Remove Sidebar button (501 to 504)
# Wait, let's find it dynamically to be safe
btn_idx = -1
for i, l in enumerate(lines):
    if "onClick={() => setActiveHotel('commercials')}" in l:
        btn_idx = i
        break
if btn_idx != -1:
    del lines[btn_idx:btn_idx+4]

# 2. Remove header ternary
hdr_idx = -1
for i, l in enumerate(lines):
    if ") : activeHotel === 'commercials' ? (" in l:
        if "Base de Datos de Personal" in lines[i+2]:
            hdr_idx = i
            break
if hdr_idx != -1:
    del lines[hdr_idx:hdr_idx+5]

# 3. Extract main content ternary
main_idx = -1
for i, l in enumerate(lines):
    if ") : activeHotel === 'commercials' ? (" in l:
        main_idx = i
        break

if main_idx != -1:
    # 850 is main_idx + 2
    # 1029 is main_idx + 181
    # Let's find exactly
    end_idx = -1
    for i in range(main_idx, len(lines)):
        if ") : activeHotel === 'clauses' ? (" in lines[i]:
            end_idx = i - 1
            break
    
    # Extract the inner card (skip the wrapper)
    # The card starts at main_idx + 2, ends at end_idx - 1
    card_content = lines[main_idx+2 : end_idx]
    
    # Remove the whole commercials branch
    del lines[main_idx:end_idx+1]
    
    # 4. Insert card_content at the end of users branch
    # To find the end of users branch, we look for ) : activeHotel === 'services' ? (
    srv_idx = -1
    for i, l in enumerate(lines):
        if ") : activeHotel === 'services' ? (" in l:
            srv_idx = i
            break
            
    if srv_idx != -1:
        # We want to insert it before the closing div of users.
        # Lines right before srv_idx are:
        # </div>
        # </div>
        # ) : activeHotel === 'services'
        # We insert at srv_idx - 2.
        
        for item in reversed(card_content):
            lines.insert(srv_idx - 2, item)

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done")
