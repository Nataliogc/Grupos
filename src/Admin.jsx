
    const { useState, useEffect, useMemo, useRef } = React;
    const {
      ResponsiveContainer,
      AreaChart,
      Area,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      PieChart,
      Pie,
      Cell,
      Legend,
      BarChart,
      Bar,
    } = Recharts;

    // LucideIcon cargado desde js/icons.js (window.LucideIcon)


    // --- FIREBASE ---
    // Inicialización cargada desde js/firebase-init.js
    const db = window.db;

    // --- UTILIDADES ---
    const safeParseAmount = NexusUtils.parseNum;
    const fmt = NexusUtils.formatCurrency;
    const formatDate = NexusUtils.formatDate;


    // --- MÓDULO IA (CONEXIÓN SEGURA) ---
    // --- MÓDULO IA ESTRATÉGICA (CONEXIÓN POR PARÁMETROS) ---
    async function analizarGrupos(datos) {
      // 1. Obtener parámetros dinámicos de Firestore
      let apiKey = window.firebaseConfig.apiKey;
      let model = "gemini-1.5-flash"; // Default Standard Model

      try {
        const settingsDoc = await db.collection("settings").doc("main").get();
        if (settingsDoc.exists) {
          const s = settingsDoc.data().system || {};
          if (s.geminiApiKey) apiKey = s.geminiApiKey;
          if (s.geminiModel) model = s.geminiModel;
        }
      } catch (e) {
        console.warn(
          "No se pudo cargar la API Key de Firestore, usando fallback.",
        );
      }

      if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
        throw new Error(
          "ERROR: No se ha configurado la API Key de Gemini en el panel de Configuración.",
        );
      }

      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

      const prompt = `
            Actúa como un experto analista de Revenue Management hotelero de alto nivel.
            Analiza los siguientes datos de grupos consolidados de los hoteles Sercotel Guadiana y Cumbria Spa & Hotel.
            Derrame un informe estratégico conciso con:
            1. Puntos críticos de release (vencimientos próximos).
            2. Análisis de ocupación y revenue por hotel.
            3. Recomendaciones de seguimiento comercial (upselling, confirmación de grupos en tentativa).
            4. Proyección de cierre de mes.
            Utiliza un tono profesional y directo.
            
            DATOS DE GRUPOS:
            ${JSON.stringify(datos)}
            `;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          const msg = error.error?.message || "";

          if (msg.includes("blocked") || msg.includes("PERMISSION_DENIED")) {
            throw new Error(
              "ðŸš« ACCESO DENEGADO: Tu API Key está bloqueada o no tiene permisos. Verifica en Google AI Studio que la 'Generative Language API' esté activa y que no haya restricciones de IP/dominio.",
            );
          }
          if (msg.includes("leaked")) {
            throw new Error(
              "⚠️ SEGURIDAD: Tu API Key ha sido desactivada por filtración pública (leaked). Por favor, genera una nueva clave privada en Google AI Studio.",
            );
          }
          throw new Error(
            `Error en API Gemini: ${msg || JSON.stringify(error)}`,
          );
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error("Error llamando a Gemini:", error);
        throw error;
      }
    }

    const Sidebar = ({ activeTab, setActiveTab }) => {
      const items = [
        {
          id: "dashboard",
          icon: "layout-dashboard",
          label: "Panel de Control",
        },
        { id: "groups", icon: "users", label: "Directorio Grupos" },
        {
          id: "budgets",
          icon: "clipboard-list",
          label: "Seguimiento Presupuestos",
        },
        { id: "invoices", icon: "file-text", label: "Facturas Proforma" },
        { id: "analytics", icon: "bar-chart-3", label: "Análisis IA" },
        {
          id: "menus",
          icon: "utensils",
          label: "Menús Eventos",
        },
        {
          id: "turisticos",
          icon: "map",
          label: "Menús Turísticos",
        },
        {
          id: "cocteles",
          icon: "martini",
          label: "Menús Cócteles",
        },
        { id: "settings", icon: "settings", label: "Configuración" },
      ];

      return (
        <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 p-6 flex flex-col z-30 shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col items-center mb-8 px-2 space-y-6">
            <div className="w-full flex justify-center p-4">
              <img
                src="Nexus%20Groups/Nexus_Groups-removebg-preview.png"
                className="h-20 w-auto object-contain"
                alt="Nexus Groups Logo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center justify-center">
                <img
                  src="Logos/Sercotel Guadiana.jpg"
                  className="h-8 w-auto object-contain"
                  alt="Logo Guadiana"
                />
              </div>
              <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center justify-center">
                <img
                  src="Logos/Cumbria Spa&Hotel.jpg"
                  className="h-8 w-auto object-contain"
                  alt="Logo Cumbria"
                />
              </div>
            </div>
            <div className="h-[1px] w-full bg-slate-100"></div>
          </div>

          <nav className="flex-1 space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "groups")
                    window.location.href = "Gestion-de-Grupos.html";
                  else if (item.id === "budgets")
                    window.location.href = "Presupuestos.html";
                  else if (item.id === "alta-email")
                    window.location.href = "AltaEmail.html";
                  else if (item.id === "invoices") {
                    window.location.href = "Proformas.html";
                  } else if (item.id === "menus")
                    window.open(
                      "https://nataliogc.github.io/menus-eventos/admin.html",
                      "_blank"
                    );
                  else if (item.id === "turisticos")
                    window.open(
                      "https://nataliogc.github.io/Menus-Turisticos/",
                      "_blank"
                    );
                  else if (item.id === "cocteles")
                    window.open(
                      "https://nataliogc.github.io/menus-cocteles/",
                      "_blank"
                    );
                  else if (item.id === "settings")
                    window.location.href = "Configuracion.html";
                  else setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? "sidebar-item-active" : "text-slate-500 hover:bg-slate-50 hover:translate-x-1"}`}
              >
                <LucideIcon name={item.icon} className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="p-4 bg-[#2d5a43]/5 rounded-2xl border border-[#2d5a43]/10">
              <p className="text-[10px] font-bold text-[#2d5a43] uppercase tracking-widest mb-1">
                Estado Global
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">
                  Sistema Operativo
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const Dashboard = ({
      arrivals,
      stats,
      alerts,
      onRunAnalysis,
      timeRange,
      onRangeChange,
      data,
    }) => {
      const [selectedHotel, setSelectedHotel] = React.useState("todos");

      // Helper robusto para parsear fechas de diversas fuentes
      const parseDate = (val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        if (val && typeof val === 'object' && typeof val.toDate === 'function') {
          return val.toDate();
        }
        const str = String(val).trim();
        if (!str) return null;

        if (!isNaN(str) && str.length > 4 && !str.includes("/") && !str.includes("-")) {
          const excelEpoch = new Date(1899, 11, 30);
          excelEpoch.setDate(excelEpoch.getDate() + parseInt(str));
          return excelEpoch;
        }

        const parts = str.split(/[\/-]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          }
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }

        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
      };

      // Filtrado por hotel seleccionado
      const filteredGroups = React.useMemo(() => {
        if (selectedHotel === "todos") return data || [];
        return (data || []).filter((g) => {
          const hotel = (g.Hotel_Asignado || g.Hotel || "").toLowerCase();
          if (selectedHotel === "guadiana") return hotel.includes("guad") || hotel.includes("guadiana");
          if (selectedHotel === "cumbria") return hotel.includes("cumb") || hotel.includes("cumbria");
          return true;
        });
      }, [data, selectedHotel]);

      // Cálculo de contadores para las pestañas de hotel (sobre el total sin filtrar por hotel)
      const counts = React.useMemo(() => {
        let total = 0;
        let cumbria = 0;
        let guadiana = 0;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const fiveDaysFromNow = new Date(startOfToday);
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
        const fifteenDaysFromNow = new Date(startOfToday);
        fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

        (data || []).forEach(g => {
          const status = ((g.Estado || "") + " " + (g.Com_Estado_Interno || "")).toUpperCase();
          const isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS"].some(s => status.includes(s));
          const departureDate = parseDate(g.Salida || g.Entrada);
          const isPast = departureDate && departureDate < startOfToday;

          if (isCancelled || isPast) return;

          const isConfirmed = status.includes("CONFIRM") || status.includes("GARANT") || status.includes("RESERVA");
          const isTentative = status.includes("BLOQ") || status.includes("OPCI") || status.includes("TENTAT");
          const entryDate = parseDate(g.Entrada);

          const totalAmt = safeParseAmount(g.Total_Importe_Facturable || g["Importe(*)"] || 0);
          let paid = parseFloat(g.Com_Pagado) || 0;
          try {
            const plan = JSON.parse(g.PaymentPlan_JSON || "[]");
            plan.forEach(p => { if (p.status === "Cobrado") paid += parseFloat(p.amount) || 0; });
          } catch (e) {}
          const pending = Math.max(0, totalAmt - paid);

          let hasAlert = false;

          // 1. Financial
          if ((isConfirmed || isTentative) && pending > 0.1) {
            try {
              const plan = JSON.parse(g.PaymentPlan_JSON || "[]");
              const pastDueMilestones = plan.filter(p => {
                const pDate = parseDate(p.date);
                return pDate && pDate < now && p.status !== "Cobrado" && p.status !== "Pagado";
              });
              if (pastDueMilestones.length > 0) hasAlert = true;
            } catch (e) {}
          }

          // 2. Release
          const dRel = parseDate(g.Com_Vencimiento_Rel);
          if (!hasAlert && (!isConfirmed || pending > 0.1) && dRel && dRel <= fiveDaysFromNow) {
            hasAlert = true;
          }

          // 3. Logistics
          if (!hasAlert && isConfirmed && entryDate && entryDate >= startOfToday && entryDate <= fifteenDaysFromNow) {
            if (!g.Logistica_Rooming) hasAlert = true;
            const regime = (g["Régimen"] || "").toUpperCase();
            if (regime.includes("MP") && !g.Logistica_MenuMP) hasAlert = true;
            if (regime.includes("PC") && !g.Logistica_MenuPC) hasAlert = true;
          }

          // 4. CRM
          const dFollow = parseDate(g.Com_Seguimiento);
          if (!hasAlert && dFollow && dFollow <= endOfToday) {
            hasAlert = true;
          }

          if (hasAlert) {
            total++;
            const hotel = (g.Hotel_Asignado || g.Hotel || "").toLowerCase();
            if (hotel.includes("cumb")) cumbria++;
            else if (hotel.includes("guad") || hotel.includes("guadiana")) guadiana++;
          }
        });

        return { total, cumbria, guadiana };
      }, [data]);

      // Cálculo de alertas en 4 columnas
      const columnsData = React.useMemo(() => {
        const financialAlerts = [];
        const releaseAlerts = [];
        const logisticsAlerts = [];
        const crmAlerts = [];

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const fiveDaysFromNow = new Date(startOfToday);
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
        const fifteenDaysFromNow = new Date(startOfToday);
        fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

        const seenFinancial = new Set();
        const seenRelease = new Set();
        const seenLogistics = new Set();
        const seenCrm = new Set();

        filteredGroups.forEach((g) => {
          const resId = g.Reserva || g.Com_Id || "";
          const status = ((g.Estado || "") + " " + (g.Com_Estado_Interno || "")).toUpperCase();
          const isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS"].some(s => status.includes(s));
          
          const departureDate = parseDate(g.Salida || g.Entrada);
          const isPast = departureDate && departureDate < startOfToday;

          if (isCancelled || isPast) return;

          const isConfirmed = status.includes("CONFIRM") || status.includes("GARANT") || status.includes("RESERVA");
          const isTentative = status.includes("BLOQ") || status.includes("OPCI") || status.includes("TENTAT");
          const entryDate = parseDate(g.Entrada);

          const total = safeParseAmount(g.Total_Importe_Facturable || g["Importe(*)"] || 0);
          let paid = parseFloat(g.Com_Pagado) || 0;
          try {
            const plan = JSON.parse(g.PaymentPlan_JSON || "[]");
            plan.forEach(p => {
              if (p.status === "Cobrado") paid += parseFloat(p.amount) || 0;
            });
          } catch (e) {}
          const pending = Math.max(0, total - paid);

          // 1. Column 1: Financial Alerts
          if ((isConfirmed || isTentative) && pending > 0.1 && !seenFinancial.has(resId)) {
            try {
              const plan = JSON.parse(g.PaymentPlan_JSON || "[]");
              const pastDueMilestones = plan.filter(p => {
                const pDate = parseDate(p.date);
                return pDate && pDate < now && p.status !== "Cobrado" && p.status !== "Pagado";
              });
              if (pastDueMilestones.length > 0) {
                seenFinancial.add(resId);
                const firstPastDue = pastDueMilestones[0];
                const amt = parseFloat(firstPastDue.amount) || 0;
                financialAlerts.push({
                  group: g,
                  icon: "AlertTriangle",
                  label: "Hito Vencido",
                  detail: `Pago de ${fmt(amt)} vencido el ${formatDate(firstPastDue.date)}`,
                  type: "danger"
                });
              }
            } catch (e) {}
          }

          // 2. Column 2: Releases y Plazos
          if ((!isConfirmed || pending > 0.1) && !seenRelease.has(resId)) {
            const dRel = parseDate(g.Com_Vencimiento_Rel);
            if (dRel && dRel <= fiveDaysFromNow) {
              seenRelease.add(resId);
              const diffTime = dRel - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isOverdue = dRel < startOfToday;
              
              releaseAlerts.push({
                group: g,
                icon: "Clock",
                label: isOverdue ? "Release Vencido" : "Próximo Release",
                detail: isOverdue 
                  ? `Venció hace ${Math.abs(diffDays)} días (${formatDate(dRel)})`
                  : `Vence en ${diffDays} días (${formatDate(dRel)})`,
                type: isOverdue ? "danger" : "warning"
              });
            }
          }

          // 3. Column 3: Datos Operativos Faltantes
          if (isConfirmed && entryDate && entryDate >= startOfToday && entryDate <= fifteenDaysFromNow && !seenLogistics.has(resId)) {
            const missingDetails = [];
            if (!g.Logistica_Rooming) {
              missingDetails.push({ text: "Falta Rooming List", icon: "FileText" });
            }
            
            const regime = (g["Régimen"] || "").toUpperCase();
            if (regime.includes("MP") && !g.Logistica_MenuMP) {
              missingDetails.push({ text: "Falta Menú MP", icon: "Utensils" });
            }
            if (regime.includes("PC") && !g.Logistica_MenuPC) {
              missingDetails.push({ text: "Falta Menú PC", icon: "Utensils" });
            }

            if (missingDetails.length > 0) {
              seenLogistics.add(resId);
              logisticsAlerts.push({
                group: g,
                icon: "FileWarning",
                label: "Datos Faltantes",
                detail: missingDetails.map(d => d.text).join(", "),
                details: missingDetails,
                type: "warning"
              });
            }
          }

          // 4. Column 4: CRM Tasks
          if (!seenCrm.has(resId)) {
            const dFollow = parseDate(g.Com_Seguimiento);
            if (dFollow && dFollow <= endOfToday) {
              seenCrm.add(resId);
              const isPastDue = dFollow < startOfToday;
              crmAlerts.push({
                group: g,
                icon: "PhoneCall",
                label: isPastDue ? "CRM Retrasado" : "CRM Hoy",
                detail: isPastDue
                  ? `Planificado para el ${formatDate(dFollow)}`
                  : `Programado para hoy (${formatDate(dFollow)})`,
                type: isPastDue ? "danger" : "info"
              });
            }
          }
        });

        // Ordenamiento por prioridad/fecha
        financialAlerts.sort((a, b) => {
          const aDate = parseDate(JSON.parse(a.group.PaymentPlan_JSON || "[]").find(p => p.status !== "Cobrado" && p.status !== "Pagado")?.date);
          const bDate = parseDate(JSON.parse(b.group.PaymentPlan_JSON || "[]").find(p => p.status !== "Cobrado" && p.status !== "Pagado")?.date);
          if (!aDate) return 1;
          if (!bDate) return -1;
          return aDate - bDate;
        });

        releaseAlerts.sort((a, b) => {
          const aDate = parseDate(a.group.Com_Vencimiento_Rel);
          const bDate = parseDate(b.group.Com_Vencimiento_Rel);
          if (!aDate) return 1;
          if (!bDate) return -1;
          return aDate - bDate;
        });

        logisticsAlerts.sort((a, b) => {
          const aDate = parseDate(a.group.Entrada);
          const bDate = parseDate(b.group.Entrada);
          if (!aDate) return 1;
          if (!bDate) return -1;
          return aDate - bDate;
        });

        crmAlerts.sort((a, b) => {
          const aDate = parseDate(a.group.Com_Seguimiento);
          const bDate = parseDate(b.group.Com_Seguimiento);
          if (!aDate) return 1;
          if (!bDate) return -1;
          return aDate - bDate;
        });

        return {
          financialAlerts,
          releaseAlerts,
          logisticsAlerts,
          crmAlerts
        };
      }, [filteredGroups]);

      const AlertColumn = ({ title, icon, colorClass, alerts }) => {
        const theme = {
          rose: {
            bg: "bg-rose-50/50",
            border: "border-rose-100",
            text: "text-rose-700",
            iconBg: "bg-rose-100 text-rose-600",
            bubble: "bg-rose-600 text-white",
            cardHover: "hover:border-rose-300 hover:shadow-rose-100/50"
          },
          amber: {
            bg: "bg-amber-50/50",
            border: "border-amber-100",
            text: "text-amber-800",
            iconBg: "bg-amber-100 text-amber-600",
            bubble: "bg-amber-500 text-white",
            cardHover: "hover:border-amber-300 hover:shadow-amber-100/50"
          },
          orange: {
            bg: "bg-orange-50/50",
            border: "border-orange-100",
            text: "text-orange-800",
            iconBg: "bg-orange-100 text-orange-600",
            bubble: "bg-orange-500 text-white",
            cardHover: "hover:border-orange-300 hover:shadow-orange-100/50"
          },
          indigo: {
            bg: "bg-indigo-50/50",
            border: "border-indigo-100",
            text: "text-indigo-800",
            iconBg: "bg-indigo-100 text-indigo-600",
            bubble: "bg-indigo-600 text-white",
            cardHover: "hover:border-indigo-300 hover:shadow-indigo-100/50"
          }
        }[colorClass];

        return (
          <div className={`flex flex-col rounded-[2rem] border ${theme.border} ${theme.bg} p-5 min-h-[500px] shadow-sm`}>
            {/* Cabecera de la Columna */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ${theme.iconBg}`}>
                  <LucideIcon name={icon} size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {title}
                </h3>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${theme.bubble}`}>
                {alerts.length}
              </span>
            </div>

            {/* Tarjetas de Alerta */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar pr-1">
              {alerts.map((alert, idx) => {
                const g = alert.group;
                const isCumbria = (g.Hotel_Asignado || g.Hotel || "").toLowerCase().includes("cumb");
                
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      localStorage.setItem("nexus_return_reserva", g.Reserva);
                      window.location.href = `Gestion-de-Grupos.html?reserva=${encodeURIComponent(g.Reserva)}`;
                    }}
                    className={`bg-white p-4 rounded-[1.5rem] border border-slate-100/80 cursor-pointer shadow-sm hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ${theme.cardHover} flex flex-col gap-2 relative group`}
                  >
                    <div className="flex justify-between items-center">
                      <img
                        src={isCumbria ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg"}
                        alt="Hotel Logo"
                        className="h-4 max-w-[80px] object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {formatDate(g.Entrada)}
                      </span>
                    </div>

                    <div className="mt-1">
                      <h4 className="font-bold text-slate-800 text-xs leading-snug group-hover:text-emerald-700 transition-colors uppercase line-clamp-2" title={g["Nombre del Grupo"]}>
                        {g["Nombre del Grupo"] || "Grupo sin nombre"}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                          #{g.Reserva}
                        </span>
                        {g.Com_Comercial && (
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            👤 {g.Com_Comercial}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 border-t border-slate-50 pt-2 flex flex-col gap-1.5">
                      {alert.details ? (
                        alert.details.map((det, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 leading-tight">
                            <LucideIcon name={det.icon} size={10} className={theme.text} strokeWidth={2.5} />
                            <span className="truncate">{det.text}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 leading-tight">
                          <LucideIcon name={alert.icon} size={10} className={theme.text} strokeWidth={2.5} />
                          <span className="line-clamp-2" title={alert.detail}>
                            {alert.detail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {alerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/50 border border-dashed border-slate-200 rounded-[1.5rem] opacity-70">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <LucideIcon name="check" size={18} strokeWidth={3} />
                  </div>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider text-center">
                    Todo al día
                  </p>
                  <p className="text-[8px] text-slate-400 text-center mt-0.5">
                    Sin actuaciones pendientes
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      };

      return (
        <div className="space-y-8 animate-fade-in relative">
          {/* Banner de Bienvenida */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden mb-2">
            <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10">
              <LucideIcon name="bell" size={300} />
            </div>
            <div className="relative z-10 max-w-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1.5 rounded-full">
                Centro de Operaciones
              </span>
              <h2 className="text-3xl font-black tracking-tight mt-4 mb-2">
                Panel de Alertas y Actuaciones Críticas
              </h2>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                Supervisa vencimientos financieros, plazos de release, información logística ausente y tareas CRM pendientes. Filtra por establecimiento y abre las fichas correspondientes con un clic.
              </p>
            </div>
          </div>

          {/* Selector de Hotel */}
          <div className="flex bg-slate-100/80 p-1.5 rounded-[2rem] border border-slate-200/50 w-fit gap-1.5 shadow-sm">
            {[
              { id: "todos", label: "Todos los Hoteles", icon: "Hotel" },
              { id: "guadiana", label: "Sercotel Guadiana", logo: "Logos/Sercotel Guadiana.jpg" },
              { id: "cumbria", label: "Cumbria Spa & Hotel", logo: "Logos/Cumbria Spa&Hotel.jpg" }
            ].map(hotel => {
              const active = selectedHotel === hotel.id;
              return (
                <button
                  key={hotel.id}
                  onClick={() => setSelectedHotel(hotel.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${active ? "bg-white text-slate-900 shadow-md scale-102 border border-slate-100" : "text-slate-500 hover:text-slate-800 hover:bg-white/40"}`}
                >
                  {hotel.logo ? (
                    <img src={hotel.logo} className="h-4 object-contain" alt={hotel.label} />
                  ) : (
                    <LucideIcon name={hotel.icon} size={14} />
                  )}
                  {hotel.label}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1.5 ${active ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {hotel.id === "todos" ? counts.total : hotel.id === "guadiana" ? counts.guadiana : counts.cumbria}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid de Alertas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            <AlertColumn
              title="Alertas Financieras"
              icon="CreditCard"
              colorClass="rose"
              alerts={columnsData.financialAlerts}
            />
            <AlertColumn
              title="Releases y Plazos"
              icon="Clock"
              colorClass="amber"
              alerts={columnsData.releaseAlerts}
            />
            <AlertColumn
              title="Datos Faltantes"
              icon="FileWarning"
              colorClass="orange"
              alerts={columnsData.logisticsAlerts}
            />
            <AlertColumn
              title="Seguimientos CRM"
              icon="PhoneCall"
              colorClass="indigo"
              alerts={columnsData.crmAlerts}
            />
          </div>

          <footer className="text-center py-12">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
              Nexus Gold Edition v2.8.5 • System Normal • Refreshed at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </footer>
        </div>
      );
    };

    const GroupsManager = ({ data, onUpdateStatus, onDeleteGroup }) => {
      const [searchTerm, setSearchTerm] = React.useState("");

      const filteredData = data.filter((group) => {
        const term = searchTerm.toLowerCase();
        const name = (group["Nombre del Grupo"] || "").toLowerCase();
        const agency = (group["Empresa/Agencia"] || "").toLowerCase();
        const reserva = (group["Reserva"] || "").toString().toLowerCase();
        return (
          name.includes(term) ||
          agency.includes(term) ||
          reserva.includes(term)
        );
      });

      const getStatusProps = (status) => {
        const s = (status || "").toUpperCase();
        if (
          s.includes("ANUL") ||
          s.includes("CANC") ||
          s.includes("BAJA") ||
          s.includes("DESESTIMADO")
        )
          return {
            label: "Anulado",
            text: "text-rose-500 bg-rose-50",
            border: "border-rose-100",
          };
        if (
          s.includes("CONFIRM") ||
          s.includes("GARANT") ||
          s.includes("RESERVA")
        )
          return {
            label: "Confirmado",
            text: "text-emerald-500 bg-emerald-50",
            border: "border-emerald-100",
          };
        if (s.includes("BLOQ") || s.includes("OPCI") || s.includes("TENTATI"))
          return {
            label: "Tentativa",
            text: "text-blue-500 bg-blue-50",
            border: "border-blue-100",
          };
        if (s.includes("PROSPEC") || s.includes("PENDIE"))
          return {
            label: "Prospect",
            text: "text-amber-500 bg-amber-50",
            border: "border-amber-100",
          };
        if (s.includes("SEGUIMIENTO"))
          return {
            label: "Seguimiento",
            text: "text-indigo-500 bg-indigo-50",
            border: "border-indigo-100",
          };
        if (s.includes("ENVIADO"))
          return {
            label: "Enviado",
            text: "text-blue-500 bg-blue-50",
            border: "border-blue-100",
          };
        if (s.includes("PRESUPUESTO"))
          return {
            label: "Presupuesto",
            text: "text-purple-500 bg-purple-50",
            border: "border-purple-100",
          };
        return {
          label: status,
          text: "text-slate-500 bg-slate-50",
          border: "border-slate-100",
        };
      };

      return (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Directorio de Grupos
              </h2>
              <p className="text-slate-500 text-sm italic">
                Accede a las herramientas de análisis y facturación.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <LucideIcon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, agencia o reserva..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-[#2d5a43] transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() =>
                  (window.location.href = "Gestion-de-Grupos.html")
                }
                className="bg-[#2d5a43] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#1e3a2c] transition-all text-sm shrink-0"
              >
                <LucideIcon name="table" className="w-4 h-4" />
                Gestor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredData.map((group, i) => (
              <div
                key={i}
                className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-[#2d5a43]/30 transition-all relative overflow-hidden h-full"
              >
                {/* Action Buttons (Hover) */}
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <select
                    className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border-none outline-none cursor-pointer shadow-sm ${getStatusProps(group["Estado"] || group["Com_Estado_Interno"]).text}`}
                    value={group["Estado"] || group["Com_Estado_Interno"] || ""}
                    onChange={(e) => onUpdateStatus(group.id || group.Reserva, e.target.value)}
                  >
                    <option value="PRESUPUESTO">Presupuesto</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="SEGUIMIENTO">Seguimiento</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="DESESTIMADO">Desestimado</option>
                  </select>

                  <button
                    onClick={() => onDeleteGroup(group.id || group.Reserva)}
                    className="w-6 h-6 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title="Desestimar Grupo"
                  >
                    <LucideIcon name="trash-2" size={12} />
                  </button>
                </div>

                <div className="flex-1 mt-4">
                  <div className="flex justify-between items-start mb-2">
                    <img
                      src={
                        (group["Hotel_Asignado"] || "").includes("Cumb")
                          ? "Logos/Cumbria Spa&Hotel.jpg"
                          : "Logos/Sercotel Guadiana.jpg"
                      }
                      alt="Logo"
                      className="h-6 object-contain"
                    />
                  </div>

                  <div className="mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">
                      {formatDate(group["Entrada"])}
                    </span>
                    <h4
                      className="font-bold text-slate-800 mb-1 cursor-pointer hover:text-[#2d5a43] transition-colors text-xs leading-tight line-clamp-2"
                      onClick={() => {
                        const resId = group["Reserva"];
                        localStorage.setItem("nexus_return_reserva", resId);
                        window.location.href = `Gestion-de-Grupos.html?reserva=${encodeURIComponent(resId)}`;
                      }}
                      title={group["Nombre del Grupo"]}
                    >
                      {group["Nombre del Grupo"]}
                    </h4>
                    <p className="text-[9px] text-slate-400">
                      {group["Empresa/Agencia"]}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2 bg-slate-50 p-2 rounded-xl">
                    <div className="text-center">
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                        Revenue (PMS)
                      </p>
                      <p className="font-bold text-slate-700 text-xs">
                        {fmt(safeParseAmount(group["Importe(*)"] || 0))}
                      </p>
                    </div>
                    {group.Com_ProformaTotal && (
                      <div className="text-center border-l border-slate-200">
                        <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-tighter">
                          Proforma
                        </p>
                        <p className="font-bold text-emerald-700 text-xs">
                          {fmt(safeParseAmount(group.Com_ProformaTotal))}
                        </p>
                      </div>
                    )}
                    <div className="text-center border-l border-slate-200">
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                        Pax
                      </p>
                      <p className="font-bold text-slate-700 text-xs">
                        {group["Pax."] || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {/* Internal Phase Badge */}
                    {group["Com_Estado_Interno"] && (
                      <div
                        className={`flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded border max-w-full ${getStatusProps(group["Com_Estado_Interno"]).text} ${getStatusProps(group["Com_Estado_Interno"]).text.replace("bg-", "border-").replace("text-", "border-")}`}
                      >
                        <LucideIcon
                          name="briefcase"
                          className="w-2.5 h-2.5 shrink-0"
                        />
                        <span className="font-bold">
                          {group["Com_Estado_Interno"]}
                        </span>
                      </div>
                    )}

                    {/* Release Date Warning */}
                    {group["Com_Vencimiento_Rel"] && (
                      <div className="flex items-center gap-1 text-[8px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100 max-w-full">
                        <LucideIcon
                          name="clock"
                          className="w-2.5 h-2.5 shrink-0"
                        />
                        <span>
                          Rel:{" "}
                          <span className="font-bold">
                            {formatDate(group["Com_Vencimiento_Rel"])}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Avisos Manuales */}
                  {group["Com_Notas"] && (
                    <div className="mb-2 text-[8px] bg-yellow-50 text-yellow-800 p-1.5 rounded-lg border border-yellow-100 flex items-start gap-1 leading-tight">
                      <LucideIcon
                        name="alert-circle"
                        className="w-3 h-3 shrink-0 text-yellow-600"
                      />
                      <span
                        className="line-clamp-2"
                        title={group["Com_Notas"]}
                      >
                        {group["Com_Notas"]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-50 mt-auto">
                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "selectedGroup",
                        JSON.stringify(group),
                      );
                      window.location.href = "Fac Prof.html";
                    }}
                    className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[9px] hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
                  >
                    <LucideIcon name="file-text" className="w-3 h-3" />
                    Proforma
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = "Gestion-de-Grupos.html")
                    }
                    className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center"
                  >
                    <LucideIcon name="pencil" className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <p className="col-span-full text-center py-20 text-slate-400">
                No se encontraron grupos coincidiendo con tu búsqueda.
              </p>
            )}
          </div>
        </div>
      );
    };

    const BudgetManager = ({ data, onUpdateStatus, onDeleteGroup }) => {
      const [searchTerm, setSearchTerm] = React.useState("");
      const [statusFilter, setStatusFilter] = React.useState("TODOS");

      const budgetData = data.filter((g) => {
        const isBudget =
          String(g.Reserva || "").startsWith("PRES-") ||
          (g.Estado || "").toUpperCase().includes("PRESUPUESTO") ||
          (g.Com_Estado_Interno || "").toUpperCase().includes("PRESUPUESTO") ||
          (g.Com_Estado_Interno || "").toUpperCase().includes("ENVIADO") ||
          (g.Com_Estado_Interno || "").toUpperCase().includes("SEGUIMIENTO");

        if (!isBudget) return false;

        const term = searchTerm.toLowerCase();
        const name = (g["Nombre del Grupo"] || "").toLowerCase();
        const agency = (g["Empresa/Agencia"] || "").toLowerCase();
        const reserva = (g["Reserva"] || "").toString().toLowerCase();

        const matchesSearch =
          name.includes(term) ||
          agency.includes(term) ||
          reserva.includes(term);
        const matchesStatus =
          statusFilter === "TODOS" ||
          (g.Com_Estado_Interno || g.Estado || "")
            .toUpperCase()
            .includes(statusFilter);

        return matchesSearch && matchesStatus;
      });

      const getBudgetStatusProps = (statusRaw) => {
        const s = (statusRaw || "").toString().toUpperCase();
        if (s.includes("CONFIRM"))
          return {
            color: "bg-emerald-500",
            text: "bg-emerald-50 text-emerald-600",
            icon: "check-circle",
            label: "CONFIRMADO",
          };
        if (
          s.includes("DESESTIMADO") ||
          s.includes("CANCEL") ||
          s.includes("ANUL")
        )
          return {
            color: "bg-slate-400",
            text: "bg-slate-50 text-slate-500",
            icon: "x-circle",
            label: "DESESTIMADO",
          };
        if (s.includes("SEGUIMIENTO"))
          return {
            color: "bg-indigo-500",
            text: "bg-indigo-50 text-indigo-600",
            icon: "phone-forwarded",
            label: "SEGUIMIENTO",
          };
        if (s.includes("ENVIADO"))
          return {
            color: "bg-blue-500",
            text: "bg-blue-50 text-blue-600",
            icon: "mail",
            label: "ENVIADO",
          };
        return {
          color: "bg-amber-500",
          text: "bg-amber-50 text-amber-600",
          icon: "clock",
          label: "PENDIENTE",
        };
      };

      return (
        <div className="animate-fade-in space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Seguimiento de Presupuestos
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                Control comercial y conversión de leads
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <LucideIcon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Buscar presupuesto..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 text-slate-600"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="ENVIADO">Enviados</option>
                <option value="SEGUIMIENTO">En Seguimiento</option>
                <option value="CONFIRMADO">Confirmados</option>
                <option value="DESESTIMADO">Desestimados</option>
              </select>
              <button
                onClick={() => (window.location.href = "AltaEmail.html")}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
              >
                <LucideIcon name="plus" className="w-4 h-4" />
                Nuevo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {budgetData.map((budget, i) => {
              const st = getBudgetStatusProps(
                budget.Com_Estado_Interno || budget.Estado,
              );
              return (
                <div
                  key={i}
                  className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all flex flex-col group relative overflow-hidden h-fit"
                >
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <select
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border-none outline-none cursor-pointer shadow-sm ${getStatusProps(budget.Com_Estado_Interno || budget.Estado).text}`}
                      value={budget.Com_Estado_Interno || budget.Estado || ""}
                      onChange={(e) => onUpdateStatus(budget.id || budget.Reserva, e.target.value)}
                    >
                      <option value="PRESUPUESTO">Presupuesto</option>
                      <option value="ENVIADO">Enviado</option>
                      <option value="SEGUIMIENTO">Seguimiento</option>
                      <option value="CONFIRMADO">Confirmado</option>
                      <option value="CANCELADO">Cancelado</option>
                      <option value="DESESTIMADO">Desestimado</option>
                    </select>

                    <button
                      onClick={() => onDeleteGroup(budget.id || budget.Reserva)}
                      className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      title="Desestimar Presupuesto"
                    >
                      <LucideIcon name="trash-2" size={14} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${st.text} border border-current opacity-20`}
                    >
                      <LucideIcon name={st.icon} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                        ID: {budget.Reserva}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 uppercase leading-tight line-clamp-2">
                        {budget["Nombre del Grupo"]}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-2xl">
                      <div className="text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Importe Est.
                        </p>
                        <p className="text-sm font-black text-indigo-700">
                          {fmt(safeParseAmount(budget["Importe(*)"] || budget.Com_ProformaTotal || 0))}
                        </p>
                      </div>
                      <div className="text-center border-l border-slate-200">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Personas
                        </p>
                        <p className="text-sm font-black text-slate-700">
                          {budget["Pax."] || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-slate-500">
                      <LucideIcon
                        name="building-2"
                        size={14}
                        className="shrink-0"
                      />
                      <span className="text-[10px] font-bold uppercase">
                        {budget["Empresa/Agencia"] || "Contacto Directo"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <LucideIcon
                        name="users"
                        size={14}
                        className="shrink-0"
                      />
                      <span className="text-[10px] font-bold uppercase">
                        {budget["Pax."]} Pax • {budget["Régimen"]}
                      </span>
                    </div>
                    {budget.Com_Email_Contacto && (
                      <div className="flex items-center gap-3 text-slate-400">
                        <LucideIcon
                          name="mail"
                          size={14}
                          className="shrink-0"
                        />
                        <span className="text-[10px] font-bold lowercase italic">
                          {budget.Com_Email_Contacto}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => {
                        window.location.href =
                          "Gestion-de-Grupos.html?reserva=" + budget.Reserva;
                      }}
                      className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center shadow-lg shadow-emerald-100"
                      title="Abrir en Panel de Gestión"
                    >
                      <LucideIcon name="external-link" size={14} />
                    </button>
                    <button
                      onClick={() => {
                        try {
                          localStorage.setItem(
                            "selectedGroup",
                            JSON.stringify(budget),
                          );
                          console.log(
                            "Guardado en localStorage p/ edición:",
                            budget.Reserva,
                          );
                        } catch (e) {
                          console.warn("LocalStorage bloqueado:", e);
                        }
                        window.location.href =
                          "AltaEmail.html?edit=" +
                          encodeURIComponent(budget.Reserva);
                      }}
                      className="flex-1 py-2.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                      <LucideIcon name="edit-3" size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem(
                          "selectedGroup",
                          JSON.stringify(budget),
                        );
                        window.location.href = "Fac Prof.html";
                      }}
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-100"
                      title="Ver Proforma"
                    >
                      <LucideIcon name="file-text" size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {budgetData.length === 0 && (
              <div className="col-span-full py-32 text-center">
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <LucideIcon name="clipboard-x" size={64} />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">
                    No hay presupuestos en esta sección
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    const App = () => {
      const [activeTab, setActiveTab] = useState("dashboard");
      const [data, setData] = useState([]);
      const [arrivals, setArrivals] = useState([]);
      const [timeRange, setTimeRange] = useState(30);
      const [stats, setStats] = useState({
        revenue: "0€",
        groups: 0,
        pending: 0,
        pax: 0,
      });
      const [successToast, setSuccessToast] = useState(null);

      const handleUpdateStatus = async (groupId, newStatus) => {
        try {
          const docId = String(groupId || "").trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
          await db.collection("groups").doc(docId).set({
            Estado: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          setSuccessToast(`Estado actualizado a ${newStatus}`);
          setTimeout(() => setSuccessToast(null), 3000);
        } catch (e) {
          console.error("Error updating status:", e);
        }
      };

      const handleDeleteGroup = async (groupId) => {
        if (window.confirm("¿Estás seguro de que deseas desestimar este grupo?")) {
          try {
            const docId = String(groupId || "").trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
            await db.collection("groups").doc(docId).set({
              Estado: "DESESTIMADO",
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            setSuccessToast("Grupo desestimado correctamente");
            setTimeout(() => setSuccessToast(null), 3000);
          } catch (e) {
            console.error("Error deleting group:", e);
          }
        }
      };

      // Detectar redireccion desde AltaEmail con petición enviada
      useEffect(() => {
        setTimeout(() => setSuccessToast(null), 5000);
      }, []);

      const getStatusProps = (statusRaw) => {
        const s = (statusRaw || "").toString().toUpperCase();
        if (
          s.includes("CONFIRM") ||
          s.includes("GARANT") ||
          s.includes("RESERVA")
        )
          return {
            color: "bg-emerald-500",
            text: "bg-emerald-50 text-emerald-600",
            label: s || "CONFIRMADO",
          };
        if (
          s.includes("BLOQ") ||
          s.includes("OPCI") ||
          s.includes("TIEMPO") ||
          s.includes("TENTATI")
        )
          return {
            color: "bg-indigo-500",
            text: "bg-indigo-50 text-indigo-600",
            label: s || "BLOQUEADO",
          };
        if (
          s.includes("ENVIAD") ||
          s.includes("COTIZ") ||
          s.includes("OFERT")
        )
          return {
            color: "bg-blue-400",
            text: "bg-blue-50 text-blue-600",
            label: s || "ENVIADO",
          };
        if (
          s.includes("ANUL") ||
          s.includes("CANC") ||
          s.includes("BAJA") ||
          s.includes("DESESTIMADO")
        )
          return {
            color: "bg-red-400 opacity-60",
            text: "bg-red-50 text-red-500",
            label: s || "CANCELADO",
          };
        if (s.includes("SEGUIMIENTO"))
          return {
            color: "bg-indigo-500",
            text: "bg-indigo-50 text-indigo-600",
            label: s || "SEGUIMIENTO",
          };
        if (
          s.includes("PROSPEC") ||
          s.includes("PENDIE") ||
          s.includes("PRESUPUESTO")
        )
          return {
            color: "bg-amber-500",
            text: "bg-amber-50 text-amber-600",
            label: s || "PROSPECTO",
          };
        return {
          color: "bg-slate-400",
          text: "bg-slate-50 text-slate-500",
          label: s || "ACTIVO",
        };
      };

      // Generar Alertas Dinámicas
      const alerts = useMemo(() => {
        const list = [];
        const now = new Date();
        const sevenDaysFromNow = new Date(now);
        sevenDaysFromNow.setDate(now.getDate() + 7);
        const fortyEightHours = 48 * 60 * 60 * 1000;

        // 1. Alerta de Vencimiento de Proformas (basado en Com_Vencimiento_Rel)
        data.forEach((g) => {
          const groupName = g["Nombre del Grupo"] || g["Reserva"] || "Grupo";
          const arrival = g["Entrada"]
            ? g["Entrada"] instanceof Date
              ? g["Entrada"]
              : new Date(g["Entrada"])
            : null;
          const status = ((g["Status"] || "") + " " + (g["Estado"] || "") + " " + (g["Com_Estado_Interno"] || "")).toUpperCase();
          const isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS"].some(s => status.includes(s));
          
          const departureStr = g["Salida"] || g["Entrada"] || "";
          const todayStr = new Date().toISOString().split("T")[0];
          const isPast = departureStr && departureStr < todayStr;

          if (isCancelled || isPast) return;

          // Alert 1: Release Urgente (< 7 días)
          let dRel = null;
          if (g["Com_Vencimiento_Rel"]) {
            const val = g["Com_Vencimiento_Rel"];
            const num = parseFloat(val);
            if (!isNaN(num) && num > 40000 && num < 60000)
              dRel = new Date(Math.round((num - 25569) * 86400 * 1000));
            else dRel = new Date(val);
          }
          if (dRel && !isNaN(dRel.getTime())) {
            const diff = dRel - now;
            if (diff > 0 && diff < fortyEightHours) {
              list.push({
                label: `Release 48h: ${groupName}`,
                icon: "Clock",
                type: "danger",
                group: g,
              });
            } else if (dRel <= sevenDaysFromNow) {
              list.push({
                label: `Vence Release: ${groupName}`,
                icon: "Clock",
                type: "warning",
                group: g,
              });
            }
          }

          // Alert 2: Seguimiento Pendiente
          let dFollow = null;
          if (g["Com_Seguimiento"]) {
            const val = g["Com_Seguimiento"];
            const num = parseFloat(val);
            if (!isNaN(num) && num > 40000 && num < 60000)
              dFollow = new Date(Math.round((num - 25569) * 86400 * 1000));
            else dFollow = new Date(val);
          }
          if (dFollow && !isNaN(dFollow.getTime()) && dFollow <= now) {
            list.push({
              label: `Seguimiento: ${groupName}`,
              icon: "Phone",
              type: "info",
              group: g,
            });
          }

          // Alert 3: Pagos Pendientes
          try {
            const plan = JSON.parse(g.PaymentPlan_JSON || "[]");
            const hasPending = plan.some((p) => {
              let pDate = p.date ? new Date(p.date) : null;
              return p.status !== "Cobrado" && pDate && pDate <= now;
            });
            if (hasPending) {
              list.push({
                label: `Pago Atrasado: ${groupName}`,
                icon: "AlertTriangle",
                type: "danger",
                group: g,
              });
            }
          } catch (e) { }

          // Alert 4: Tentativa próxima a llegada
          const isTentative =
            (g["Estado"] || "").toLowerCase().includes("tentat") ||
            (g["Com_Estado_Interno"] || "").toLowerCase().includes("tentat");
          const entryDate = arrival;
          if (
            isTentative &&
            entryDate &&
            !isNaN(entryDate.getTime()) &&
            entryDate <= sevenDaysFromNow
          ) {
            list.push({
              label: `Confirmar Urgente: ${groupName}`,
              icon: "Calendar",
              type: "warning",
              group: g,
            });
          }

          // Alert 5: Presupuesto sin comercial (Sin valorar)
          const gStatus = (g.Com_Estado_Interno || g.Estado || "").toLowerCase();
          const gCom = (g.Com_Comercial || "").trim();
          const isBudget =
            gStatus.includes("presup") ||
            gStatus.includes("pend") ||
            String(g.Reserva || "").startsWith("PRES-");

          if (isBudget && !gCom) {
            list.push({
              label: `Sin Comercial: ${groupName}`,
              icon: "UserPlus",
              type: "danger",
              group: g,
            });
          }
        });

        // 5. Alerta de Sincronización Reciente (Global)
        const recentCount = data.filter((g) => {
          if (!g.updatedAt) return false;
          const updateDate = g.updatedAt.toDate
            ? g.updatedAt.toDate()
            : new Date(g.updatedAt);
          return now - updateDate < 15 * 60 * 1000;
        }).length;

        if (recentCount > 0) {
          list.push({
            label: `${recentCount} registros sincronizados`,
            icon: "RefreshCw",
            type: "success",
            group: null,
          });
        }

        return list.slice(0, 5); // Mostrar top 5 más urgentes
      }, [data]);

      // Estados para IA
      const [isAiModalOpen, setIsAiModalOpen] = useState(false);
      const [isAiLoading, setIsAiLoading] = useState(false);
      const [aiResult, setAiResult] = useState("");

      const runStrategicAnalysis = async () => {
        setIsAiModalOpen(true);
        setIsAiLoading(true);
        try {
          const analysis = await analizarGrupos(data);
          setAiResult(analysis);
        } catch (error) {
          console.error("Error en análisis IA:", error);
          setAiResult(
            `### Error Detectado\n**Detalles técnicos:** ${error.message}\n\n*Posible solución:* Verifica que la API Key tenga activada la "Generative Language API" y que las restricciones de sitio web incluyan tu URL actual.`,
          );
        } finally {
          setIsAiLoading(false);
        }
      };

      useEffect(() => {
        const unsubscribe = db.collection("groups").onSnapshot((snapshot) => {
          const parsed = [];
          snapshot.forEach((doc) => {
            const row = doc.data();
            // Normalización de Segmentos
            let seg = (row["Segment."] || "").toString().trim().toUpperCase();
            if (seg === "GRTANTEO" || seg === "GRUPO TANTEO") {
              row["Segment."] = "GRUPO TANTEO";
            }
            parsed.push(row);
          });

          if (parsed.length > 0) {
            setData(parsed);

            // 1. Helper de Procesamiento
            const parseDate = (val) => {
              if (!val) return new Date(8640000000000000);
              if (val instanceof Date) return val;
              const str = String(val);

              // Caso: Excel Date Number (Ej: 45690)
              if (
                !isNaN(str) &&
                str.length > 4 &&
                !str.includes("/") &&
                !str.includes("-")
              ) {
                const excelEpoch = new Date(1899, 11, 30);
                excelEpoch.setDate(excelEpoch.getDate() + parseInt(str));
                return excelEpoch;
              }

              const parts = str.split(/[\/-]/);
              if (parts.length === 3) {
                // YYYY-MM-DD
                if (parts[0].length === 4)
                  return new Date(parts[0], parts[1] - 1, parts[2]);
                // DD-MM-YYYY
                return new Date(parts[2], parts[1] - 1, parts[0]);
              }
              const d = new Date(str);
              return isNaN(d.getTime()) ? new Date(8640000000000000) : d;
            };

            // 2. Calcular Alerts Reales
            let totalRev = 0;
            const now = new Date();
            const sevenDaysFromNow = new Date(now);
            sevenDaysFromNow.setDate(now.getDate() + 7);

            const realAlerts = [];

            parsed.forEach((g) => {
              const val =
                g["Importe(*)"] ||
                g["Importe"] ||
                g["Total_Importe_Facturable"] ||
                "0";
              totalRev += safeParseAmount(val);

              const groupName =
                g["Nombre del Grupo"] || g["Reserva"] || "Grupo";
              const arrival = parseDate(g["Entrada"]);
              const status = ((g["Status"] || "") + " " + (g["Estado"] || "") + " " + (g["Com_Estado_Interno"] || "")).toUpperCase();
              const isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS"].some(s => status.includes(s));
              
              const departureStr = g["Salida"] || g["Entrada"] || "";
              const todayStr = now.toISOString().split("T")[0];
              const isPast = departureStr && departureStr < todayStr;

              if (isCancelled || isPast) return;

              // Alert 1: Release Urgente (< 7 días)
              const comRel = g.Com_Vencimiento_Rel
                ? parseDate(g.Com_Vencimiento_Rel)
                : null;
              if (
                comRel &&
                !isNaN(comRel.getTime()) &&
                comRel <= sevenDaysFromNow
              ) {
                realAlerts.push({
                  label: `Vence Release: ${groupName}`,
                  icon: "Clock",
                  type: "warning",
                });
              }

              // Alert 2: Seguimiento Pendiente
              const followUp = g.Com_Seguimiento
                ? parseDate(g.Com_Seguimiento)
                : null;
              if (followUp && !isNaN(followUp.getTime()) && followUp <= now) {
                realAlerts.push({
                  label: `Seguimiento: ${groupName}`,
                  icon: "Phone",
                  type: "info",
                });
              }

              // Alert 3: Pagos Pendientes
              try {
                const plan = JSON.parse(g.PaymentPlan_JSON || "[]");
                const hasPending = plan.some((p) => {
                  const pDate = parseDate(p.date);
                  return p.status !== "Cobrado" && pDate <= now;
                });
                if (hasPending) {
                  realAlerts.push({
                    label: `Pago Atrasado: ${groupName}`,
                    icon: "AlertTriangle",
                    type: "danger",
                    group: g,
                  });
                }
              } catch (e) { }

              // Alert 4: Tentativa próxima a llegada
              const isTentative =
                (g["Estado"] || "").toLowerCase().includes("tentat") ||
                (g["Com_Estado_Interno"] || "")
                  .toLowerCase()
                  .includes("tentat");
              if (isTentative && arrival <= sevenDaysFromNow) {
                realAlerts.push({
                  label: `Confirmar Urgente: ${groupName}`,
                  icon: "Calendar",
                  type: "warning",
                  group: g,
                });
              }
            });

            // setAlerts(realAlerts.slice(0, 5)); // Mostrar top 5 - Eliminado porque alerts es useMemo

            const getGroupDate = (g) => {
              return parseDate(
                g["Entrada"] ||
                g["ENTRADA"] ||
                g["Fecha Entrada"] ||
                g["Com_Entrada"],
              );
            };

            const months = [
              "Ene",
              "Feb",
              "Mar",
              "Abr",
              "May",
              "Jun",
              "Jul",
              "Ago",
              "Sep",
              "Oct",
              "Nov",
              "Dic",
            ];
            const currentMonthIdx = now.getMonth();
            const currentYear = now.getFullYear();
            const groupsByMonth = {};

            parsed.forEach((g) => {
              const entryDate = getGroupDate(g);
              const status = (
                (g["Estado"] || "") + " " +
                (g["Com_Estado_Interno"] || "")
              ).toLowerCase();
              const isCancelled = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA"].some(s => status.includes(s));

              if (entryDate && !isNaN(entryDate.getTime()) && !isCancelled) {
                const y = entryDate.getFullYear();
                const m = entryDate.getMonth();
                const key = `${y}-${m}`;
                groupsByMonth[key] = (groupsByMonth[key] || 0) + 1;
              }
            });

            const trendData = [];
            // Generar previsión para los próximos 9 meses
            for (let i = 0; i < 9; i++) {
              const d = new Date(currentYear, currentMonthIdx + i, 1);
              const y = d.getFullYear();
              const m = d.getMonth();
              const key = `${y}-${m}`;
              trendData.push({
                name: `${months[m]} ${y.toString().slice(-2)}`,
                val: groupsByMonth[key] || 0,
              });
            }

            let unattendedCount = 0;
            const processedGroups = new Set();
            parsed.forEach((p) => {
              const resId = p["Reserva"] || p["Nombre del Grupo"];
              if (!processedGroups.has(resId)) {
                processedGroups.add(resId);
                const status = (
                  (p["Estado"] || "") + " " +
                  (p["Com_Estado_Interno"] || "")
                ).toLowerCase();
                const com = (p["Com_Comercial"] || "").trim();
                const isBudget =
                  status.includes("presup") ||
                  status.includes("pend") ||
                  String(resId).startsWith("PRES-");
                const isCancelled = ["cancel", "anul", "baja", "desestimado", "gastos"].some(s => status.includes(s));
                if (isBudget && !com && !isCancelled) {
                  unattendedCount++;
                }
              }
            });

            setStats({
              revenue: new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totalRev),
              groups: new Set(
                parsed.map((p) => p["Nombre del Grupo"] || p["Reserva"]),
              ).size,
              pending: parsed.filter((p) => {
                const status =
                  (
                    (p["Estado"] || "") + " " +
                    (p["Com_Estado_Interno"] || "")
                  ).toLowerCase() +
                  " " +
                  (p["Segment."] || "").toLowerCase();
                const isCancelled = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA", "DESCART", "RECHAZ"].some(s => status.toUpperCase().includes(s));
                if (isCancelled) return false;

                const val =
                  p["Importe(*)"] ||
                  p["Importe"] ||
                  p["Total_Importe_Facturable"] ||
                  "0";
                const rawVal = String(val).trim();
                const isZero =
                  rawVal === "" ||
                  rawVal === "0" ||
                  rawVal === "0,00" ||
                  rawVal === "0.00" ||
                  Number(rawVal) === 0;

                return (
                  (status.includes("presup") ||
                    status.includes("pend") ||
                    String(p["Reserva"]).startsWith("PRES.")) &&
                  isZero
                );
              }).length,
              pax: parsed.reduce(
                (acc, curr) => acc + (parseInt(curr["Pax."]) || 0),
                0,
              ),
              releaseAlerts: realAlerts.filter((a) =>
                a.label.includes("Release"),
              ).length,
              followUpAlerts: realAlerts.filter((a) =>
                a.label.includes("Seguimiento"),
              ).length,
              unattendedQuotes: unattendedCount,
              trendData,
            });

            // 4. Calcular Próximas Llegadas
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);

            const endOfRange = new Date(startOfToday);
            endOfRange.setDate(startOfToday.getDate() + timeRange);

            const arrivalsList = parsed
              .filter((p) => {
                const entryDate = getGroupDate(p);
                const status = (
                  (p["Estado"] || "") + " " +
                  (p["Com_Estado_Interno"] || "")
                ).toUpperCase();
                const isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS"].some(s => status.includes(s));
                // Ensure entryDate is valid and within range
                return (
                  entryDate &&
                  !isNaN(entryDate.getTime()) &&
                  entryDate >= startOfToday &&
                  entryDate <= endOfRange &&
                  !isCancelled
                );
              })
              .sort((a, b) => getGroupDate(a) - getGroupDate(b))
              .slice(0, 30);

            setArrivals(arrivalsList);
          }
        });

        return () => unsubscribe();
      }, [timeRange]);

      useEffect(() => {
        // Ya no es necesario llamar a lucide.createIcons() globalmente
        // porque usamos el componente LucideIcon que lo maneja de forma segura
      }, [activeTab, data]);

      return (
        <div className="min-h-screen">
          {/* Toast de éxito al regresar de Petición de Grupo */}
          {successToast && (
            <div className="fixed top-6 right-6 z-50 flex items-start gap-3 bg-white border-2 border-emerald-400 rounded-2xl shadow-2xl shadow-emerald-100 px-6 py-4 max-w-sm animate-fade-in">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 text-emerald-600">
                <LucideIcon name="check-circle" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-0.5">
                  ¡Petición Procesada!
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {successToast}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  La solicitud de presupuesto se ha enviado correctamente.
                </p>
              </div>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5"
              >
                <LucideIcon name="x" size={16} />
              </button>
            </div>
          )}

          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main
            className={`ml-64 p-8 md:p-12 ${activeTab === "dashboard" ? "bg-gradient-to-b from-slate-50/50 to-transparent" : ""}`}
          >
            {/* Header Superior */}

            {activeTab === "dashboard" && (
              <Dashboard
                arrivals={arrivals}
                stats={stats}
                alerts={alerts}
                data={data}
                onRunAnalysis={runStrategicAnalysis}
                timeRange={timeRange}
                onRangeChange={setTimeRange}
              />
            )}
            {activeTab === "groups" && (
              <GroupsManager
                data={data}
                onUpdateStatus={handleUpdateStatus}
                onDeleteGroup={handleDeleteGroup}
              />
            )}
            {activeTab === "budgets" && (
              <BudgetManager
                data={data}
                onUpdateStatus={handleUpdateStatus}
                onDeleteGroup={handleDeleteGroup}
              />
            )}
            {activeTab === "analytics" && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-[#2d5a43] rounded-full flex items-center justify-center mx-auto mb-6">
                    <LucideIcon name="sparkles" className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Análisis Estratégico IA
                  </h2>
                  <p className="text-slate-500 max-w-lg mx-auto mb-10">
                    Utiliza la potencia de Gemini 2.5 Flash para obtener una
                    visión profunda de la rentabilidad, riesgos y
                    oportunidades de tus grupos actuales.
                  </p>
                  <button
                    onClick={runStrategicAnalysis}
                    className="bg-[#2d5a43] text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center gap-3 mx-auto"
                  >
                    Generar Nuevo Informe IA
                    <LucideIcon name="zap" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {(activeTab === "invoices" || activeTab === "settings") && (
              <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                  <LucideIcon
                    name="construction"
                    className="w-8 h-8 text-[#2d5a43]"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Acceso a módulo externo
                </h3>
                <p className="text-slate-500 mb-8 max-w-sm">
                  Esta sección utiliza las herramientas dinámicas del gestor.
                  Redirigiendo...
                </p>
                <button
                  onClick={() =>
                  (window.location.href =
                    activeTab === "invoices"
                      ? "Proformas.html"
                      : "Gestion-de-Grupos.html")
                  }
                  className="bg-slate-900 px-8 py-4 rounded-2xl text-white font-bold hover:bg-slate-800 transition-all shadow-xl"
                >
                  Abrir{" "}
                  {activeTab === "invoices"
                    ? "Módulo de Facturación"
                    : "Gestor de Grupos"}
                </button>
              </div>
            )}
          </main>

          {/* MODAL IA ESTRATÉGICA */}
          {isAiModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
              <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#2d5a43] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                      <LucideIcon name="sparkles" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Análisis Estratégico IA
                      </h3>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                        Motor: Gemini 2.5 Flash
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-all"
                  >
                    <LucideIcon name="x" className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  {isAiLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-6">
                      <div className="spinner"></div>
                      <p className="text-slate-500 font-semibold animate-pulse tracking-wide text-center">
                        Analizando todos los grupos en tiempo real...
                        <br />
                        <span className="text-[10px] font-normal uppercase mt-2 block">
                          Consultando Firestore "groups"
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div
                      className="prose max-w-none text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(aiResult),
                      }}
                    ></div>
                  )}
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <p className="text-xs text-slate-400 italic">
                    Este informe se basa en los grupos activos en Firestore.
                  </p>
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-8 py-3 bg-[#2d5a43] text-white font-bold rounded-2xl hover:bg-[#1e3a2c] transition-all shadow-lg"
                  >
                    Cerrar Informe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<App />);
  
