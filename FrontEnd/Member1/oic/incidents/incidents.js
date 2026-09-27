
document.addEventListener("DOMContentLoaded", () => {
  initClock();
});

/* ==========================================
   1. LIVE CLOCK & DATE
   ========================================== */
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
   2. CSO DIRECTIVES & GOVERNANCE
   ========================================== */
function acknowledgeDirective(directiveId, btnElement) {
  const confirmed = confirm(`Are you sure you want to acknowledge directive ${directiveId}?`);
  if (!confirmed) return;

  if (btnElement) {
    const row = btnElement.closest("tr");
    const statusPill = row ? row.querySelector(".status-pill") : null;

    if (statusPill) {
      statusPill.className = "status-pill in-progress";
      statusPill.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Acknowledged`;
    }

    btnElement.className = "btn-secondary btn-xs";
    btnElement.disabled = true;
    btnElement.innerHTML = "In Progress";
  }

  alert(`Directive ${directiveId} updated to 'In Progress'. Chief Security Susantha De Silva has been notified.`);
}

function filterDirectives() {
  const filterElement = document.getElementById("filterDirective");
  if (!filterElement) return;

  const filterValue = filterElement.value.toLowerCase();
  const rows = document.querySelectorAll("#directivesTable tbody tr");

  rows.forEach((row) => {
    const statusPill = row.querySelector(".status-pill");
    if (!statusPill) return;

    const statusText = statusPill.textContent.toLowerCase();
    
    if (filterValue === "all" || statusText.includes(filterValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function sendCSOReply() {
  const message = prompt("Enter brief progress report or update for Susantha De Silva:");
  
  if (message && message.trim() !== "") {
    alert("Status report successfully dispatched to Chief Security Susantha De Silva.");
  }
}

/* ==========================================
   3. INCIDENT REVIEW & ESCALATION
   ========================================== */
function filterIncidents() {
  const searchInput = document.getElementById("searchIncidents") || document.getElementById("tableFilterInput");

  if (!searchInput) return;

  const query = searchInput.value.toLowerCase();
  const rows = document.querySelectorAll("#incidentsTable tbody tr");

  rows.forEach((row) => {
    const rowText = row.innerText.toLowerCase();
    if (rowText.includes(query)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function updateIncidentCounters(escalatedDelta = 0, receivedDelta = 0, resolvedDelta = 0) {
  const countEscalated = document.getElementById("countEscalated");
  const countReceived = document.getElementById("countReceived");
  const countResolved = document.getElementById("countResolved");

  if (countEscalated && escalatedDelta !== 0) {
    countEscalated.innerText = Math.max(0, parseInt(countEscalated.innerText || "0") + escalatedDelta);
  }
  if (countReceived && receivedDelta !== 0) {
    countReceived.innerText = Math.max(0, parseInt(countReceived.innerText || "0") + receivedDelta);
  }
  if (countResolved && resolvedDelta !== 0) {
    countResolved.innerText = Math.max(0, parseInt(countResolved.innerText || "0") + resolvedDelta);
  }
}

/**
 * Opens Briefing Modal with updated labels
 */
function openBriefingModal(code, location, title, reportDesc, jsoOfficer, statusDirective, imgUrl) {
  document.getElementById('modalRefCode').innerText = code;
  document.getElementById('modalLocation').innerText = `${title} - ${location}`;
  document.getElementById('modalObservations').innerText = reportDesc;
  document.getElementById('modalOfficer').innerText = jsoOfficer;
  document.getElementById('modalDirectives').innerText = statusDirective;
  document.getElementById('modalEvidenceImg').src = imgUrl;
  document.getElementById('briefingModal').style.display = 'flex';
}

function closeBriefingModal() {
  document.getElementById('briefingModal').style.display = 'none';
}

/* ==========================================
   OIC INCIDENT OPERATIONS HANDLER
   ========================================== */

function openActionModal(incidentId, incidentTitle = '', jsoName = '') {
  const modal = document.getElementById('actionModal');
  if (!modal) return;

  document.getElementById('modalIncidentId').value = incidentId;
  
  const titleField = document.getElementById('modalIncidentTitle');
  if (titleField) {
    titleField.value = incidentTitle ? `${incidentId} - ${incidentTitle}` : incidentId;
  }

  const jsoField = document.getElementById('modalJsoName');
  if (jsoField) {
    jsoField.value = jsoName || 'Assigned JSO';
  }

  document.getElementById('modalActionType').value = 'RESOLVE';
  document.getElementById('modalCsoRemarks').value = '';

  toggleActionFields();

  modal.style.display = 'flex';
  modal.classList.add('active');
}

function closeActionModal() {
  const modal = document.getElementById('actionModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}

/**
 * Toggle display fields based on chosen OIC Action Decision
 */
function toggleActionFields() {
  const actionType = document.getElementById('modalActionType').value;
  const escalateGroup = document.getElementById('escalateFieldGroup');
  const submitBtn = document.getElementById('btnSubmitAction');

  if (actionType === 'RESOLVE') {
    escalateGroup.style.display = 'none';
    submitBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Mark as Resolved';
    submitBtn.style.backgroundColor = '#10b981'; // Green
  } else if (actionType === 'ESCALATE_CSO') {
    escalateGroup.style.display = 'block';
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Escalate to CSO';
    submitBtn.style.backgroundColor = '#ef4444'; // Red
  }
}

/**
 * Process OIC Action (Resolve or Escalate)
 */
function submitOicAction() {
  const incidentId = document.getElementById('modalIncidentId').value;
  const actionType = document.getElementById('modalActionType').value;

  if (actionType === 'RESOLVE') {
    updateRowStatus(incidentId, 'Resolved', 'Reviewed');
    updateCounter('countResolved', 1);
    updateCounter('countReceived', -1);

    alert(`Incident ${incidentId} has been marked as RESOLVED.`);
  } 
  else if (actionType === 'ESCALATE_CSO') {
    const csoRemarks = document.getElementById('modalCsoRemarks').value.trim();
    if (!csoRemarks) {
      alert('Please enter critical remarks and recommendations for the CSO.');
      return;
    }

    updateRowStatus(incidentId, 'Critical', 'Reviewed');
    updateCounter('countEscalated', 1);
    updateCounter('countReceived', -1);

    alert(`Incident ${incidentId} has been escalated as a CRITICAL incident to the Chief Security Officer (CSO).`);
  }

  closeActionModal();
}

function deleteIncident(target) {
  let row;
  
  if (typeof target === 'string') {
    row = document.querySelector(`tr[data-id="${target}"]`);
  } else if (target && target.closest) {
    row = target.closest('tr');
  }

  if (!row) return;

  const incidentId = row.getAttribute('data-id') || 'this incident';

  if (confirm(`Are you sure you want to dismiss/delete ${incidentId}? This action cannot be undone.`)) {
    row.style.transition = 'all 0.3s ease';
    row.style.opacity = '0';
    
    setTimeout(() => {
      row.remove();
      updateCounter('countReceived', -1);
    }, 300);
  }
}

function updateRowStatus(incidentId, actionStatus, reviewStatusText) {
  const row = document.querySelector(`tr[data-id="${incidentId}"]`);
  if (!row) return;

  const actionBadge = row.cells[2].querySelector('.priority-badge');
  if (actionBadge) {
    actionBadge.className = `priority-badge ${actionStatus.toLowerCase() === 'resolved' ? 'low' : 'critical'}`;
    actionBadge.innerText = actionStatus;
  }

  const reviewCell = row.cells[3].querySelector('.status-pill');
  if (reviewCell) {
    reviewCell.className = `status-pill ${reviewStatusText.toLowerCase() === 'reviewed' ? 'completed' : 'pending'}`;
    reviewCell.innerHTML = `<i class="fa-solid fa-${reviewStatusText.toLowerCase() === 'reviewed' ? 'check' : 'clock'}"></i> ${reviewStatusText}`;
  }
}

function updateCounter(counterId, change) {
  const element = document.getElementById(counterId);
  if (element) {
    let currentVal = parseInt(element.innerText, 10) || 0;
    element.innerText = Math.max(0, currentVal + change);
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
