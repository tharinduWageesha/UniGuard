document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // GENERATE LONG HORIZONTAL VISITOR BARCODE
    // ==========================================

    const passId = "VP-2026-00842";

    const barcodeElement = document.getElementById("visitorBarcode");

    if (barcodeElement) {
        JsBarcode(barcodeElement, passId, {
            format: "CODE128",
            lineColor: "#1f2937",
            width: 2.5,
            height: 85,
            displayValue: false,
            margin: 12,
            background: "#ffffff"
        });
    }

    // ==========================================
    // DOWNLOAD PASS
    // ==========================================

    const downloadBtn = document.getElementById("downloadPassBtn");

    downloadBtn?.addEventListener("click", () => {
        showToast("Pass download started.", "success");
    });

    // ==========================================
    // PRINT PASS
    // ==========================================

    const printBtn = document.getElementById("printPassBtn");

    printBtn?.addEventListener("click", () => {
        window.print();
    });

});

function updateGreeting() {
  const elements = document.querySelectorAll(".welcome-hi");
  if (!elements.length) return;
  const hour = new Date().getHours();
  let greetingText = "Good morning";
  if (hour >= 12 && hour < 17) {
    greetingText = "Good afternoon";
  } else if (hour >= 17) {
    greetingText = "Good evening";
  }
  elements.forEach((el) => {
    const text = el.textContent || "";
    const hasComma = text.trim().endsWith(",");
    el.textContent = greetingText + (hasComma ? "," : "");
  });
}

(function() { if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", updateGreeting); } else { updateGreeting(); } })();
