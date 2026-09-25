let oicEventsData = [
    {
        id: "EVT-802",
        title: "Inter-Faculty Cricket Championship",
        department: "Department of Physical Education",
        venue: "University Grounds",
        datetime: "2026-08-10T09:00",
        expectedAttendance: "800 Students",
        description: "Annual sports tournament involving all faculties. Perimeter control and crowd monitoring required.",
        assignedJsos: ["Perera (Gate Control)", "Bandara (Parking)"],
        dutyInstructions: "Perera at main ground gate. Bandara managing vehicle parking near gymnasium.",
        status: "Officers Deployed"
    },
    {
        id: "EVT-804",
        title: "Delegation Visit - Ministry of Education",
        department: "College House",
        venue: "College House Campus",
        datetime: "2026-08-18T13:00",
        expectedAttendance: "50 Delegates",
        description: "High-level diplomatic delegation visiting the Vice-Chancellor.",
        assignedJsos: [],
        dutyInstructions: "",
        status: "Pending JSO Assignment"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    renderOicEventsTable();
});

function updateClock() {
    updateGreeting();
    const now = new Date();
    const timeElem = document.getElementById('current-time');
    const dateElem = document.getElementById('current-date');

    if (timeElem) {
        timeElem.textContent = now.toLocaleTimeString('en-US', { hour12: true });
    }
    if (dateElem) {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        dateElem.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
    }
}

function renderOicEventsTable(data = oicEventsData) {
    const tbody = document.getElementById('oic-events-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 20px;">No events currently assigned by CSO.</td></tr>`;
        updateMetrics();
        return;
    }

    data.forEach(evt => {
        const tr = document.createElement('tr');

        const jsosFormatted = evt.assignedJsos.length > 0 
            ? evt.assignedJsos.map(jso => {
                const parts = jso.split(' ');
                const nameSnippet = parts.length > 1 ? `${parts[0]} ${parts[1]}` : jso;
                return `<span class="badge-tag" style="background:#e2e8f0; color:#334155; padding:2px 8px; border-radius:12px; font-size:0.75rem; display:inline-block; margin:2px;"><i class="fa-solid fa-user-shield"></i> ${nameSnippet}</span>`;
              }).join('') 
            : `<span style="color: #94a3b8; font-style: italic;">None Assigned</span>`;

        tr.innerHTML = `
          <td>
            <strong>${evt.title}</strong>
            <div style="font-size: 0.75rem; color: #64748b;">Ref: ${evt.id} | Dept: ${evt.department}</div>
          </td>
          <td><i class="fa-solid fa-location-dot" style="color: #64748b; margin-right: 4px;"></i>${evt.venue}</td>
          <td>${formatDateTime(evt.datetime)}</td>
          <td>${jsosFormatted}</td>
          <td>${getOicStatusPill(evt.status)}</td>
          <td class="text-right">
            <div class="action-btn-group" style="justify-content: flex-end; display: flex; gap: 6px;">
              <button class="btn-icon" onclick="openViewOicEventModal('${evt.id}')" title="View Details">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn-icon" onclick="openAssignJsoModal('${evt.id}')" title="Assign / Edit JSOs">
                <i class="fa-solid fa-user-plus"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
    });

    updateMetrics();
}

function updateMetrics() {
    const assignedElem = document.getElementById('countAssignedEvents');
    const pendingElem = document.getElementById('countPendingJso');
    const mannedElem = document.getElementById('countMannedEvents');

    if (assignedElem) assignedElem.textContent = oicEventsData.length;

    if (pendingElem) {
        const pending = oicEventsData.filter(e => e.status === 'Pending JSO Assignment').length;
        pendingElem.textContent = pending;
    }

    if (mannedElem) {
        const manned = oicEventsData.filter(e => e.status === 'Officers Deployed').length;
        mannedElem.textContent = manned;
    }
}

function getOicStatusPill(status) {
    switch (status) {
        case 'Pending JSO Assignment':
            return `<span class="status-pill pending" style="background:#fef3c7; color:#d97706; padding:4px 10px; border-radius:12px; font-weight:600; font-size:0.8rem;"><i class="fa-solid fa-clock"></i> Pending JSOs</span>`;
        case 'Officers Deployed':
            return `<span class="status-pill completed" style="background:#dcfce7; color:#15803d; padding:4px 10px; border-radius:12px; font-weight:600; font-size:0.8rem;"><i class="fa-solid fa-check-circle"></i> Deployed</span>`;
        default:
            return `<span class="status-pill">${status}</span>`;
    }
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '--';
    const d = new Date(dateTimeStr);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// --- FILTER TABLE ---
function filterOicEvents() {
    const searchVal = document.getElementById('search-events')?.value.toLowerCase() || '';
    const tableSearchVal = document.getElementById('event-table-search')?.value.toLowerCase() || '';
    const query = searchVal || tableSearchVal;

    const filtered = oicEventsData.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.department.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query)
    );
    renderOicEventsTable(filtered);
}

// --- MODAL CONTROLS ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// --- VIEW EVENT MODAL ---
function openViewOicEventModal(id) {
    const evt = oicEventsData.find(e => e.id === id);
    if (!evt) return;

    document.getElementById('view-oic-event-id').value = evt.id;
    document.getElementById('view-oic-event-title').value = evt.title;
    document.getElementById('view-oic-event-dept').value = evt.department;
    document.getElementById('view-oic-event-venue').value = evt.venue;
    document.getElementById('view-oic-event-datetime').value = formatDateTime(evt.datetime);
    document.getElementById('view-oic-event-attendance').value = evt.expectedAttendance;
    document.getElementById('view-oic-event-description').value = evt.description;

    openModal('viewOicEventModal');
}

// --- ASSIGN JSO MODAL ---
function openAssignJsoModal(id) {
    const evt = oicEventsData.find(e => e.id === id);
    if (!evt) return;

    document.getElementById('assign-event-id').value = evt.id;
    document.getElementById('assign-event-title').value = `${evt.title} (${evt.id})`;
    document.getElementById('jso-duty-instructions').value = evt.dutyInstructions || '';

    // Check pre-selected JSOs in checkbox options
    const checkboxes = document.querySelectorAll('#assignJsoModal input[name="assigned_jsos"]');
    checkboxes.forEach(cb => {
        cb.checked = evt.assignedJsos.includes(cb.value);
    });

    openModal('assignJsoModal');
}

function handleSaveJsoAssignment(e) {
    e.preventDefault();

    const id = document.getElementById('assign-event-id').value;
    const instructions = document.getElementById('jso-duty-instructions').value;

    // Retrieve checked checkboxes
    const checkedBoxes = document.querySelectorAll('#assignJsoModal input[name="assigned_jsos"]:checked');
    const selectedJsos = Array.from(checkedBoxes).map(cb => cb.value);

    const index = oicEventsData.findIndex(e => e.id === id);
    if (index !== -1) {
        oicEventsData[index].assignedJsos = selectedJsos;
        oicEventsData[index].dutyInstructions = instructions;
        oicEventsData[index].status = selectedJsos.length > 0 ? 'Officers Deployed' : 'Pending JSO Assignment';
    }

    alert(`Successfully deployed ${selectedJsos.length} officer(s) to the event!`);
    closeModal('assignJsoModal');
    renderOicEventsTable();
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
