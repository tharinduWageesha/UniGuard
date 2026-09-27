/* ==========================================================
   JSO — VEHICLE RECORDS LOG
   Manages rendering, filtering, and searching vehicle entry/exit history.
   ========================================================== */

const INITIAL_VEHICLE_RECORDS = [
  { datetime: "2026-07-30 09:45 PM", plate: "WP CAD-1092", owner: "Dr. A. Pathirana", category: "Staff Vehicle", gate: "Main Gate", action: "Exit" },
  { datetime: "2026-07-30 09:10 PM", plate: "CAB-4829", owner: "Prof. K. Samarasinghe", category: "Staff Vehicle", gate: "Main Gate", action: "Entry" },
  { datetime: "2026-07-30 08:30 PM", plate: "NC ND-8832", owner: "UCSC Official Van", category: "University Vehicle", gate: "Rear Gate", action: "Entry" },
  { datetime: "2026-07-30 07:15 PM", plate: "WP CAD-1092", owner: "Dr. A. Pathirana", category: "Staff Vehicle", gate: "Main Gate", action: "Entry" },
  { datetime: "2026-07-30 04:20 PM", plate: "SP BCF-5021", owner: "Supply Express (Delivery)", category: "Visitor / Delivery", gate: "Main Gate", action: "Exit" },
  { datetime: "2026-07-30 02:05 PM", plate: "SP BCF-5021", owner: "Supply Express (Delivery)", category: "Visitor / Delivery", gate: "Main Gate", action: "Entry" },
  { datetime: "2026-07-30 08:00 AM", plate: "CAB-4829", owner: "Prof. K. Samarasinghe", category: "Staff Vehicle", gate: "Main Gate", action: "Entry" },
];

let recordsData = [...INITIAL_VEHICLE_RECORDS];

function updateStats(filteredData) {
  const total = filteredData.length;
  const entries = filteredData.filter(r => r.action === "Entry").length;
  const exits = filteredData.filter(r => r.action === "Exit").length;

  document.getElementById("statTotalLogs").innerText = total;
  document.getElementById("statTotalEntries").innerText = entries;
  document.getElementById("statTotalExits").innerText = exits;
}

function renderRecordsTable() {
  const actionValue = document.getElementById("actionFilter").value;
  const categoryValue = document.getElementById("categoryFilter").value;
  const searchQuery = document.getElementById("globalSearchInput").value.trim().toLowerCase();

  const filtered = recordsData.filter((item) => {
    const matchesAction = actionValue === "ALL" || item.action === actionValue;
    const matchesCategory = categoryValue === "ALL" || item.category === categoryValue;
    const matchesSearch =
      !searchQuery ||
      item.plate.toLowerCase().includes(searchQuery) ||
      item.owner.toLowerCase().includes(searchQuery) ||
      item.gate.toLowerCase().includes(searchQuery);

    return matchesAction && matchesCategory && matchesSearch;
  });

  const tbody = document.getElementById("recordsTableBody");
  const noRecordsMsg = document.getElementById("noRecordsMsg");

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    noRecordsMsg.style.display = "block";
  } else {
    noRecordsMsg.style.display = "none";
    tbody.innerHTML = filtered
      .map(
        (row) => `
        <tr>
          <td>${row.datetime}</td>
          <td><strong>${row.plate}</strong></td>
          <td>${row.owner}</td>
          <td>${row.category}</td>
          <td>${row.gate}</td>
          <td><span class="status-pill ${row.action === "Entry" ? "active" : "expired"}">${row.action}</span></td>
        </tr>`
      )
      .join("");
  }

  updateStats(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  renderRecordsTable();

  // Filter Listeners
  document.getElementById("actionFilter").addEventListener("change", renderRecordsTable);
  document.getElementById("categoryFilter").addEventListener("change", renderRecordsTable);
  document.getElementById("globalSearchInput").addEventListener("input", renderRecordsTable);

  // Reset Filters
  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    document.getElementById("actionFilter").value = "ALL";
    document.getElementById("categoryFilter").value = "ALL";
    document.getElementById("globalSearchInput").value = "";
    renderRecordsTable();
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
