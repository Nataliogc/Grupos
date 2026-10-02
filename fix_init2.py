import sys
with open('Fac Prof.html', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("syncFields();", "syncFields();\n        switchTemplate(currentTemplate);")

with open('Fac Prof.html', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
