import sys
with open('Fac Prof.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

button_html = """
            <!-- Reset Clausulas -->
            <button onclick="resetClauses()" id="btn-reset-clauses"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider transition-all hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Restaurar Base
            </button>
"""

# Insert button
for i, l in enumerate(lines):
    if "<!-- Guardar y Salir -->" in l:
        lines.insert(i, button_html)
        break

# Insert reset function
func_js = """
        function resetClauses() {
            if(!confirm('¿Estás seguro de que quieres borrar las cláusulas personalizadas de este grupo y volver a cargar las cláusulas estándar globales?')) return;
            const saved = localStorage.getItem('selectedGroup');
            if(saved) {
                const group = JSON.parse(saved);
                if(group.ProformaCustomFields) {
                    delete group.ProformaCustomFields.confirmationClauses;
                    localStorage.setItem('selectedGroup', JSON.stringify(group));
                    
                    // Al guardar le mandaremos las custom fields sin las clausulas para borrar en BBDD
                    // Pero para que sea inmediato, regeneramos la vista
                    renderItems();
                    
                    // Hacemos auto-save para persistirlo
                    saveProforma(true);
                }
            }
        }
"""
for i, l in enumerate(lines):
    if "async function saveProforma(silent" in l:
        lines.insert(i, func_js)
        break

# Update UI visibility in switchTemplate
for i, l in enumerate(lines):
    if "document.getElementById('btn-proforma').className" in l:
        lines.insert(i+1, "            const btnReset = document.getElementById('btn-reset-clauses'); if(btnReset) btnReset.classList.toggle('hidden', tpl !== 'confirmacion');\n")
        break

with open('Fac Prof.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)
