(function () {
  'use strict';

  var ENDPOINT = window.NEXUS_VERIFY_ENDPOINT || '/api/verify';
  var currentDocument = null;

  function $(id) { return document.getElementById(id); }

  function addDetail(dl, label, value, cls) {
    var dt = document.createElement('dt');
    dt.textContent = label;
    var dd = document.createElement('dd');
    dd.textContent = value;
    if (cls) dd.className = cls;
    dl.appendChild(dt);
    dl.appendChild(dd);
  }

  async function sha256Hex(arrayBuffer) {
    var digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(digest)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  function renderResult(kind, badgeText, title, message, doc) {
    var card = $('resultCard');
    var badge = $('statusBadge');
    var dl = $('detailsList');
    var copyWrap = $('copyWrap');
    var pdfCard = $('pdfCheckCard');
    if (!card) return;

    currentDocument = doc || null;
    card.hidden = false;
    badge.className = 'badge ' + kind;
    badge.textContent = badgeText;
    $('resultTitle').textContent = title;
    $('resultMessage').textContent = message;

    dl.replaceChildren();
    if (doc) {
      dl.hidden = false;
      addDetail(dl, 'Hotel emisor', doc.hotelName);
      addDetail(dl, 'Beneficiario', doc.beneficiary);
      addDetail(dl, 'Entidad bancaria', doc.bankName);
      addDetail(dl, 'IBAN oficial', doc.ibanOfficial, 'iban');
      if (doc.bic) addDetail(dl, 'BIC / SWIFT', doc.bic);
      addDetail(dl, 'Referencia', doc.maskedReference);
      addDetail(dl, 'Importe autorizado', Number(doc.amountEuros).toFixed(2) + ' ' + (doc.currency || 'EUR'));
      addDetail(dl, 'Fecha de emisión', new Date(doc.issuedAt).toLocaleString('es-ES'));
      addDetail(dl, 'Teléfono oficial', doc.phone);
      copyWrap.hidden = doc.status !== 'VALID';
      pdfCard.hidden = !doc.pdfSha256;
    } else {
      dl.hidden = true;
      copyWrap.hidden = true;
      pdfCard.hidden = true;
    }
  }

  async function verifyCode(rawCode) {
    var code = String(rawCode || '').trim();
    if (!code) return;
    renderResult('amber', 'Verificando…', 'Consultando servidor oficial', 'Comprobando firma criptográfica y vigencia…', null);
    try {
      var res = await fetch(ENDPOINT + '?code=' + encodeURIComponent(code), { cache: 'no-store' });
      var data = await res.json().catch(function () { return null; });
      if (!res.ok || !data || !data.ok) {
        var errMsg = (data && data.error) || 'No se pudo verificar el documento. Confirme el IBAN telefónicamente con el hotel.';
        var badge = res.status === 429 ? 'Límite excedido' : (res.status === 503 ? 'Servicio no disponible' : 'No verificado');
        renderResult('red', badge, 'No realice ninguna transferencia sin confirmar', errMsg, null);
        return;
      }
      var doc = data.document;
      if (doc.status === 'VALID') {
        renderResult('ok', 'Documento válido', 'Transferencia verificada por ' + doc.hotelName,
          'Compruebe que el beneficiario, el IBAN y el importe coinciden exactamente con su documento.', doc);
      } else if (doc.status === 'SUPERSEDED') {
        renderResult('amber', 'Documento sustituido', 'Existe una versión más reciente de este documento',
          'Solicite la versión actualizada al hotel antes de realizar la transferencia.', doc);
      } else {
        renderResult('red', 'Documento revocado', 'No realice ninguna transferencia con este documento',
          doc.revokeReason || 'Este documento ha sido revocado por el hotel.', doc);
      }
    } catch (_) {
      renderResult('red', 'Sin conexión', 'Verificación temporalmente no disponible',
        'No se ha podido contactar con el servidor de verificación. Confirme el IBAN por teléfono con el hotel antes de transferir.', null);
    }
  }

  async function loadOfficialIbans() {
    var grid = $('hotelsGrid');
    var statusEl = $('officialStatus');
    if (!grid) return;
    try {
      var res = await fetch(ENDPOINT + '?mode=official-ibans', { cache: 'no-store' });
      var data = await res.json().catch(function () { return null; });
      if (!res.ok || !data || !data.ok || !data.hotels) {
        statusEl.textContent = 'No disponible temporalmente. Confirme el IBAN llamando a recepción.';
        return;
      }
      statusEl.textContent = 'Información bancaria servida en tiempo real desde configuración protegida.';
      grid.replaceChildren();
      ['guadiana', 'cumbria'].forEach(function (key) {
        var h = data.hotels[key];
        if (!h) return;
        var card = document.createElement('section');
        card.className = 'card';
        var h2 = document.createElement('h2');
        h2.textContent = h.hotelName;
        var ben = document.createElement('p');
        ben.textContent = 'Beneficiario: ' + h.beneficiary;
        var bank = document.createElement('p');
        bank.textContent = 'Entidad: ' + h.bankName + (h.bic ? ' (' + h.bic + ')' : '');
        var iban = document.createElement('div');
        iban.className = 'iban';
        iban.textContent = h.ibanOfficial;
        var phone = document.createElement('p');
        phone.className = 'muted';
        phone.textContent = 'Confirmación telefónica: ' + h.phone;
        card.append(h2, ben, bank, iban, phone);
        grid.appendChild(card);
      });
    } catch (_) {
      statusEl.textContent = 'No se ha podido cargar la información bancaria oficial.';
    }
  }

  if ($('verifyForm')) {
    $('verifyForm').addEventListener('submit', function (e) {
      e.preventDefault();
      verifyCode($('codeInput').value);
    });
    var copyBtn = $('copyIbanBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!currentDocument || !currentDocument.ibanOfficial) return;
        navigator.clipboard.writeText(currentDocument.ibanOfficial.replace(/\s+/g, '')).then(function () {
          $('copyFeedback').textContent = 'IBAN copiado.';
        }).catch(function () {
          $('copyFeedback').textContent = 'Copie el IBAN manualmente.';
        });
      });
    }
    var fileInput = $('pdfFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', async function () {
        var out = $('pdfCheckResult');
        var file = fileInput.files && fileInput.files[0];
        if (!file || !currentDocument || !currentDocument.pdfSha256) return;
        var hash = await sha256Hex(await file.arrayBuffer());
        if (hash === currentDocument.pdfSha256) {
          out.style.color = '#086346';
          out.textContent = 'COINCIDENCIA EXACTA: El archivo PDF es idéntico al documento original sellado por el hotel.';
        } else {
          out.style.color = '#9b1c1c';
          out.textContent = 'ATENCIÓN: Este archivo PDF NO coincide con el documento original emitido. No realice ninguna transferencia.';
        }
      });
    }
    // Auto-read token from /v/<token> or ?code=<token>
    var params = new URLSearchParams(window.location.search);
    var pathMatch = window.location.pathname.match(/\/v\/([A-Za-z0-9_-]{24})$/);
    var initial = params.get('code') || (pathMatch ? pathMatch[1] : '');
    if (initial) {
      $('codeInput').value = initial;
      verifyCode(initial);
    }
  }

  if ($('hotelsGrid')) {
    loadOfficialIbans();
  }
})();
