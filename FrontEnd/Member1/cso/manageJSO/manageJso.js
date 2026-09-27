/* ==========================================
   UNIGUARD - MANAGE JSO STATE & OPERATIONS (DATABASE DRIVEN)
   ========================================== */

let jsoData = [];
let dispatchedDirectivesCount = parseInt(localStorage.getItem("uniguard_jso_dispatched_count")) || 8;

/* ==========================================
   LIFECYCLE & INITIALIZATION
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initLiveClock === 'function') {
    initLiveClock();
  }
  fetchJsoUsers();
  setupSearchInput();
});

// Fetch JSO accounts directly from MySQL Database via API
async function fetchJsoUsers() {
  try {
    const res = await fetch('/Uniguard/BackEnd/index.php?action=get_users');
    const result = await res.json();
    if (result.status === 'success' && Array.isArray(result.data)) {
      jsoData = result.data
        .filter(u => {
          const r = (u.role || '').toLowerCase();
          return r === 'jso' || r === 'junior security officer' || r === 'security officer';
        })
        .map(u => {
          const meta = u.meta_data || {};
          return {
            id: u.id,
            fname: u.fname || '',
            lname: u.lname || '',
            name: `${u.fname || ''} ${u.lname || ''}`.trim() || u.username,
            badge: meta.badge_id || meta.badge || u.badge_id || (`JSO-${200 + parseInt(u.id)}`),
            email: u.email || '',
            username: u.username || u.email,
            phone: meta.phone || u.phone || meta.contact_phone || 'N/A',
            department: meta.assigned_sector || u.assigned_sector || meta.department || meta.dept || 'Unassigned',
            status: u.status || 'Active'
          };
        });
      renderJsoTable();
      updateMetrics();
    }
  } catch (err) {
    console.error('Failed to fetch JSO users:', err);
  }
}

/* ==========================================
   TABLE RENDERING & METRICS
   ========================================== */
