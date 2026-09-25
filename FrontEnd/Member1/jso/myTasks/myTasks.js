/* =====================================================
   UNIGUARD JSO - MY TASKS ENGINE (REAL-TIME DB)
===================================================== */

let taskData = [];
let activeTaskId = null;

document.addEventListener("DOMContentLoaded", () => {
  checkJsoAuthentication();
  updateClock();
  setInterval(updateClock, 1000);

  fetchJsoTasks();
  setupTaskEventListeners();

  // Auto-refresh tasks every 8 seconds for real-time synchronization with OIC
  setInterval(() => {
    fetchJsoTasks(true);
  }, 8000);
});

/* =====================================================
   1. AUTHENTICATION & HEADER SYNC
===================================================== */
async function checkJsoAuthentication() {
  try {
    const response = await fetch('/Uniguard/BackEnd/index.php?action=check_auth');
    const data = await response.json();

    if (response.ok && data.authenticated) {
      const user = data.user;
      const jsoName = `${user.fname || ''} ${user.lname || ''}`.trim() || user.username || 'K. L. Perera';

      const welcomeName = document.querySelector(".welcome-name");
      const userName = document.querySelector(".user-name");
      const avatarInitial = document.querySelector(".avatar-initial");

      if (welcomeName) welcomeName.textContent = user.fname || jsoName;
      if (userName) userName.textContent = jsoName;
      if (avatarInitial) avatarInitial.textContent = getInitials(jsoName);

      sessionStorage.setItem("uniguard_user", JSON.stringify(user));
    }
  } catch (e) {
    console.warn("Auth check warning, using active session", e);
  }
}

