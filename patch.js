const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

const calendarCode = `
const BudgetCalendar = ({ groups, onEventClick }) => {
  const { useState } = React;
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Lunes como primer día de la semana
  const startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  const daysInMonth = lastDayOfMonth.getDate();
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Agrupar presupuestos por día de entrada
  const eventsByDay = {};
  groups.forEach(g => {
    let entryDateStr = g.Entrada;
    if (g.isMultiSegment && Array.isArray(g.segments) && g.segments.length > 0) {
       const stats = getSegmentStats(g.segments);
       entryDateStr = stats.globalIn;
    }
    if (entryDateStr) {
       const dateObj = new Date(entryDateStr);
       if (dateObj.getFullYear() === currentDate.getFullYear() && dateObj.getMonth() === currentDate.getMonth()) {
           const day = dateObj.getDate();
           if (!eventsByDay[day]) eventsByDay[day] = [];
           eventsByDay[day].push(g);
       }
    }
  });

  const getStatusStyle = (g) => {
    const status = g.Com_Estado_Interno || g.Estado || "";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('confirm')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (lowerStatus.includes('cancel') || lowerStatus.includes('anul') || lowerStatus.includes('gastos') || lowerStatus.includes('desestimado') || lowerStatus.includes('baja') || lowerStatus.includes('caducado')) return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(React.createElement('div', { key: \`empty-\${i}\`, className: "h-24 sm:h-32 bg-slate-50/50 border-r border-b border-slate-100" }));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEvents = eventsByDay[i] || [];
      const hasMore = dayEvents.length > 3;
      const visibleEvents = dayEvents.slice(0, 3);
      
      const isToday = new Date().getDate() === i && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

      days.push(React.createElement('div', { key: i, className: \`h-24 sm:h-32 border-r border-b border-slate-200 overflow-hidden relative flex flex-col p-1 transition-colors \${isToday ? 'bg-indigo-50/30' : 'bg-white hover:bg-slate-50'}\` }, 
        React.createElement('div', { className: \`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 \${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}\` }, i),
        React.createElement('div', { className: "flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1" }, 
           visibleEvents.map(g => {
             const name = g["Nombre del Grupo"] || g.Cliente || "Sin Nombre";
             const pax = g["Pax."] || g.Pax || "-";
             const amount = g._totalAmount ? formatNum(g._totalAmount) + '€' : '-';
             
             return React.createElement('div', { 
               key: g.uid || Math.random(), 
               onClick: () => onEventClick(g),
               className: \`text-[10px] sm:text-xs leading-tight p-1 sm:p-1.5 rounded border cursor-pointer hover:shadow-sm transition-all truncate group relative \${getStatusStyle(g)}\`,
               title: \`\${name}\\nPax: \${pax}\\nImporte: \${amount}\`
             }, 
               React.createElement('div', { className: "font-semibold truncate" }, name),
               React.createElement('div', { className: "flex justify-between items-center opacity-80 text-[9px] mt-0.5" },
                 React.createElement('span', null, \`👤 \${pax}\`),
                 React.createElement('span', null, amount)
               )
             )
           }),
           hasMore && React.createElement('div', { className: "text-[10px] text-center font-semibold text-slate-500 pt-0.5 cursor-pointer hover:text-slate-700" }, \`+ \${dayEvents.length - 3} más\`)
        )
      ));
    }
    return days;
  };

  return React.createElement('div', { className: "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4 animate-fade-in" }, 
    React.createElement('div', { className: "p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/80" },
       React.createElement('h3', { className: "text-lg font-black text-slate-800 capitalize flex items-center gap-2" }, 
         React.createElement('i', { className: "fas fa-calendar-alt text-indigo-600" }),
         \`\${monthNames[currentDate.getMonth()]} \${currentDate.getFullYear()}\`
       ),
       React.createElement('div', { className: "flex gap-2" },
         React.createElement('button', { onClick: prevMonth, className: "p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors" }, React.createElement('i', { className: "fas fa-chevron-left" })),
         React.createElement('button', { onClick: goToToday, className: "px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 shadow-sm text-sm transition-all" }, "Hoy"),
         React.createElement('button', { onClick: nextMonth, className: "p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors" }, React.createElement('i', { className: "fas fa-chevron-right" }))
       )
    ),
    React.createElement('div', { className: "grid grid-cols-7 border-b border-slate-200 bg-slate-100" },
      ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => 
        React.createElement('div', { key: d, className: "p-2 text-center text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 last:border-r-0" }, d)
      )
    ),
    React.createElement('div', { className: "grid grid-cols-7" },
      renderDays()
    )
  );
};
`;

