/* =========================================================
   JSO BARCODE & VEHICLE SCANNER CONTROLLER (WITH GATE LOGIC)
   ========================================================= */

// Database containing Students, Staff, Visitors, and Registered Vehicles
const MOCK_SECURITY_DATABASE = {
  // Vehicle Barcodes & License Plates
  "VEH-WP-CAS4091": {
    category: "VEHICLE",
    type: "Staff Vehicle Permit",
    plateNo: "WP CAS-4091",
    model: "Toyota Prius (White)",
    ownerName: "Dr. S.K. Jayawardena",
    ownerRole: "Senior Lecturer - UCSC",
    permittedZone: "Zone A (Faculty Parking)",
    status: "AUTHORIZED",
    icon: "fa-car"
  },
  "CAS-4091": {
    category: "VEHICLE",
    type: "Staff Vehicle Permit",
    plateNo: "WP CAS-4091",
    model: "Toyota Prius (White)",
    ownerName: "Dr. S.K. Jayawardena",
    ownerRole: "Senior Lecturer - UCSC",
    permittedZone: "Zone A (Faculty Parking)",
    status: "AUTHORIZED",
    icon: "fa-car"
  },
  "VEH-NP-8832": {
    category: "VEHICLE",
    type: "Night Vehicle Permit",
    plateNo: "WP CB-1290",
    model: "Nissan Kicks (Black)",
    ownerName: "Dr. Ruwan Alwis",
    ownerRole: "Overnight Visitor/Staff",
    permittedZone: "Overnight Gate 01 Parking",
    status: "AUTHORIZED",
    icon: "fa-car-side"
  },
  "NP-8832": {
    category: "VEHICLE",
    type: "Night Vehicle Permit",
    plateNo: "WP CB-1290",
    model: "Nissan Kicks (Black)",
    ownerName: "Dr. Ruwan Alwis",
    ownerRole: "Overnight Visitor/Staff",
    permittedZone: "Overnight Gate 01 Parking",
    status: "AUTHORIZED",
    icon: "fa-car-side"
  },
  
  // Student & Staff IDs
  "STU-220045A": {
    category: "STUDENT",
    type: "Student ID Pass",
    name: "Kamal Gunawardena",
    id: "Index: 220045A",
    destination: "Faculty of Science",
    validDate: "Active Student",
    photo: "https://i.pravatar.cc/100?img=15"
  },
  "STF-402": {
    category: "STAFF",
    type: "Academic Staff ID",
    name: "Prof. S.K. Jayawardena",
    id: "Staff ID: STF-402",
    destination: "Computer Center",
    validDate: "Active Staff",
    photo: "https://i.pravatar.cc/100?img=53"
  },

  // Visitor Passes
  "VIS-880921": {
    category: "VISITOR",
    type: "Visitor Gate Pass",
    name: "K.V. Wickramasinghe",
    id: "NIC: 197512984V",
    destination: "Main Finance Branch",
    validDate: "30 JUL 2026",
    photo: "https://i.pravatar.cc/100?img=12"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const barcodeForm = document.getElementById("barcodeForm");
  const gateSelect = document.getElementById("gateSelect");
  const typeBtns = document.querySelectorAll(".scan-type-btn");

  if (barcodeForm) {
    barcodeForm.addEventListener("submit", processBarcodeScan);
  }

  // Update active gate indicator in banner
  if (gateSelect) {
    gateSelect.addEventListener("change", (e) => {
      const selectedGateDisplay = document.getElementById("selectedGateDisplay");
      if (selectedGateDisplay) {
        selectedGateDisplay.textContent = e.target.value;
      }
    });
  }

  // Filter button toggle
  typeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      typeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  const inputElem = document.getElementById("barcodeInput");
  if (inputElem) inputElem.focus();
});

/**
 * Handles barcode scan submit
 */
