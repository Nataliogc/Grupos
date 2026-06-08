const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

// First, fix the rendering logic.
// We need to remove the `viewMode === 'calendar' ? ... : ` inside tbody.
const tbodyPattern = /viewMode === 'calendar' \? React\.createElement\(BudgetCalendar, \{ groups: processedGroups, onEventClick: function\(g\) \{\s*handleOpenDetail\(g\);\s*\} \}\) : processedGroups\.map/s;
code = code.replace(tbodyPattern, `processedGroups.map`);

// We need to ensure the calendar is rendered outside the table.
// Right after the table and its container, or before it.
// The container starts with: `viewMode === 'list' && /*#__PURE__*/React.createElement("div", {\n        className: "overflow-x-auto"\n      }, /*#__PURE__*/React.createElement("table", {`

// Let's replace the whole table rendering block if we can, or just inject the Calendar right after the filter div.
// The filter div ends with:
/*
        setSearchTerm('');
      },
      className: "ml-2 p-1.5 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 hover:bg-rose-500 hover:text-white transition-all",
      title: "Limpiar filtros"
    }, /*#__PURE__*\/React.createElement("i", {
      className: "fas fa-times-circle"
    })))), viewMode === 'list' && /*#__PURE__*\/React.createElement("div", {
        className: "overflow-x-auto"
*/

const searchEndPattern = /title: "Limpiar filtros"\n\s*\}, \/\*#__PURE__\*\/React\.createElement\("i", \{\n\s*className: "fas fa-times-circle"\n\s*\}\)\)\)\), viewMode === 'list' && \/\*#__PURE__\*\/React\.createElement\("div", \{/;

const searchEndReplacement = `title: "Limpiar filtros"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-times-circle"
    })))), 
    viewMode === 'calendar' && React.createElement(BudgetCalendar, { groups: processedGroups, onEventClick: function(g) { handleOpenDetail(g); } }),
    viewMode === 'list' && /*#__PURE__*/React.createElement("div", {`;

code = code.replace(searchEndPattern, searchEndReplacement);

// Now let's inject the toggle button inside the filter div.
// We will look for the start of the date filters:
/*
    })), /*#__PURE__*\/React.createElement("div", {
      className: "flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm"
    }, /*#__PURE__*\/React.createElement("i", {
      className: "fas fa-calendar-alt text-slate-400 text-xs"
    }), /*#__PURE__*\/React.createElement("div", {
*/

const dateFilterPattern = /\}\)\), \/\*#__PURE__\*\/React\.createElement\("div", \{\n\s*className: "flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm"\n\s*\}, \/\*#__PURE__\*\/React\.createElement\("i", \{\n\s*className: "fas fa-calendar-alt text-slate-400 text-xs"\n\s*\}\), \/\*#__PURE__\*\/React\.createElement\("div", \{/;

const toggleHtmlCode = `})), 
    /*#__PURE__*/React.createElement("div", {
      className: "flex bg-slate-200/80 p-1 rounded-xl ml-auto border border-slate-200 mr-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setViewMode('list');
      },
      className: "px-4 py-2 rounded-lg text-xs font-bold transition-all ".concat(viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-list mr-2"
    }), "Lista"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setViewMode('calendar');
      },
      className: "px-4 py-2 rounded-lg text-xs font-bold transition-all ".concat(viewMode === 'calendar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-calendar-alt mr-2"
    }), "Calendario")),
    
    /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-calendar-alt text-slate-400 text-xs"
    }), /*#__PURE__*/React.createElement("div", {`;

code = code.replace(dateFilterPattern, toggleHtmlCode);

fs.writeFileSync(filePath, code);
console.log('Presupuestos.js UI patched successfully.');
