/**
 * ═════════════════════════════════════════════════════════════════════════════
 * NEXUS VERIFY — Servicio Cliente de Emisión, Sellado SHA-256 y Revocación
 * ═════════════════════════════════════════════════════════════════════════════
 * Exclusivo de Nexus Groups (Presupuestos y Facturas Proforma).
 * Nunca envía IBAN ni beneficiario al servidor; el servidor los resuelve desde
 * Secret Manager (NEXUS_VERIFY_BANK_CONFIG).
 */
(function (root) {
  'use strict';

  function getCallable(name) {
    if (!root.firebase || typeof root.firebase.functions !== 'function') {
      throw new Error('Firebase Functions SDK no disponible.');
    }
    return root.firebase.app().functions('us-central1').httpsCallable(name);
  }

  async function computeSha256Hex(input) {
    if (root.crypto && root.crypto.subtle && typeof root.crypto.subtle.digest === 'function') {
      var buf = input instanceof ArrayBuffer ? input : (ArrayBuffer.isView(input) ? input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) : new TextEncoder().encode(String(input)).buffer);
      var digest = await root.crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    if (typeof require === 'function') {
      var nodeCrypto = require('node:crypto');
      var data = Buffer.isBuffer(input) ? input : (input instanceof ArrayBuffer ? Buffer.from(new Uint8Array(input)) : Buffer.from(String(input), 'utf8'));
      return nodeCrypto.createHash('sha256').update(data).digest('hex');
    }
    throw new Error('Web Crypto API no disponible para calcular SHA-256.');
  }

  async function issueVerification(params) {
    var payload = {
      groupDocId: String(params.groupDocId || '').trim(),
      docType: params.docType === 'proforma' ? 'proforma' : 'budget'
    };
    if (params.expectedAmountEuros !== undefined && params.expectedAmountEuros !== null) {
      payload.expectedAmountEuros = Number(params.expectedAmountEuros);
    }
    if (params.pdfSha256) {
      payload.pdfSha256 = String(params.pdfSha256).trim().toLowerCase();
    }
    var res = await getCallable('nexusVerifyIssue')(payload);
    return res.data;
  }

  async function sealPdfBuffer(token, pdfArrayBuffer) {
    var pdfSha256 = await computeSha256Hex(pdfArrayBuffer);
    var res = await getCallable('nexusVerifySealPdf')({ token: token, pdfSha256: pdfSha256 });
    return { ok: Boolean(res.data && res.data.ok), pdfSha256: pdfSha256 };
  }

  async function revokeVerification(tokenOrHash, reason) {
    var payload = { reason: String(reason || '').trim() };
    if (/^[a-f0-9]{64}$/i.test(String(tokenOrHash || '').trim())) {
      payload.tokenHash = String(tokenOrHash).trim().toLowerCase();
    } else {
      payload.token = String(tokenOrHash || '').trim();
    }
    var res = await getCallable('nexusVerifyRevoke')(payload);
    return res.data;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildAntiFraudBlockHtml(verification) {
    if (!verification || !verification.displayCode || !verification.verifyUrl) return '';
    var domain = escapeHtml(verification.officialIbanUrl || verification.verifyUrl);
    var code = escapeHtml(verification.displayCode);
    var url = escapeHtml(verification.verifyUrl);
    return (
      '<div class="nexus-verify-block" style="margin-top:12px;padding:10px 12px;border:1px solid #0b6e57;border-radius:8px;background:#f2faf7;font-size:10px;line-height:1.45;color:#14262b;">' +
        '<div style="font-weight:800;color:#085543;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;">Verificación de transferencia segura · Nexus Verify</div>' +
        '<div><strong>Código de verificación:</strong> <code style="font-family:monospace;font-weight:800;">' + code + '</code></div>' +
        '<div><strong>Enlace de verificación:</strong> <span style="word-break:break-all;">' + url + '</span></div>' +
        '<div style="margin-top:4px;color:#334e56;">Antes de realizar cualquier transferencia, compruebe que el IBAN coincide con el publicado en el dominio oficial del hotel (<strong>' + domain + '</strong>). El hotel nunca solicita cambios de cuenta bancaria por correo electrónico.</div>' +
      '</div>'
    );
  }

  function toWinAnsiPdfString(str) {
    var text = String(str == null ? '' : str);
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i);
      if (code === 0x20AC) {
        out += '\\200'; // € in WinAnsiEncoding
      } else if (code === 0x2013 || code === 0x2014) {
        out += '-';
      } else if (code === 0x2018 || code === 0x2019) {
        out += "'";
      } else if (code === 0x201C || code === 0x201D) {
        out += '"';
      } else if (code === 0x2022 || code === 0x00B7) {
        out += ' - ';
      } else if (code === 0x28 || code === 0x29 || code === 0x5C) {
        out += '\\' + text.charAt(i);
      } else if (code >= 0x20 && code <= 0x7E) {
        out += text.charAt(i);
      } else if (code >= 0xA0 && code <= 0xFF) {
        out += '\\' + code.toString(8).padStart(3, '0');
      } else {
        out += ' ';
      }
    }
    return '(' + out + ')';
  }

  function wrapLines(text, maxChars) {
    var words = String(text || '').replace(/\s+/g, ' ').trim().split(' ');
    var lines = [];
    var current = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!w) continue;
      if (!current) {
        current = w;
      } else if ((current.length + 1 + w.length) <= maxChars) {
        current += ' ' + w;
      } else {
        lines.push(current);
        current = w;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  }

  /**
   * Genera un PDF binario 1.4 inmutable (Opción A) con los datos del documento
   * y el bloque antifraude de Nexus Verify listo para sellar su SHA-256.
   */
  function buildVerifiedPdfBytes(docSummary, verification) {
    if (!verification || !verification.displayCode || !verification.verifyUrl) {
      throw new Error('Faltan datos de verificación del servidor para generar el PDF definitivo.');
    }
    var summary = docSummary || {};
    var isProforma = summary.docType === 'proforma' || verification.docType === 'proforma';
    var docLabel = isProforma ? 'FACTURA PROFORMA VERIFICADA' : 'PRESUPUESTO VERIFICADO';
    var hotelName = verification.hotelName || verification.hotelDisplayName || (verification.hotel === 'cumbria' || verification.hotelId === 'cumbria' ? 'Cumbria Spa & Hotel' : 'Sercotel Guadiana');
    var amountStr = typeof verification.amountEuros === 'number'
      ? verification.amountEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR'
      : (typeof verification.amountCents === 'number'
        ? (verification.amountCents / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR'
        : (summary.amountText || '-'));
    var ibanDisplay = verification.ibanOfficial || verification.ibanFormatted || '-';
    var maskedRef = verification.maskedReference || verification.referenceMasked || '-';
    var issuedStr = verification.issuedAt || new Date().toISOString();
    var lines = [];

    function pushText(x, y, font, size, text) {
      lines.push('BT /' + font + ' ' + size + ' Tf ' + x + ' ' + y + ' Td ' + toWinAnsiPdfString(text) + ' Tj ET');
    }
    function pushRule(x1, y, x2) {
      lines.push('0.6 w 0.80 0.85 0.87 RG ' + x1 + ' ' + y + ' m ' + x2 + ' ' + y + ' l S');
    }

    // Cabecera corporativa
    lines.push('0.06 0.16 0.14 rg 40 760 515 52 re f');
    lines.push('1 1 1 rg');
    pushText(54, 790, 'F2', 14, hotelName.toUpperCase());
    pushText(54, 772, 'F1', 10, docLabel + '  |  NEXUS VERIFY');
    lines.push('0.08 0.15 0.17 rg');

    var y = 735;
    pushText(44, y, 'F2', 11, 'DATOS DEL DOCUMENTO');
    y -= 6;
    pushRule(44, y, 555);
    y -= 16;

    var metaRows = [
      ['Referencia', summary.reference || maskedRef],
      ['Grupo / Evento', summary.groupName || '-'],
      ['Fechas', summary.stayDates || '-'],
      ['Fecha de emisión', issuedStr],
      ['Importe total autorizado', amountStr]
    ];
    for (var m = 0; m < metaRows.length; m++) {
      pushText(44, y, 'F2', 9.5, metaRows[m][0] + ':');
      pushText(185, y, 'F1', 9.5, String(metaRows[m][1] || '-').slice(0, 72));
      y -= 15;
    }

    // Conceptos / resumen comercial (máx 14 líneas para mantener una sola página limpia)
    var items = Array.isArray(summary.items) ? summary.items.slice(0, 12) : [];
    if (items.length > 0) {
      y -= 8;
      pushText(44, y, 'F2', 11, 'RESUMEN DE SERVICIOS');
      y -= 6;
      pushRule(44, y, 555);
      y -= 15;
      for (var k = 0; k < items.length; k++) {
        var it = items[k] || {};
        var desc = String(it.description || it.concept || 'Servicio').slice(0, 62);
        var val = it.amountText != null ? String(it.amountText) : '';
        pushText(48, y, 'F1', 9, '- ' + desc);
        if (val) pushText(460, y, 'F2', 9, val);
        y -= 13;
      }
    }

    // Bloque bancario oficial (exclusivamente procedente del servidor)
    y = Math.min(y - 14, 410);
    lines.push('0.95 0.98 0.97 rg 40 ' + (y - 72) + ' 515 86 re f');
    lines.push('0.04 0.43 0.34 RG 1 w 40 ' + (y - 72) + ' 515 86 re S');
    lines.push('0.03 0.33 0.26 rg');
    pushText(52, y - 2, 'F2', 10.5, 'DATOS BANCARIOS OFICIALES PARA TRANSFERENCIA (ORIGEN SERVIDOR)');
    lines.push('0.08 0.15 0.17 rg');
    pushText(52, y - 20, 'F2', 9.5, 'Beneficiario: ');
    pushText(135, y - 20, 'F1', 9.5, verification.beneficiary || '-');
    pushText(52, y - 36, 'F2', 9.5, 'IBAN oficial: ');
    pushText(135, y - 36, 'F2', 10.5, ibanDisplay);
    if (verification.bic) {
      pushText(52, y - 52, 'F2', 9.5, 'BIC / SWIFT: ');
      pushText(135, y - 52, 'F1', 9.5, verification.bic);
    }
    pushText(52, y - 66, 'F1', 8.5, 'Concepto recomendado: ' + String(summary.reference || maskedRef));

    // Bloque antifraude Nexus Verify
    y = y - 96;
    lines.push('0.99 0.97 0.91 rg 40 ' + (y - 122) + ' 515 136 re f');
    lines.push('0.80 0.52 0.08 RG 1 w 40 ' + (y - 122) + ' 515 136 re S');
    lines.push('0.49 0.29 0.02 rg');
    pushText(52, y - 2, 'F2', 10.5, 'VERIFICACION ANTIFRAUDE - NEXUS VERIFY');
    lines.push('0.12 0.18 0.20 rg');
    pushText(52, y - 20, 'F2', 9.5, 'Codigo de verificacion: ' + verification.displayCode);
    pushText(52, y - 35, 'F1', 8.5, 'Consulta directa: ' + verification.verifyUrl);
    pushText(52, y - 49, 'F2', 8.5, 'IBAN oficial independiente: ' + (verification.officialIbanUrl || verification.verifyUrl));

    var warningText = 'AVISO DE SEGURIDAD: El enlace o QR del documento por si solos no garantizan autenticidad. Antes de ordenar cualquier transferencia, teclee manualmente el dominio oficial del hotel en su navegador, confirme que el IBAN coincide y compruebe este archivo PDF mediante su huella SHA-256. El hotel nunca solicita cambios de cuenta bancaria por correo electronico.';
    var wrapped = wrapLines(warningText, 92);
    var wy = y - 66;
    for (var wIdx = 0; wIdx < wrapped.length && wy > (y - 118); wIdx++) {
      pushText(52, wy, 'F1', 8, wrapped[wIdx]);
      wy -= 11;
    }

    // Pie
    lines.push('0.40 0.48 0.51 rg');
    pushText(44, 34, 'F1', 7.5, 'Documento PDF definitivo inmutable generado por Nexus Groups (Nexus Verify). Sello SHA-256 registrado en servidor.');

    var streamContent = lines.join('\n') + '\n';
    var objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
      '6 0 obj\n<< /Length ' + streamContent.length + ' >>\nstream\n' + streamContent + 'endstream\nendobj\n'
    ];

    var pdf = '%PDF-1.4\n';
    var offsets = [0];
    for (var o = 0; o < objects.length; o++) {
      offsets.push(pdf.length);
      pdf += objects[o];
    }
    var xrefPos = pdf.length;
    pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
    pdf += '0000000000 65535 f \n';
    for (var idx = 1; idx < offsets.length; idx++) {
      pdf += String(offsets[idx]).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF\n';

    var bytes = new Uint8Array(pdf.length);
    for (var b = 0; b < pdf.length; b++) {
      bytes[b] = pdf.charCodeAt(b) & 0xFF;
    }
    return bytes;
  }

  function triggerPdfDownload(pdfBytes, filename) {
    if (typeof document === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined') return;
    var blob = new Blob([pdfBytes], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'documento-verificado.pdf';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  /**
   * Flujo completo Opción A:
   * 1. Emite verificación en servidor (IBAN y beneficiario oficiales de Secret Manager).
   * 2. Genera el PDF binario inmutable con código y aviso antifraude.
   * 3. Calcula SHA-256 sobre el binario definitivo y lo sella en servidor (write-once).
   * 4. Descarga el PDF definitivo sellado.
   */
  async function issueAndDownloadVerifiedPdf(params) {
    var verification = await issueVerification({
      groupDocId: params.groupDocId,
      docType: params.docType,
      expectedAmountEuros: params.expectedAmountEuros
    });
    var pdfBytes = buildVerifiedPdfBytes(params.docSummary || {}, verification);
    var seal = await sealPdfBuffer(verification.token, pdfBytes);
    var safeRef = String((params.docSummary && params.docSummary.reference) || params.groupDocId || 'documento')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .slice(0, 48);
    var prefix = params.docType === 'proforma' ? 'Proforma' : 'Presupuesto';
    var filename = prefix + '_' + safeRef + '_Verificado.pdf';
    triggerPdfDownload(pdfBytes, filename);
    return {
      verification: verification,
      pdfSha256: seal.pdfSha256,
      sealed: seal.ok,
      filename: filename,
      pdfBytes: pdfBytes
    };
  }

  var api = Object.freeze({
    computeSha256Hex: computeSha256Hex,
    issueVerification: issueVerification,
    sealPdfBuffer: sealPdfBuffer,
    revokeVerification: revokeVerification,
    buildAntiFraudBlockHtml: buildAntiFraudBlockHtml,
    buildVerifiedPdfBytes: buildVerifiedPdfBytes,
    issueAndDownloadVerifiedPdf: issueAndDownloadVerifiedPdf
  });

  root.NexusVerifyService = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
