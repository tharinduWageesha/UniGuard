

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
   2. NIGHT VEHICLE ENTRY & ACCESS REGISTRY
   ========================================== */

let activeReviewRequest = null;

/**
 * Opens the OIC modal to review a night vehicle entry application.
 */
function openReviewModal(reqId, applicant, category, plate, model, windowStr, reason) {
    activeReviewRequest = { reqId, applicant, category, plate, model, windowStr, reason };

    document.getElementById("modalReqId").value = reqId;
    document.getElementById("modalApplicant").innerText = applicant;
    document.getElementById("modalCategory").innerText = category;
    document.getElementById("modalPlate").innerText = plate;
    document.getElementById("modalModel").innerText = model;
    document.getElementById("modalWindow").innerText = windowStr;
    document.getElementById("modalReason").innerText = reason;
    document.getElementById("modalOicRemarks").value = "";
    document.getElementById("modalDecisionSelect").value = "APPROVE";

    document.getElementById("reviewVehicleModal").classList.add("active");
}

/**
 * Closes the Night Access Review Modal.
 */
function closeReviewModal() {
    const modal = document.getElementById("reviewVehicleModal");
    if (modal) modal.classList.remove("active");
}

/**
 * Handles approval or rejection of night vehicle requests and syncs to Gate JSOs.
 */
function submitVehicleDecision() {
    const decision = document.getElementById("modalDecisionSelect").value;
    const remarks = document.getElementById("modalOicRemarks").value.trim();
    const req = activeReviewRequest;

    if (!req) return;

    const pendingRow = document.querySelector(`#pendingRequestsTable tr[data-id="${req.reqId}"]`);

    if (decision === "APPROVE") {
        // 1. Generate unique Night Pass ID
        const passCode = "NP-" + Math.floor(1000 + Math.random() * 9000);

        // 2. Remove from pending table
        if (pendingRow) pendingRow.remove();

        // 3. Sync & Append directly to Active Registry Table (Visible to Gate JSOs)
        const registryBody = document.getElementById("activeRegistryBody");
        if (registryBody) {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
        <td><strong class="pass-code-tag">${passCode}</strong></td>
        <td><strong style="color: var(--primary-blue); font-size: 0.9rem;">${req.plate}</strong></td>
        <td>${req.model}</td>
        <td><strong>${req.applicant}</strong><br><small class="text-muted">${req.category}</small></td>
        <td>${req.windowStr}</td>
        <td><span class="status-pill completed"><i class="fa-solid fa-circle-check"></i> Approved & Active</span></td>
        <td><span class="priority-badge normal"><i class="fa-solid fa-gate"></i> Gate Access Authorized</span></td>
      `;
            registryBody.prepend(newRow);
        }

        // Update Counters
        adjustVehicleCounters(-1, 1, 0);

        alert(`NIGHT VEHICLE PASS APPROVED!\n\nPass Code [${passCode}] issued for ${req.plate}.\nThe vehicle registry has been updated. Gate JSOs can now verify entry for ${req.applicant}.`);

    } else {
        // Rejection Flow
        if (!remarks) {
            alert("Please provide a reason/remark for rejecting this request.");
            return;
        }

        if (pendingRow) pendingRow.remove();

        // Update Counters
        adjustVehicleCounters(-1, 0, 1);

        alert(`REQUEST REJECTED:\nApplication for ${req.plate} was declined. Notification sent to ${req.applicant}.`);
    }

    closeReviewModal();
}

/**
 * Helper to dynamically update Night Access counter statistics.
 */
function adjustVehicleCounters(pendingDelta, activeDelta, rejectedDelta) {
    const pendingElem = document.getElementById("countPendingVehicles");
    const activeElem = document.getElementById("countActivePasses");
    const rejectedElem = document.getElementById("countRejectedVehicles");

    if (pendingElem && pendingDelta !== 0) {
        pendingElem.innerText = Math.max(0, parseInt(pendingElem.innerText || "0") + pendingDelta);
    }
    if (activeElem && activeDelta !== 0) {
        activeElem.innerText = Math.max(0, parseInt(activeElem.innerText || "0") + activeDelta);
    }
    if (rejectedElem && rejectedDelta !== 0) {
        rejectedElem.innerText = Math.max(0, parseInt(rejectedElem.innerText || "0") + rejectedDelta);
    }
}

/**
 * Search filter for Night Vehicle Request & Registry tables
 */
function filterNightVehicleTables() {
    const query = document.getElementById("searchVehicleReq").value.toLowerCase();

    const pendingRows = document.querySelectorAll("#pendingRequestsTable tbody tr");
    pendingRows.forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
    });

    const registryRows = document.querySelectorAll("#activeNightRegistryTable tbody tr");
    registryRows.forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none";
    });
}

/* ==========================================
   3. CSO DIRECTIVES & GOVERNANCE
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

    alert(`Directive ${directiveId} updated to 'In Progress'. CSO notified.`);
}

/* ==========================================
   4. INCIDENT REVIEW & ESCALATION
   ========================================== */
function escalateToCSO(incidentId, title) {
    const confirmAction = confirm(
        `CONFIRM ESCALATION:\n\nDo you want to immediately dispatch '${title}' (${incidentId}) to Chief Security Susantha De Silva?`
    );

    if (!confirmAction) return;

    const row = document.querySelector(`tr[data-id="${incidentId}"]`);
    if (row) {
        const statusPill = row.querySelector(".status-pill");
        const actionsCell = row.cells[6];

        if (statusPill) {
            statusPill.className = "status-pill pending";
            statusPill.style.background = "#fee2e2";
            statusPill.style.color = "#b91c1c";
            statusPill.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Escalated to CSO`;
        }

        if (actionsCell) {
            actionsCell.innerHTML = `<button class="btn-secondary btn-xs" disabled><i class="fa-solid fa-shield-cat"></i> Escalated</button>`;
        }
    }

    alert(`Incident ${incidentId} successfully escalated to Chief Security Officer.`);
}

