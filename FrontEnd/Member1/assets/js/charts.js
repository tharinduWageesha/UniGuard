/* ==========================================================
   UNIGUARD CHART UTILITIES
   Hand-rolled <canvas> line & donut charts — replaces the
   Chart.js dependency with plain JS / Canvas 2D API only.
   ========================================================== */

/* Resize a canvas's backing store to match its CSS box at the
   device pixel ratio, so lines stay crisp. Returns the 2D ctx. */
function ugPrepCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = Math.max(1, rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

/**
 * Smooth-ish line chart with gradient fill, matching the look
 * of the previous Chart.js "Incident Trends" widget.
 * opts: { labels, data, max, step, color }
 */
function ugRenderLineChart(canvasId, opts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = ugPrepCanvas(canvas);
  const labels = opts.labels || [];
  const data = opts.data || [];
  const max = opts.max != null ? opts.max : Math.max(...data, 1) * 1.2;
  const min = 0;
  const color = opts.color || "#0088ff";

  const padL = 28, padR = 10, padT = 10, padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  ctx.clearRect(0, 0, width, height);

  // gridlines + y labels
  const steps = opts.step ? Math.round(max / opts.step) : 4;
  ctx.strokeStyle = "#f1f5f9";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= steps; i++) {
    const val = min + ((max - min) * i) / steps;
    const y = padT + plotH - (plotH * i) / steps;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(width - padR, y);
    ctx.stroke();
    ctx.fillText(String(Math.round(val * 10) / 10), padL - 6, y);
  }

  // x labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  labels.forEach((label, i) => {
    const x = padL + (plotW * i) / Math.max(1, labels.length - 1);
    ctx.fillText(label, x, padT + plotH + 6);
  });

  // points
  const points = data.map((v, i) => ({
    x: padL + (plotW * i) / Math.max(1, data.length - 1),
    y: padT + plotH - (plotH * (v - min)) / (max - min),
  }));

  // gradient fill under the line
  const gradient = ctx.createLinearGradient(0, padT, 0, padT + plotH);
  gradient.addColorStop(0, hexToRgba(color, 0.25));
  gradient.addColorStop(1, hexToRgba(color, 0));

  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : smoothLineTo(ctx, points, i)));
  ctx.lineTo(points[points.length - 1].x, padT + plotH);
  ctx.lineTo(points[0].x, padT + plotH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // line
  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : smoothLineTo(ctx, points, i)));
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  // points
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  });
}

