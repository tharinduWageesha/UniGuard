/* ===================================================
   CSO VISITOR REQUESTS & OIC DISPATCH CONTROLLER
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initializeClock();
});

/**
 * Live Clock & Date Updater
 */
function initializeClock() {
    updateGreeting();
  const timeElem = document.getElementById('current-time');
  const dateElem = document.getElementById('current-date');

  function updateTime() {
    const now = new Date();
    if (timeElem) {
      timeElem.innerText = now.toLocaleTimeString('en-US', { hour12: true });
    }
    if (dateElem) {
      const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
      dateElem.innerText = now.toLocaleDateString('en-US', options).toUpperCase();
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/**
 * Open View Details Modal
 */
function openViewModal(refId, visitor, visitorId, purpose, schedule, sector, adminDocs, status) {
  document.getElementById('viewRefCode').innerText = refId;
  document.getElementById('viewVisitorName').innerText = visitor;
  document.getElementById('viewVisitorId').innerText = `ID/NIC: ${visitorId}`;
  document.getElementById('viewPurpose').innerText = purpose;
  document.getElementById('viewSchedule').innerText = schedule;
  document.getElementById('viewSector').innerText = sector;
  document.getElementById('viewAdminDocs').innerText = adminDocs;

  const modal = document.getElementById('viewModal');
  if (modal) modal.classList.add('active');
}

function closeViewModal() {
  const modal = document.getElementById('viewModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Open Forward Modal
 */
function openForwardModal(reqId, visitorName, sectorName, defaultOic) {
  document.getElementById('forwardRequestId').value = reqId;
  document.getElementById('forwardVisitorSummary').value = `${reqId} - ${visitorName} (${sectorName})`;
  document.getElementById('csoSecurityRemarks').value = '';

  const select = document.getElementById('forwardOicSelect');
  if (select && defaultOic) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value.includes(defaultOic)) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  const modal = document.getElementById('forwardModal');
  if (modal) modal.classList.add('active');
}

function closeForwardModal() {
  const modal = document.getElementById('forwardModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Submit CSO Forward Directive to Department OIC
 */
function submitForwardToOic() {
  const reqId = document.getElementById('forwardRequestId').value;
  const assignedOic = document.getElementById('forwardOicSelect').value;
  const remarks = document.getElementById('csoSecurityRemarks').value.trim();

  if (!remarks) {
    alert('Please enter CSO security directives or remarks before dispatching to the OIC.');
    return;
  }

  // Update table row dynamically
  const row = document.querySelector(`tr[data-id="${reqId}"]`);
  if (row) {
    // Status Pill Update
    const statusPill = row.querySelector('.status-pill');
    if (statusPill) {
      statusPill.className = 'status-pill completed';
      statusPill.innerHTML = '<i class="fa-solid fa-circle-check"></i> Forwarded to OIC';
    }

    // Action button update
    const actionCell = row.querySelector('td:last-child');
    if (actionCell) {
      actionCell.innerHTML = `
        <div class="action-btn-group">
          <button class="icon-btn" title="View Briefing" onclick="openViewModal('${reqId}', 'Visitor', 'Verified', 'Approved Visit', 'Scheduled', 'Sector', 'Cleared by Admin. CSO Remarks: ${remarks.replace(/'/g, "\\'")}', 'Forwarded to ${assignedOic}')"><i class="fa-regular fa-eye"></i></button>
          <button class="btn-disabled" disabled><i class="fa-solid fa-check"></i> Forwarded</button>
        </div>
      `;
    }
  }

  // Update counters
  updateCounter('countPendingForward', -1);
  updateCounter('countForwarded', 1);

  alert(`Visitor Request ${reqId} has been successfully forwarded to ${assignedOic} with your remarks.`);
  closeForwardModal();
}

/**
 * Filter Table Records
 */
function filterVisitorRequests() {
  const topInput = document.getElementById('searchRequests');
  const tableInput = document.getElementById('tableFilterInput');
  const query = (topInput && topInput.value ? topInput.value : tableInput ? tableInput.value : '').toLowerCase();

  const rows = document.querySelectorAll('#visitorRequestsTable tbody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

/**
 * Counter Updater
 */
function updateCounter(id, delta) {
  const elem = document.getElementById(id);
  if (elem) {
    let current = parseInt(elem.innerText, 10) || 0;
    elem.innerText = Math.max(0, current + delta);
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
