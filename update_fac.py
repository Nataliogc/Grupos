import sys
import re

with open('Fac Prof.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update saveProforma to scrape clauses
# We look for customFields.dynamicRows = ...
# And insert our scrape logic right before it
scrape_logic = """
    const polDiv = document.getElementById('tpl-policies');
    if (polDiv && currentTemplate === 'confirmacion') {
        const clauseBlocks = Array.from(polDiv.querySelectorAll('div > div > p.editable-clause')).map(p => p.closest('div').parentElement);
        // unique blocks
        const uniqueBlocks = [...new Set(clauseBlocks)];
        if (uniqueBlocks.length > 0) {
            customFields.confirmationClauses = uniqueBlocks.map(c => {
                const titleEl = c.querySelector('.editable-clause:nth-of-type(1), p:first-of-type.editable-clause');
                const bodyEl = c.querySelector('.clause-body.editable-clause');
                return {
                    title: titleEl ? titleEl.innerText.trim() : '',
                    body: bodyEl ? bodyEl.innerText.trim() : ''
                };
            }).filter(c => c.title || c.body);
        }
    }
"""
content = content.replace(
    "customFields.dynamicRows = Array.from(document.querySelectorAll('#ocupante-box",
    scrape_logic + "\n    customFields.dynamicRows = Array.from(document.querySelectorAll('#ocupante-box"
)


# 2. Update render logic to load them
# We look for const allC = hotelClauses.length > 0 ? hotelClauses : commonClauses;
load_logic = """
                    const groupObjTemp = JSON.parse(localStorage.getItem('selectedGroup') || '{}');
                    const customC = groupObjTemp.ProformaCustomFields?.confirmationClauses;
                    let allC = customC && customC.length > 0 ? customC : (hotelClauses.length > 0 ? hotelClauses : commonClauses);
"""
content = content.replace(
    "const allC = hotelClauses.length > 0 ? hotelClauses : commonClauses;",
    load_logic
)

with open('Fac Prof.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
