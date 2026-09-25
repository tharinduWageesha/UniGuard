// Sample Critical Incidents Data (With Evidence & Action Logs)
let incidentData = JSON.parse(localStorage.getItem("uniguard_incidents")) || [
  {
    id: 101,
    code: "INC-2026-089",
    type: "Perimeter Gate Security Breach",
    sector: "UCSC Sector",
    location: "Gate 03 Fence Line",
    status: "Pending Action", // Updated status
    assignedOic: "A.B. Perera",
    description: "Unauthorized access attempt spotted on CCTV camera 04 along the east perimeter fence at 02:15 AM.",
    evidence: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=300&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1508873696983-2df515122519?w=300&auto=format&fit=crop&q=60"
    ],
    directives: "CSO ordered immediate perimeter sweep and patrol reinforcement."
  },
  {
    id: 102,
    code: "INC-2026-092",
    type: "Lab Equipment Theft Attempt",
    sector: "Science Block",
    location: "Physics Lab 02",
    status: "Pending Action", // Updated status
    assignedOic: "K.L. Ratnayake",
    description: "Window latch tampered with overnight. Two specialized desktop workstations prepared for removal near the rear emergency door.",
    evidence: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60"
    ],
    directives: "Escalated to local police. Forensics team summoned to clear scene."
  },
  {
    id: 103,
    code: "INC-2026-095",
    type: "Unlawful Gathering / Noise Disturbance",
    sector: "Main Library Complex",
    location: "Library Courtyard",
    status: "CSO Resolved", // Updated status
    assignedOic: "M.S. Jayasinghe",
    description: "Group of non-registered individuals gathered after operational hours. Dispersed peacefully upon JSO intervention.",
    evidence: [],
    directives: "Standard clearance executed. No further intervention needed."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  startLiveClock();
  renderIncidentTable();
  updateMetrics();
});

