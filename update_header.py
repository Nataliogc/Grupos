import sys
with open('Fac Prof.html', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove max-w-[210mm] and change background to light
bad_header = """<div class="max-w-[210mm] mx-auto mb-5 no-print rounded-2xl overflow-hidden shadow-xl border border-slate-200/60" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">"""
good_header = """<div class="w-full mb-5 no-print rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">"""

code = code.replace(bad_header, good_header)

# Change text colors in row 1
code = code.replace('border-white/10', 'border-slate-100')
code = code.replace('bg-white/10 hover:bg-white/20 text-white/70 hover:text-white', 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800')
code = code.replace('bg-white/15', 'bg-slate-200')
code = code.replace('text-white/40', 'text-slate-400')

# Hotel selector
code = code.replace('bg-white/10 border border-white/20 text-white text-[10px] font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer', 'bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer')

# Buttons in row 2
code = code.replace('bg-white/10 hover:bg-white/20 text-white border border-white/20', 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm')
code = code.replace('bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15', 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm')
code = code.replace('border border-white/20 text-white', 'border border-slate-200 text-slate-700')

# Update "Entorno de Trabajo" text
code = code.replace('text-white/40', 'text-slate-400')

with open('Fac Prof.html', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
