const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'Presupuestos.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. DEFAULT_FORM_DATA
code = code.replace(/Salida: '',/, "Salida: '',\n  followUpDate: '',");

// 2. normalizeGroupData
code = code.replace(/newData\.Com_Nombre_Contacto = /g, "newData.followUpDate = groupData.followUpDate || \"\";\n  newData.Com_Nombre_Contacto = ");

// 3. Crear Manual handler
const crearManualPattern = /onClick: function onClick\(\) \{\s*setFormData\(DEFAULT_FORM_DATA\);\s*setCurrentView\('create'\);\s*\}/;
const crearManualReplace = `onClick: function onClick() {
        var d = new Date();
        d.setDate(d.getDate() + 3);
        var defaultFollowUp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        setFormData(Object.assign({}, DEFAULT_FORM_DATA, { followUpDate: defaultFollowUp }));
        setCurrentView('create');
      }`;
code = code.replace(crearManualPattern, crearManualReplace);

// 4. renderCreate form
const formSalidaPattern = /\}, "Fecha Salida"\), \/\*#__PURE__\*\/React\.createElement\("input", \{\n\s*type: "date",\n\s*className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500\/20 focus:border-indigo-500 transition-all",\n\s*value: toInputDate\(formData\.Salida\),\n\s*onChange: function onChange\(e\) \{\n\s*return setFormData\(_objectSpread\(_objectSpread\(\{\}, formData\), \{\},\ \{\n\s*Salida: e\.target\.value\n\s*\}\)\);\n\s*\}\n\s*\}\)\)/;

const formFollowUpReplace = `}, "Fecha Salida"), /*#__PURE__*/React.createElement("input", {
          type: "date",
          className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
          value: toInputDate(formData.Salida),
          onChange: function onChange(e) {
            return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
              Salida: e.target.value
            }));
          }
        })), /*#__PURE__*/React.createElement("div", {
          className: "col-span-2 sm:col-span-1"
        }, /*#__PURE__*/React.createElement("label", {
          className: "block text-xs font-black text-slate-500 uppercase tracking-widest mb-2"
        }, "Pr\xF3ximo seguimiento"), /*#__PURE__*/React.createElement("input", {
          type: "date",
          className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all",
          value: toInputDate(formData.followUpDate),
          onChange: function onChange(e) {
            return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
              followUpDate: e.target.value
            }));
          }
        }))`;
code = code.replace(formSalidaPattern, formFollowUpReplace);

// 5. renderDashboard headers
const headerEntradaPattern = /\}, "Entrada"\), \/\*#__PURE__\*\/React\.createElement\("th", \{/;
const headerSeguimientoReplace = `}, "Entrada"), /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest"
    }, "Seguimiento"), /*#__PURE__*/React.createElement("th", {`;
code = code.replace(headerEntradaPattern, headerSeguimientoReplace);

// 6. renderDashboard rows
const tdEntradaPattern = /\}, formatDate\(g\.Entrada\)\), \/\*#__PURE__\*\/React\.createElement\("span", \{/;
const tdSeguimientoReplace = `}, formatDate(g.Entrada)), /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4"
      }, function() {
        var followUpDisplay = "Sin seguimiento";
        var followUpClass = "text-slate-400 bg-slate-100";
        if (g.followUpDate) {
            var parts = g.followUpDate.split('-');
            if (parts.length === 3) {
              var fuDate = new Date(parts[0], parts[1] - 1, parts[2]);
              var today = new Date();
              today.setHours(0,0,0,0);
              if (fuDate < today) {
                  followUpDisplay = "Vencido";
                  followUpClass = "text-rose-600 bg-rose-100 font-bold border border-rose-200";
              } else if (fuDate.getTime() === today.getTime()) {
                  followUpDisplay = "Hoy";
                  followUpClass = "text-amber-600 bg-amber-100 font-bold border border-amber-200";
              } else {
                  followUpDisplay = formatDate(g.followUpDate);
                  followUpClass = "text-indigo-600 bg-indigo-50 border border-indigo-100";
              }
            }
        }
        return /*#__PURE__*/React.createElement("span", {
          className: "px-2.5 py-1 rounded-md text-[10px] inline-block " + followUpClass
        }, followUpDisplay);
      }()), /*#__PURE__*/React.createElement("span", {`;
code = code.replace(tdEntradaPattern, tdSeguimientoReplace);

// 7. renderDetail
// Search for Fase actual or similar block in renderDetail to inject the followUpDate detail
// Let's inject it right after the entry/exit date block in detail.
// find: }, formatDate(g.Entrada), " - ", formatDate(g.Salida))), /*#__PURE__*/React.createElement("div", {
const detailDatePattern = /\}, formatDate\(g\.Entrada\), " - ", formatDate\(g\.Salida\)\)\), \/\*#__PURE__\*\/React\.createElement\("div", \{/;
const detailFollowUpReplace = `}, formatDate(g.Entrada), " - ", formatDate(g.Salida))), /*#__PURE__*/React.createElement("div", {
        className: "flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-calendar-check text-amber-600"
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
        className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
      }, "Pr\\xF3ximo Seguimiento"), /*#__PURE__*/React.createElement("p", {
        className: "text-sm font-bold text-slate-700"
      }, g.followUpDate ? formatDate(g.followUpDate) : "Sin seguimiento programado"))), /*#__PURE__*/React.createElement("div", {`;
code = code.replace(detailDatePattern, detailFollowUpReplace);

