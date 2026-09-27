document.addEventListener("DOMContentLoaded", () => {
  startLiveClock();
  generateBarcode();
});

function startLiveClock() {
    updateGreeting();
  const updateClock = () => {
    updateGreeting();
    const now = new Date();
    document.getElementById("current-time").textContent = now.toLocaleTimeString('en-US', { hour12: true });
    document.getElementById("current-date").textContent = now.toLocaleDateString('en-US', {
      weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    }).toUpperCase();
  };
  updateClock();
  setInterval(updateClock, 1000);
}

// Generates a simple randomized barcode-style visual using CSS bars
function generateBarcode() {
  const strip = document.getElementById("barcode-strip");
  if (!strip) return;
  strip.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const bar = document.createElement("span");
    strip.appendChild(bar);
  }
}


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
