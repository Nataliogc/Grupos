import sys

with open('src/Configuracion.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_set_config = """                            return {
                                ...prev,
                                ...data,
                                system: {"""

new_set_config = """                            // MIGRATION: Migrate clauses from guadiana to common if missing
                            const migratedCommon = { ...prev.common, ...(data.common || {}) };
                            if (!migratedCommon.clauses || migratedCommon.clauses.length === 0) {
                                migratedCommon.clauses = (data.guadiana && data.guadiana.clauses) ? data.guadiana.clauses : BUDGET_MODEL_TEMPLATES;
                            }
                            if (!migratedCommon.confirmationClauses || migratedCommon.confirmationClauses.length === 0) {
                                migratedCommon.confirmationClauses = (data.guadiana && data.guadiana.confirmationClauses) ? data.guadiana.confirmationClauses : CONF_MODEL_TEMPLATES;
                            }

                            return {
                                ...prev,
                                ...data,
                                common: migratedCommon,
                                system: {"""

code = code.replace(old_set_config, new_set_config)

with open('src/Configuracion.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
