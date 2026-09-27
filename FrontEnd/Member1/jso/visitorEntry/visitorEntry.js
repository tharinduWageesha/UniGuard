/* ==========================================================
   JSO — VISITOR ENTRY & EXIT MANAGEMENT
   Handles direct loading of Visitor Pass details (no verification step)
   and logs Entry / Exit actions exclusively for visitors.
   ========================================================== */

// Mock Database of Registered Visitors
const VISITOR_DATABASE = {
  "VIS-482913": { name: "Nimal Ratnayake", dept: "IT Department - Server Room Access", initials: "NR" },
  "VIS-102948": { name: "Saman Kumara", dept: "Main Library - Maintenance", initials: "SK" },
  "VIS-993812": { name: "Priyantha Perera", dept: "Administration - Meeting", initials: "PP" },
  "198812345V": { name: "Sunil Wickramasinghe", dept: "Finance Branch - Audit", initials: "SW" },
};

// Initial Log entries (Visitors Only)
let visitorLog = [
  { time: "09:05 AM", passId: "VIS-482913", name: "Nimal Ratnayake", dept: "IT Department", action: "Entry" },
  { time: "10:15 AM", passId: "VIS-102948", name: "Saman Kumara", dept: "Main Library", action: "Entry" },
  { time: "11:00 AM", passId: "VIS-102948", name: "Saman Kumara", dept: "Main Library", action: "Exit" },
];

let currentVisitor = null;

/**
 * Directly fetches visitor details without a verification delay
 */
function getVisitorInfo(passId) {
  const code = passId.trim().toUpperCase();
  if (!code) return null;

  if (VISITOR_DATABASE[code]) {
    return { passId: code, ...VISITOR_DATABASE[code] };
  }

  // Fallback for any other custom Visitor ID entered
  return {
    passId: code,
    name: "Registered Visitor",
    dept: "General Campus Visit",
    initials: "RV",
  };
}

/**
 * Renders the Visitor Gate Log Table
 */
function renderVisitorLog() {
  const tbody = document.getElementById("logTableBody");
  tbody.innerHTML = visitorLog
    .map(
      (row) => `
      <tr>
        <td>${row.time}</td>
        <td><strong>${row.passId}</strong></td>
        <td>${row.name}</td>
        <td>${row.dept}</td>
        <td><span class="status-pill ${row.action === "Entry" ? "active" : "expired"}">${row.action}</span></td>
      </tr>`
    )
    .join("");
}

/**
 * Displays loaded Visitor Details directly
 */
function showVisitorDetails(visitor) {
  currentVisitor = visitor;
  document.getElementById("resultEmpty").style.display = "none";
  document.getElementById("resultPanel").style.display = "block";

  document.getElementById("resultAvatar").innerText = visitor.initials;
  document.getElementById("resultName").innerText = visitor.name;
  document.getElementById("resultId").innerText = visitor.passId;
  document.getElementById("resultDept").innerText = visitor.dept;
}

/**
 * Logs Entry or Exit action for the loaded Visitor
 */
function recordVisitorAction(action) {
  if (!currentVisitor) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  visitorLog.unshift({
    time: timeStr,
    passId: currentVisitor.passId,
    name: currentVisitor.name,
    dept: currentVisitor.dept,
    action: action,
  });

  renderVisitorLog();
  alert(`Visitor ${action} recorded for ${currentVisitor.name} (${currentVisitor.passId}).`);
}

document.addEventListener("DOMContentLoaded", () => {
  renderVisitorLog();

  const loadBtn = document.getElementById("loadVisitorBtn");
  const visitorInput = document.getElementById("visitorInput");

  // Load Visitor details on button click
  loadBtn.addEventListener("click", () => {
    const passId = visitorInput.value;
    if (!passId.trim()) {
      alert("Please enter a Visitor Pass ID or NIC number.");
      return;
    }

    const visitor = getVisitorInfo(passId);
    showVisitorDetails(visitor);
  });

  // Load Visitor details on Enter key
  visitorInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      loadBtn.click();
    }
  });

  // Record Entry & Exit
  document.getElementById("recordEntryBtn").addEventListener("click", () => recordVisitorAction("Entry"));
  document.getElementById("recordExitBtn").addEventListener("click", () => recordVisitorAction("Exit"));
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
