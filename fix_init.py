import sys
with open('Fac Prof.html', 'r', encoding='utf-8') as f:
    code = f.read()

bad = """        loadSelectedGroup();
        renderItems();
        syncFields();
    });"""

good = """        loadSelectedGroup();
        renderItems();
        syncFields();
        switchTemplate(currentTemplate);
    });"""

code = code.replace(bad, good)
with open('Fac Prof.html', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