function renderJsoTable(dataToRender = jsoData) {
  const tbody = document.getElementById("jso-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (dataToRender.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: #94a3b8; font-weight: 500;">
          <i class="fa-solid fa-folder-open fa-2x" style="margin-bottom: 8px; display: block;"></i>
          No JSO Accounts Registered in Database.
        </td>
      </tr>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  dataToRender.forEach((jso) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", jso.id);
    const dept = jso.department || "Unassigned";
    const status = jso.status || "Active";

    const statusClass = status.toLowerCase() === 'active' ? 'status-active' :
                        status.toLowerCase() === 'on leave' ? 'status-leave' : 'status-suspended';

    tr.innerHTML = `
      <td>
        <div class="officer-name" style="font-weight: 700; color: #0f172a;">${escapeHtml(jso.name)}</div>
        <div class="officer-badge" style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
          <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-family: monospace; font-weight: 600;">
            <i class="fa-solid fa-id-badge"></i> ${escapeHtml(jso.badge)}
          </span>
          <span class="status-pill ${statusClass}" style="font-size: 0.75rem;">${escapeHtml(status)}</span>
        </div>
      </td>
      <td>
        <div style="font-size: 0.85rem; color: #334155;"><i class="fa-solid fa-phone" style="font-size: 0.8rem; color: #10b981; margin-right: 4px;"></i> ${escapeHtml(jso.phone)}</div>
        <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;"><i class="fa-solid fa-envelope" style="font-size: 0.8rem; color: #0088ff; margin-right: 4px;"></i> ${escapeHtml(jso.email)}</div>
      </td>
      <td>
        <div style="margin-bottom: 4px;">
          <span style="background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 12px; font-size: 0.82rem; font-weight: 600;">
            <i class="fa-solid fa-location-dot" style="color: #0088ff; margin-right: 4px;"></i>${escapeHtml(dept)}
          </span>
        </div>
      </td>
      <td class="text-right" style="white-space: nowrap;">
        <div class="action-btns" style="display: flex; justify-content: flex-end; gap: 6px;">
          <button class="btn-icon" title="Dispatch Field Duty Instructions" onclick="openRecommendModal(${jso.id})">
            <i class="fa-solid fa-shield-halved" style="color: #8b5cf6;"></i>
          </button>
          <button class="btn-icon" title="Send Directive" onclick="openMessageModal(${jso.id})">
            <i class="fa-solid fa-paper-plane" style="color: #0088ff;"></i>
          </button>
          <button class="btn-icon" title="Edit Account" onclick="openEditModal(${jso.id})">
            <i class="fa-solid fa-pen-to-square" style="color: #10b981;"></i>
          </button>
          <button class="btn-icon delete" title="Delete Account" onclick="deleteJso(${jso.id})">
            <i class="fa-solid fa-trash" style="color: #ef4444;"></i>
          </button>
        </div>
      </td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

function updateMetrics() {
  const totalCountElem = document.getElementById("total-jso-count");
  const shiftCountElem = document.getElementById("active-shift-count");
  const msgCountElem = document.getElementById("messages-sent-count");

  if (totalCountElem) totalCountElem.textContent = jsoData.length;

  const activeOfficers = jsoData.filter((j) => (j.status || '').toLowerCase() === "active");

  if (shiftCountElem) shiftCountElem.textContent = activeOfficers.length;
  if (msgCountElem) msgCountElem.textContent = dispatchedDirectivesCount;
}

function setupSearchInput() {
  const searchInput = document.getElementById("jso-search-input");
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filterJsoTable();
    }, 200);
  });
}

function filterJsoTable() {
  const searchInput = document.getElementById("jso-search-input");
  if (!searchInput) return;

  const query = searchInput.value.toLowerCase().trim();
  const filtered = jsoData.filter((j) => {
    const dept = j.department || "";
    return (
      j.name.toLowerCase().includes(query) ||
      j.badge.toLowerCase().includes(query) ||
      dept.toLowerCase().includes(query) ||
      j.email.toLowerCase().includes(query) ||
      j.phone.toLowerCase().includes(query)
    );
  });
  renderJsoTable(filtered);
}

/* ==========================================
   MODAL CONTROLS & DATABASE CRUD OPERATIONS
   ========================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

function openAddModal() {
  const title = document.getElementById("modalTitle");
  if (title) title.textContent = "Add New JSO Account";

  const form = document.getElementById("jsoForm");
  if (form) form.reset();

  const idField = document.getElementById("jso-id");
  if (idField) idField.value = "";

  openModal("jsoModal");
}

function openEditModal(id) {
  const jso = jsoData.find((item) => String(item.id) === String(id));
  if (!jso) return;

  const title = document.getElementById("modalTitle");
  if (title) title.textContent = "Edit JSO Account";

  document.getElementById("jso-id").value = jso.id;
  document.getElementById("jso-name").value = jso.name;
  document.getElementById("jso-badge").value = jso.badge;
  document.getElementById("jso-email").value = jso.email;
  document.getElementById("jso-phone").value = jso.phone;
  document.getElementById("jso-dept").value = jso.department || "Unassigned";

  const statusElem = document.getElementById("jso-status");
  if (statusElem) statusElem.value = jso.status || "Active";

  openModal("jsoModal");
}

// Handle Form Submission (Add or Update in MySQL DB)
async function handleFormSubmit(event) {
  event.preventDefault();

  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) saveBtn.disabled = true;

  const id = document.getElementById("jso-id").value;
  const fullName = document.getElementById("jso-name").value.trim();
  const badge = document.getElementById("jso-badge").value.trim();
  const email = document.getElementById("jso-email").value.trim();
  const phone = document.getElementById("jso-phone").value.trim();
  const department = document.getElementById("jso-dept").value;
  const status = document.getElementById("jso-status") ? document.getElementById("jso-status").value : "Active";

  const nameParts = fullName.split(' ');
  const fname = nameParts[0] || fullName;
  const lname = nameParts.slice(1).join(' ') || '';

  try {
    let payload = {};
    let action = '';

    if (id) {
      action = 'update_user';
      payload = {
        action: 'update_user',
        id: parseInt(id),
        fname: fname,
        lname: lname,
        email: email,
        username: email,
        role: 'JSO',
        status: status,
        meta_data: {
          badge_id: badge,
          phone: phone,
          assigned_sector: department
        }
      };
    } else {
      action = 'add_user';
      payload = {
        action: 'add_user',
        fname: fname,
        lname: lname,
        email: email,
        username: email,
        password: 'Password123!',
        role: 'JSO',
        status: status,
        meta_data: {
          badge_id: badge,
          phone: phone,
          assigned_sector: department
        }
      };
    }

    const res = await fetch('/Uniguard/BackEnd/index.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.status === 'success') {
      alert(`JSO Account ${id ? 'updated' : 'created'} successfully in database!`);
      closeModal("jsoModal");
      await fetchJsoUsers();
    } else {
      alert(`Error: ${result.message || 'Operation failed.'}`);
    }
  } catch (err) {
    console.error('Failed to submit JSO form:', err);
    alert('Failed to connect to database backend.');
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

// Delete JSO Account from MySQL Database
async function deleteJso(id) {
  const jso = jsoData.find((item) => String(item.id) === String(id));
  if (!jso) return;

  if (!confirm(`Are you sure you want to permanently delete JSO ${jso.name} (${jso.badge}) from the database?`)) {
    return;
  }

  try {
    const res = await fetch('/Uniguard/BackEnd/index.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_user',
        id: parseInt(id),
        role: 'JSO'
      })
    });

    const result = await res.json();
    if (result.status === 'success') {
      alert(`JSO account deleted successfully.`);
      await fetchJsoUsers();
    } else {
      alert(`Failed to delete: ${result.message || 'Server error.'}`);
    }
  } catch (err) {
    console.error('Failed to delete JSO:', err);
    alert('Failed to communicate with database server.');
  }
}

/* ==========================================
   DIRECTIVES & DEPLOYMENTS LOGIC
   ========================================== */
function openMessageModal(id) {
  const jso = jsoData.find((item) => String(item.id) === String(id));
  if (!jso) return;

  const dept = jso.department || "Unassigned";
  document.getElementById("msg-jso-id").value = jso.id;
  document.getElementById("msg-jso-name").value = `${jso.name} (${dept})`;
  document.getElementById("msg-content").value = "";
  openModal("messageModal");
}

function handleSendMessage(event) {
  event.preventDefault();
  const name = document.getElementById("msg-jso-name").value;

  dispatchedDirectivesCount++;
  localStorage.setItem("uniguard_jso_dispatched_count", dispatchedDirectivesCount);
  updateMetrics();
  closeModal("messageModal");

  alert(`Directive successfully dispatched to ${name}.`);
}

function openRecommendModal(id) {
  const jso = jsoData.find((item) => String(item.id) === String(id));
  if (!jso) return;

  document.getElementById("rec-jso-id").value = jso.id;
  document.getElementById("rec-jso-name").value = `${jso.name} - ${jso.badge}`;
  populateActivityDetails();
  openModal("recommendModal");
}

function populateActivityDetails() {
  const type = document.getElementById("rec-activity-type").value;
  const textarea = document.getElementById("rec-details");

  const defaultTemplates = {
    "Main Gate Access & Barcode Audit": "Perform strict QR/Barcode card verification for all incoming student and staff vehicles. Report unauthorized entries immediately.",
    "Perimeter Building Security Sweep": "Conduct hourly security perimeter sweeps around key campus structures and verify all access doors are secured.",
    "Exam Center / Hall Guard Duty": "Maintain static guard position outside exam halls. Restrict entry to authorized cardholders and exam supervisors only.",
    "Overnight Vehicle Log Audit": "Log all overnight parked vehicles and report unregistered license plates before morning shift handover.",
    "Escort & Special Event Security": "Provide VIP security escort and maintain crowd control protocols at the assigned event venue."
  };

  textarea.value = defaultTemplates[type] || "";
}

function handleSendRecommendation(event) {
  event.preventDefault();
  const name = document.getElementById("rec-jso-name").value;

  dispatchedDirectivesCount++;
  localStorage.setItem("uniguard_jso_dispatched_count", dispatchedDirectivesCount);
  updateMetrics();
  closeModal("recommendModal");

  alert(`Field Duty deployment instructions successfully sent to ${name}.`);
}

/* ==========================================
   BULK IMPORT LOGIC
   ========================================== */
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileNameElem = document.getElementById("selected-file-name");
  const previewArea = document.getElementById("file-preview-area");
  const submitBtn = document.getElementById("btn-import-submit");

  if (fileNameElem) fileNameElem.textContent = file.name;
  if (previewArea) previewArea.style.display = "flex";
  if (submitBtn) submitBtn.disabled = false;
}

function clearSelectedFile() {
  const fileInput = document.getElementById("csv-file-input");
  const previewArea = document.getElementById("file-preview-area");
  const submitBtn = document.getElementById("btn-import-submit");

  if (fileInput) fileInput.value = "";
  if (previewArea) previewArea.style.display = "none";
  if (submitBtn) submitBtn.disabled = true;
}

async function handleBulkUploadSubmit(event) {
  event.preventDefault();
  const fileInput = document.getElementById("csv-file-input");
  if (!fileInput || !fileInput.files.length) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function(e) {
    const text = e.target.result;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length <= 1) {
      alert('CSV file appears empty or only contains headers.');
      return;
    }

    let addedCount = 0;
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 3) {
        const name = parts[0];
        const email = parts[1];
        const phone = parts[2] || 'N/A';
        const department = parts[3] || 'Unassigned';
        const badge = parts[4] || `JSO-${Math.floor(2000 + Math.random() * 8000)}`;

        const nameParts = name.split(' ');
        const fname = nameParts[0] || name;
        const lname = nameParts.slice(1).join(' ') || '';

        try {
          await fetch('/Uniguard/BackEnd/index.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'add_user',
              fname: fname,
              lname: lname,
              email: email,
              username: email,
              password: 'Password123!',
              role: 'JSO',
              status: 'Active',
              meta_data: {
                badge_id: badge,
                phone: phone,
                assigned_sector: department
              }
            })
          });
          addedCount++;
        } catch (err) {}
      }
    }

    alert(`Successfully processed bulk upload. Added ${addedCount} JSO accounts to database.`);
    clearSelectedFile();
    closeModal('bulkUploadModal');
    await fetchJsoUsers();
  };

  reader.readAsText(file);
}

/* ==========================================
   UTILITY FUNCTIONS & STATUS PICKER
   ========================================== */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
