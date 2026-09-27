document.addEventListener("DOMContentLoaded", () => {
  initClock();
  setupSearchInput();
  syncUserSector();
});

/**
 * Updates topbar live digital clock and date
 */
function initClock() {
    updateGreeting();
  function updateClock() {
    updateGreeting();
    const timeElem = document.getElementById("current-time");
    const dateElem = document.getElementById("current-date");

    if (!timeElem || !dateElem) return;

    const now = new Date();
    const hours = now.toLocaleTimeString("en-US", { hour12: true });
    const options = { weekday: "long", day: "2-digit", month: "short", year: "numeric" };
    const dateStr = now.toLocaleDateString("en-US", options).toUpperCase();

    timeElem.innerText = hours;
    dateElem.innerText = dateStr;
  }

  setInterval(updateClock, 1000);
  updateClock();
}

/**
 * Allows the OIC to send a quick progress report/reply back to the CSO
 */
function sendCSOReply() {
  const message = prompt("Enter brief progress report or update for Susantha De Silva:");
  
  if (message && message.trim() !== "") {
    alert("Status report successfully dispatched to Chief Security Susantha De Silva.");
  }
}

/**
 * Setup search bar filtering for the directives table
 */
function setupSearchInput() {
  const searchInput = document.querySelector(".search-bar input");
  if (!searchInput) return;

  searchInput.addEventListener("input", filterDirectivesTable);
}

/**
 * Filter directives table rows based on text search
 */
function filterDirectivesTable() {
  const searchInput = document.querySelector(".search-bar input");
  if (!searchInput) return;

  const query = searchInput.value.toLowerCase().trim();
  const rows = document.querySelectorAll("#directivesTable tbody tr");

  rows.forEach((row) => {
    const textContent = row.textContent.toLowerCase();
    if (textContent.includes(query)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

document.querySelector('.sidebar-footer .btn-logout').addEventListener('click', function() {
    // Clear session storage or tokens here if needed
    // localStorage.removeItem('token');
    
    window.location.href = '../loginPage.html';
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

function syncUserSector() {
  const sessionUser = sessionStorage.getItem("uniguard_user");
  if (sessionUser) {
    try {
      const u = JSON.parse(sessionUser);
      const sector = u.assigned_sector || (u.meta_data ? u.meta_data.assigned_sector : '') || '';
      const sectorElem = document.querySelector(".sector-name");
      if (sectorElem && sector) {
        sectorElem.textContent = sector;
      }
    } catch(e){}
  }
}