function processBarcodeScan(event) {
  event.preventDefault();

  const inputElem = document.getElementById("barcodeInput");
  const barcodeValue = inputElem.value.trim().toUpperCase();

  if (!barcodeValue) return;

  const detailsContainer = document.getElementById("scanDetailsContainer");
  const statusBadge = document.getElementById("scanStatusBadge");

  // Query database
  const record = MOCK_SECURITY_DATABASE[barcodeValue];

  if (record) {
    statusBadge.className = "priority-badge normal";
    statusBadge.style.background = "#d1fae5";
    statusBadge.style.color = "#047857";
    statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ACCESS AUTHORIZED`;

    if (record.category === "VEHICLE") {
      // Render Vehicle Specific Card
      detailsContainer.innerHTML = `
        <div class="scan-profile-header">
          <div class="vehicle-icon-box">
            <i class="fa-solid ${record.icon}"></i>
          </div>
          <div>
            <h2><span class="vehicle-badge-pill">${record.plateNo}</span> ${record.model}</h2>
            <p><strong>Permit Type:</strong> ${record.type}</p>
            <p><strong>Registered Owner:</strong> ${record.ownerName} (${record.ownerRole})</p>
            <p><strong>Permitted Parking:</strong> ${record.permittedZone}</p>
          </div>
        </div>

        <div class="scan-action-row">
          <button class="btn-entry" onclick="recordGateMovement('${barcodeValue}', '${record.plateNo} - ${record.model}', 'VEHICLE', 'ENTRY')">
            <i class="fa-solid fa-right-to-bracket"></i> Record Vehicle ENTRY
          </button>
          <button class="btn-exit" onclick="recordGateMovement('${barcodeValue}', '${record.plateNo} - ${record.model}', 'VEHICLE', 'EXIT')">
            <i class="fa-solid fa-right-from-bracket"></i> Record Vehicle EXIT
          </button>
        </div>
      `;
    } else {
      // Render Personnel / Student / Staff / Visitor Card
      detailsContainer.innerHTML = `
        <div class="scan-profile-header">
          <img src="${record.photo}" alt="Holder Photo" class="scan-avatar">
          <div>
            <h2>${record.name}</h2>
            <p><strong>Category:</strong> ${record.type} | <strong>ID:</strong> ${record.id}</p>
            <p><strong>Permitted Area:</strong> ${record.destination}</p>
            <p><strong>Validity:</strong> ${record.validDate}</p>
          </div>
        </div>

        <div class="scan-action-row">
          <button class="btn-entry" onclick="recordGateMovement('${barcodeValue}', '${record.name}', '${record.category}', 'ENTRY')">
            <i class="fa-solid fa-right-to-bracket"></i> Record ENTRY
          </button>
          <button class="btn-exit" onclick="recordGateMovement('${barcodeValue}', '${record.name}', '${record.category}', 'EXIT')">
            <i class="fa-solid fa-right-from-bracket"></i> Record EXIT
          </button>
        </div>
      `;
    }
  } else {
    // Unrecognized Code
    statusBadge.className = "priority-badge high";
    statusBadge.style.background = "#fee2e2";
    statusBadge.style.color = "#b91c1c";
    statusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> UNRECOGNIZED`;

    detailsContainer.innerHTML = `
      <div class="placeholder-scan-state">
        <i class="fa-solid fa-circle-xmark" style="color: #ef4444; font-size: 2.8rem;"></i>
        <h3 style="margin-top:0.75rem; color: #ef4444;">Unrecognized Barcode (${barcodeValue})</h3>
        <p>No student, staff, visitor, or vehicle record found in the security database.</p>
      </div>
    `;
  }

  inputElem.value = "";
  inputElem.focus();
}

/**
 * Logs Entry or Exit into the activity log table
 */
function recordGateMovement(code, infoName, category, movementType) {
  const logBody = document.getElementById("activityLogBody");
  const selectedGate = document.getElementById("gateSelect").value;
  const shortGateName = selectedGate.split("-")[0].trim();

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const isEntry = movementType === "ENTRY";
  const statusPillClass = isEntry ? "status-pill completed" : "status-pill pending";
  const statusStyle = isEntry ? "" : "background:#fee2e2; color:#b91c1c;";
  const icon = isEntry ? "fa-right-to-bracket" : "fa-right-from-bracket";

  // Category pill styling
  let catClass = "category-pill student";
  let catIcon = "fa-user";
  if (category === "VEHICLE") { catClass = "category-pill vehicle"; catIcon = "fa-car"; }
  else if (category === "STAFF") { catClass = "category-pill staff"; catIcon = "fa-user-tie"; }
  else if (category === "VISITOR") { catClass = "category-pill visitor"; catIcon = "fa-id-card"; }

  if (logBody) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${timeStr}</td>
      <td><small class="gate-tag"><i class="fa-solid fa-torii-gate"></i> ${shortGateName}</small></td>
      <td><small class="${catClass}"><i class="fa-solid ${catIcon}"></i> ${category}</small></td>
      <td><strong>${code}</strong></td>
      <td>${infoName}</td>
      <td><span class="${statusPillClass}" style="${statusStyle}"><i class="fa-solid ${icon}"></i> ${movementType}</span></td>
    `;
    logBody.prepend(newRow);
  }

  // Feedback Notification
  const statusBadge = document.getElementById("scanStatusBadge");
  statusBadge.className = "priority-badge normal";
  statusBadge.style.background = "#e0e7ff";
  statusBadge.style.color = "#3730a3";
  statusBadge.innerHTML = `<i class="fa-solid fa-check"></i> LOGGED (${movementType})`;

  document.getElementById("scanDetailsContainer").innerHTML = `
    <div class="placeholder-scan-state">
      <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 2.8rem;"></i>
      <p style="margin-top: 0.5rem; color: #0f172a;">
        <strong>${movementType} recorded for ${infoName} [${code}] at ${shortGateName}.</strong><br>
        Ready for next scan.
      </p>
    </div>
  `;

  document.getElementById("barcodeInput").focus();
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