function openJsoModal(incidentId, jsoName) {
    const modal = document.getElementById("jsoModal");
    if (!modal) return;

    document.getElementById("modalIncidentId").value = incidentId;
    document.getElementById("modalJsoName").value = jsoName;
    document.getElementById("modalJsoFeedback").value = "";

    modal.classList.add("active");
}

function closeJsoModal() {
    const modal = document.getElementById("jsoModal");
    if (modal) modal.classList.remove("active");
}

function submitJsoFeedback() {
    const incidentId = document.getElementById("modalIncidentId").value;
    const jsoName = document.getElementById("modalJsoName").value;
    const status = document.getElementById("modalStatusSelect").value;
    const feedback = document.getElementById("modalJsoFeedback").value;

    if (!feedback.trim()) {
        alert("Please enter status notes or instructions for the JSO.");
        return;
    }

    const row = document.querySelector(`tr[data-id="${incidentId}"]`);
    if (row) {
        const statusPill = row.querySelector(".status-pill");
        const actionsCell = row.cells[6];

        if (statusPill) {
            statusPill.className = "status-pill completed";
            statusPill.innerHTML = `<i class="fa-solid fa-check"></i> ${status} & Informed`;
        }

        if (actionsCell) {
            actionsCell.innerHTML = `<button class="btn-secondary btn-xs" disabled><i class="fa-solid fa-circle-check"></i> Feedback Sent</button>`;
        }
    }

    closeJsoModal();
    alert(`Status update successfully transmitted to ${jsoName}.`);
}

/* ==========================================
   5. VISITOR MANAGEMENT & PASS GENERATION
   ========================================== */
let currentGeneratingRequestId = null;

function generateVisitorPass(reqId, name, nic, dept, date, email) {
    currentGeneratingRequestId = reqId;
    const randomBarcode = "VIS-" + Math.floor(100000 + Math.random() * 900000);

    document.getElementById("passVisitorName").innerText = name;
    document.getElementById("passNic").innerText = nic;
    document.getElementById("passDept").innerText = dept;
    document.getElementById("passDate").innerText = date;
    document.getElementById("passBarcodeCode").innerText = randomBarcode;
    document.getElementById("passEmailInput").value = email;

    try {
        if (typeof JsBarcode !== "undefined") {
            JsBarcode("#barcodeCanvas", randomBarcode, {
                format: "CODE128",
                lineColor: "#0f172a",
                width: 2,
                height: 50,
                displayValue: false
            });
        }
    } catch (err) {
        console.error("Barcode generation error:", err);
    }

    document.getElementById("passModal").classList.add("active");
}

function closePassModal() {
    const modal = document.getElementById("passModal");
    if (modal) modal.classList.remove("active");
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
