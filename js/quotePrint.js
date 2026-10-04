// Fit the complete quote to the printable height of one A4 sheet.
(function () {
  function fitQuoteToPage() {
    const quote = document.getElementById('quote-document');
    if (!quote) return;
    quote.style.setProperty('--quote-print-scale', '1');
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;height:275mm;width:1px;';
    quote.appendChild(probe);
    const availableHeight = probe.getBoundingClientRect().height;
    probe.remove();
    // Re-measure after scaling: the available width changes text wrapping.
    let scale = 1;
    for (let pass = 0; pass < 4; pass += 1) {
      const height = Math.max(quote.scrollHeight * scale, quote.getBoundingClientRect().height);
      if (height <= availableHeight) break;
      scale *= availableHeight / height;
      quote.style.setProperty('--quote-print-scale', String(scale));
    }
  }
  window.addEventListener('beforeprint', fitQuoteToPage);
  window.addEventListener('afterprint', function () {
    document.getElementById('quote-document')?.style.removeProperty('--quote-print-scale');
  });
})();
