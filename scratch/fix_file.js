const fs = require('fs');
const path = 'js/GestionGrupos.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const startLine = 2866; // 1-indexed
const endLine = 3400;   // 1-indexed

const replacement = `  var handleMergeGroup = /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(sourceGroup) {
      var targetReserva, destId, sourceRecords, sourceIds, batch, destDoc, targetName, _iterator4, _step4, row, oldId, newId, oldRef, newRef, payload, _t5;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            targetReserva = prompt("Fusionar \\"\\"".concat(sourceGroup.name, "\\"\\" con otra reserva existente.\\n\\nIntroduce el ID de Reserva PMS destino (ej: 205249):"), "");
            if (!(!targetReserva || targetReserva.trim() === "")) {
              _context7.n = 1;
              break;
            }
            return _context7.a(2);
          case 1:
            destId = normalizeId(targetReserva);
            sourceRecords = sourceGroup.records || [];
            sourceIds = sourceRecords.map(function (r) {
              return normalizeId(r["Reserva"]);
            }).filter(function (id) {
              return id !== destId;
            });
            if (!(sourceIds.length === 0)) {
              _context7.n = 2;
              break;
            }
            alert("No hay registros que mover o ya tienen ese ID.");
            return _context7.a(2);
          case 2:
            if (confirm("\\\\xBFEst\\\\xE1s seguro de fusionar todos los datos de \\"\\"".concat(sourceGroup.name, "\\"\\" en la reserva ").concat(targetReserva, "?\\n\\nLos registros manuales o de presupuesto se vincular\\\\xE1n al nuevo ID y se eliminar\\\\xE1n los documentos antiguos."))) {
              _context7.n = 3;
              break;
            }
            return _context7.a(2);
          case 3:
            _context7.p = 3;
            batch = db.batch(); 
            return db.collection("groups").doc(destId).get();
          case 4:
            destDoc = _context7.v;
            targetName = sourceGroup.name;
            if (destDoc.exists) {
              targetName = destDoc.data()["Nombre del Grupo"] || targetName;
            }
            sourceRecords.forEach(function (row) {
              var oldId = normalizeId(row["Reserva"]);
              var newId = destId;
              var oldRef = db.collection("groups").doc(oldId);
              var newRef = db.collection("groups").doc(newId);
              var payload = _objectSpread(_objectSpread({}, row), {}, {
                Reserva: targetReserva,
                "Nombre del Grupo": targetName,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              });
              batch.set(newRef, payload, {
                merge: true
              });
              if (oldId !== newId) {
                batch.delete(oldRef);
              }
            });
            return batch.commit();
          case 5:
            alert("✅ Fusión completada con éxito. Pulsa Aceptar para recargar.");
            window.location.reload();
            _context7.n = 7;
            break;
          case 6:
            _context7.p = 6;
            _t5 = _context7.v;
            console.error("Error en fusión:", _t5);
            alert("❌ Error al fusionar: " + _t5.message);
          case 7:
            return _context7.a(2);
        }
      }, _callee7, null, [[3, 6]]);
    }));
    return function handleMergeGroup(_x2) {
      return _ref12.apply(this, arguments);
    };
  }();

  var openClientDataModal = function openClientDataModal() {
    if (!selectedGroupFicha || !selectedGroupFicha.records) return;
    var baseRecord = selectedGroupFicha.records[0] || {};
    var fields = ["Fiscal_RazonSocial", "Fiscal_CIF", "Persona_Contacto", "Email", "Telefono", "Fiscal_Direccion", "Fiscal_CP", "Fiscal_Poblacion", "Fiscal_Provincia", "Fiscal_Pais", "Observaciones"];
    var initialData = {};
    fields.forEach(function (f) {
      initialData[f] = baseRecord[f] || "";
    });
    setTempClientData(initialData);
    setShowClientData(true);
  };

  var updateGroupMetadata = /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(resId, fieldOrUpdates) {
      var valueIfSingle, hotelFilterArg, updates, hVal, normH, normTargetId, currentGroupRows, firstRow, manualPaid, totalRevenue, totalCommission, rl, netRevenue, currentPlan, filteredPlan, newPlan, remainingToSubtract, hSync, batch, _args8 = arguments, _t6;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.p = _context8.n) {
          case 0:
            valueIfSingle = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : null;
            hotelFilterArg = _args8.length > 3 && _args8[3] !== undefined ? _args8[3] : null;
            updates = _typeof(fieldOrUpdates) === "object" ? _objectSpread({}, fieldOrUpdates) : _defineProperty({}, fieldOrUpdates, valueIfSingle); // --- VALIDACIÓN HOTEL ---
            hVal = updates["Hotel_Asignado"] || updates["Hotel"];
            if (hVal !== undefined) {
              normH = String(hVal).toLowerCase();
              if (!normH || normH.includes("pend") || normH.trim() === "") {
                alert("⚠️ Error: No se puede asignar un hotel 'PENDIENTE' o vacío.");
                return _context8.a(2);
              }
            }
            _context8.n = 1;
            break;
          case 1:
            if (updates["Com_Estado_Interno"] === "CANCELADO" && !updates["Estado"]) {
              updates["Estado"] = "ANULADA";
            }
            normTargetId = normalizeId(resId);
            currentGroupRows = (data || []).filter(function (r) {
              return normalizeId(r.Reserva) === normTargetId && (!hotelFilterArg || (r["Hotel_Asignado"] || r["Hotel"]) === hotelFilterArg);
            });
            if (currentGroupRows.length === 0) {
              return _context8.a(2);
            }
            _context8.n = 2;
            break;
          case 2:
            if (updates["Com_Pagado"] !== undefined) {
              try {
                firstRow = currentGroupRows[0];
                manualPaid = parseNum(updates["Com_Pagado"]);
                totalRevenue = parseNum(firstRow["Importe(*)"]);
                totalCommission = 0;
                try {
                  rl = JSON.parse(firstRow.RoomingList_JSON || "[]");
                  totalCommission = rl.reduce(function (acc, i) {
                    var _i$comision2;
                    return acc + (parseFloat((_i$comision2 = i.comision) === null || _i$comision2 === void 0 ? void 0 : _i$comision2.total_comision) || 0);
                  }, 0);
                } catch (e) {}
                netRevenue = Math.max(0, totalRevenue - totalCommission);
                currentPlan = [];
                try {
                  currentPlan = JSON.parse(firstRow["PaymentPlan_JSON"] || "[]");
                } catch (e) {
                  currentPlan = [];
                }
                filteredPlan = currentPlan.filter(function (p) {
                  return !p.id.toString().startsWith("manual-") && p.label !== "Pago a Cuenta";
                });
                newPlan = [];
                if (manualPaid > 0) {
                  newPlan.push({
                    id: "manual-" + Date.now(),
                    label: "Pago a Cuenta",
                    percent: (manualPaid / (netRevenue || 1) * 100).toFixed(1),
                    amount: manualPaid.toFixed(2),
                    releaseDays: 0,
                    date: new Date().toISOString().split("T")[0],
                    status: "Cobrado"
                  });
                }
                remainingToSubtract = manualPaid;
                filteredPlan.forEach(function (p) {
                  var amt = parseNum(p.amount);
                  if (remainingToSubtract > 0) {
                    if (remainingToSubtract >= amt) {
                      remainingToSubtract -= amt;
                      return;
                    } else {
                      amt -= remainingToSubtract;
                      remainingToSubtract = 0;
                    }
                  }
                  if (amt > 0.01) {
                    newPlan.push(_objectSpread(_objectSpread({}, p), {}, {
                      amount: amt.toFixed(2),
                      percent: (amt / (netRevenue || 1) * 100).toFixed(1)
                    }));
                  }
                });
                updates["PaymentPlan_JSON"] = JSON.stringify(newPlan);
              } catch (err) {
                console.error("Error syncing PaymentPlan on Com_Pagado update", err);
              }
            }

            setData(function (prevData) {
              return prevData.map(function (row) {
                var matchesReserva = normalizeId(row.Reserva) === normTargetId;
                var matchesHotel = !hotelFilterArg || (row["Hotel_Asignado"] || row["Hotel"]) === hotelFilterArg;
                if (matchesReserva && matchesHotel) {
                  return _objectSpread(_objectSpread({}, row), updates);
                }
                return row;
              });
            });

            setSelectedGroupFicha(function (prev) {
              if (!prev || normalizeId(prev.id) !== normTargetId) return prev;
              var updatedRecords = prev.records.map(function (r) {
                var matchesHotel = !hotelFilterArg || (r["Hotel_Asignado"] || r["Hotel"]) === hotelFilterArg;
                if (matchesHotel) {
                  return _objectSpread(_objectSpread({}, r), updates);
                }
                return r;
              });
              var newTotalPax = updatedRecords.reduce(function (sum, r) {
                return sum + parseInt(r["Pax."] || 0);
              }, 0);
              var newTotalRevenue = updatedRecords.reduce(function (sum, r) {
                return sum + parseNum(r["Importe(*)"]);
              }, 0);
              var newTotalRooms = 0;
              if (updatedRecords[0] && updatedRecords[0].RoomingList_JSON) {
                try {
                  var _rl2 = JSON.parse(updatedRecords[0].RoomingList_JSON);
                  newTotalRooms = _rl2.reduce(function (acc, i) {
                    return acc + (i.isService ? 0 : parseInt(i.qty) || 0);
                  }, 0);
                } catch (e) {}
              }
              return _objectSpread(_objectSpread({}, prev), {}, {
                records: updatedRecords,
                totalPax: newTotalPax,
                totalRooms: newTotalRooms,
                totalRevenue: newTotalRevenue,
                name: updates["Nombre del Grupo"] || prev.name,
                hotel: updates["Hotel_Asignado"] || updates["Hotel"] || prev.hotel
              });
            });

            if (updates["Hotel_Asignado"]) {
              hSync = updates["Hotel_Asignado"];
              if (hSync.toLowerCase().includes("cumbria")) hSync = "Cumbria Spa&Hotel";else if (hSync.toLowerCase().includes("guadiana")) hSync = "Sercotel Guadiana";
              setRoomManagerForm(function (prev) {
                return _objectSpread(_objectSpread({}, prev), {}, {
                  hotel: hSync
                });
              });
            }

            _context8.p = 3;
            batch = db.batch();
            currentGroupRows.forEach(function (row) {
              var targetDocId = row._docId || normalizeId(row.Reserva);
              if (targetDocId) {
                var docRef = db.collection("groups").doc(targetDocId);
                var payload = _objectSpread(_objectSpread({}, updates), {}, {
                  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                if (!updates.tracking && !updates.RoomingList_JSON && !updates.PaymentPlan_JSON && !updates.updatedAt) {
                  var changesText = Object.keys(updates).map(function (k) {
                    return "".concat(k, ": ").concat(row[k] || 'vacio', " -> ").concat(updates[k]);
                  }).join(" | ");
                  var now_str = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + ' ' + String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0');
                  var logEntry = { id: Date.now(), date: now_str, text: "Modificaci\\\\xF3n field: ".concat(changesText) };
                  var oldTrack = [];
                  try { oldTrack = JSON.parse(row.tracking || "[]"); } catch (e) {}
                  payload.tracking = JSON.stringify([].concat(_toConsumableArray(oldTrack), [logEntry]));
                }
                batch.set(docRef, payload, { merge: true });
              }
            });
            return batch.commit();
          case 3:
            _context8.n = 5;
            break;
          case 4:
            _context8.p = 4;
            _t6 = _context8.v;
            console.error("❌ Error updating metadata:", _t6);
          case 5:
            return _context8.a(2);
        }
      }, _callee8, null, [[3, 4]]);
    }));
    return function updateGroupMetadata(_x3, _x4) {
      return _ref13.apply(this, arguments);
    };
  }();

  var updatePaymentPlan = function updatePaymentPlan(resId, hotelFilter, plan) {
    updateGroupMetadata(resId, "PaymentPlan_JSON", JSON.stringify(plan), hotelFilter);
  };
  var addNewRow = function addNewRow() {
    var emptyRow = {};
    columns.forEach(function (col) {
      return emptyRow[col] = "";
    });
    emptyRow["Entrada"] = new Date().toISOString().split("T")[0];
    setData([emptyRow].concat(_toConsumableArray(data)));
  };`;

lines.splice(startLine - 1, endLine - startLine + 1, replacement);
fs.writeFileSync(path, lines.join('\\n'), 'utf8');
