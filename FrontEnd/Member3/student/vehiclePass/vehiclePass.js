// ==========================================
// INITIAL SAMPLE DATA
// ==========================================
let passData = [
  { id: 1, vehicleNo: "WP CAB-2451", type: "Car", issued: "2026-07-01", expire: "2026-12-31", status: "Active" },
  { id: 2, vehicleNo: "WP KL-9021", type: "Motorcycle", issued: "2026-01-05", expire: "2026-06-30", status: "Expired" }
];

document.addEventListener("DOMContentLoaded", () => {
  startLiveClock();
  renderCurrentPass();
  renderPassTable();
});

function startLiveClock() {
    updateGreeting();
  const updateClock = () => {
    updateGreeting();
    const now = new Date();
    const timeElem = document.getElementById("current-time");
    const dateElem = document.getElementById("current-date");
    if (timeElem && dateElem) {
      timeElem.textContent = now.toLocaleTimeString('en-US', { hour12: true });
      dateElem.textContent = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };
  updateClock();
  setInterval(updateClock, 1000);
}

function renderCurrentPass() {
  const wrap = document.getElementById("current-pass-wrap");
  const activePass = passData.find(p => p.status === "Active");

  if (!activePass) {
    wrap.innerHTML = `
      <div class="pass-card-empty">
        <i class="fa-solid fa-car-burst"></i>
        <p>You do not have an active vehicle pass. Submit a request to obtain one.</p>
      </div>
    `;
    return;
  }

  wrap.innerHTML = `
    <div class="pass-card">
      <div class="pass-card-header">
        <h4><i class="fa-solid fa-id-card"></i> ACTIVE VEHICLE PASS</h4>
        <span class="status-badge active">Active</span>
      </div>
      <div class="pass-card-body">
        <div class="info-item"><span>Vehicle No.</span><p>${activePass.vehicleNo}</p></div>
        <div class="info-item"><span>Vehicle Type</span><p>${activePass.type}</p></div>
        <div class="info-item"><span>Issued Date</span><p>${activePass.issued}</p></div>
        <div class="info-item"><span>Expire Date</span><p>${activePass.expire}</p></div>
      </div>
    </div>
  `;
}

function renderPassTable() {
  const tbody = document.getElementById("pass-table-body");
  tbody.innerHTML = "";

  if (passData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #94a3b8;">No vehicle pass history found.</td></tr>`;
    return;
  }

  passData.forEach(p => {
    const statusClass = p.status === "Active" ? "active" : "expired";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="officer-name">${p.vehicleNo}</td>
      <td>${p.type}</td>
      <td>${p.issued}</td>
      <td>${p.expire}</td>
      <td><span class="status-badge ${statusClass}">${p.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

function openRequestModal(type) {
  document.getElementById("pass-type").value = type;
  document.getElementById("requestForm").reset();
  document.getElementById("pass-type").value = type;

  document.getElementById("requestModalTitle").innerHTML = type === "night"
    ? '<i class="fa-solid fa-moon"></i> Request Night Vehicle Pass'
    : '<i class="fa-solid fa-car-side"></i> Request Vehicle Pass';

  openModal("requestModal");
}

function handleRequestSubmit(event) {
  event.preventDefault();
  const type = document.getElementById("pass-type").value;
  const vehicleNo = document.getElementById("vehicle-number").value;
  const vehicleType = document.getElementById("vehicle-type").value;

  const issued = new Date().toISOString().split("T")[0];
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + (type === "night" ? 1 : 6));

  const newId = passData.length > 0 ? Math.max(...passData.map(p => p.id)) + 1 : 1;
  passData.unshift({
    id: newId,
    vehicleNo: vehicleNo,
    type: vehicleType,
    issued: issued,
    expire: expireDate.toISOString().split("T")[0],
    status: "Active"
  });

  renderCurrentPass();
  renderPassTable();
  closeModal("requestModal");
  alert(`Your ${type === "night" ? "night" : "standard"} vehicle pass request has been submitted for approval.`);
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
