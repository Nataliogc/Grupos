// Fit the complete quote to the printable height of one A4 sheet.
(function () {
  function fitQuoteToPage() {
    const quote = document.getElementById('quote-document');
    if (!quote) return;
    quote.style.setProperty('--quote-print-scale', '1');
    // CSS lengths use 96 pixels per inch. A measuring element inside the quote
    // can itself increase scrollHeight and trigger repeated, excessive shrinking.
    const availableHeight = 275 * 96 / 25.4;
    // Keep the layout width fixed, so reducing zoom cannot widen the document.
    let scale = 1;
    for (let pass = 0; pass < 4; pass += 1) {
      const height = quote.getBoundingClientRect().height;
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
