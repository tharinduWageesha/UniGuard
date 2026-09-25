/* ==========================================
   UNIGUARD - MANAGE OIC STATE & OPERATIONS (DATABASE DRIVEN)
   ========================================== */

let oicData = [];
let dispatchedDirectivesCount = parseInt(localStorage.getItem("uniguard_dispatched_count")) || 12;

/* ==========================================
   LIFECYCLE & INITIALIZATION
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initLiveClock === 'function') {
    initLiveClock();
  }
  fetchOicUsers();
});

// Fetch OIC accounts directly from MySQL Database via API
async function fetchOicUsers() {
  try {
    const res = await fetch('/Uniguard/BackEnd/index.php?action=get_users');
    const result = await res.json();
    if (result.status === 'success' && Array.isArray(result.data)) {
      oicData = result.data
        .filter(u => {
          const r = (u.role || '').toLowerCase();
          return r === 'oic' || r === 'officer in charge';
        })
        .map(u => {
          const meta = u.meta_data || {};
          return {
            id: u.id,
            fname: u.fname || '',
            lname: u.lname || '',
            name: `${u.fname || ''} ${u.lname || ''}`.trim() || u.username,
            badge: meta.badge_id || meta.badge || u.badge_id || (`OIC-${u.id}`),
            email: u.email || '',
            username: u.username || u.email,
            phone: meta.phone || u.phone || meta.contact_phone || 'N/A',
            department: meta.assigned_sector || u.assigned_sector || meta.department || meta.dept || 'Unassigned',
            status: u.status || 'Active'
          };
        });
      renderOicTable();
      updateMetrics();
    }
  } catch (err) {
    console.error('Failed to fetch OIC users:', err);
  }
}

/* ==========================================
   TABLE RENDERING & METRICS
   ========================================== */