// 8. BudgetCalendar Update
const calendarPatternStart = code.indexOf('const BudgetCalendar =');
const calendarPatternEnd = code.indexOf('function App() {');

if (calendarPatternStart !== -1 && calendarPatternEnd !== -1) {
    const calendarCode = `const BudgetCalendar = ({ groups, onEventClick }) => {
  const { useState } = React;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null); // { dateStr: "DD/MM/YYYY", events: [] }
  const [calendarMode, setCalendarMode] = useState('seguimiento'); // 'seguimiento' | 'entrada'

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
    let targetDateStr = '';
    
    if (calendarMode === 'seguimiento') {
       targetDateStr = g.followUpDate;
    } else {
       targetDateStr = g.Entrada;
       if (g.isMultiSegment && Array.isArray(g.segments) && g.segments.length > 0) {
          const stats = getSegmentStats(g.segments);
          targetDateStr = stats.globalIn;
       }
    }
    
    if (!targetDateStr) {
       noDateEvents.push(g);
    } else {
       // Parseo seguro zona horaria local
       const parts = targetDateStr.split('-');
       if (parts.length === 3) {
           const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
           if (!isNaN(dateObj.getTime()) && dateObj.getFullYear() === currentDate.getFullYear() && dateObj.getMonth() === currentDate.getMonth()) {
               const day = dateObj.getDate();
               if (!eventsByDay[day]) eventsByDay[day] = [];
               eventsByDay[day].push(g);
           } else if (isNaN(dateObj.getTime())) {
               noDateEvents.push(g);
           }
       } else {
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
    if (g.followUpDate) tooltip += \`\\nSeguimiento: \${formatDate(g.followUpDate)}\`;
    
    return React.createElement('div', { 
      key: g.uid || Math.random(), 
      onClick: (e) => { e.stopPropagation(); onEventClick(g); },
      className: \`text-[10px] sm:text-xs leading-tight p-1 sm:p-1.5 rounded border cursor-pointer hover:shadow-sm transition-all truncate group relative \${colorClass} \${detailed ? 'mb-2' : ''}\`,
      title: tooltip
    }, 
      React.createElement('div', { className: "font-semibold truncate" }, name),
      detailed && g.followUpDate && calendarMode === 'entrada' && React.createElement('div', { className: "text-[9px] opacity-80 mt-0.5 text-amber-700 font-bold" }, \`Seguimiento: \${formatDate(g.followUpDate)}\`),
      detailed && g.Entrada && calendarMode === 'seguimiento' && React.createElement('div', { className: "text-[9px] opacity-80 mt-0.5" }, \`Entrada: \${formatDate(g.Entrada)}\`),
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

  return React.createElement('div', { className: "flex flex-col gap-4 animate-fade-in w-full" },
    React.createElement('div', { className: "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" }, 
      React.createElement('div', { className: "p-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-50/80" },
         React.createElement('h3', { className: "text-lg font-black text-slate-800 capitalize flex items-center gap-2" }, 
           React.createElement('i', { className: "fas fa-calendar-alt text-indigo-600" }),
           \`\${monthNames[currentDate.getMonth()]} \${currentDate.getFullYear()}\`
         ),
         React.createElement('div', { className: "flex flex-col sm:flex-row gap-4 w-full lg:w-auto" },
           React.createElement('div', { className: "flex bg-slate-200/80 p-1 rounded-xl border border-slate-200" },
             React.createElement('button', { 
               onClick: () => setCalendarMode('seguimiento'),
               className: \`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all \${calendarMode === 'seguimiento' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`
             }, "Por seguimiento"),
             React.createElement('button', { 
               onClick: () => setCalendarMode('entrada'),
               className: \`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all \${calendarMode === 'entrada' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`
             }, "Por entrada")
           ),
           React.createElement('div', { className: "flex gap-2 justify-center" },
             React.createElement('button', { onClick: prevMonth, className: "p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors" }, React.createElement('i', { className: "fas fa-chevron-left" })),
             React.createElement('button', { onClick: goToToday, className: "px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 shadow-sm text-sm transition-all" }, "Hoy"),
             React.createElement('button', { onClick: nextMonth, className: "p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors" }, React.createElement('i', { className: "fas fa-chevron-right" }))
           )
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
        calendarMode === 'seguimiento' 
          ? \`Presupuestos sin fecha de seguimiento (\${noDateEvents.length})\`
          : \`Presupuestos sin fecha de entrada válida (\${noDateEvents.length})\`
      ),
      React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" },
        noDateEvents.map(g => React.createElement(EventCard, { key: g.uid, g: g }))
      )
    ),

    selectedDayEvents && React.createElement('div', { 
        className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm",
        onClick: () => setSelectedDayEvents(null)
      },
      React.createElement('div', { 
          className: "bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col",
          onClick: e => e.stopPropagation()
        },
        React.createElement('div', { className: "p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl" },
          React.createElement('div', null,
            React.createElement('h4', { className: "font-black text-slate-800 text-lg" }, selectedDayEvents.dateStr),
            React.createElement('p', { className: "text-xs text-slate-500 font-bold mt-1" }, \`\${selectedDayEvents.events.length} presupuestos\`)
          ),
          React.createElement('button', { 
            onClick: () => setSelectedDayEvents(null),
            className: "w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors" 
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
    code = code.substring(0, calendarPatternStart) + calendarCode + '\n' + code.substring(calendarPatternEnd);
}

fs.writeFileSync(filePath, code);
console.log('Presupuestos.js updated successfully with followUpDate support.');