function smoothLineTo(ctx, points, i) {
  const prev = points[i - 1];
  const curr = points[i];
  const midX = (prev.x + curr.x) / 2;
  ctx.quadraticCurveTo(prev.x, prev.y, midX, (prev.y + curr.y) / 2);
  ctx.quadraticCurveTo(midX, (prev.y + curr.y) / 2, curr.x, curr.y);
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Donut chart with a legend rendered below the canvas.
 * opts: { labels, data, colors, cutout (0-1), legendId }
 */
function ugRenderDonutChart(canvasId, opts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const { ctx, width, height } = ugPrepCanvas(canvas);
  const data = opts.data || [];
  const colors = opts.colors || ["#0088ff", "#ef4444", "#f59e0b", "#10b981"];
  const labels = opts.labels || [];
  const cutout = opts.cutout != null ? opts.cutout : 0.68;

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2, cy = height / 2;
  const radius = Math.min(width, height) / 2 - 4;
  const total = data.reduce((a, b) => a + b, 0) || 1;

  let start = -Math.PI / 2;
  data.forEach((val, i) => {
    const slice = (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += slice;
  });

  // cutout hole
  ctx.beginPath();
  ctx.arc(cx, cy, radius * cutout, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // legend
  if (opts.legendId) {
    const legendEl = document.getElementById(opts.legendId);
    if (legendEl) {
      legendEl.innerHTML = labels
        .map(
          (label, i) =>
            `<span><span class="dot" style="background:${colors[i % colors.length]}"></span>${label}</span>`
        )
        .join("");
    }
  }
}

/**
 * Deterministic-looking barcode drawn on a <canvas>, replacing
 * the JsBarcode dependency. Not a real symbology — purely a
 * visual mock so scan-simulation screens have something to show.
 * opts: { color, background }
 */
function ugDrawBarcode(canvasId, text, opts) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  opts = opts || {};
  const color = opts.color || "#0f172a";
  const bg = opts.background || "#ffffff";

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.width || 240;
  const cssHeight = canvas.clientHeight || canvas.height || 60;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // seed a simple pseudo-random sequence from the text so the
  // same code always renders the same bar pattern
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  function next() {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return (seed >>> 8) / 0xffffff;
  }

  const barAreaWidth = cssWidth - 8;
  let x = 4;
  ctx.fillStyle = color;
  while (x < barAreaWidth) {
    const w = 1 + Math.floor(next() * 3);
    if (next() > 0.45) {
      ctx.fillRect(x, 4, w, cssHeight - 8);
    }
    x += w + 1;
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



(function injectStatusStyle() {
  if (document.getElementById("ug-status-style")) return;
  const style = document.createElement("style");
  style.id = "ug-status-style";
  style.textContent = `
    .welcome-greet { display: flex !important; align-items: center !important; gap: 0.6rem !important; flex-wrap: wrap !important; }
    .officer-status-picker { display: inline-flex !important; align-items: center !important; gap: 6px !important; background: #ffffff !important; border: 1px solid #cbd5e1 !important; border-radius: 20px !important; padding: 3px 10px !important; margin-left: 6px !important; font-size: 0.78rem !important; font-weight: 600 !important; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important; transition: all 0.2s ease !important; cursor: pointer !important; }
    .officer-status-picker:hover { border-color: #0088ff !important; box-shadow: 0 2px 5px rgba(0, 136, 255, 0.15) !important; }
    .status-indicator-dot { width: 9px !important; height: 9px !important; border-radius: 50% !important; display: inline-block !important; flex-shrink: 0 !important; transition: background-color 0.25s ease, box-shadow 0.25s ease !important; }
    .status-indicator-dot.active { background-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25) !important; }
    .status-indicator-dot.leave { background-color: #f59e0b !important; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25) !important; }
    .status-select { border: none !important; background: transparent !important; font-size: 0.78rem !important; font-weight: 700 !important; color: #1e293b !important; cursor: pointer !important; outline: none !important; font-family: inherit !important; padding-right: 2px !important; }
    .status-select option { font-weight: 600 !important; color: #1e293b !important; background: #ffffff !important; }
  `;
  document.head.appendChild(style);
})();

function initOfficerStatus() {
  const greetContainer = document.querySelector(".welcome-greet");
  if (!greetContainer) return;

  let picker = greetContainer.querySelector("[data-status-picker]");
  if (!picker) {
    picker = document.createElement("div");
    picker.className = "officer-status-picker";
    picker.setAttribute("data-status-picker", "");
    picker.innerHTML = `
      <span class="status-indicator-dot active" data-status-dot></span>
      <select class="status-select" data-status-select title="Change your active status">
        <option value="On Active">On Active</option>
        <option value="On Leave">On Leave</option>
      </select>
    `;
    greetContainer.appendChild(picker);
  }

  const select = picker.querySelector("[data-status-select]");
  const dot = picker.querySelector("[data-status-dot]");
  if (!select || !dot) return;

  let roleKey = "uniguard_officer_status";
  const pathStr = window.location.pathname.toLowerCase();
  if (pathStr.includes("/cso/")) roleKey = "uniguard_status_CSO";
  else if (pathStr.includes("/oic/")) roleKey = "uniguard_status_OIC";
  else if (pathStr.includes("/jso/")) roleKey = "uniguard_status_JSO";

  const savedStatus = localStorage.getItem(roleKey) || localStorage.getItem("uniguard_officer_status") || "On Active";
  select.value = savedStatus;
  updateDotClass(savedStatus);

  function updateDotClass(val) {
    if (val === "On Leave") {
      dot.className = "status-indicator-dot leave";
    } else {
      dot.className = "status-indicator-dot active";
    }
  }

  select.onchange = function () {
    const val = select.value;
    localStorage.setItem(roleKey, val);
    localStorage.setItem("uniguard_officer_status", val);
    updateDotClass(val);
  };
}

(function() { if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initOfficerStatus); } else { initOfficerStatus(); } })();