code = code.replace(/function App\(\) {/, calendarCode + '\nfunction App() {');

// Inject the state
const statePattern = /var _useState35 = useState\(false\),\n\s*\_useState36 = \_slicedToArray\(\_useState35, 2\),\n\s*isParsingEmail = \_useState36\[0\],\n\s*setIsParsingEmail = \_useState36\[1\];/;

const newStateCode = `var _useState35 = useState(false),
    _useState36 = _slicedToArray(_useState35, 2),
    isParsingEmail = _useState36[0],
    setIsParsingEmail = _useState36[1];

  var _useStateView = useState(function() { return localStorage.getItem('presupuestosViewMode') || 'list'; }),
    _useStateView2 = _slicedToArray(_useStateView, 2),
    viewMode = _useStateView2[0],
    setViewModeState = _useStateView2[1];

  var setViewMode = function(mode) {
    localStorage.setItem('presupuestosViewMode', mode);
    setViewModeState(mode);
  };`;

code = code.replace(statePattern, newStateCode);

// Inject toggle button
const filterTabPattern = /<input type="date" value={endDate} onChange={function onChange\(e\) {/;
const toggleHtml = `
      {/* Vista Toggle */}
      <div className="flex bg-slate-200 p-1 rounded-lg ml-auto">
        <button 
          onClick={() => setViewMode('list')} 
          className={\`px-4 py-1.5 rounded-md text-xs font-bold transition-all \${viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
        >
          <i className="fas fa-list mr-1"></i> Lista
        </button>
        <button 
          onClick={() => setViewMode('calendar')} 
          className={\`px-4 py-1.5 rounded-md text-xs font-bold transition-all \${viewMode === 'calendar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
        >
          <i className="fas fa-calendar-alt mr-1"></i> Calendario
        </button>
      </div>
      <input type="date" value={endDate} onChange={function onChange(e) {`;

code = code.replace(filterTabPattern, toggleHtml.replace(/<[^>]+>/g, (match) => {
    // Basic conversion of JSX to React.createElement for this specific toggle button block if needed.
    // Actually, Presupuestos.js uses React.createElement heavily. I need to output React.createElement.
    return match; // Will be handled differently below
}));

// Better approach for JSX to React.createElement substitution:
const filterHtmlMatch = /className: "fas fa-times"\n\s*}\)\)\), \/\*#__PURE__\*\/React\.createElement\("div", \{\n\s*className: "flex gap-2 items-center"\n\s*\}, \/\*#__PURE__\*\/React\.createElement\("span", \{\n\s*className: "text-xs font-bold text-slate-400"\n\s*\}, "Fechas:"\), \/\*#__PURE__\*\/React\.createElement\("input", {/s;

const viewModeToggleCode = `className: "fas fa-times"
    }))), 
    
    /*#__PURE__*/React.createElement("div", {
      className: "flex bg-slate-200/80 p-1 rounded-xl ml-auto border border-slate-200"
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
      className: "flex gap-2 items-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold text-slate-400"
    }, "Fechas:"), /*#__PURE__*/React.createElement("input", {`;

code = code.replace(filterHtmlMatch, viewModeToggleCode);

// Inject BudgetCalendar rendering logic
const renderPattern = /\}, processedGroups\.map\(/;
const renderReplacement = `}, viewMode === 'calendar' ? React.createElement(BudgetCalendar, { groups: processedGroups, onEventClick: function(g) {
      handleOpenDetail(g);
    } }) : processedGroups.map(`;

code = code.replace(renderPattern, renderReplacement);

const emptyStatePattern = /processedGroups\.length === 0 && !loading && \/\*#__PURE__\*\/React\.createElement\("div", \{/;
const emptyStateReplacement = `viewMode === 'list' && processedGroups.length === 0 && !loading && /*#__PURE__*/React.createElement("div", {`;
code = code.replace(emptyStatePattern, emptyStateReplacement);

const theadPattern = /\/\*#__PURE__\*\/React\.createElement\("thead", \{/g;
// Replace only the first occurrence within renderDashboard, actually the table container needs conditional wrapping.
const tableContainerPattern = /\/\*#__PURE__\*\/React\.createElement\("div", \{\n\s*className: "overflow-x-auto"\n\s*\}, \/\*#__PURE__\*\/React\.createElement\("table", \{/;
const tableContainerReplacement = `viewMode === 'list' && /*#__PURE__*/React.createElement("div", {
        className: "overflow-x-auto"
      }, /*#__PURE__*/React.createElement("table", {`;

code = code.replace(tableContainerPattern, tableContainerReplacement);


fs.writeFileSync(filePath, code);
console.log('Presupuestos.js patched.');
