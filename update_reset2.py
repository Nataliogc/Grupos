import sys
with open('Fac Prof.html', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove old reset button
old_btn = """<!-- Reset Clausulas -->
            <button onclick="resetClauses()" id="btn-reset-clauses"
                class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider transition-all hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Restaurar Base
            </button>"""
code = code.replace(old_btn, "")

# Insert new reset button next to desestimar
new_btn = """<!-- Reset Clausulas -->
            <button onclick="resetClauses()" id="btn-reset-clauses" title="Restaurar Cláusulas por Defecto"
                class="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/20 transition-all hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>"""

code = code.replace("<!-- Desestimar -->", new_btn + "\n            <!-- Desestimar -->")

# Add switchTemplate('confirmacion') to init/load
init_hook = """
            loadDataFromGroup();
            renderItems();
            renderDynamicOccupants();
"""
new_init_hook = """
            loadDataFromGroup();
            renderItems();
            renderDynamicOccupants();
            switchTemplate(currentTemplate); // Ensure UI visibility matches initial state
"""
code = code.replace(init_hook, new_init_hook)

with open('Fac Prof.html', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
