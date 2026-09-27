// --- INITIAL MOCK DATA (Admin Approved Events) ---
let eventsData = [
    {
        id: "EVT-801",
        title: "Annual General Convocation 2026",
        department: "Main Campus Administration",
        venue: "Main Auditorium Complex",
        datetime: "2026-08-15T08:30",
        expectedAttendance: "2,500 Guests",
        description: "Official University Convocation with State Guests and Ministry Officials present.",
        leadOfficer: "Unassigned",
        status: "Pending Dispatch"
    },
    {
        id: "EVT-802",
        title: "Inter-Faculty Cricket Championship",
        department: "Department of Physical Education",
        venue: "University Grounds",
        datetime: "2026-08-10T09:00",
        expectedAttendance: "800 Students",
        description: "Annual sports tournament involving all faculties. Perimeter control and crowd monitoring required.",
        leadOfficer: "Gamage (Sports Unit)",
        status: "Dispatched to OIC"
    },
    {
        id: "EVT-803",
        title: "International IT & Cyber Exhibition",
        department: "UCSC",
        venue: "UCSC Premises & Labs",
        datetime: "2026-08-12T10:00",
        expectedAttendance: "1,200 Visitors",
        description: "Public technology exhibition featuring external industry partners and students.",
        leadOfficer: "Unassigned",
        status: "Pending Dispatch"
    },
    {
        id: "EVT-804",
        title: "Delegation Visit - Ministry of Education",
        department: "College House",
        venue: "College House Campus",
        datetime: "2026-08-18T13:00",
        expectedAttendance: "50 Delegates",
        description: "High-level diplomatic delegation visiting the Vice-Chancellor.",
        leadOfficer: "Fernando (Main Campus)",
        status: "Dispatched to OIC"
    }
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    renderEventsTable();
});

// --- CLOCK & DATE FUNCTIONALITY ---
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

// --- RENDER TABLE & METRICS ---
function renderEventsTable(data = eventsData) {
    const tbody = document.getElementById('events-table-body');
    tbody.innerHTML = '';

    data.forEach(evt => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
      <td>
        <strong>${evt.title}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Ref: ${evt.id} | Dept: ${evt.department}</div>
      </td>
      <td><i class="fa-solid fa-location-dot" style="color: var(--text-muted); margin-right: 4px;"></i>${evt.venue}</td>
      <td>${formatDateTime(evt.datetime)}</td>
      <td>
        <span style="font-weight: 500;">${evt.leadOfficer}</span>
      </td>
      <td>${getStatusPill(evt.status)}</td>
      <td class="text-right">
        <div class="action-btns" style="justify-content: flex-end;">
          <button class="btn-icon" onclick="openViewEventModal('${evt.id}')" title="View Event Details">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn-icon" onclick="openDispatchModal('${evt.id}')" title="Dispatch to OIC">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </td>
    `;
        tbody.appendChild(tr);
    });

    updateMetrics();
}

function updateMetrics() {
    document.getElementById('total-events-count').textContent = eventsData.length;

    const pending = eventsData.filter(e => e.status === 'Pending Dispatch').length;
    document.getElementById('pending-dispatch-count').textContent = pending;

    const dispatched = eventsData.filter(e => e.status === 'Dispatched to OIC').length;
    document.getElementById('dispatched-count').textContent = dispatched;
}

// --- STATUS PILL HELPER ---
function getStatusPill(status) {
    switch (status) {
        case 'Pending Dispatch':
            return `<span class="status-pill status-escalated"><i class="fa-solid fa-clock"></i> Pending Dispatch</span>`;
        case 'Dispatched to OIC':
            return `<span class="status-pill status-open"><i class="fa-solid fa-circle-check"></i> Dispatched to OIC</span>`;
        case 'In Progress':
            return `<span class="status-pill status-investigating"><i class="fa-solid fa-spinner"></i> In Progress</span>`;
        case 'Completed':
            return `<span class="status-pill status-resolved"><i class="fa-solid fa-check"></i> Completed</span>`;
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

// --- FILTER / SEARCH TABLE ---
function filterEventTable() {
    const query = document.getElementById('event-search-input').value.toLowerCase();
    const filtered = eventsData.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.department.toLowerCase().includes(query) ||
        e.leadOfficer.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query)
    );
    renderEventsTable(filtered);
}

// --- MODAL CONTROLS ---
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// --- VIEW EVENT MODAL (READ ONLY) ---
function openViewEventModal(id) {
    const evt = eventsData.find(e => e.id === id);
    if (!evt) return;

    document.getElementById('view-event-id').value = evt.id;
    document.getElementById('view-event-title').value = evt.title;
    document.getElementById('view-event-dept').value = evt.department;
    document.getElementById('view-event-venue').value = evt.venue;
    document.getElementById('view-event-datetime').value = formatDateTime(evt.datetime);
    document.getElementById('view-event-attendance').value = evt.expectedAttendance;
    document.getElementById('view-event-description').value = evt.description;

    openModal('viewEventModal');
}

// --- DISPATCH TO OIC MODAL ---
function openDispatchModal(id) {
    const evt = eventsData.find(e => e.id === id);
    if (!evt) return;

    document.getElementById('dispatch-event-id').value = evt.id;
    document.getElementById('dispatch-event-title').value = `${evt.title} (${evt.id})`;
    document.getElementById('dispatch-event-dept').value = evt.department;
    
    // Auto-select existing OIC if assigned, or default empty
    document.getElementById('dispatch-oic-select').value = evt.leadOfficer !== 'Unassigned' ? evt.leadOfficer : '';

    openModal('dispatchOicModal');
}

function handleDispatchToOic(e) {
    e.preventDefault();

    const id = document.getElementById('dispatch-event-id').value;
    const selectedOic = document.getElementById('dispatch-oic-select').value;

    const index = eventsData.findIndex(e => e.id === id);
    if (index !== -1) {
        eventsData[index].leadOfficer = selectedOic;
        eventsData[index].status = 'Dispatched to OIC';
    }

    alert(`Event successfully dispatched to ${selectedOic}!`);
    closeModal('dispatchOicModal');
    renderEventsTable();
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
