/* ==========================================================
   JSO — NIGHT VEHICLE ENTRY & EXIT MANAGEMENT
   Handles direct lookup and logging of night vehicle entry/exit.
   ========================================================== */

const MOCK_VEHICLE_DIRECTORY = {
  "VEH-0042": { plate: "CAB-4829", owner: "Prof. K. Samarasinghe", category: "Staff Vehicle" },
  "CAB-4829": { plate: "CAB-4829", owner: "Prof. K. Samarasinghe", category: "Staff Vehicle" },
  "VEH-0108": { plate: "WP CAD-1092", owner: "Dr. A. Pathirana", category: "Staff Vehicle" },
  "WP CAD-1092": { plate: "WP CAD-1092", owner: "Dr. A. Pathirana", category: "Staff Vehicle" },
  "VEH-0551": { plate: "NC ND-8832", owner: "UCSC Official Van", category: "University Vehicle" },
  "NC ND-8832": { plate: "NC ND-8832", owner: "UCSC Official Van", category: "University Vehicle" },
};

let vehicleLog = [
  { time: "07:15 PM", plate: "WP CAD-1092", owner: "Dr. A. Pathirana", category: "Staff Vehicle", action: "Entry" },
  { time: "08:30 PM", plate: "NC ND-8832", owner: "UCSC Official Van", category: "University Vehicle", action: "Entry" },
  { time: "09:10 PM", plate: "CAB-4829", owner: "Prof. K. Samarasinghe", category: "Staff Vehicle", action: "Entry" },
  { time: "09:45 PM", plate: "WP CAD-1092", owner: "Dr. A. Pathirana", category: "Staff Vehicle", action: "Exit" },
];

let currentVehicle = null;

function resolveVehicle(input) {
  const code = input.trim().toUpperCase();
  if (MOCK_VEHICLE_DIRECTORY[code]) {
    return MOCK_VEHICLE_DIRECTORY[code];
  }
  if (!code) return null;

  return {
    plate: code,
    owner: "Registered Owner",
    category: "Visitor / Official",
  };
}

function updateStats() {
  const entries = vehicleLog.filter(v => v.action === "Entry").length;
  const exits = vehicleLog.filter(v => v.action === "Exit").length;
  const inside = entries - exits;

  document.getElementById("statInside").innerText = inside >= 0 ? inside : 0;
  document.getElementById("statEntries").innerText = entries;
  document.getElementById("statExits").innerText = exits;
}

function renderLog() {
  const tbody = document.getElementById("logTableBody");
  tbody.innerHTML = vehicleLog
    .map(
      (row) => `
      <tr>
        <td>${row.time}</td>
        <td><strong>${row.plate}</strong></td>
        <td>${row.owner}</td>
        <td>${row.category}</td>
        <td><span class="status-pill ${row.action === "Entry" ? "active" : "expired"}">${row.action}</span></td>
      </tr>`
    )
    .join("");

  updateStats();
}

function showResult(vehicle) {
  currentVehicle = vehicle;
  document.getElementById("resultEmpty").style.display = "none";
  document.getElementById("resultPanel").style.display = "block";

  document.getElementById("resultPlate").innerText = vehicle.plate;
  document.getElementById("resultOwner").innerText = vehicle.owner;
  document.getElementById("resultCategory").innerText = vehicle.category;
}

function recordAction(action) {
  if (!currentVehicle) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  vehicleLog.unshift({
    time: timeStr,
    plate: currentVehicle.plate,
    owner: currentVehicle.owner,
    category: currentVehicle.category,
    action: action,
  });

  renderLog();
  alert(`Vehicle ${action} recorded for ${currentVehicle.plate} (${currentVehicle.owner}).`);
}

document.addEventListener("DOMContentLoaded", () => {
  renderLog();

  const searchBtn = document.getElementById("searchBtn");
  const vehicleInput = document.getElementById("vehicleInput");

  searchBtn.addEventListener("click", () => {
    const code = vehicleInput.value;
    if (!code.trim()) {
      alert("Please enter a vehicle plate or tag number first.");
      return;
    }

    const vehicle = resolveVehicle(code);
    showResult(vehicle);
  });

  vehicleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBtn.click();
    }
  });

  document.getElementById("recordEntryBtn").addEventListener("click", () => recordAction("Entry"));
  document.getElementById("recordExitBtn").addEventListener("click", () => recordAction("Exit"));
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
