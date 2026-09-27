/* =====================================================
   UNIGUARD OIC - TASK ASSIGNMENT ENGINE (SECTOR ISOLATION)
===================================================== */

let loadedJsos = [];
let loadedTasks = [];
let oicAssignedSector = '';

document.addEventListener("DOMContentLoaded", () => {
    checkOicAuthentication().then(() => {
        fetchJsosList();
        fetchTasksList();
    });

    updateClock();
    setInterval(updateClock, 1000);

    setupFormSubmission();
    setupStatusPicker();

    // Auto-refresh tasks every 10 seconds for real-time synchronization
    setInterval(() => {
        fetchTasksList(true);
        fetchJsosList(true);
    }, 10000);
});

/* =====================================================
   1. AUTHENTICATION & SECTOR ISOLATION SYNC
===================================================== */
async function checkOicAuthentication() {
    try {
        const response = await fetch('/Uniguard/BackEnd/index.php?action=check_auth');
        const data = await response.json();

        if (response.ok && data.authenticated) {
            const user = data.user;
            const oicName = `${user.fname || ''} ${user.lname || ''}`.trim() || user.username || 'OIC Officer';

            // Extract assigned sector for OIC
            oicAssignedSector = user.assigned_sector || (user.meta_data ? user.meta_data.assigned_sector : '') || '';

            const welcomeName = document.querySelector(".welcome-name");
            const userName = document.querySelector(".user-name");
            const userRole = document.querySelector(".user-role");

            if (welcomeName) welcomeName.textContent = user.fname || oicName;
            if (userName) userName.textContent = oicName;
            if (userRole) {
                userRole.textContent = oicAssignedSector 
                    ? `OIC - ${oicAssignedSector.toUpperCase()}`
                    : 'OFFICER IN CHARGE';
            }

            // Update Page Banner Header to show Sector
            const bannerHeader = document.querySelector(".banner-body h1");
            const bannerDesc = document.querySelector(".section-desc") || document.querySelector(".banner-body p");

            if (bannerHeader && oicAssignedSector) {
                bannerHeader.innerHTML = `Task Assignment & Directives <span style="font-size: 0.85rem; font-weight: 600; background: #0088ff; color: white; padding: 4px 12px; border-radius: 20px; margin-left: 10px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa-solid fa-building-shield"></i> Sector: ${escapeHTML(oicAssignedSector)}</span>`;
            }

            // Lock/pre-select target sector in task form to OIC's assigned sector
            const sectorSelect = document.getElementById("sectorSelect");
            if (sectorSelect && oicAssignedSector) {
                let matched = false;
                for (let opt of sectorSelect.options) {
                    if (opt.value.toLowerCase().includes(oicAssignedSector.toLowerCase()) || oicAssignedSector.toLowerCase().includes(opt.value.toLowerCase())) {
                        opt.selected = true;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    const newOpt = document.createElement("option");
                    newOpt.value = oicAssignedSector;
                    newOpt.textContent = oicAssignedSector;
                    newOpt.selected = true;
                    sectorSelect.appendChild(newOpt);
                }
            }

            sessionStorage.setItem("uniguard_user", JSON.stringify(user));
        }
    } catch (e) {
        console.warn("Auth check error, proceeding with active session", e);
    }
}

/* =====================================================
   2. LIVE CLOCK & DATE
===================================================== */
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

/* =====================================================
   3. FETCH JSO OFFICERS & STATUS (SECTOR FILTERED)
===================================================== */
async function fetchJsosList(silent = false) {
    try {
        const sectorParam = oicAssignedSector ? `&sector=${encodeURIComponent(oicAssignedSector)}` : '';
        const response = await fetch(`/Uniguard/BackEnd/index.php?action=get_jsos${sectorParam}`);
        const result = await response.json();

        if (result.status === 'success' && Array.isArray(result.data)) {
            loadedJsos = result.data;
            populateJsoDropdown(loadedJsos);
            renderJsoStatusList(loadedJsos);
        }
    } catch (err) {
        if (!silent) console.error("Error fetching JSO list", err);
    }
}

function populateJsoDropdown(jsos) {
    const select = document.getElementById("jsoSelect");
    if (!select) return;

    const currentValue = select.value;
    const sectorHeader = oicAssignedSector ? ` (${oicAssignedSector})` : '';
    select.innerHTML = `<option value="" disabled ${!currentValue ? 'selected' : ''}>-- Choose JSO from your Sector${sectorHeader} --</option>`;

    if (jsos.length === 0) {
        select.innerHTML = `<option value="" disabled selected>No JSO officers registered in ${oicAssignedSector || 'this sector'}</option>`;
        return;
    }

    jsos.forEach(jso => {
        const statusLabel = jso.duty_status === 'Available' ? 'Available' : `On Duty (${jso.active_tasks_count} Task${jso.active_tasks_count > 1 ? 's' : ''})`;
        const sectorStr = jso.assigned_sector ? ` - ${jso.assigned_sector}` : '';
        const option = document.createElement("option");
        option.value = jso.id;
        option.textContent = `${jso.name} (${statusLabel}${sectorStr})`;
        select.appendChild(option);
    });

    if (currentValue) select.value = currentValue;
}

function renderJsoStatusList(jsos) {
    const statusList = document.querySelector(".jso-status-list");
    const descEl = document.querySelector(".section-desc");
    if (descEl && oicAssignedSector) {
        descEl.textContent = `Officers in your sector (${oicAssignedSector}):`;
    }

    if (!statusList) return;
    statusList.innerHTML = "";

    if (jsos.length === 0) {
        statusList.innerHTML = `
            <li class="status-item" style="padding:1rem; text-align:center; color:#64748b;">
                <i class="fa-solid fa-user-slash" style="font-size:1.5rem; margin-bottom:0.4rem; display:block; color:#94a3b8;"></i>
                No active JSOs found in <strong>${escapeHTML(oicAssignedSector || 'your sector')}</strong>.
            </li>
        `;
        return;
    }

    jsos.forEach(jso => {
        const isAvailable = (jso.duty_status === 'Available');
        const initials = getInitials(jso.name);
        const statusBadgeClass = isAvailable ? 'online' : 'busy';
        const itemClass = isAvailable ? 'available' : 'busy';

        const li = document.createElement("li");
        li.className = `status-item ${itemClass}`;
        li.innerHTML = `
            <div class="jso-avatar-sm">${initials}</div>
            <div class="jso-details">
                <strong>${escapeHTML(jso.name)}</strong>
                <span>Status: <em class="badge-status ${statusBadgeClass}">${isAvailable ? 'Available' : `On Duty (${jso.active_tasks_count})`}</em></span>
            </div>
            <button class="btn-xs ${!isAvailable ? 'disabled' : ''}" ${!isAvailable ? 'disabled' : ''} onclick="quickAssign('${jso.id}')">
                ${isAvailable ? 'Assign' : 'Busy'}
            </button>
        `;
        statusList.appendChild(li);
    });
}

function getInitials(name) {
    if (!name) return 'SO';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* =====================================================
   4. FETCH ACTIVE TASKS TABLE (SECTOR FILTERED)
===================================================== */
async function fetchTasksList(silent = false) {
    const filterSelect = document.getElementById("filterStatus");
    const statusFilter = filterSelect ? filterSelect.value : 'all';

    try {
        const sectorParam = oicAssignedSector ? `&sector=${encodeURIComponent(oicAssignedSector)}` : '';
        const url = `/Uniguard/BackEnd/index.php?action=get_tasks&status=${encodeURIComponent(statusFilter)}${sectorParam}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.status === 'success' && Array.isArray(result.data)) {
            loadedTasks = result.data;
            renderTasksTable(loadedTasks);
        }
    } catch (err) {
        if (!silent) console.error("Error fetching tasks", err);
    }
}

function renderTasksTable(tasks) {
    const tableBody = document.querySelector("#tasksTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (tasks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">
                    No active tasks found for sector <strong>${escapeHTML(oicAssignedSector || 'selected filter')}</strong>.
                </td>
            </tr>
        `;
        return;
    }

    tasks.forEach(task => {
        let priorityClass = 'normal';
        if (task.priority === 'Medium') priorityClass = 'medium';
        else if (task.priority === 'Urgent' || task.priority === 'High') priorityClass = 'high';

        let statusPillClass = 'pending';
        let statusIcon = 'fa-clock';
        if (task.status === 'In Progress') {
            statusPillClass = 'in-progress';
            statusIcon = 'fa-spinner fa-spin';
        } else if (task.status === 'Completed') {
            statusPillClass = 'completed';
            statusIcon = 'fa-check';
        } else if (task.status === 'Cancelled') {
            statusPillClass = 'cancelled';
            statusIcon = 'fa-ban';
        }

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${escapeHTML(task.task_code || 'TSK-' + task.id)}</strong></td>
            <td>${escapeHTML(task.jso_name)}</td>
            <td>
                <strong>${escapeHTML(task.title)}</strong><br>
                <small class="text-muted">Location: ${escapeHTML(task.sector)}</small>
            </td>
            <td><span class="priority-badge ${priorityClass}">${escapeHTML(task.priority)}</span></td>
            <td>${escapeHTML(task.deadline)}</td>
            <td><span class="status-pill ${statusPillClass}"><i class="fa-solid ${statusIcon}"></i> ${escapeHTML(task.status)}</span></td>
            <td>
                <button class="btn-icon" title="View Details" onclick="viewTaskDetails(${task.id})"><i class="fa-solid fa-eye"></i></button>
                <button class="btn-icon danger" title="Cancel Task" onclick="deleteTaskRecord(${task.id})"><i class="fa-solid fa-xmark"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function filterTasks() {
    fetchTasksList();
}

/* =====================================================
   5. CREATE NEW TASK FORM SUBMISSION
===================================================== */
function setupFormSubmission() {
    const assignForm = document.getElementById("assignTaskForm");
    if (!assignForm) return;

    assignForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const jsoSelect = document.getElementById("jsoSelect").value;
        const title = document.getElementById("taskTitle").value.trim();
        const sector = document.getElementById("sectorSelect").value;
        const priority = document.getElementById("prioritySelect").value;
        const deadline = document.getElementById("deadlineTime").value;
        const instructions = document.getElementById("taskInstructions").value.trim();

        const userNameEl = document.querySelector(".user-name");
        const oicName = userNameEl ? userNameEl.textContent.trim() : 'OIC Officer';

        if (!jsoSelect || !title || !deadline) {
            alert("Please select a JSO officer, task title, and completion deadline.");
            return;
        }

        const submitBtn = assignForm.querySelector("button[type='submit']");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Assigning...`;
        }

        try {
            const response = await fetch('/Uniguard/BackEnd/index.php?action=create_task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jso_id: jsoSelect,
                    title: title,
                    sector: sector,
                    priority: priority,
                    deadline: formatTimeDisplay(deadline),
                    instructions: instructions,
                    oic_name: oicName,
                    oic_sector: oicAssignedSector
                })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                alert(`Task Directives Issued Successfully!\n\nTask Code: ${result.task_code}\nTitle: ${title}\nSector: ${sector}\nDeadline: ${formatTimeDisplay(deadline)}`);
                assignForm.reset();

                // Re-lock sector after reset if OIC sector is set
                if (oicAssignedSector) {
                    const sectorSelect = document.getElementById("sectorSelect");
                    if (sectorSelect) {
                        for (let opt of sectorSelect.options) {
                            if (opt.value.toLowerCase().includes(oicAssignedSector.toLowerCase()) || oicAssignedSector.toLowerCase().includes(opt.value.toLowerCase())) {
                                opt.selected = true;
                                break;
                            }
                        }
                    }
                }

                fetchTasksList();
                fetchJsosList();
            } else {
                alert(result.message || "Failed to assign task.");
            }
        } catch (err) {
            alert("Error connecting to server. Please try again.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Assign Task`;
            }
        }
    });
}

function formatTimeDisplay(timeStr) {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;

    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
}

/* =====================================================
   6. QUICK ASSIGN & MODAL ACTIONS
===================================================== */
function quickAssign(jsoId) {
    const select = document.getElementById("jsoSelect");
    if (select) {
        select.value = jsoId;
        const preset = document.getElementById("taskPreset");
        if (preset) preset.focus();

        const formCard = document.querySelector(".form-card");
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleTaskPreset(value) {
    const titleInput = document.getElementById("taskTitle");
    if (value && value !== "custom") {
        titleInput.value = value;
    } else if (value === "custom") {
        titleInput.value = "";
        titleInput.focus();
    }
}

function viewTaskDetails(taskId) {
    const task = loadedTasks.find(t => t.id == taskId);
    if (!task) return;

    let modal = document.getElementById("taskDetailsModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "taskDetailsModal";
        modal.style.cssText = "display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center; padding:1rem;";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#fff; border-radius:12px; width:100%; max-width:550px; padding:1.5rem; box-shadow:0 10px 25px rgba(0,0,0,0.2); font-family:'Inter', sans-serif;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:0.75rem; margin-bottom:1rem;">
                <h3 style="margin:0; font-size:1.15rem; color:#1e293b;"><i class="fa-solid fa-list-check" style="color:#0088ff;"></i> Task Details (${escapeHTML(task.task_code || 'TSK-' + task.id)})</h3>
                <button onclick="document.getElementById('taskDetailsModal').style.display='none'" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#64748b;">&times;</button>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem; font-size:0.875rem;">
                <div><strong>Assigned Officer:</strong><br><span style="color:#0088ff; font-weight:600;">${escapeHTML(task.jso_name)}</span></div>
                <div><strong>Issuing Officer:</strong><br><span>${escapeHTML(task.oic_name || 'OIC Officer')}</span></div>
                <div><strong>Target Sector:</strong><br><span>${escapeHTML(task.sector)}</span></div>
                <div><strong>Priority:</strong><br><span>${escapeHTML(task.priority)}</span></div>
                <div><strong>Deadline:</strong><br><span>${escapeHTML(task.deadline)}</span></div>
                <div><strong>Current Status:</strong><br><span>${escapeHTML(task.status)}</span></div>
            </div>
            <div style="background:#f8fafc; padding:0.85rem; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:1.25rem;">
                <strong style="font-size:0.85rem; color:#334155; display:block; margin-bottom:0.3rem;">Task Directives & Instructions:</strong>
                <p style="margin:0; font-size:0.875rem; color:#475569; line-height:1.5;">${escapeHTML(task.instructions || 'No special instructions provided.')}</p>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                <button onclick="document.getElementById('taskDetailsModal').style.display='none'" style="padding:0.5rem 1.25rem; border-radius:6px; border:none; background:#0088ff; color:white; font-weight:600; cursor:pointer;">Close</button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
}

async function deleteTaskRecord(taskId) {
    if (!confirm("Are you sure you want to cancel and delete this task directive?")) return;

    try {
        const response = await fetch('/Uniguard/BackEnd/index.php?action=delete_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId })
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Task cancelled successfully.");
            fetchTasksList();
            fetchJsosList();
        } else {
            alert(result.message || "Failed to cancel task.");
        }
    } catch (err) {
        alert("Error connecting to server.");
    }
}

function setupStatusPicker() {
    const logoutBtn = document.querySelector('.sidebar-footer .btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            try { await fetch('/Uniguard/BackEnd/index.php?action=logout'); } catch(e){}
            sessionStorage.clear();
            window.location.href = '../loginPage.html';
        });
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