function updateClock() {
  updateGreeting();
  const now = new Date();
  const hours = now.toLocaleTimeString('en-US', { hour12: true });
  const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', options).toUpperCase();

  const timeEl = document.getElementById('current-time');
  const dateEl = document.getElementById('current-date');
  if (timeEl) timeEl.innerText = hours;
  if (dateEl) dateEl.innerText = dateStr;
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

function getInitials(name) {
  if (!name) return 'KP';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* =====================================================
   2. FETCH TASKS FROM BACKEND (REAL-TIME DB)
===================================================== */
async function fetchJsoTasks(silent = false) {
  try {
    const filterSelect = document.getElementById("filterStatus");
    const filter = filterSelect ? filterSelect.value : 'all';
    const response = await fetch(`/Uniguard/BackEnd/index.php?action=get_tasks&status=${encodeURIComponent(filter)}`);
    const result = await response.json();

    if (result.status === 'success' && Array.isArray(result.data)) {
      taskData = result.data.map(t => ({
        id: t.id,
        code: t.task_code || `TSK-${t.id}`,
        title: t.title,
        sector: t.sector,
        priority: (t.priority || 'Normal').toLowerCase(),
        deadline: t.deadline,
        status: (t.status || 'Pending').toLowerCase().replace(' ', '-'),
        instructions: t.instructions || 'No special instructions provided.',
        oic_name: t.oic_name || 'OIC Somendra'
      }));
      renderTaskTable(filter);
      updateStats();
    }
  } catch (err) {
    if (!silent) console.error("Error loading JSO tasks from backend", err);
  }
}

function priorityLabel(p) {
  if (!p) return 'Normal';
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function statusLabel(s) {
  if (!s) return 'Pending';
  return { pending: "Pending", "in-progress": "In Progress", completed: "Completed", cancelled: "Cancelled" }[s] || s;
}

function renderTaskTable(filter) {
  const tbody = document.getElementById("taskTableBody");
  if (!tbody) return;

  const searchInput = document.getElementById("taskSearch");
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtered = taskData.filter(t => {
    const matchesFilter = (!filter || filter === "all" || t.status === filter);
    const matchesSearch = (!searchQuery || t.title.toLowerCase().includes(searchQuery) || t.sector.toLowerCase().includes(searchQuery) || t.code.toLowerCase().includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">No active tasks assigned matching selected filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (t) => `
      <tr>
        <td><strong>${escapeHTML(t.title)}</strong><br><small style="color:#64748b;">Code: ${escapeHTML(t.code)}</small></td>
        <td>${escapeHTML(t.sector)}</td>
        <td><span class="priority-badge ${t.priority}">${priorityLabel(t.priority)}</span></td>
        <td>${escapeHTML(t.deadline)}</td>
        <td><span class="status-pill ${t.status}">${statusLabel(t.status)}</span></td>
        <td>
          <div class="action-btns" style="display:flex; gap:0.4rem; align-items:center;">
            <button class="btn-xs" onclick="viewTaskDetails(${t.id})">View</button>
            ${
              t.status === "completed"
                ? `<button class="btn-xs disabled" disabled>Done</button>`
                : t.status === "in-progress"
                ? `<button class="btn-xs" style="background:#10b981; color:#fff; border:none;" onclick="completeTask(${t.id})">Mark Done</button>`
                : `<button class="btn-xs" style="background:#0088ff; color:#fff; border:none;" onclick="acceptTask(${t.id})">Accept</button>`
            }
          </div>
        </td>
      </tr>`
    )
    .join("");
}

function updateStats() {
  const pendingEl = document.getElementById("statPending");
  const progressEl = document.getElementById("statProgress");
  const completedEl = document.getElementById("statCompleted");

  if (pendingEl) pendingEl.innerText = taskData.filter((t) => t.status === "pending").length;
  if (progressEl) progressEl.innerText = taskData.filter((t) => t.status === "in-progress").length;
  if (completedEl) completedEl.innerText = taskData.filter((t) => t.status === "completed").length;
}

/* =====================================================
   3. TASK DETAILS MODAL & ACTIONS
===================================================== */
function viewTaskDetails(id) {
  const task = taskData.find((t) => t.id == id);
  if (!task) return;
  activeTaskId = id;

  const titleEl = document.getElementById("detailTitle");
  const sectorEl = document.getElementById("detailSector");
  const priorityEl = document.getElementById("detailPriority");
  const deadlineEl = document.getElementById("detailDeadline");
  const oicEl = document.getElementById("detailAssignedBy");
  const instructionsEl = document.getElementById("detailInstructions");

  if (titleEl) titleEl.innerText = `${task.title} (${task.code})`;
  if (sectorEl) sectorEl.innerText = task.sector;
  if (priorityEl) priorityEl.innerText = priorityLabel(task.priority);
  if (deadlineEl) deadlineEl.innerText = task.deadline;
  if (oicEl) oicEl.innerText = task.oic_name || 'OIC Somendra';
  if (instructionsEl) instructionsEl.innerText = task.instructions;

  const acceptBtn = document.getElementById("acceptTaskBtn");
  if (acceptBtn) {
    if (task.status === "pending") {
      acceptBtn.style.display = "inline-flex";
      acceptBtn.innerHTML = `<i class="fa-solid fa-check"></i> Accept the Task`;
    } else if (task.status === "in-progress") {
      acceptBtn.style.display = "inline-flex";
      acceptBtn.innerHTML = `<i class="fa-solid fa-check-double"></i> Mark Completed`;
    } else {
      acceptBtn.style.display = "none";
    }
  }

  if (typeof ugOpenModal === 'function') {
    ugOpenModal("taskDetailsModal");
  } else {
    const modal = document.getElementById("taskDetailsModal");
    if (modal) modal.style.display = "flex";
  }
}

async function acceptTask(id) {
  const targetId = id || activeTaskId;
  if (!targetId) return;

  try {
    const response = await fetch('/Uniguard/BackEnd/index.php?action=update_task_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: targetId, status: 'In Progress' })
    });

    const result = await response.json();
    if (result.status === 'success') {
      alert("Task Accepted! Moved to In Progress.");
      fetchJsoTasks();
    } else {
      alert(result.message || "Failed to update task.");
    }
  } catch (err) {
    alert("Error connecting to database.");
  }
}

async function completeTask(id) {
  const targetId = id || activeTaskId;
  if (!targetId) return;

  try {
    const response = await fetch('/Uniguard/BackEnd/index.php?action=update_task_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: targetId, status: 'Completed' })
    });

    const result = await response.json();
    if (result.status === 'success') {
      alert("Task marked as Completed!");
      fetchJsoTasks();
    } else {
      alert(result.message || "Failed to complete task.");
    }
  } catch (err) {
    alert("Error connecting to database.");
  }
}

function setupTaskEventListeners() {
  const filterSelect = document.getElementById("filterStatus");
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      renderTaskTable(e.target.value);
    });
  }

  const searchInput = document.getElementById("taskSearch");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const filter = filterSelect ? filterSelect.value : 'all';
      renderTaskTable(filter);
    });
  }

  const acceptBtn = document.getElementById("acceptTaskBtn");
  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      const task = taskData.find(t => t.id == activeTaskId);
      if (task) {
        if (task.status === "pending") {
          acceptTask(activeTaskId);
        } else if (task.status === "in-progress") {
          completeTask(activeTaskId);
        }
      }
      if (typeof ugCloseModal === 'function') {
        ugCloseModal(acceptBtn);
      } else {
        const modal = document.getElementById("taskDetailsModal");
        if (modal) modal.style.display = "none";
      }
    });
  }

  const submitIncidentBtn = document.getElementById("submitIncidentBtn");
  if (submitIncidentBtn) {
    submitIncidentBtn.addEventListener("click", () => {
      const form = document.getElementById("incidentForm");
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const type = document.getElementById("incidentType") ? document.getElementById("incidentType").value : '';
      const location = document.getElementById("incidentLocation") ? document.getElementById("incidentLocation").value : '';

      if (typeof ugCloseModal === 'function') ugCloseModal(submitIncidentBtn);
      if (form) form.reset();
      alert(`Incident report submitted!\n\nType: ${type}\nLocation: ${location}\n\nYour OIC and the CSO have been notified.`);
    });
  }

  const logoutBtn = document.querySelector('.sidebar-footer .btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      try { await fetch('/Uniguard/BackEnd/index.php?action=logout'); } catch (e) {}
      sessionStorage.clear();
      window.location.href = '../loginPage.html';
    });
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