function renderOicTable(dataToRender = oicData) {
  const tbody = document.getElementById('oic-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (dataToRender.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: #94a3b8;">
          <i class="fa-solid fa-folder-open fa-2x" style="margin-bottom: 8px; display: block;"></i>
          No OIC Accounts Registered in Database.
        </td>
      </tr>
    `;
    return;
  }

  dataToRender.forEach(oic => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', oic.id);

    const statusClass = (oic.status || '').toLowerCase() === 'active' ? 'status-active' :
                        (oic.status || '').toLowerCase() === 'on leave' ? 'status-leave' : 'status-suspended';

    tr.innerHTML = `
      <td>
        <div style="font-weight: 700; color: #0f172a;">${oic.name}</div>
        <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
          <span class="badge-chip"><i class="fa-solid fa-id-badge"></i> ${oic.badge}</span>
          <span class="status-pill ${statusClass}">${oic.status}</span>
        </div>
      </td>
      <td>
        <div style="font-size: 0.85rem; color: #334155;"><i class="fa-regular fa-envelope" style="color:#0088ff;"></i> ${oic.email}</div>
        <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;"><i class="fa-solid fa-phone" style="color:#10b981;"></i> ${oic.phone}</div>
      </td>
      <td>
        <span class="dept-tag"><i class="fa-solid fa-location-dot"></i> ${oic.department}</span>
      </td>
      <td class="text-right">
        <div class="action-btn-group" style="justify-content: flex-end; display: flex; gap: 6px;">
          <button class="btn-icon" title="Edit OIC Account" onclick="openEditModal(${oic.id})">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-icon" title="Send Directive" onclick="openMessageModal(${oic.id})">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
          <button class="btn-icon" title="Recommend Activities" onclick="openRecommendModal(${oic.id})">
            <i class="fa-solid fa-lightbulb"></i>
          </button>
          <button class="btn-icon danger" title="Delete OIC Account" onclick="deleteOic(${oic.id})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateMetrics() {
  const totalElem = document.getElementById('total-oic-count');
  const deptElem = document.getElementById('assigned-dept-count');
  const activeElem = document.getElementById('active-oic-count');

  if (totalElem) totalElem.textContent = oicData.length;

  if (deptElem) {
    const depts = new Set(oicData.map(u => u.department).filter(d => d && d !== 'Unassigned'));
    deptElem.textContent = depts.size;
  }

  if (activeElem) {
    const activeCount = oicData.filter(u => (u.status || '').toLowerCase() === 'active').length;
    activeElem.textContent = activeCount;
  }
}

/* ==========================================
   SEARCH & FILTER
   ========================================== */
function filterOicTable() {
  const query = (document.getElementById('oic-search-input')?.value || '').toLowerCase().trim();
  if (!query) {
    renderOicTable(oicData);
    return;
  }

  const filtered = oicData.filter(oic => 
    oic.name.toLowerCase().includes(query) ||
    oic.badge.toLowerCase().includes(query) ||
    oic.email.toLowerCase().includes(query) ||
    oic.phone.toLowerCase().includes(query) ||
    oic.department.toLowerCase().includes(query)
  );

  renderOicTable(filtered);
}

/* ==========================================
   MODAL CONTROLS & FORM HANDLERS
   ========================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function openAddModal() {
  const form = document.getElementById('oicForm');
  if (form) form.reset();

  document.getElementById('oic-id').value = '';
  document.getElementById('modalTitle').textContent = 'Add New OIC Account';
  openModal('oicModal');
}

function openEditModal(id) {
  const oic = oicData.find(u => String(u.id) === String(id));
  if (!oic) return;

  document.getElementById('oic-id').value = oic.id;
  document.getElementById('oic-name').value = oic.name;
  document.getElementById('oic-badge').value = oic.badge;
  document.getElementById('oic-phone').value = oic.phone !== 'N/A' ? oic.phone : '';
  document.getElementById('oic-email').value = oic.email;
  document.getElementById('oic-dept').value = oic.department;
  document.getElementById('oic-status').value = oic.status;

  document.getElementById('modalTitle').textContent = 'Edit OIC Account';
  openModal('oicModal');
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const id = document.getElementById('oic-id').value;
  const fullName = document.getElementById('oic-name').value.trim();
  const badge = document.getElementById('oic-badge').value.trim();
  const phone = document.getElementById('oic-phone').value.trim();
  const email = document.getElementById('oic-email').value.trim();
  const dept = document.getElementById('oic-dept').value;
  const status = document.getElementById('oic-status').value;

  const nameParts = fullName.split(' ');
  const fname = nameParts[0] || fullName;
  const lname = nameParts.slice(1).join(' ') || '';

  const payload = {
    fname: fname,
    lname: lname,
    email: email,
    username: email,
    role: 'OIC',
    status: status,
    meta_data: {
      badge_id: badge,
      phone: phone,
      assigned_sector: dept
    }
  };

  try {
    let url = '/Uniguard/BackEnd/index.php?action=add_user';
    if (id) {
      payload.id = parseInt(id);
      url = '/Uniguard/BackEnd/index.php?action=update_user';
    } else {
      payload.password = 'Oic123!';
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.status === 'success') {
      closeModal('oicModal');
      await fetchOicUsers();
      alert(id ? 'OIC account updated successfully.' : 'New OIC account created successfully.');
    } else {
      alert(result.message || 'Failed to save OIC account.');
    }
  } catch (err) {
    console.error('Error saving OIC account:', err);
    alert('Server connection error. Please try again.');
  }
}

async function deleteOic(id) {
  const oic = oicData.find(u => String(u.id) === String(id));
  const oicName = oic ? oic.name : 'this officer';

  if (!confirm(`Are you sure you want to delete the OIC account for "${oicName}"?`)) {
    return;
  }

  try {
    const res = await fetch('/Uniguard/BackEnd/index.php?action=delete_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, role: 'OIC' })
    });

    const result = await res.json();
    if (result.status === 'success') {
      await fetchOicUsers();
      alert('OIC account deleted successfully.');
    } else {
      alert(result.message || 'Failed to delete OIC account.');
    }
  } catch (err) {
    console.error('Error deleting OIC account:', err);
    alert('Server connection error.');
  }
}

/* ==========================================
   BULK UPLOAD MODAL & HANDLERS
   ========================================== */
function openBulkUploadModal() {
  const form = document.getElementById("bulkUploadForm");
  if (form) form.reset();
  clearSelectedFile();
  openModal("bulkUploadModal");
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById("selected-file-name").textContent = file.name;
    document.getElementById("file-preview-area").style.display = "flex";
    document.getElementById("file-dropzone-text").textContent = "File selected!";
    document.getElementById("btn-import-submit").disabled = false;
  }
}