// Live Clock in Topbar
function startLiveClock() {
  initOfficerStatus();
    updateGreeting();
  const updateClock = () => {
    updateGreeting();
    const now = new Date();
    const timeElem = document.getElementById("current-time");
    const dateElem = document.getElementById("current-date");

    if (timeElem && dateElem) {
      timeElem.textContent = now.toLocaleTimeString("en-US", { hour12: true });
      dateElem.textContent = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
  };
  updateClock();
  setInterval(updateClock, 1000);
}

// Render Table (Replacing Severity with CSO Resolution Status)
function renderIncidentTable(dataToRender = incidentData) {
  const tbody = document.getElementById("incident-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (dataToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #94a3b8;">No matching critical incident records found.</td></tr>`;
    return;
  }

  dataToRender.forEach((inc) => {
    const tr = document.createElement("tr");

    // Resolution Status Badges
    const isResolved = inc.status === "CSO Resolved";
    const statusBadgeClass = isResolved ? "status-resolved" : "status-pending";
    const statusIcon = isResolved ? "fa-circle-check" : "fa-clock";
    const statusColor = isResolved ? "#059669" : "#d97706";
    const statusBg = isResolved ? "#d1fae5" : "#fef3c7";

    tr.innerHTML = `
      <td>
        <div style="font-weight:700; color:#1e293b;">${inc.code}</div>
        <div style="font-size:0.85rem; color:#475569; font-weight:600;">${inc.type}</div>
      </td>
      <td>
        <span class="department-badge">${inc.sector}</span>
        <div style="font-size:0.75rem; color:#64748b; margin-top:2px;"><i class="fa-solid fa-location-dot"></i> ${inc.location}</div>
      </td>
      <td>
        <span class="status-pill ${statusBadgeClass}" style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
          <i class="fa-solid ${statusIcon}"></i> ${inc.status}
        </span>
      </td>
      <td>
        <div style="font-weight:600; color:#334155;">${inc.assignedOic || "Unassigned"}</div>
      </td>
      <td class="text-right">
        <div class="action-btns">
          <button class="btn-icon" title="View Full Briefing & Evidence" onclick="openBriefingModal(${inc.id})">
            <i class="fa-solid fa-eye" style="color: #0284c7;"></i>
          </button>
          <button class="btn-icon" title="Take CSO Action & Update Status" onclick="openActionModal(${inc.id})">
            <i class="fa-solid fa-user-shield" style="color: #059669;"></i>
          </button>
          <button class="btn-icon delete" title="Delete Incident Record" onclick="deleteIncident(${inc.id})">
            <i class="fa-solid fa-trash-can" style="color: #dc2626;"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateMetrics() {
  const totalElem = document.getElementById("total-incidents-count");
  const activeElem = document.getElementById("active-incidents-count");
  const resolvedElem = document.getElementById("resolved-incidents-count");

  if (totalElem) totalElem.textContent = incidentData.length;

  const pendingCount = incidentData.filter((i) => i.status === "Pending Action").length;
  if (activeElem) activeElem.textContent = pendingCount;

  const resolvedCount = incidentData.filter((i) => i.status === "CSO Resolved").length;
  if (resolvedElem) resolvedElem.textContent = resolvedCount;
}

// Filter Search Handler
function filterIncidentTable() {
  const input = document.getElementById("incident-search-input");
  if (!input) return;

  const query = input.value.toLowerCase().trim();
  const filtered = incidentData.filter(
    (i) =>
      i.code.toLowerCase().includes(query) ||
      i.type.toLowerCase().includes(query) ||
      i.sector.toLowerCase().includes(query) ||
      i.location.toLowerCase().includes(query) ||
      i.status.toLowerCase().includes(query) ||
      (i.assignedOic && i.assignedOic.toLowerCase().includes(query))
  );
  renderIncidentTable(filtered);
}

// Modal Toggle Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

function openReportModal() {
  const title = document.getElementById("modalTitle");
  if (title) title.textContent = "Log New Critical Incident";
  
  const form = document.getElementById("incidentForm");
  if (form) form.reset();
  
  document.getElementById("incident-id").value = "";
  openModal("incidentModal");
}

// Log New Incident Form Submit
function handleFormSubmit(event) {
  event.preventDefault();
  
  const type = document.getElementById("incident-title").value.trim();
  const sector = document.getElementById("incident-sector").value;
  const location = document.getElementById("incident-location").value.trim();
  const status = document.getElementById("incident-status").value; // Replaced severity
  const assignedOic = document.getElementById("incident-assigned-oic").value;
  const description = document.getElementById("incident-description").value.trim();
  const evidenceInput = document.getElementById("incident-evidence-url").value.trim();

  // Parse image evidence links
  let evidence = [];
  if (evidenceInput) {
    evidence = evidenceInput.split(",").map((url) => url.trim()).filter((url) => url.length > 0);
  }

  const newId = incidentData.length > 0 ? Math.max(...incidentData.map((i) => i.id)) + 1 : 101;
  const code = `INC-2026-${String(newId).padStart(3, "0")}`;

  incidentData.unshift({
    id: newId,
    code,
    type,
    sector,
    location,
    status,
    assignedOic,
    description,
    evidence,
    directives: "Incident logged. Pending CSO field action."
  });

  saveAndRefresh();
  closeModal("incidentModal");
}

// Open CSO Take Action Modal
function openActionModal(id) {
  const inc = incidentData.find((item) => item.id === id);
  if (!inc) return;

  document.getElementById("action-incident-id").value = inc.id;
  document.getElementById("action-incident-code").value = `${inc.code} - ${inc.type}`;
  document.getElementById("action-status").value = inc.status || "Pending Action"; // Replaced severity dropdown
  document.getElementById("action-assigned-oic").value = inc.assignedOic || "Unassigned";
  document.getElementById("action-directive").value = inc.directives || "";

  openModal("actionModal");
}

// Process CSO Take Action Submit
function handleActionSubmit(event) {
  event.preventDefault();

  const id = parseInt(document.getElementById("action-incident-id").value);
  const updatedStatus = document.getElementById("action-status").value; // Replaced severity
  const updatedOic = document.getElementById("action-assigned-oic").value;
  const newDirective = document.getElementById("action-directive").value.trim();

  const index = incidentData.findIndex((item) => item.id === id);
  if (index !== -1) {
    incidentData[index].status = updatedStatus;
    incidentData[index].assignedOic = updatedOic;
    incidentData[index].directives = newDirective;
    saveAndRefresh();
  }

  closeModal("actionModal");
  alert(`CSO Action Directive & Status successfully updated for ${incidentData[index].code}.`);
}

// Delete Incident
function deleteIncident(id) {
  const inc = incidentData.find((item) => item.id === id);
  if (inc && confirm(`Are you sure you want to permanently delete critical incident record ${inc.code}?`)) {
    incidentData = incidentData.filter((item) => item.id !== id);
    saveAndRefresh();
  }
}

// Open Briefing Modal with Evidence Gallery
function openBriefingModal(id) {
  const inc = incidentData.find((item) => item.id === id);
  if (!inc) return;

  document.getElementById("briefing-code").textContent = `${inc.code} (${inc.status})`;
  document.getElementById("briefing-title").textContent = `${inc.type} - ${inc.sector} [${inc.location}]`;
  
  const formattedDetails = `
    <strong>Report Observations:</strong><br>${inc.description}
    <br><br>
    <strong>Resolution Status:</strong> ${inc.status}
    <br>
    <strong>Assigned Officer:</strong> ${inc.assignedOic || "Unassigned"}
    <br>
    <strong>CSO Action Directives:</strong> ${inc.directives || "No action log attached."}
  `;
  document.getElementById("briefing-details").innerHTML = formattedDetails;

  // Render Evidence Pictures
  const galleryContainer = document.getElementById("briefing-evidence-gallery");
  galleryContainer.innerHTML = "";

  if (inc.evidence && inc.evidence.length > 0) {
    inc.evidence.forEach((imgUrl, idx) => {
      const imgAnchor = document.createElement("a");
      imgAnchor.href = imgUrl;
      imgAnchor.target = "_blank";
      imgAnchor.innerHTML = `
        <img src="${imgUrl}" alt="Evidence ${idx + 1}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
      `;
      galleryContainer.appendChild(imgAnchor);
    });
  } else {
    galleryContainer.innerHTML = `<div style="font-size: 0.85rem; color: #94a3b8; grid-column: 1 / -1;">No evidence media uploaded for this incident.</div>`;
  }

  openModal("briefingModal");
}

// Sync LocalStorage & UI Refresh
function saveAndRefresh() {
  localStorage.setItem("uniguard_incidents", JSON.stringify(incidentData));
  filterIncidentTable();
  updateMetrics();
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
