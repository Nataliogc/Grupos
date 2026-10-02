import sys
with open('Fac Prof.html', 'r', encoding='utf-8') as f:
    code = f.read()

bad = """                const titleEl = c.querySelector('.editable-clause:nth-of-type(1), p:first-of-type.editable-clause');
                const bodyEl = c.querySelector('.clause-body.editable-clause');"""

good = """                const allEditable = c.querySelectorAll('.editable-clause');
                const titleEl = allEditable[0];
                const bodyEl = allEditable[1] || c.querySelector('.clause-body');"""

code = code.replace(bad, good)
with open('Fac Prof.html', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
