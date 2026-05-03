/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Sistema de Iconos Unificado
 * ═══════════════════════════════════════════════════════════
 * Componente LucideIcon React compartido para todas las páginas.
 * Usa la API estable lucide.createIcons() para generar SVGs.
 *
 * Dependencias: React, Lucide (CDN)
 * Uso: <script src="js/icons.js"></script>
 *      <LucideIcon name="check" size={20} />
 * ═══════════════════════════════════════════════════════════
 */

(function () {
    "use strict";

    // ── Componente LucideIcon (React) ─────────────────────

    function createLucideIconComponent() {
        var _React = window.React;
        if (!_React) return null;

        var LucideIcon = function (props) {
            var name = props.name;
            var size = props.size || 20;
            var className = props.className || "";

            var iconRef = _React.useRef(null);

            _React.useEffect(
                function () {
                    if (!iconRef.current || !window.lucide) return;

                    // Clear previous content
                    iconRef.current.innerHTML = "";

                    // Create a temporary <i> element with data-lucide attribute
                    var i = document.createElement("i");
                    i.setAttribute("data-lucide", name);
                    iconRef.current.appendChild(i);

                    // Use the stable createIcons API to replace <i> with <svg>
                    try {
                        window.lucide.createIcons({
                            nodes: [iconRef.current],
                            attrs: {
                                width: size,
                                height: size,
                                "stroke-width": 2,
                            },
                        });
                    } catch (e) {
                        // Fallback: try global replace on the container
                        try {
                            window.lucide.createIcons();
                        } catch (e2) {
                            console.warn("[Icons] Failed to render icon: " + name, e2);
                        }
                    }

                    // Apply size to the rendered SVG
                    var svg = iconRef.current.querySelector("svg");
                    if (svg) {
                        svg.setAttribute("width", size);
                        svg.setAttribute("height", size);
                        if (className) {
                            className.split(" ").forEach(function (cls) {
                                if (cls) svg.classList.add(cls);
                            });
                        }
                    }
                },
                [name, size, className]
            );

            return _React.createElement("span", {
                ref: iconRef,
                className: "inline-flex items-center justify-center " + className,
                style: { width: size + "px", height: size + "px", lineHeight: 0 },
            });
        };

        return LucideIcon;
    }

    // ── Mapa de aliases (nombres SVG manual → Lucide names) ─
    var ICON_ALIASES = {
        IconCheck: "check",
        IconClock: "clock",
        IconX: "x",
        IconChart: "bar-chart-3",
        IconBrain: "brain",
        IconUsers: "users",
        IconTable: "table",
        IconMail: "mail",
        IconChevronDown: "chevron-down",
        IconArrowRight: "arrow-right",
        IconCalendar: "calendar",
        IconFile: "file",
        IconTrash: "trash-2",
        IconPlus: "plus",
        IconRefresh: "refresh-cw",
        IconMore: "more-horizontal",
        IconSave: "save",
        IconSearch: "search",
        IconFilter: "filter",
        IconPrinter: "printer",
        IconDownload: "download",
        IconBed: "bed",
        IconBuildingSkyscraper: "building-2",
        IconChevronLeft: "chevron-left",
        IconChevronRight: "chevron-right",
        IconChevronUp: "chevron-up",
        IconSparkles: "sparkles",
        IconUpload: "upload",
        IconPieChart: "pie-chart",
        IconGroup: "users",
        IconEdit: "square-pen",
        IconEdit3: "pencil",
        IconGripVertical: "grip-vertical",
        IconAlertTriangle: "triangle-alert",
        IconUser: "user",
        IconSettings: "settings",
        IconUtensils: "utensils",
        IconMap: "map",
        IconMartini: "martini",
        IconCircle: "circle",
        IconCreditCard: "credit-card",
        IconFileInvoice: "file-text",
        IconCheckCircle: "circle-check",
        IconXCircle: "circle-x",
        IconPhone: "phone",
        IconPhoneForwarded: "phone-forwarded",
        IconClipboardX: "clipboard-x",
        IconBuilding2: "building-2",
        IconFileText: "file-text",
        IconEye: "eye",
        IconFileSpreadsheet: "file-spreadsheet",
        IconMessage: "message-square",
    };

    // ── Factory para crear wrapper components ─────────────
    function createAliasComponents(LucideIcon) {
        var _React = window.React;
        if (!_React || !LucideIcon) return {};

        var components = {};

        Object.keys(ICON_ALIASES).forEach(function (alias) {
            var lucideName = ICON_ALIASES[alias];
            components[alias] = function (props) {
                var mergedProps = Object.assign({}, props, { name: lucideName });
                if (!mergedProps.size) mergedProps.size = props.size || 24;
                return _React.createElement(LucideIcon, mergedProps);
            };
        });

        return components;
    }

    // ── Inicialización ────────────────────────────────────
    var LucideIcon = createLucideIconComponent();

    if (LucideIcon) {
        window.LucideIcon = LucideIcon;

        var aliases = createAliasComponents(LucideIcon);
        Object.keys(aliases).forEach(function (name) {
            window[name] = aliases[name];
        });
    }

    window.NexusIcons = {
        ICON_ALIASES: ICON_ALIASES,
        LucideIcon: LucideIcon,
    };
})();
