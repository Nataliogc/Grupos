const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

// Replace the viewMode hook to validate the storage value
const oldUseStateView = /var _useStateView = useState\(function\(\) \{ return localStorage\.getItem\('presupuestosViewMode'\) \|\| 'list'; \}\),/;
const newUseStateView = `var _useStateView = useState(function() { 
    var val = localStorage.getItem('presupuestosViewMode'); 
    return (val === 'calendar' || val === 'list') ? val : 'list'; 
  }),`;

code = code.replace(oldUseStateView, newUseStateView);

// Replace BudgetCalendar
const calendarStart = code.indexOf('const BudgetCalendar =');
const calendarEnd = code.indexOf('function App() {');
if (calendarStart !== -1 && calendarEnd !== -1) {
    const newCalendarCode = `const BudgetCalendar = ({ groups, onEventClick }) => {
  const { useState } = React;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null); // { dateStr: "DD/MM/YYYY", events: [] }

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Lunes como primer día de la semana
  const startingDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  const daysInMonth = lastDayOfMonth.getDate();
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const eventsByDay = {};
  const noDateEvents = [];

  groups.forEach(g => {
    let entryDateStr = g.Entrada;
    if (g.isMultiSegment && Array.isArray(g.segments) && g.segments.length > 0) {
       const stats = getSegmentStats(g.segments);
       entryDateStr = stats.globalIn;
    }
    
    if (!entryDateStr) {
       noDateEvents.push(g);
    } else {
       // Parseo seguro zona horaria local
       const dateObj = new Date(entryDateStr + "T00:00:00");
       if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() === currentDate.getFullYear() && dateObj.getMonth() === currentDate.getMonth()) {
           const day = dateObj.getDate();
           if (!eventsByDay[day]) eventsByDay[day] = [];
           eventsByDay[day].push(g);
       } else if (isNaN(dateObj.getTime())) {
           noDateEvents.push(g);
       }
    }
  });

  const EventCard = ({ g, detailed = false }) => {
    const name = g["Nombre del Grupo"] || g.Cliente || "Sin Nombre";
    const pax = g["Pax."] || g.Pax || "-";
    const amount = g._totalAmount ? formatNum(g._totalAmount) + '€' : '-';
    // Se asume que getStatusColor está disponible en el scope (importado de NexusUtils)
    const colorClass = typeof getStatusColor === 'function' ? getStatusColor(g.Com_Estado_Interno || g.Estado) : 'bg-slate-100 text-slate-800 border-slate-200';
    
    let tooltip = \`\${name}\\nPax: \${pax}\\nImporte: \${amount}\`;
    if (g.Entrada) tooltip += \`\\nEntrada: \${formatDate(g.Entrada)}\`;
    if (g.Salida) tooltip += \`\\nSalida: \${formatDate(g.Salida)}\`;
    
    return React.createElement('div', { 
      key: g.uid || Math.random(), 
      onClick: (e) => { e.stopPropagation(); onEventClick(g); },
      className: \`text-[10px] sm:text-xs leading-tight p-1 sm:p-1.5 rounded border cursor-pointer hover:shadow-sm transition-all truncate group relative \${colorClass} \${detailed ? 'mb-2' : ''}\`,
      title: tooltip
    }, 
      React.createElement('div', { className: "font-semibold truncate" }, name),
      detailed && g.Entrada && React.createElement('div', { className: "text-[9px] opacity-80 mt-0.5" }, \`\${formatDate(g.Entrada)} \${g.Salida ? '→ ' + formatDate(g.Salida) : ''}\`),
      React.createElement('div', { className: \`flex justify-between items-center opacity-80 text-[9px] \${detailed ? 'mt-1 pt-1 border-t border-black/10' : 'mt-0.5'}\` },
        React.createElement('span', null, \`👤 \${pax}\`),
        React.createElement('span', null, amount)
      )
    );
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

      days.push(React.createElement('div', { 
          key: i, 
          className: \`h-24 sm:h-32 border-r border-b border-slate-200 overflow-hidden relative flex flex-col p-1 transition-colors \${isToday ? 'bg-indigo-50/30' : 'bg-white hover:bg-slate-50'}\`
        }, 
        React.createElement('div', { className: \`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 \${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}\` }, i),
        React.createElement('div', { className: "flex-1 overflow-hidden flex flex-col gap-1 pr-1" }, 
           visibleEvents.map(g => React.createElement(EventCard, { key: g.uid, g: g })),
           hasMore && React.createElement('div', { 
               className: "text-[10px] text-center font-bold text-indigo-600 bg-indigo-50 rounded cursor-pointer hover:bg-indigo-100 py-0.5 transition-colors mt-auto",
               onClick: (e) => {
                 e.stopPropagation();
                 setSelectedDayEvents({ 
                   dateStr: \`\${i} de \${monthNames[currentDate.getMonth()]} \${currentDate.getFullYear()}\`, 
                   events: dayEvents 
                 });
               }
           }, \`+ \${dayEvents.length - 3} más\`)
        )
      ));
    }
    return days;
  };

  return React.createElement('div', { className: "flex flex-col gap-4 animate-fade-in" },
    React.createElement('div', { className: "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" }, 
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
    ),
    
    noDateEvents.length > 0 && React.createElement('div', { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm" },
      React.createElement('h4', { className: "text-amber-800 font-bold text-sm mb-3 flex items-center gap-2" }, 
        React.createElement('i', { className: "fas fa-exclamation-triangle" }), 
        \`Presupuestos sin fecha de entrada válida (\${noDateEvents.length})\`
      ),
      React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" },
        noDateEvents.map(g => React.createElement(EventCard, { key: g.uid, g: g }))
      )
    ),

    selectedDayEvents && React.createElement('div', { 
        className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm",
        onClick: () => setSelectedDayEvents(null)
      },
      React.createElement('div', { 
          className: "bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col",
          onClick: e => e.stopPropagation()
        },
        React.createElement('div', { className: "p-4 border-b border-slate-100 flex justify-between items-center" },
          React.createElement('h4', { className: "font-black text-slate-800 text-lg" }, selectedDayEvents.dateStr),
          React.createElement('button', { 
            onClick: () => setSelectedDayEvents(null),
            className: "w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors" 
          }, React.createElement('i', { className: "fas fa-times" }))
        ),
        React.createElement('div', { className: "p-4 overflow-y-auto flex-1 custom-scrollbar" },
          selectedDayEvents.events.map(g => React.createElement(EventCard, { key: g.uid, g: g, detailed: true }))
        )
      )
    )
  );
};
`;
    
    code = code.substring(0, calendarStart) + newCalendarCode + '\n' + code.substring(calendarEnd);
    fs.writeFileSync(filePath, code);
    console.log('Presupuestos.js updated successfully.');
} else {
    console.log('Error: Could not find BudgetCalendar boundaries.');
}