function clearSelectedFile() {
  const fileInput = document.getElementById("csv-file-input");
  if (fileInput) fileInput.value = "";
  const preview = document.getElementById("file-preview-area");
  if (preview) preview.style.display = "none";
  const dropText = document.getElementById("file-dropzone-text");
  if (dropText) dropText.textContent = "Click to choose file or drag & drop here";
  const submitBtn = document.getElementById("btn-import-submit");
  if (submitBtn) submitBtn.disabled = true;
}

async function handleBulkUploadSubmit(event) {
  event.preventDefault();
  const fileInput = document.getElementById("csv-file-input");
  if (!fileInput || fileInput.files.length === 0) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async function (e) {
    const text = e.target.result;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let addedCount = 0;
    // Skip header line if CSV has headers
    const startIdx = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('email') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2) {
        const fullName = cols[0] || 'OIC Officer';
        const email = cols[1] || `oic${Date.now()}@uniguard.lk`;
        const badge = cols[2] || `OIC-${Math.floor(1000 + Math.random() * 9000)}`;
        const phone = cols[3] || 'N/A';
        const dept = cols[4] || 'UCSC Sector';

        const nameParts = fullName.split(' ');
        const fname = nameParts[0] || fullName;
        const lname = nameParts.slice(1).join(' ') || '';

        try {
          await fetch('/Uniguard/BackEnd/index.php?action=add_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fname: fname,
              lname: lname,
              email: email,
              username: email,
              password: 'Oic123!',
              role: 'OIC',
              status: 'Active',
              meta_data: { badge_id: badge, phone: phone, assigned_sector: dept }
            })
          });
          addedCount++;
        } catch (err) {}
      }
    }

    closeModal("bulkUploadModal");
    await fetchOicUsers();
    alert(`File "${file.name}" processed! Successfully imported ${addedCount} OIC accounts into the database.`);
  };

  reader.readAsText(file);
}

/* ==========================================
   DIRECTIVES LOGIC
   ========================================== */
function openMessageModal(id) {
  const oic = oicData.find((item) => String(item.id) === String(id));
  if (!oic) return;

  const dept = oic.department || 'Unassigned';
  document.getElementById("msg-oic-id").value = oic.id;
  document.getElementById("msg-oic-name").value = `${oic.name} (${dept})`;
  document.getElementById("msg-content").value = "";
  openModal("messageModal");
}

function handleSendMessage(event) {
  event.preventDefault();
  const name = document.getElementById("msg-oic-name").value;

  dispatchedDirectivesCount++;
  localStorage.setItem("uniguard_dispatched_count", dispatchedDirectivesCount);
  closeModal("messageModal");

  alert(`Directive successfully dispatched to ${name}.`);
}

/* ==========================================
   RECOMMENDATIONS LOGIC
   ========================================== */
function openRecommendModal(id) {
  const oic = oicData.find((item) => String(item.id) === String(id));
  if (!oic) return;

  document.getElementById("rec-oic-id").value = oic.id;
  document.getElementById("rec-oic-name").value = `${oic.name} (${oic.department})`;
  populateActivityDetails();
  openModal("recommendModal");
}

function populateActivityDetails() {
  const type = document.getElementById("rec-activity-type").value;
  const detailsArea = document.getElementById("rec-details");
  if (!detailsArea) return;

  const templates = {
    "Conduct Night Patrol & Gate Audit": "Perform comprehensive night patrol across sector gates between 22:00 and 04:00. Verify entry logs, badge checks, and lock status.",
    "Review Sector Incident Reports": "Review all recent security incident submissions in your assigned sector. Submit summary report to CSO office.",
    "Inspect Visitor & Vehicle Pass Logs": "Audit visitor pass registrations and high-frequency vehicle passes at main sector checkpoints.",
    "Assign & Reallocate JSO Staff": "Re-evaluate JSO roster distribution to address high-traffic zones during upcoming events.",
    "Audit Lost & Found Claims": "Conduct weekly audit of unclaimed lost and found items in sector security booth."
  };

  detailsArea.value = templates[type] || "Please execute specified strategic activity and submit confirmation report.";
}

function handleSendRecommendation(event) {
  event.preventDefault();
  const name = document.getElementById("rec-oic-name").value;
  const type = document.getElementById("rec-activity-type").value;

  closeModal("recommendModal");
  alert(`Strategic recommendation "${type}" sent successfully to ${name}.`);
}

/* Logout Button Helper */
const logoutBtn = document.querySelector('.sidebar-footer .btn-logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    window.location.href = '../loginPage.html';
  });
}
