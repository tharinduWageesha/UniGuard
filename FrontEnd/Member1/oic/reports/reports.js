document.addEventListener("DOMContentLoaded", () => {
  initClock();
});

/* ==========================================
   1. LIVE CLOCK & DATE
   ========================================== */
/**
 * Initializes and updates the live digital topbar clock and date.
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
/* ==========================================
   6. DEPARTMENT REPORTS MANAGEMENT
   ========================================== */

/**
 * Updates file name display when OIC selects a document file.
 */
function updateFileName(inputElement) {
  const displayElem = document.getElementById("fileNameDisplay");
  if (inputElement.files && inputElement.files[0]) {
    const file = inputElement.files[0];
    displayElem.innerHTML = `<strong style="color: var(--primary-blue);"><i class="fa-solid fa-file-circle-check"></i> Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)</strong>`;
  } else {
    displayElem.innerText = "Click or drag & drop document file here";
  }
}

/**
 * Handles uploading the report document and dispatching to CSO
 */
function handleReportUpload(event) {
  event.preventDefault();

  const title = document.getElementById("reportTitle").value.trim();
  const category = document.getElementById("reportCategory").value;
  const period = document.getElementById("reportPeriod").value.trim();
  const remarks = document.getElementById("reportRemarks").value.trim();
  const fileInput = document.getElementById("reportFileInput");

  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please attach a document file (PDF or Word) before submitting.");
    return;
  }

  const fileName = fileInput.files[0].name;
  const fileSize = (fileInput.files[0].size / (1024 * 1024)).toFixed(2) + " MB";

  // Generate Reference Number
  const repRef = "REP-" + Math.floor(100 + Math.random() * 900);

  // Form Date String
  const now = new Date();
  const options = { day: "2-digit", month: "SHORT", year: "numeric" };
  const dateStr = now.toLocaleDateString("en-US", options).toUpperCase();

  // Create Table Row
  const tableBody = document.getElementById("reportsTableBody");
  if (tableBody) {
    const newRow = document.createElement("tr");
    newRow.setAttribute("data-id", `REP-2026-${repRef}`);
    newRow.innerHTML = `
      <td><strong>${repRef}</strong></td>
      <td>
        <strong>${title}</strong><br>
        <small class="text-muted">File: ${fileName} (${fileSize})</small>
      </td>
      <td><span class="priority-badge normal">${category}</span></td>
      <td>${dateStr}<br><small class="text-muted">By Ranasinghe</small></td>
      <td><span class="status-pill pending"><i class="fa-solid fa-hourglass-half"></i> Pending CSO Review</span></td>
      <td>
        <button class="btn-secondary btn-xs" onclick="downloadReport('${fileName}')">
          <i class="fa-solid fa-download"></i> View File
        </button>
      </td>
    `;
    tableBody.prepend(newRow);
  }

  // Update Counters
  updateReportCounters();

  // Reset Form
  document.getElementById("uploadReportForm").reset();
  document.getElementById("fileNameDisplay").innerText = "Click or drag & drop document file here";

  alert(`REPORT DISPATCHED TO CSO!\n\nReport '${title}' (${repRef}) has been successfully submitted to Chief Security Susantha De Silva.`);
}

/**
 * Download / View existing uploaded report
 */
function downloadReport(fileName) {
  alert(`Downloading document: ${fileName}\nAccessing secure storage server...`);
}

/**
 * Filter report table by search query
 */
function filterReports() {
  const query = document.getElementById("searchReports").value.toLowerCase();
  const rows = document.querySelectorAll("#reportsTable tbody tr");

  rows.forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
  });
}

/**
 * Dynamic Counter Updates
 */
function updateReportCounters() {
  const submittedElem = document.getElementById("countSubmittedReports");
  const pendingElem = document.getElementById("countPendingReview");

  if (submittedElem) {
    submittedElem.innerText = parseInt(submittedElem.innerText || "0") + 1;
  }
  if (pendingElem) {
    pendingElem.innerText = parseInt(pendingElem.innerText || "0") + 1;
  }
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
