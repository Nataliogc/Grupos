
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
    const formatDate = (val) => {
      if (!val) return "";
      if (val instanceof Date) {
        if (isNaN(val.getTime())) return "";
        const d = String(val.getDate()).padStart(2, "0");
        const m = String(val.getMonth() + 1).padStart(2, "0");
        const y = val.getFullYear();
        return `${d}/${m}/${y}`;
      }
      return NexusUtils.formatDate ? NexusUtils.formatDate(val) : String(val);
    };

    const isCreditoGroup = (g) => {
      if (!g) return false;
      if (g.isCredito === true || g.isCredito === "true") return true;
      if (g.Es_Credito === true || g.Es_Credito === "true" || g["Es_Credito"] === true || g["Es_Credito"] === "true") return true;
      if (g.Com_Es_Credito === true || g.Com_Es_Credito === "true" || g["Com_Es_Credito"] === true || g["Com_Es_Credito"] === "true") return true;
      const fp = String(g.Forma_Pago || g["Forma de Pago"] || g.Com_Forma_Pago || "").toUpperCase();
      if (fp.includes("CREDIT") || fp.includes("CRÉDIT")) return true;
      if (Array.isArray(g.records)) {
        return g.records.some(r => isCreditoGroup(r));
      }
      return false;
    };

    const getGroupFinancialInfo = (g) => {
      if (!g) return { total: 0, paid: 0, pending: 0, planPaid: 0, planTotal: 0, allMilestonesCobrado: false };

      const records = Array.isArray(g.records) && g.records.length > 0 ? g.records : [g];

      let roomingTotal = 0;
      records.forEach(rec => {
        if (rec.RoomingList_JSON) {
          try {
            const rList = typeof rec.RoomingList_JSON === "string" ? JSON.parse(rec.RoomingList_JSON) : rec.RoomingList_JSON;
            if (Array.isArray(rList)) {
              rList.forEach(item => {
                roomingTotal += parseFloat(item.total) || 0;
              });
            }
          } catch (e) {}
        }
      });

      let planTotal = 0;
      let planPaid = 0;
      let hasMilestones = false;
      let allMilestonesCobrado = true;

      const processedPlans = new Set();
      records.forEach(rec => {
        if (rec.PaymentPlan_JSON && rec.PaymentPlan_JSON !== "[]" && !processedPlans.has(rec.PaymentPlan_JSON)) {
          processedPlans.add(rec.PaymentPlan_JSON);
          try {
            const plan = JSON.parse(rec.PaymentPlan_JSON);
            if (Array.isArray(plan) && plan.length > 0) {
              hasMilestones = true;
              plan.forEach(p => {
                const amt = parseFloat(p.amount) || 0;
                planTotal += amt;
                if (p.status === "Cobrado" || p.status === "Pagado") {
                  planPaid += amt;
                } else {
                  allMilestonesCobrado = false;
                }
              });
            }
          } catch (e) {}
        }
      });

      const manualPaid = records.reduce((max, r) => Math.max(max, safeParseAmount(r.Com_Pagado || 0)), 0);
      const paid = Math.max(manualPaid, planPaid);

      let total = 0;
      if (roomingTotal > 0) {
        total = roomingTotal;
      } else {
        const facturable = records.reduce((sum, r) => sum + safeParseAmount(r.Total_Importe_Facturable || 0), 0);
        if (facturable > 0) {
          total = facturable;
        } else if (planTotal > 0) {
          total = planTotal;
        } else {
          total = records.reduce((sum, r) => sum + safeParseAmount(r["Importe(*)"] || r["Importe"] || 0), 0);
        }
      }

      let pending = Math.max(0, total - paid);
      if ((hasMilestones && allMilestonesCobrado && planPaid > 0) || (planTotal > 0 && paid >= planTotal - 0.05) || (total > 0 && paid >= total - 0.05)) {
        pending = 0;
      }

      return { total, paid, pending, planPaid, planTotal, allMilestonesCobrado };
    };


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
      const [selectedEmailAlert, setSelectedEmailAlert] = React.useState(null);
      const [emailModalTab, setEmailModalTab] = React.useState("preview");
      const [internalReportModal, setInternalReportModal] = React.useState(null);
      const [internalReportTab, setInternalReportTab] = React.useState("preview");
      const [toastInfo, setToastInfo] = React.useState(null);
      const [notifiedAlerts, setNotifiedAlerts] = React.useState(() => {
        try {
          return JSON.parse(localStorage.getItem("nexus_notified_alerts") || "{}");
        } catch (e) {
          return {};
        }
      });

      React.useEffect(() => {
        if (toastInfo) {
          const t = setTimeout(() => setToastInfo(null), 4500);
          return () => clearTimeout(t);
        }
      }, [toastInfo]);

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
          const isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS", "DESGLOSADO"].some(s => status.includes(s)) || g.excludeFromStatistics === true;
          const departureDate = parseDate(g.Salida || g.Entrada);
          const isPast = departureDate && departureDate < startOfToday;

          if (isCancelled || isPast) return;

          const isConfirmed = status.includes("CONFIRM") || status.includes("OK") || status.includes("GARANT") || status.includes("RESERVA") || status.includes("GRUPO");
          const isTentative = status.includes("BLOQ") || status.includes("OPCI") || status.includes("TENTAT") || status.includes("TANTEO");
          const entryDate = parseDate(g.Entrada);

          const fin = getGroupFinancialInfo(g);
          const totalAmt = fin.total;
          const paid = fin.paid;
          const pending = fin.pending;

          let hasAlert = false;

          const isCredito = isCreditoGroup(g);

          // 1. Financial (ignorar si es crédito)
          if (!isCredito && (isConfirmed || isTentative) && pending > 0.1) {
            try {
              const plan = JSON.parse(g.PaymentPlan_JSON || "[]");
              const pastDueMilestones = plan.filter(p => {
                const pDate = parseDate(p.date);
                return pDate && pDate < now && p.status !== "Cobrado" && p.status !== "Pagado";
              });
              if (pastDueMilestones.length > 0) hasAlert = true;
            } catch (e) {}
          }

          // 2. Release (sólo para reservas NO confirmadas y que no sean crédito)
          const dRel = parseDate(g.Com_Vencimiento_Rel);
          if (!hasAlert && !isConfirmed && (!isCredito && pending > 0.1) && dRel && dRel <= fiveDaysFromNow) {
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

          // 5. Tentativa Urgente (< 25 días para la llegada)
          if (!hasAlert && isTentative && entryDate && entryDate >= startOfToday && entryDate <= twentyFiveDaysFromNow) {
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

      // Cálculo de alertas en 5 columnas
      const columnsData = React.useMemo(() => {
        const financialAlerts = [];
        const releaseAlerts = [];
        const logisticsAlerts = [];
        const crmAlerts = [];
        const tentativeAlerts = [];

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
        const seenTentative = new Set();
        const twentyFiveDaysFromNow = new Date(startOfToday);
        twentyFiveDaysFromNow.setDate(twentyFiveDaysFromNow.getDate() + 25);

        filteredGroups.forEach((g) => {
          const resId = g.Reserva || g.Com_Id || "";
          const status = ((g.Estado || "") + " " + (g.Com_Estado_Interno || "")).toUpperCase();
          const isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS", "DESGLOSADO", "CADUC"].some(s => status.includes(s)) || g.excludeFromStatistics === true;
          
          const departureDate = parseDate(g.Salida || g.Entrada);
          const isPast = departureDate && departureDate < startOfToday;

          if (isCancelled || isPast) return;

          const isConfirmed = status.includes("CONF") || status.includes("OK") || status.includes("GARANT") || status.includes("RESERVA") || status.includes("GRUPO");
          const isTentative = status.includes("BLOQ") || status.includes("OPCI") || status.includes("TENTAT") || status.includes("TANTEO");
          const entryDate = parseDate(g.Entrada);

          const fin = getGroupFinancialInfo(g);
          const total = fin.total;
          const paid = fin.paid;
          const pending = fin.pending;

          const isCredito = isCreditoGroup(g);

          // 1. Column 1: Financial Alerts (ignorar si es crédito)
          if (!isCredito && (isConfirmed || isTentative) && pending > 0.1 && !seenFinancial.has(resId)) {
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
                  icon: "alert-triangle",
                  label: "Hito Vencido",
                  detail: `Pago de ${fmt(amt)} vencido el ${formatDate(firstPastDue.date)}`,
                  type: "danger"
                });
              }
            } catch (e) {}
          }

          // 2. Column 2: Releases y Plazos (sólo aplica a reservas NO confirmadas)
          if (!isConfirmed && (!isCredito && pending > 0.1) && !seenRelease.has(resId)) {
            const dRel = parseDate(g.Com_Vencimiento_Rel);
            if (dRel && dRel <= fiveDaysFromNow) {
              seenRelease.add(resId);
              const diffTime = dRel - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isOverdue = dRel < startOfToday;
              
              releaseAlerts.push({
                group: g,
                icon: "clock",
                label: isOverdue ? "Release Vencido" : "Próximo Release",
                detail: isOverdue 
                  ? `Venció hace ${Math.abs(diffDays)} días (${formatDate(dRel)}) - Pend: ${pending.toFixed(2)}€ - Est: ${status}`
                  : `Vence en ${diffDays} días (${formatDate(dRel)}) - Pend: ${pending.toFixed(2)}€`,
                type: isOverdue ? "danger" : "warning"
              });
            }
          }

          // 3. Column 3: Datos Operativos Faltantes
          if (isConfirmed && entryDate && entryDate >= startOfToday && entryDate <= fifteenDaysFromNow && !seenLogistics.has(resId)) {
            const missingDetails = [];
            if (!g.Logistica_Rooming) {
              missingDetails.push({ text: "Falta Rooming List", icon: "file-text" });
            }
            
            const regime = (g["Régimen"] || "").toUpperCase();
            if (regime.includes("MP") && !g.Logistica_MenuMP) {
              missingDetails.push({ text: "Falta Menú MP", icon: "utensils" });
            }
            if (regime.includes("PC") && !g.Logistica_MenuPC) {
              missingDetails.push({ text: "Falta Menú PC", icon: "utensils" });
            }

            if (missingDetails.length > 0) {
              seenLogistics.add(resId);
              logisticsAlerts.push({
                group: g,
                icon: "file-warning",
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
                icon: "phone-call",
                label: isPastDue ? "CRM Retrasado" : "CRM Hoy",
                detail: isPastDue
                  ? `Planificado para el ${formatDate(dFollow)}`
                  : `Programado para hoy (${formatDate(dFollow)})`,
                type: isPastDue ? "danger" : "info"
              });
            }
          }

          // 5. Column 5: Tentativas Urgentes (< 25 días para la llegada)
          if (isTentative && entryDate && !seenTentative.has(resId)) {
            if (entryDate >= startOfToday && entryDate <= twentyFiveDaysFromNow) {
              seenTentative.add(resId);
              const diffDays = Math.ceil((entryDate - startOfToday) / (1000 * 60 * 60 * 24));
              const urgency = diffDays <= 7 ? "danger" : diffDays <= 14 ? "warning" : "info";
              tentativeAlerts.push({
                group: g,
                icon: "calendar-clock",
                label: diffDays <= 7 ? "Llegada Crítica" : diffDays <= 14 ? "Confirmar Pronto" : "Confirmar Antes de Plazo",
                detail: `Entrada en ${diffDays} día${diffDays !== 1 ? 's' : ''} (${formatDate(entryDate)}) — aún en Tentativa`,
                type: urgency
              });
            }
          }
        });

        // Ordenamiento por prioridad/fecha
        financialAlerts.sort((a, b) => {
          // Use cached entry date instead of re-parsing JSON inside the comparator
          const aDate = parseDate(a.group.Entrada);
          const bDate = parseDate(b.group.Entrada);
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

        tentativeAlerts.sort((a, b) => {
          const aDate = parseDate(a.group.Entrada);
          const bDate = parseDate(b.group.Entrada);
          if (!aDate) return 1;
          if (!bDate) return -1;
          return aDate - bDate;
        });

        return {
          financialAlerts,
          releaseAlerts,
          logisticsAlerts,
          crmAlerts,
          tentativeAlerts
        };
      }, [filteredGroups]);

      const STAFF_PRESETS = [
        { label: "🏢 Administración", email: "comunicaciones@hotelguadiana.es", desc: "Administración / Control" },
        { label: "👤 Sergio", email: "ssanchez@hotelguadiana.es", desc: "Dirección / Comercial" },
        { label: "👤 Natalio", email: "comunicaciones@hotelguadiana.es", desc: "Administración" },
        { label: "👤 Diana", email: "dianahotelguadiana@gmail.com", desc: "Comercial" },
        { label: "👥 Todo el Equipo", email: "comunicaciones@hotelguadiana.es, ssanchez@hotelguadiana.es, dianahotelguadiana@gmail.com", desc: "Equipo Completo" }
      ];

      const getStaffEmail = (name) => {
        const n = String(name || "").toLowerCase().trim();
        if (n.includes("sergio")) return "ssanchez@hotelguadiana.es";
        if (n.includes("natalio")) return "comunicaciones@hotelguadiana.es";
        if (n.includes("oscar")) return "osanchez@hotelguadiana.es";
        if (n.includes("diana")) return "dianahotelguadiana@gmail.com";
        return "";
      };

      const availableCommercials = React.useMemo(() => {
        const set = new Set();
        const allAlerts = [
          ...(columnsData.financialAlerts || []),
          ...(columnsData.releaseAlerts || []),
          ...(columnsData.logisticsAlerts || []),
          ...(columnsData.crmAlerts || []),
          ...(columnsData.tentativeAlerts || [])
        ];
        allAlerts.forEach(a => {
          const com = (a.group && a.group.Com_Comercial) ? a.group.Com_Comercial.trim() : "";
          if (com) set.add(com);
        });
        return Array.from(set).sort();
      }, [columnsData]);

      const handleOpenInternalReportModal = (initialSectionKey = null) => {
        const defaultSections = {
          financial: initialSectionKey ? initialSectionKey === "financial" : true,
          release: initialSectionKey ? initialSectionKey === "release" : true,
          logistics: initialSectionKey ? initialSectionKey === "logistics" : true,
          crm: initialSectionKey ? initialSectionKey === "crm" : true,
          tentative: initialSectionKey ? initialSectionKey === "tentative" : true
        };

        const hotelLabel = selectedHotel === "guadiana" ? "Sercotel Guadiana" : selectedHotel === "cumbria" ? "Cumbria Spa & Hotel" : "Todos los Hoteles";
        const todayStr = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });

        setInternalReportTab("preview");
        setInternalReportModal({
          filterComercial: "todos",
          sections: defaultSections,
          emailTo: "comunicaciones@hotelguadiana.es",
          subject: `[CONTROL INTERNO] Resumen de Alertas Operativas - ${hotelLabel} - ${todayStr}`,
          customBody: null
        });
      };

      const handleOpenSectionReportModal = (title) => {
        let sectionKey = "financial";
        const t = (title || "").toLowerCase();
        if (t.includes("rel")) sectionKey = "release";
        else if (t.includes("dato") || t.includes("falt") || t.includes("logist")) sectionKey = "logistics";
        else if (t.includes("crm") || t.includes("seg")) sectionKey = "crm";
        else if (t.includes("tent")) sectionKey = "tentative";

        handleOpenInternalReportModal(sectionKey);
      };

      const reportData = React.useMemo(() => {
        if (!internalReportModal) return null;

        const hotelLabel = selectedHotel === "guadiana"
          ? "Sercotel Guadiana"
          : selectedHotel === "cumbria"
          ? "Cumbria Spa & Hotel"
          : "Todos los Hoteles";

        const filterCom = (internalReportModal.filterComercial || "todos").toLowerCase();

        const filterAlerts = (list) => {
          if (!list) return [];
          if (filterCom === "todos") return list;
          return list.filter(a => {
            const com = (a.group?.Com_Comercial || "").toLowerCase();
            return com.includes(filterCom);
          });
        };

        const sectionDefs = [
          {
            id: "financial",
            title: "Alertas Financieras (Pagos y Vencimientos)",
            shortTitle: "Financieras",
            icon: "credit-card",
            colorClass: "rose",
            badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
            headerBg: "#ffe4e6",
            headerColor: "#9f1239",
            alerts: internalReportModal.sections.financial ? filterAlerts(columnsData.financialAlerts) : []
          },
          {
            id: "release",
            title: "Releases y Plazos Críticos",
            shortTitle: "Releases",
            icon: "clock",
            colorClass: "amber",
            badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
            headerBg: "#fef3c7",
            headerColor: "#92400e",
            alerts: internalReportModal.sections.release ? filterAlerts(columnsData.releaseAlerts) : []
          },
          {
            id: "logistics",
            title: "Datos Operativos Faltantes",
            shortTitle: "Datos Faltantes",
            icon: "file-warning",
            colorClass: "orange",
            badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
            headerBg: "#ffedd5",
            headerColor: "#9a3412",
            alerts: internalReportModal.sections.logistics ? filterAlerts(columnsData.logisticsAlerts) : []
          },
          {
            id: "crm",
            title: "Seguimientos CRM y Tareas Comerciales",
            shortTitle: "Seguimientos CRM",
            icon: "phone-call",
            colorClass: "indigo",
            badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
            headerBg: "#e0e7ff",
            headerColor: "#3730a3",
            alerts: internalReportModal.sections.crm ? filterAlerts(columnsData.crmAlerts) : []
          },
          {
            id: "tentative",
            title: "Tentativas Urgentes (< 25 días a llegada)",
            shortTitle: "Tentativas Urgentes",
            icon: "calendar-clock",
            colorClass: "violet",
            badgeColor: "bg-violet-100 text-violet-800 border-violet-200",
            headerBg: "#ede9fe",
            headerColor: "#5b21b6",
            alerts: internalReportModal.sections.tentative ? filterAlerts(columnsData.tentativeAlerts) : []
          }
        ];

        let totalAlerts = 0;
        let totalFinancialPending = 0;

        sectionDefs.forEach(s => {
          totalAlerts += s.alerts.length;
          if (s.id === "financial") {
            s.alerts.forEach(a => {
              const fin = getGroupFinancialInfo(a.group);
              totalFinancialPending += (fin.pending || 0);
            });
          }
        });

        return {
          hotelLabel,
          filterComercial: internalReportModal.filterComercial,
          sections: sectionDefs,
          totalAlerts,
          totalFinancialPending,
          dateStr: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
          timeStr: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        };
      }, [internalReportModal, columnsData, selectedHotel]);

      const generateInternalReportText = (rep) => {
        if (!rep) return "";
        const lines = [];
        lines.push("================================================================================");
        lines.push("INFORME INTERNO DE CONTROL OPERATIVO Y ALERTAS");
        lines.push(`Ámbito: ${rep.hotelLabel} | Fecha: ${rep.dateStr} ${rep.timeStr}`);
        lines.push(`Filtro Comercial: ${rep.filterComercial === "todos" ? "Todos los Comerciales" : rep.filterComercial}`);
        lines.push(`Total Alertas Activas: ${rep.totalAlerts}`);
        if (rep.totalFinancialPending > 0) {
          lines.push(`Total Importe Pendiente Reclamado: ${fmt(rep.totalFinancialPending)}`);
        }
        lines.push("================================================================================\n");

        lines.push("[RESUMEN POR SECCIONES]");
        rep.sections.forEach((sec, idx) => {
          lines.push(`  ${idx + 1}. ${sec.title}: ${sec.alerts.length} caso(s)`);
        });
        lines.push("");

        rep.sections.forEach((sec, sIdx) => {
          if (sec.alerts.length === 0) return;
          lines.push("--------------------------------------------------------------------------------");
          lines.push(`${sIdx + 1}. ${sec.title.toUpperCase()} (${sec.alerts.length})`);
          lines.push("--------------------------------------------------------------------------------");

          sec.alerts.forEach((alert) => {
            const g = alert.group || {};
            const resId = String(g.Reserva || g.Com_Id || "").replace(/^#/, "");
            const name = g["Nombre del Grupo"] || "Grupo sin nombre";
            const hotel = (g.Hotel_Asignado || g.Hotel || "").toLowerCase().includes("cumb") ? "Cumbria Spa & Hotel" : "Sercotel Guadiana";
            const com = g.Com_Comercial || "Sin asignar";
            const pax = g["Pax."] || g.Pax || 0;
            const entrada = formatDate(g.Entrada) || "---";
            const salida = formatDate(g.Salida) || "---";
            const fin = getGroupFinancialInfo(g);

            lines.push(`• [Reserva #${resId}] ${name.toUpperCase()}`);
            lines.push(`  Hotel: ${hotel} | Comercial: ${com} | Pax: ${pax}`);
            lines.push(`  Estancia: ${entrada} ➔ ${salida}`);

            if (sec.id === "financial" || sec.id === "release") {
              lines.push(`  Importes: Total: ${fmt(fin.total)} | Pagado: ${fmt(fin.paid)} | PENDIENTE: ${fmt(fin.pending)}`);
            }

            if (sec.id === "logistics" && alert.details) {
              lines.push(`  Faltante: ${alert.details.map(d => d.text).join(", ")}`);
            } else {
              lines.push(`  Alerta: ${alert.detail || alert.label}`);
            }
            lines.push("");
          });
        });

        lines.push("================================================================================");
        lines.push("Por favor gestionar las actuaciones correspondientes a la mayor brevedad.");
        lines.push("Dirección de Operaciones & Departamento de Administración");
        lines.push("================================================================================");

        return lines.join("\n");
      };

      const generateInternalReportHtml = (rep) => {
        if (!rep) return "";
        const sectionsHtml = rep.sections.filter(s => s.alerts.length > 0).map((sec) => {
          const rowsHtml = sec.alerts.map(alert => {
            const g = alert.group || {};
            const resId = String(g.Reserva || g.Com_Id || "").replace(/^#/, "");
            const name = g["Nombre del Grupo"] || "Grupo sin nombre";
            const isCumbria = (g.Hotel_Asignado || g.Hotel || "").toLowerCase().includes("cumb");
            const hotelName = isCumbria ? "Cumbria Spa & Hotel" : "Sercotel Guadiana";
            const com = g.Com_Comercial || "Sin asignar";
            const pax = g["Pax."] || g.Pax || 0;
            const entrada = formatDate(g.Entrada) || "---";
            const salida = formatDate(g.Salida) || "---";
            const fin = getGroupFinancialInfo(g);

            const alertDetailText = (sec.id === "logistics" && alert.details)
              ? alert.details.map(d => d.text).join(" • ")
              : (alert.detail || alert.label);

            return `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 12px; vertical-align: top; width: 85px;">
                  <span style="display: inline-block; background-color: #0f172a; color: #f8fafc; font-size: 11px; font-weight: 800; font-family: monospace; padding: 3px 7px; border-radius: 6px;">
                    #${resId}
                  </span>
                  <div style="font-size: 9.5px; color: #64748b; font-weight: 600; margin-top: 4px;">
                    ${hotelName.includes("Cumbria") ? "🏨 Cumbria" : "🏨 Guadiana"}
                  </div>
                </td>
                <td style="padding: 10px 12px; vertical-align: top;">
                  <div style="font-size: 12.5px; font-weight: 800; color: #0f172a;">
                    ${name}
                  </div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                    <strong>Estancia:</strong> ${entrada} ➔ ${salida} &nbsp;|&nbsp; <strong>Pax:</strong> ${pax}
                  </div>
                  <div style="margin-top: 5px; background-color: #f8fafc; border-left: 3px solid ${sec.headerColor}; padding: 4px 8px; border-radius: 0 4px 4px 0; font-size: 11.5px; font-weight: 600; color: #334155;">
                    ⚠️ ${alertDetailText}
                  </div>
                </td>
                <td style="padding: 10px 12px; vertical-align: top; width: 110px;">
                  <span style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 4px;">
                    👤 ${com}
                  </span>
                </td>
                ${sec.id === "financial" || sec.id === "release" ? `
                <td style="padding: 10px 12px; vertical-align: top; text-align: right; width: 130px;">
                  <div style="font-size: 10px; color: #64748b;">Total: ${fmt(fin.total)}</div>
                  <div style="font-size: 12.5px; font-weight: 800; color: #be123c; margin-top: 2px;">
                    Pend: ${fmt(fin.pending)}
                  </div>
                  <div style="font-size: 9.5px; color: #059669; font-weight: 600;">Abonado: ${fmt(fin.paid)}</div>
                </td>` : `
                <td style="padding: 10px 12px; vertical-align: top; text-align: right; width: 110px;">
                  <span style="font-size: 10.5px; font-weight: 700; color: #0284c7; background-color: #f0f9ff; padding: 3px 8px; border-radius: 6px; border: 1px solid #bae6fd;">
                    Requiere Acción
                  </span>
                </td>`}
              </tr>
            `;
          }).join("");

          return `
            <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
              <div style="background-color: ${sec.headerBg}; border-bottom: 2px solid ${sec.headerColor}; padding: 10px 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="font-size: 13px; font-weight: 800; color: ${sec.headerColor}; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${sec.title}
                    </td>
                    <td style="text-align: right; font-size: 11px; font-weight: 800; color: ${sec.headerColor};">
                      ${sec.alerts.length} caso(s)
                    </td>
                  </tr>
                </table>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-family: inherit;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">
                    <th style="padding: 7px 12px;">Localizador</th>
                    <th style="padding: 7px 12px;">Grupo & Requerimiento</th>
                    <th style="padding: 7px 12px;">Comercial</th>
                    <th style="padding: 7px 12px; text-align: right;">${sec.id === "financial" || sec.id === "release" ? "Importes" : "Estado"}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </div>
          `;
        }).join("");

        return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 760px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 22px 28px; color: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle;">
                <div style="display: inline-block; background-color: rgba(245,158,11,0.2); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; border-radius: 12px; margin-bottom: 6px;">
                  🔒 Control Interno Operativo
                </div>
                <div style="font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
                  Informe de Alertas Operativas y Actuaciones Críticas
                </div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 3px;">
                  Establecimiento: <strong style="color: #ffffff;">${rep.hotelLabel}</strong> &nbsp;•&nbsp; Generado: ${rep.dateStr} a las ${rep.timeStr}
                </div>
              </td>
              <td style="vertical-align: middle; text-align: right; width: 140px;">
                <div style="background-color: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 8px 12px; text-align: center;">
                  <div style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Total Alertas</div>
                  <div style="font-size: 22px; font-weight: 900; color: #fbbf24; line-height: 1.1;">${rep.totalAlerts}</div>
                </div>
              </td>
            </tr>
          </table>
        </div>

        ${rep.totalFinancialPending > 0 ? `
        <!-- Financial Alert Highlight Banner -->
        <div style="background-color: #fff1f2; border-bottom: 2px solid #fecdd3; padding: 12px 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 12px; font-weight: 800; color: #be123c;">
                💰 Total Pendiente de Cobro en Alertas Financieras:
              </td>
              <td style="text-align: right; font-size: 16px; font-weight: 900; color: #9f1239;">
                ${fmt(rep.totalFinancialPending)}
              </td>
            </tr>
          </table>
        </div>` : ''}

        <!-- Body Content -->
        <div style="padding: 24px 28px; background-color: #f8fafc;">
          ${sectionsHtml || `
            <div style="text-align: center; padding: 30px; color: #64748b; font-size: 13px; font-weight: 700;">
              ✅ No hay alertas activas en las secciones seleccionadas para este filtro.
            </div>
          `}
        </div>

        <!-- Footer -->
        <div style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 14px 28px; font-size: 11px; color: #64748b; text-align: center;">
          <strong>Nexus Groups Gold Edition</strong> • Módulo de Control Interno de Operaciones y Seguimiento Comercial
        </div>
      </div>
        `;
      };

      const handleCopyReportRichEmail = () => {
        if (!reportData) return;
        const htmlContent = generateInternalReportHtml(reportData);
        const plainText = internalReportModal?.customBody || generateInternalReportText(reportData);
        const fullPlain = `Para: ${internalReportModal?.emailTo || ""}\nAsunto: ${internalReportModal?.subject || ""}\n\n${plainText}`;

        if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
          try {
            const blobHtml = new Blob([htmlContent], { type: "text/html" });
            const blobText = new Blob([fullPlain], { type: "text/plain" });
            navigator.clipboard.write([
              new ClipboardItem({
                "text/html": blobHtml,
                "text/plain": blobText
              })
            ]).then(() => {
              setToastInfo("✨ ¡Informe visual copiado! Pégalo en Outlook o Gmail con formato y tablas.");
            }).catch(() => {
              navigator.clipboard.writeText(fullPlain).then(() => {
                setToastInfo("📋 Informe en texto copiado al portapapeles.");
              });
            });
          } catch (e) {
            navigator.clipboard.writeText(fullPlain).then(() => {
              setToastInfo("📋 Informe en texto copiado al portapapeles.");
            });
          }
        } else {
          navigator.clipboard.writeText(fullPlain).then(() => {
            setToastInfo("📋 Informe en texto copiado al portapapeles.");
          });
        }
      };

      const handleCopyReportText = () => {
        if (!reportData) return;
        const bodyText = internalReportModal?.customBody || generateInternalReportText(reportData);
        const fullPlain = `Para: ${internalReportModal?.emailTo || ""}\nAsunto: ${internalReportModal?.subject || ""}\n\n${bodyText}`;
        navigator.clipboard.writeText(fullPlain).then(() => {
          setToastInfo("📋 Texto del informe copiado al portapapeles.");
        }).catch(() => {
          setToastInfo("❌ Error al copiar texto.");
        });
      };

      const handleExecuteSendReport = () => {
        if (!reportData) return;
        const bodyText = internalReportModal?.customBody || generateInternalReportText(reportData);
        const to = internalReportModal?.emailTo || "comunicaciones@hotelguadiana.es";
        const sub = internalReportModal?.subject || `[CONTROL INTERNO] Resumen de Alertas Operativas - ${reportData.hotelLabel}`;

        const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailtoUrl;

        setToastInfo("🚀 Gestor de correo abierto con el informe interno por secciones.");
        setInternalReportModal(null);
      };

      const generateRichHtmlEmail = (data) => {
        if (!data) return "";
        const fin = data.fin || { total: 0, paid: 0, pending: 0 };
        const hasFin = (fin.total > 0 || fin.pending > 0);
        const isInternal = data.mode === "internal";
        
        return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
  <!-- Header Banner -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 28px; color: #ffffff;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="vertical-align: middle;">
          ${isInternal ? `
          <div style="display: inline-block; background-color: rgba(245,158,11,0.25); border: 1px solid rgba(245,158,11,0.45); color: #fbbf24; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; border-radius: 12px; margin-bottom: 6px;">
            🔒 Control Interno Operativo
          </div>` : ''}
          <div style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
            ${data.hotelOfficial}
          </div>
          <div style="font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">
            ${isInternal ? "Aviso a Comercial / Administración" : "Dpto. Reservas y Gestión de Grupos"}
          </div>
        </td>
        <td style="vertical-align: middle; text-align: right;">
          <span style="display: inline-block; background-color: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #f8fafc;">
            Ref #${data.resId}
          </span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Group Summary Bar -->
  <div style="background-color: #f8fafc; padding: 14px 28px; border-bottom: 1px solid #e2e8f0;">
    <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 3px;">
      ${data.grupoName}
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #64748b;">
      <tr>
        <td>
          <strong>Estancia:</strong> ${data.entrada || "---"} ➔ ${data.salida || "---"}
        </td>
        <td style="text-align: right;">
          <strong>Ocupación:</strong> ${data.pax || 0} pax &nbsp;|&nbsp; <strong>Comercial:</strong> ${data.comercial || "---"}
        </td>
      </tr>
    </table>
  </div>

  <!-- Content Container -->
  <div style="padding: 26px 28px; font-size: 13.5px; line-height: 1.65; color: #334155;">
    
    ${hasFin ? `
    <!-- Financial Metrics Grid -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 22px;">
      <tr>
        <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 8px; text-align: center; width: 33%;">
          <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;">Total Contratado</div>
          <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 3px;">${fmt(fin.total)}</div>
        </td>
        <td style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 8px; text-align: center; width: 33%;">
          <div style="font-size: 9px; font-weight: 800; color: #059669; text-transform: uppercase;">Abonado / Confirmado</div>
          <div style="font-size: 15px; font-weight: 800; color: #047857; margin-top: 3px;">${fmt(fin.paid)}</div>
        </td>
        <td style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 12px 8px; text-align: center; width: 34%;">
          <div style="font-size: 9px; font-weight: 800; color: #e11d48; text-transform: uppercase;">Pendiente de Cobro</div>
          <div style="font-size: 15px; font-weight: 800; color: #be123c; margin-top: 3px;">${fmt(fin.pending)}</div>
        </td>
      </tr>
    </table>` : ''}

    <!-- Callout Box -->
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 22px;">
      <div style="font-size: 10px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
        ${isInternal ? "Actuación Crítica Detectada" : "Situación / Requerimiento"}
      </div>
      <div style="font-size: 12.5px; font-weight: 600; color: #7f1d1d;">
        ${data.alert?.detail || "Revisión operativa de las condiciones acordadas."}
      </div>
    </div>

    <!-- Body text -->
    <div style="white-space: pre-line; margin-bottom: 22px; color: #334155; font-size: 13px; line-height: 1.65;">
      ${data.body}
    </div>

    <!-- Bank Details Card (Sólo si no es interno o si procede) -->
    ${(!isInternal && data.hotelIban) ? `
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 18px 22px; color: #ffffff; margin-top: 22px;">
      <div style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
        💳 Datos Oficiales para Transferencia Bancaria
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #f8fafc;">
        <tr>
          <td style="padding: 3px 0; color: #94a3b8; width: 115px;"><strong>Entidad:</strong></td>
          <td style="padding: 3px 0; font-weight: 700; color: #ffffff;">${data.hotelBank}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0; color: #94a3b8;"><strong>IBAN:</strong></td>
          <td style="padding: 3px 0; font-weight: 800; font-family: monospace; font-size: 13.5px; color: #38bdf8; letter-spacing: 1px;">${data.hotelIban}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0; color: #94a3b8;"><strong>Beneficiario:</strong></td>
          <td style="padding: 3px 0; font-weight: 700; color: #ffffff;">${data.hotelOfficial}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0; color: #94a3b8;"><strong>Concepto:</strong></td>
          <td style="padding: 3px 0; font-weight: 800; color: #facc15;">Reserva #${data.resId} - ${data.grupoName}</td>
        </tr>
      </table>
    </div>` : ''}

  </div>

  <!-- Footer -->
  <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 11px; color: #64748b; text-align: center;">
    <strong>${data.hotelOfficial}</strong> • ${isInternal ? "Sistema de Control Interno Operativo" : "Dpto. Reservas y Gestión de Grupos"} • Nexus Groups
  </div>
</div>`;
      };

      const handleOpenEmailModal = (alert, columnTitle, mode = "internal") => {
        const g = alert.group || {};
        const resId = String(g.Reserva || g.Com_Id || "").replace(/^#/, "");
        const grupoName = g["Nombre del Grupo"] || "Grupo sin nombre";
        const hotel = (g.Hotel_Asignado || g.Hotel || "").toLowerCase();
        const isCumbria = hotel.includes("cumb");
        const hotelOfficial = isCumbria ? "Cumbria Spa & Hotel" : "Sercotel Guadiana";
        const hotelBank = isCumbria ? "Caja Rural de Castilla-La Mancha" : "Globalcaja";
        const hotelIban = isCumbria ? "ES19 3081 0601 0850 0004 8966" : "ES30 3190 3953 1851 8526 3521";
        const hotelLogo = isCumbria ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg";

        const fin = getGroupFinancialInfo(g);
        const entrada = formatDate(g.Entrada);
        const salida = formatDate(g.Salida);
        const pax = g["Pax."] || g.Pax || 0;
        const comercial = g.Com_Comercial || "Sin asignar";

        // Detección inteligente de email del cliente
        let clientEmail = g.Com_Email_Contacto || g.Email || g.Fiscal_Email || "";
        if (!clientEmail) {
          const textToSearch = `${grupoName} ${g["Empresa/Agencia"] || ""}`;
          const match = textToSearch.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (match) clientEmail = match[0];
        }

        // Email del comercial asignado o administración por defecto
        const staffEmail = getStaffEmail(comercial) || "comunicaciones@hotelguadiana.es";

        const isFinanciera = columnTitle.toLowerCase().includes("financ");
        const isRelease = columnTitle.toLowerCase().includes("release");
        const isDatos = columnTitle.toLowerCase().includes("dato");
        const isCrm = columnTitle.toLowerCase().includes("crm") || columnTitle.toLowerCase().includes("seguimiento");

        let internalSubject = `[CONTROL INTERNO] ${columnTitle} - Reserva #${resId} (${grupoName}) - ${hotelOfficial}`;
        let internalBody = `PARA: ${comercial} / Administración
ASUNTO: Control Interno - ${columnTitle}
ESTABLECIMIENTO: ${hotelOfficial}

DATOS DE LA RESERVA:
═══════════════════════════════════════════════════════════
• Localizador:    #${resId}
• Grupo:          ${grupoName}
• Estancia:       ${entrada || "---"} ➔ ${salida || "---"}
• Ocupación:      ${pax} personas
• Comercial:      ${comercial}
• Email Cliente:  ${clientEmail || "No especificado"}

ACTUACIÓN REQUERIDA (${columnTitle.toUpperCase()}):
═══════════════════════════════════════════════════════════
${alert.detail || "Revisión operativa de la situación acordada."}

ESTADO ECONÓMICO:
═══════════════════════════════════════════════════════════
• Total Contratado:  ${fmt(fin.total)}
• Abonado / Confirm: ${fmt(fin.paid)}
• PENDIENTE:         ${fmt(fin.pending)}

Por favor revisar con urgencia las actuaciones necesarias para mantener la operativa al día.`;

        let clientSubject = "";
        let clientBody = "";

        if (isFinanciera) {
          clientSubject = `Recordatorio de Pago Pendiente - Reserva #${resId} (${grupoName}) - ${hotelOfficial}`;
          clientBody = `Estimado/a cliente,\n\nNos ponemos en contacto desde el Departamento de Reservas y Grupos de ${hotelOfficial} en relación a la reserva del grupo "${grupoName}" (Localizador: #${resId}), con estancia prevista del ${entrada || "---"} al ${salida || "---"}.\n\n═══════════════════════════════════════════════════════════\nESTADO ECONÓMICO DE LA RESERVA\n═══════════════════════════════════════════════════════════\n• Importe Total Contratado:      ${fmt(fin.total)}\n• Importe Abonado y Confirmado:  ${fmt(fin.paid)}\n• Importe Pendiente de Pago:     ${fmt(fin.pending)}\n\nDetalle del vencimiento pendiente:\n${alert.detail || "Hito de pago pendiente según las condiciones pactadas."}\n\nCon el fin de mantener la reserva debidamente garantizada y confirmada en nuestro sistema, le rogamos proceda a la regularización del importe pendiente a la mayor brevedad posible.\n\n═══════════════════════════════════════════════════════════\nDATOS OFICIALES PARA TRANSFERENCIA BANCARIA\n═══════════════════════════════════════════════════════════\n• Entidad Bancaria:        ${hotelBank}\n• IBAN:                    ${hotelIban}\n• Beneficiario:            ${hotelOfficial}\n• Concepto imprescindible: Reserva #${resId} - ${grupoName}\n\nUna vez realizada la transferencia, le agradeceríamos que nos remita el correspondiente justificante bancario respondiendo a este correo.\n\nAtentamente,\n${comercial}\n${hotelOfficial}`;
        } else if (isRelease) {
          clientSubject = `Aviso de Plazo / Release - Reserva #${resId} (${grupoName}) - ${hotelOfficial}`;
          clientBody = `Estimado/a cliente,\n\nNos ponemos en contacto desde ${hotelOfficial} con respecto a la reserva del grupo "${grupoName}" (Ref: #${resId}), cuya fecha de entrada está fijada para el ${entrada || "próximamente"}.\n\nSituación del plazo: ${alert.detail}\nImporte pendiente: ${fmt(fin.pending)}\n\nA fin de mantener el bloqueo de habitaciones solicitado y no liberar automáticamente las plazas, le rogamos nos confirme el estado final del grupo y proceda al trámite de garantía antes de la fecha límite.\n\nAtentamente,\n${comercial}\n${hotelOfficial}`;
        } else if (isDatos) {
          const missingItems = alert.details ? alert.details.map(d => `• ${d.text}`).join("\n") : `• ${alert.detail}`;
          clientSubject = `Solicitud de Documentación Operativa - Reserva #${resId} (${grupoName}) - ${hotelOfficial}`;
          clientBody = `Estimado/a cliente,\n\nNos ponemos en contacto desde el Departamento de Reservas de ${hotelOfficial} para ultimar los preparativos de la llegada del grupo "${grupoName}" (Localizador #${resId}), con fecha de entrada el ${entrada || "próximamente"}.\n\nINFORMACIÓN PENDIENTE:\n${missingItems}\n\nLe rogamos nos haga llegar estos datos a la mayor brevedad posible.\n\nAtentamente,\n${comercial}\n${hotelOfficial}`;
        } else if (isCrm) {
          clientSubject = `Seguimiento de Propuesta para Grupo - Reserva #${resId} (${grupoName}) - ${hotelOfficial}`;
          clientBody = `Estimado/a cliente,\n\nLe escribimos desde ${hotelOfficial} para dar seguimiento a la propuesta para el grupo "${grupoName}" (Ref: #${resId}), con estancia prevista del ${entrada || "---"} al ${salida || "---"}.\n\nNos gustaría conocer si han tenido ocasión de valorar las condiciones o si necesitan realizar alguna modificación.\n\nAtentamente,\n${comercial}\n${hotelOfficial}`;
        } else {
          clientSubject = `Gestión Urgente: Próxima Llegada - Reserva #${resId} (${grupoName}) - ${hotelOfficial}`;
          clientBody = `Estimado/a cliente,\n\nNos ponemos en contacto desde ${hotelOfficial} en relación a la reserva tentativa para el grupo "${grupoName}" (Ref: #${resId}), con fecha de entrada muy próxima (${entrada || "en los próximos días"}).\n\nSituación actual: ${alert.detail}\n\nDada la cercanía de la fecha de llegada, le rogamos nos confirme en firme si continuarán con la reserva antes de liberar el bloqueo de plazas.\n\nAtentamente,\n${comercial}\n${hotelOfficial}`;
        }

        const isInternalMode = mode === "internal";

        setEmailModalTab("preview");
        setSelectedEmailAlert({
          alert,
          columnTitle,
          mode: isInternalMode ? "internal" : "client",
          group: g,
          resId,
          grupoName,
          hotelOfficial,
          hotelLogo,
          hotelBank,
          hotelIban,
          fin,
          entrada,
          salida,
          pax,
          comercial,
          clientEmail,
          staffEmail,
          emailTo: isInternalMode ? staffEmail : clientEmail,
          subject: isInternalMode ? internalSubject : clientSubject,
          body: isInternalMode ? internalBody : clientBody,
          internalSubject,
          internalBody,
          clientSubject,
          clientBody
        });
      };

      const handleExecuteOpenEmail = (data) => {
        if (!data) return;
        const mailtoUrl = `mailto:${encodeURIComponent(data.emailTo || "")}?subject=${encodeURIComponent(data.subject || "")}&body=${encodeURIComponent(data.body || "")}`;
        
        const updated = { ...notifiedAlerts, [data.resId]: new Date().toISOString() };
        setNotifiedAlerts(updated);
        try {
          localStorage.setItem("nexus_notified_alerts", JSON.stringify(updated));
        } catch (e) {}

        window.location.href = mailtoUrl;

        setToastInfo(`✅ Gestor de correo abierto para #${data.resId} (${data.grupoName}). Notificación confirmada.`);
        setSelectedEmailAlert(null);
      };

      const handleCopyRichEmail = (data) => {
        if (!data) return;
        const htmlContent = generateRichHtmlEmail(data);
        const plainText = `Para: ${data.emailTo || "(No especificado)"}\nAsunto: ${data.subject}\n\n${data.body}`;

        const markAsNotified = () => {
          const updated = { ...notifiedAlerts, [data.resId]: new Date().toISOString() };
          setNotifiedAlerts(updated);
          try {
            localStorage.setItem("nexus_notified_alerts", JSON.stringify(updated));
          } catch (e) {}
        };

        if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
          try {
            const blobHtml = new Blob([htmlContent], { type: "text/html" });
            const blobText = new Blob([plainText], { type: "text/plain" });
            navigator.clipboard.write([
              new ClipboardItem({
                "text/html": blobHtml,
                "text/plain": blobText
              })
            ]).then(() => {
              markAsNotified();
              setToastInfo(`✨ ¡Plantilla visual copiada! Pégala directamente en Outlook o Gmail con formato y diseño.`);
            }).catch((err) => {
              console.warn("ClipboardItem write error, falling back to text:", err);
              navigator.clipboard.writeText(plainText).then(() => {
                markAsNotified();
                setToastInfo(`📋 Texto copiado al portapapeles y registrado para #${data.resId}.`);
              });
            });
          } catch (err) {
            navigator.clipboard.writeText(plainText).then(() => {
              markAsNotified();
              setToastInfo(`📋 Texto copiado al portapapeles y registrado para #${data.resId}.`);
            });
          }
        } else {
          navigator.clipboard.writeText(plainText).then(() => {
            markAsNotified();
            setToastInfo(`📋 Texto copiado al portapapeles y registrado para #${data.resId}.`);
          });
        }
      };

      const handleCopyEmailText = (data) => {
        if (!data) return;
        const fullText = `Para: ${data.emailTo || "(No especificado)"}\nAsunto: ${data.subject}\n\n${data.body}`;
        navigator.clipboard.writeText(fullText).then(() => {
          const updated = { ...notifiedAlerts, [data.resId]: new Date().toISOString() };
          setNotifiedAlerts(updated);
          try {
            localStorage.setItem("nexus_notified_alerts", JSON.stringify(updated));
          } catch (e) {}

          setToastInfo(`📋 Texto copiado al portapapeles y registrado para #${data.resId}.`);
        }).catch(() => {
          setToastInfo("❌ No se pudo copiar al portapapeles automáticamente.");
        });
      };

      const handleCopyIban = (iban) => {
        if (!iban) return;
        const clean = iban.replace(/\s+/g, "");
        navigator.clipboard.writeText(clean).then(() => {
          setToastInfo(`💳 IBAN copiado al portapapeles: ${clean}`);
        }).catch(() => {
          setToastInfo(`💳 IBAN: ${iban}`);
        });
      };

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
          },
          violet: {
            bg: "bg-violet-50/50",
            border: "border-violet-100",
            text: "text-violet-800",
            iconBg: "bg-violet-100 text-violet-600",
            bubble: "bg-violet-600 text-white",
            cardHover: "hover:border-violet-300 hover:shadow-violet-100/50"
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
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenSectionReportModal(title)}
                  disabled={alerts.length === 0}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    alerts.length === 0
                      ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400"
                      : "bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 shadow-2xs hover:shadow-xs border border-slate-200/80 hover:border-slate-400"
                  }`}
                  title={`Generar informe interno de la sección ${title}`}
                >
                  <LucideIcon name="mail" size={11} className="text-slate-600" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${theme.bubble}`}>
                  {alerts.length}
                </span>
              </div>
            </div>

            {/* Tarjetas de Alerta */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar pr-1">
              {alerts.map((alert, idx) => {
                const g = alert.group;
                const isCumbria = (g.Hotel_Asignado || g.Hotel || "").toLowerCase().includes("cumb");
                
                const entryDate = parseDate(g.Entrada);
                let daysToArrival = null;
                if (entryDate && !isNaN(entryDate.getTime())) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
                  daysToArrival = Math.round((entryDay - today) / (1000 * 60 * 60 * 24));
                }

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      localStorage.setItem("nexus_return_reserva", g.Reserva);
                      window.location.href = `Gestion-de-Grupos.html?reserva=${encodeURIComponent(g.Reserva)}`;
                    }}
                    className={`bg-white p-4 rounded-[1.5rem] border border-slate-100/80 cursor-pointer shadow-sm hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ${theme.cardHover} flex flex-col gap-2 relative group`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <img
                        src={isCumbria ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg"}
                        alt="Hotel Logo"
                        className="h-4 max-w-[80px] object-contain opacity-70 group-hover:opacity-100 transition-opacity mt-0.5"
                      />
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5">
                          {daysToArrival !== null && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap leading-none ${
                              daysToArrival < 0
                                ? "bg-slate-100 text-slate-500 border border-slate-200"
                                : daysToArrival === 0
                                ? "bg-rose-600 text-white font-black animate-pulse"
                                : daysToArrival === 1
                                ? "bg-rose-500 text-white font-black"
                                : daysToArrival <= 3
                                ? "bg-rose-50 text-rose-700 border border-rose-200 font-black"
                                : daysToArrival <= 7
                                ? "bg-amber-50 text-amber-700 border border-amber-200 font-bold"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold"
                            }`}>
                              {daysToArrival < 0
                                ? `Llegó hace ${Math.abs(daysToArrival)}d`
                                : daysToArrival === 0
                                ? "¡Llega hoy!"
                                : daysToArrival === 1
                                ? "Falta 1 día"
                                : `Faltan ${daysToArrival} días`}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                            {formatDate(g.Entrada)}
                          </span>
                        </div>
                      </div>
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

                    {/* Botón para Enviar Notificación por Email */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEmailModal(alert, title);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider border transition-all duration-200 shadow-2xs group/btn cursor-pointer ${
                          notifiedAlerts[String(g.Reserva || g.Com_Id || "").replace(/^#/, "")]
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 border-slate-200/80 hover:border-slate-900 hover:shadow-xs"
                        }`}
                        title="Redactar y abrir email con detalles confirmados y pagos"
                      >
                        <LucideIcon
                          name={notifiedAlerts[String(g.Reserva || g.Com_Id || "").replace(/^#/, "")] ? "check-circle" : "mail"}
                          size={12}
                          className={notifiedAlerts[String(g.Reserva || g.Com_Id || "").replace(/^#/, "")] ? "text-emerald-600" : "text-slate-500 group-hover/btn:text-white transition-colors"}
                        />
                        <span>{notifiedAlerts[String(g.Reserva || g.Com_Id || "").replace(/^#/, "")] ? "Notificado" : "Enviar Email"}</span>
                      </button>
                      <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                        #{g.Reserva}
                      </span>
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

          {/* Barra de Controles: Selector de Hotel y Botón de Informe Interno */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Selector de Hotel */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-[2rem] border border-slate-200/50 w-fit gap-1.5 shadow-sm">
              {[
                { id: "todos", label: "Todos los Hoteles", icon: "hotel" },
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

            {/* Botón Principal: Informe Interno de Alertas para Comerciales / Administración */}
            <button
              type="button"
              onClick={() => handleOpenInternalReportModal()}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-[2rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-slate-900/20 hover:shadow-xl hover:scale-102 active:scale-98 transition-all cursor-pointer border border-indigo-500/30"
              title="Generar informe de control interno con todas las alertas clasificadas por secciones para enviar a los comerciales o administración"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <LucideIcon name="mail" size={13} />
              </div>
              <span>Enviar Informe Interno de Alertas</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                {columnsData.financialAlerts.length +
                  columnsData.releaseAlerts.length +
                  columnsData.logisticsAlerts.length +
                  columnsData.crmAlerts.length +
                  columnsData.tentativeAlerts.length}
              </span>
            </button>
          </div>

          {/* Grid de Alertas - 5 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 items-start">
            <AlertColumn
              title="Alertas Financieras"
              icon="credit-card"
              colorClass="rose"
              alerts={columnsData.financialAlerts}
            />
            <AlertColumn
              title="Releases y Plazos"
              icon="clock"
              colorClass="amber"
              alerts={columnsData.releaseAlerts}
            />
            <AlertColumn
              title="Datos Faltantes"
              icon="file-warning"
              colorClass="orange"
              alerts={columnsData.logisticsAlerts}
            />
            <AlertColumn
              title="Seguimientos CRM"
              icon="phone-call"
              colorClass="indigo"
              alerts={columnsData.crmAlerts}
            />
            <AlertColumn
              title="Tentativas Urgentes"
              icon="calendar-clock"
              colorClass="violet"
              alerts={columnsData.tentativeAlerts}
            />
          </div>

          {/* Toast Notification Flotante */}
          {toastInfo && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in max-w-md">
              <LucideIcon name="check-circle" size={18} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-slate-100 leading-snug">{toastInfo}</span>
              <button
                onClick={() => setToastInfo(null)}
                className="text-slate-400 hover:text-white ml-auto text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Modal de Notificación de Alerta por Email */}
          {selectedEmailAlert && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
              onClick={() => setSelectedEmailAlert(null)}
            >
              <div
                className="bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-auto max-h-[94vh] animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Cabecera del Modal con Selector de Pestañas */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
                      <LucideIcon name="mail" size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black tracking-wide uppercase text-white">
                          Notificación Oficial
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                          {selectedEmailAlert.columnTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {selectedEmailAlert.hotelOfficial} • Reserva #{selectedEmailAlert.resId} ({selectedEmailAlert.grupoName})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tab Switcher */}
                    <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setEmailModalTab("preview")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                          emailModalTab === "preview"
                            ? "bg-white text-slate-900 shadow-md scale-102"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <LucideIcon name="eye" size={13} />
                        <span>Vista Diseñada</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmailModalTab("edit")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                          emailModalTab === "edit"
                            ? "bg-white text-slate-900 shadow-md scale-102"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <LucideIcon name="edit-3" size={13} />
                        <span>Modo Editor</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEmailAlert(null)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
                      title="Cerrar modal"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Barra de Metadatos: Destinatario, Modo y Asunto */}
                <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3 space-y-2.5">
                  {/* Selector de Modo: Control Interno vs Notificación Cliente */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmailAlert({
                            ...selectedEmailAlert,
                            mode: "internal",
                            emailTo: selectedEmailAlert.staffEmail || "comunicaciones@hotelguadiana.es",
                            subject: selectedEmailAlert.internalSubject,
                            body: selectedEmailAlert.internalBody
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          selectedEmailAlert.mode === "internal"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        🔒 Control Interno (Comercial/Admin)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmailAlert({
                            ...selectedEmailAlert,
                            mode: "client",
                            emailTo: selectedEmailAlert.clientEmail || "",
                            subject: selectedEmailAlert.clientSubject,
                            body: selectedEmailAlert.clientBody
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          selectedEmailAlert.mode === "client"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        ✉️ Redactar al Cliente
                      </button>
                    </div>

                    {/* Chips de Destinatarios Rápidos */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] font-black uppercase text-slate-400">Para:</span>
                      {[
                        { label: "🏢 Admin", email: "comunicaciones@hotelguadiana.es" },
                        { label: "👤 Sergio", email: "ssanchez@hotelguadiana.es" },
                        { label: "👤 Natalio", email: "comunicaciones@hotelguadiana.es" },
                        ...(selectedEmailAlert.comercial && selectedEmailAlert.comercial !== "Sin asignar" ? [{ label: `👤 ${selectedEmailAlert.comercial}`, email: selectedEmailAlert.staffEmail }] : []),
                        ...(selectedEmailAlert.clientEmail ? [{ label: "🏢 Cliente", email: selectedEmailAlert.clientEmail }] : [])
                      ].map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => setSelectedEmailAlert({ ...selectedEmailAlert, emailTo: chip.email })}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                            selectedEmailAlert.emailTo === chip.email
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          Destinatario (Para):
                        </span>
                        {!selectedEmailAlert.emailTo && (
                          <span className="text-[9px] font-bold text-rose-600 animate-pulse">
                            ⚠️ Email requerido
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          value={selectedEmailAlert.emailTo}
                          onChange={(e) => setSelectedEmailAlert({ ...selectedEmailAlert, emailTo: e.target.value })}
                          placeholder="ejemplo@hotelguadiana.es"
                          className={`w-full pl-8 pr-3 py-1.5 bg-white border rounded-xl text-xs font-bold outline-none transition-all ${
                            !selectedEmailAlert.emailTo
                              ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:bg-white"
                              : "border-slate-200 text-slate-800 focus:border-indigo-500"
                          }`}
                        />
                        <LucideIcon name="mail" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div className="sm:col-span-7">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                        Asunto del Correo:
                      </span>
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedEmailAlert.subject}
                          onChange={(e) => setSelectedEmailAlert({ ...selectedEmailAlert, subject: e.target.value })}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                        />
                        <LucideIcon name="file-text" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido Dinámico según Pestaña */}
                {emailModalTab === "preview" ? (
                  <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-100/70">
                    {/* Contenedor tipo Carta Ejecutiva */}
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200/90 overflow-hidden">
                      
                      {/* Cabecera Oficial del Documento */}
                      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 sm:p-6 text-white relative">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {selectedEmailAlert.hotelLogo && (
                              <img
                                src={selectedEmailAlert.hotelLogo}
                                alt="Logo Hotel"
                                className="h-9 max-w-[120px] object-contain bg-white/95 px-2 py-1 rounded-xl shadow-xs"
                              />
                            )}
                            <div>
                              <div className="text-base sm:text-lg font-black uppercase tracking-wide text-white">
                                {selectedEmailAlert.hotelOfficial}
                              </div>
                              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                Departamento de Reservas y Grupos
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="inline-block bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-white shadow-xs">
                              Ref #{selectedEmailAlert.resId}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-medium">
                              {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Franja de Información del Grupo */}
                      <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 text-sm">{selectedEmailAlert.grupoName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {selectedEmailAlert.pax} pax
                          </span>
                        </div>
                        <div className="text-slate-500 font-semibold text-[11px]">
                          Estancia: <strong className="text-slate-700">{selectedEmailAlert.entrada || "---"}</strong> ➔ <strong className="text-slate-700">{selectedEmailAlert.salida || "---"}</strong>
                        </div>
                      </div>

                      {/* Cuerpo de la Carta */}
                      <div className="p-6 space-y-5">
                        
                        {/* Tarjetas KPI Financieras (si aplica) */}
                        {(selectedEmailAlert.fin.total > 0 || selectedEmailAlert.fin.pending > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Presupuesto</span>
                              <span className="text-base font-black text-slate-800 block mt-0.5">{fmt(selectedEmailAlert.fin.total)}</span>
                              <span className="text-[9px] font-medium text-slate-400 block mt-0.5">Contratado</span>
                            </div>
                            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Abonado / Confirmado</span>
                                <LucideIcon name="check-circle" size={11} className="text-emerald-600" />
                              </div>
                              <span className="text-base font-black text-emerald-700 block mt-0.5">{fmt(selectedEmailAlert.fin.paid)}</span>
                              <span className="text-[9px] font-medium text-emerald-600/80 block mt-0.5">Cobros registrados</span>
                            </div>
                            <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200 shadow-2xs text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider">Pendiente de Cobro</span>
                                <LucideIcon name="alert-triangle" size={11} className="text-rose-600" />
                              </div>
                              <span className="text-base font-black text-rose-700 block mt-0.5">{fmt(selectedEmailAlert.fin.pending)}</span>
                              <span className="text-[9px] font-bold text-rose-600/80 block mt-0.5">Vencimiento pendiente</span>
                            </div>
                          </div>
                        )}

                        {/* Callout de Situación Notificada */}
                        <div className="bg-rose-50/70 border-l-4 border-rose-500 rounded-r-2xl p-3.5 flex items-start gap-3">
                          <LucideIcon name="alert-circle" size={16} className="text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">
                              Situación Requerida
                            </span>
                            <p className="text-xs font-bold text-rose-900 mt-0.5 leading-relaxed">
                              {selectedEmailAlert.alert.detail}
                            </p>
                          </div>
                        </div>

                        {/* Previsualización del Texto Redactado */}
                        <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-normal">
                          {selectedEmailAlert.body}
                        </div>

                        {/* Tarjeta Ejecutiva de Datos Bancarios */}
                        {selectedEmailAlert.hotelIban && (
                          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-700">
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <LucideIcon name="credit-card" size={16} className="text-sky-400" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-sky-300">
                                  Datos Oficiales para Transferencia Bancaria
                                </span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                                {selectedEmailAlert.hotelBank}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Código IBAN Oficial</span>
                                  <span className="font-mono font-black text-sm sm:text-base text-sky-400 tracking-wider">
                                    {selectedEmailAlert.hotelIban}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyIban(selectedEmailAlert.hotelIban)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white font-bold text-[10px] border border-sky-400/30 transition-all cursor-pointer shrink-0"
                                >
                                  <LucideIcon name="copy" size={12} />
                                  <span>Copiar IBAN</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Beneficiario</span>
                                  <span className="font-bold text-slate-200">{selectedEmailAlert.hotelOfficial}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Concepto Imprescindible</span>
                                  <span className="font-bold text-amber-300">Reserva #{selectedEmailAlert.resId} - {selectedEmailAlert.grupoName}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pie y Firma Oficial */}
                        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
                          <div>
                            <div className="font-bold text-slate-800">{selectedEmailAlert.comercial}</div>
                            <div className="text-[11px] text-slate-400">Departamento de Reservas y Grupos • {selectedEmailAlert.hotelOfficial}</div>
                          </div>
                          <div className="text-right text-[10px] text-slate-400 font-bold">
                            Nexus Groups Gold Edition
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Editor del Cuerpo del Mensaje
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Puedes personalizar o redactar libremente cualquier parte del correo antes de abrirlo o copiarlo.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                        Formato Texto con Separadores
                      </span>
                    </div>

                    <textarea
                      rows={14}
                      value={selectedEmailAlert.body}
                      onChange={(e) => setSelectedEmailAlert({ ...selectedEmailAlert, body: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-[12px] leading-relaxed text-slate-800 font-medium font-mono outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none custom-scrollbar"
                      placeholder="Redacta el mensaje aquí..."
                    />
                  </div>
                )}

                {/* Acciones del Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopyRichEmail(selectedEmailAlert)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 font-black text-xs transition-all shadow-2xs cursor-pointer"
                      title="Copia el correo con diseño para pegar en Outlook o Gmail"
                    >
                      <LucideIcon name="sparkles" size={14} className="text-indigo-600" />
                      <span>Copiar Formato Visual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyEmailText(selectedEmailAlert)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                      title="Copia el texto plano con separadores"
                    >
                      <LucideIcon name="copy" size={14} className="text-slate-500" />
                      <span>Copiar Texto</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedEmailAlert(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteOpenEmail(selectedEmailAlert)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer w-full sm:w-auto"
                    >
                      <LucideIcon name="send" size={14} />
                      <span>Abrir en Gestor de Correo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Informe Interno de Control de Operaciones por Secciones */}
          {internalReportModal && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
              onClick={() => setInternalReportModal(null)}
            >
              <div
                className="bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-auto max-h-[95vh] animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Cabecera del Modal */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-inner shrink-0">
                      <LucideIcon name="mail" size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black tracking-wide uppercase text-white">
                          Informe Interno de Control Operativo
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                          {reportData?.totalAlerts || 0} Alertas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {reportData?.hotelLabel} • Destinado a Comerciales y Administración
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Tab Switcher */}
                    <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setInternalReportTab("preview")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                          internalReportTab === "preview"
                            ? "bg-white text-slate-900 shadow-md scale-102"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <LucideIcon name="eye" size={13} />
                        <span>Vista Diseñada</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (internalReportModal.customBody === null && reportData) {
                            setInternalReportModal({
                              ...internalReportModal,
                              customBody: generateInternalReportText(reportData)
                            });
                          }
                          setInternalReportTab("edit");
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                          internalReportTab === "edit"
                            ? "bg-white text-slate-900 shadow-md scale-102"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        <LucideIcon name="edit-3" size={13} />
                        <span>Modo Editor</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInternalReportModal(null)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
                      title="Cerrar modal"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Barra de Destinatarios y Asunto */}
                <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3 space-y-2.5">
                  {/* Fila 1: Presets rápidos de destinatarios */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1">
                      Destinatarios Rápidos:
                    </span>
                    {STAFF_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInternalReportModal({ ...internalReportModal, emailTo: p.email })}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          internalReportModal.emailTo === p.email
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={p.desc}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Fila 2: Inputs de Para y Asunto */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5">
                      <div className="relative">
                        <input
                          type="text"
                          value={internalReportModal.emailTo}
                          onChange={(e) => setInternalReportModal({ ...internalReportModal, emailTo: e.target.value })}
                          placeholder="comunicaciones@hotelguadiana.es"
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                        />
                        <LucideIcon name="mail" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>

                    <div className="sm:col-span-7">
                      <div className="relative">
                        <input
                          type="text"
                          value={internalReportModal.subject}
                          onChange={(e) => setInternalReportModal({ ...internalReportModal, subject: e.target.value })}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
                        />
                        <LucideIcon name="file-text" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Fila 3: Filtros de Secciones y Comercial */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2.5">
                    {/* Checkboxes de Secciones */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1">
                        Secciones a Incluir:
                      </span>
                      {[
                        { key: "financial", label: "💳 Financieras", count: columnsData.financialAlerts.length, color: "text-rose-700 bg-rose-50 border-rose-200" },
                        { key: "release", label: "⏰ Releases", count: columnsData.releaseAlerts.length, color: "text-amber-700 bg-amber-50 border-amber-200" },
                        { key: "logistics", label: "📄 Datos Faltantes", count: columnsData.logisticsAlerts.length, color: "text-orange-700 bg-orange-50 border-orange-200" },
                        { key: "crm", label: "📞 CRM", count: columnsData.crmAlerts.length, color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
                        { key: "tentative", label: "⏱️ Tentativas", count: columnsData.tentativeAlerts.length, color: "text-violet-700 bg-violet-50 border-violet-200" }
                      ].map(sec => {
                        const isChecked = internalReportModal.sections[sec.key];
                        return (
                          <button
                            key={sec.key}
                            type="button"
                            onClick={() => setInternalReportModal({
                              ...internalReportModal,
                              customBody: null,
                              sections: {
                                ...internalReportModal.sections,
                                [sec.key]: !isChecked
                              }
                            })}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              isChecked
                                ? `${sec.color} font-black shadow-2xs`
                                : "bg-slate-100 text-slate-400 border-slate-200 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <span>{isChecked ? "☑" : "☐"}</span>
                            <span>{sec.label}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded-full bg-white/70">
                              {sec.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Filtro de Comercial */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Comercial:
                      </span>
                      <select
                        value={internalReportModal.filterComercial}
                        onChange={(e) => setInternalReportModal({
                          ...internalReportModal,
                          filterComercial: e.target.value,
                          customBody: null
                        })}
                        className="text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="todos">Todos los Comerciales</option>
                        {availableCommercials.map((com, cIdx) => (
                          <option key={cIdx} value={com}>
                            {com}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contenido Dinámico: Preview o Editor */}
                {internalReportTab === "preview" ? (
                  <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-100/70">
                    {/* Render visual del HTML del informe */}
                    <div
                      className="max-w-3xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: generateInternalReportHtml(reportData) }}
                    />
                  </div>
                ) : (
                  <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Editor del Informe de Control Interno
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Edita libremente el texto del informe antes de copiarlo o abrirlo en tu gestor de correo.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInternalReportModal({
                          ...internalReportModal,
                          customBody: generateInternalReportText(reportData)
                        })}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        Restablecer Texto Original
                      </button>
                    </div>

                    <textarea
                      rows={16}
                      value={internalReportModal.customBody !== null ? internalReportModal.customBody : (generateInternalReportText(reportData) || "")}
                      onChange={(e) => setInternalReportModal({ ...internalReportModal, customBody: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-[12px] leading-relaxed text-slate-800 font-medium font-mono outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none custom-scrollbar"
                      placeholder="Generando informe..."
                    />
                  </div>
                )}

                {/* Acciones del Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    <button
                      type="button"
                      onClick={handleCopyReportRichEmail}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 font-black text-xs transition-all shadow-2xs cursor-pointer"
                      title="Copia el informe con diseño y tablas de colores para pegar directamente en Outlook o Gmail"
                    >
                      <LucideIcon name="sparkles" size={14} className="text-indigo-600" />
                      <span>Copiar Formato Visual</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyReportText}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                      title="Copia el texto estructurado del informe"
                    >
                      <LucideIcon name="copy" size={14} className="text-slate-500" />
                      <span>Copiar Texto</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setInternalReportModal(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteSendReport}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer w-full sm:w-auto"
                      title="Abre tu gestor de correo nativo (Outlook, Thunderbird, etc.) con el informe"
                    >
                      <LucideIcon name="send" size={14} />
                      <span>Abrir en Gestor de Correo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
        const res = String(group["Reserva"] || "").toUpperCase();
        const uid = String(group.uid || group.id || "").toUpperCase();
        const inSt = String(group["Com_Estado_Interno"] || "").toUpperCase();
        const ext = String(group["Estado"] || "").toUpperCase();
        const seg = String(group["Segment."] || "").toUpperCase();
        const isBudget = (group.isBudget === true) || res.startsWith("PRES-") || uid.startsWith("PRES-") || ext.includes("PRESUP") || inSt.includes("PRESUP") || seg.includes("PRESUP");
        if (isBudget && (inSt.includes("CADUC") || inSt.includes("DESESTIM") || inSt.includes("CANCEL") || inSt.includes("ANUL") || inSt.includes("BAJA") || ext.includes("CADUC") || ext.includes("DESESTIM") || ext.includes("CANCEL") || ext.includes("ANUL") || ext.includes("BAJA"))) {
          return false;
        }

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
          s.includes("DESESTIMADO") ||
          s.includes("CADUC")
        )
          return {
            label: s.includes("CADUC") ? "Caducado" : (s.includes("CANC") ? "Cancelado" : "Desestimado"),
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

          const isCredito = isCreditoGroup(g);
          const isConfirmed = ["CONFIRM", "OK", "GARANT", "RESERVA", "GRUPO"].some(s => status.includes(s));
          const fin = getGroupFinancialInfo(g);
          const totalAmt = fin.total;
          const paidAmt = fin.paid;
          const pendingAmt = fin.pending;
          const needsReleaseCheck = !isConfirmed && (!isCredito && pendingAmt > 0.1);

          // Alert 1: Release Urgente (< 7 días)
          if (needsReleaseCheck) {
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

          // Alert 3: Pagos Pendientes (ignorar si es crédito)
          if (!isCredito) {
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
          }

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

              const isCredito = isCreditoGroup(g);
              const isConfirmed = ["CONFIRM", "OK", "GARANT", "RESERVA", "GRUPO"].some(s => status.includes(s));
              const fin = getGroupFinancialInfo(g);
              const totalAmt = fin.total;
              const paidAmt = fin.paid;
              const pendingAmt = fin.pending;
              const needsReleaseCheck = !isConfirmed && (!isCredito && pendingAmt > 0.1);

              // Alert 1: Release Urgente (< 7 días)
              if (needsReleaseCheck) {
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

              // Alert 3: Pagos Pendientes (ignorar si es crédito)
              if (!isCredito) {
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
              }

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
  
