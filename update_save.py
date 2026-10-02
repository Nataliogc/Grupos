import sys

with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_save = """            const saveConfig = async () => {
                setLoading(true);
                try {
                    await db.collection("settings").doc("main").set(config);"""

new_save = """            const saveConfig = async () => {
                setLoading(true);
                try {
                    const dataToSave = { ...config };
                    if (dataToSave.guadiana) { delete dataToSave.guadiana.clauses; delete dataToSave.guadiana.confirmationClauses; }
                    if (dataToSave.cumbria) { delete dataToSave.cumbria.clauses; delete dataToSave.cumbria.confirmationClauses; }
                    await db.collection("settings").doc("main").set(dataToSave);"""

code = code.replace(old_save, new_save)

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
