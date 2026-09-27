// ==========================================
// INITIAL SAMPLE DATA & PAGINATION STATE
// ==========================================
function normalizeRole(roleStr) {
  if (!roleStr) return "";
  const r = String(roleStr).trim().toLowerCase();
  if (r === "cso" || r === "chief security officer") return "CSO";
  if (r === "jso" || r === "junior security officer" || r === "security officer") return "JSO";
  if (r === "oic" || r === "officer in charge") return "OIC";
  if (r === "admin" || r === "system admin") return "Admin";
  if (r === "university management" || r === "university admin" || r === "um") return "University Management";
  if (r === "support agent" || r === "support account" || r === "support" || r === "user") return "Support Account";
  if (r === "student") return "Student";
  if (r === "staff") return "Staff";
  if (r === "visitor") return "Visitor";
  return roleStr;
}

let userData = [
  { id: 1, uid: "Student_1", name: "T.W Abeysekera", email: "abeysekera@stu.cmb.ac.lk", phone: "+94 71 234 5678", idNumber: "2021/CS/001", role: "Student", original_role: "Student", status: "Active" },
  { id: 2, uid: "Student_2", name: "H.T Wijenayaka", email: "wijenayaka@stu.cmb.ac.lk", phone: "+94 77 345 6789", idNumber: "2021/CS/002", role: "Student", original_role: "Student", status: "Active" },
  { id: 3, uid: "Staff_3", name: "A.M.D Amna", email: "amna.staff@cmb.ac.lk", phone: "+94 76 456 7890", idNumber: "STF-102", role: "Staff", original_role: "Staff", status: "Active" },
  { id: 4, uid: "CSO_4", name: "Susantha De Silva", email: "susantha@uniguard.lk", phone: "+94 70 112 2334", idNumber: "CSO-001", role: "CSO", original_role: "Chief Security Officer", status: "Active" },
  { id: 5, uid: "JSO_5", name: "K.L. Ranasinghe", email: "ranasinghe@uniguard.lk", phone: "+94 77 412 8901", idNumber: "SEC-089", role: "JSO", original_role: "Security Officer", status: "Active" },
  { id: 6, uid: "Student_6", name: "J.K. Fonseka", email: "fonseka@stu.cmb.ac.lk", phone: "+94 75 998 1122", idNumber: "2021/CS/044", role: "Student", original_role: "Student", status: "Deactivated" }
];

let currentPage = 1;
const rowsPerPage = 10;
let currentFilteredData = [...userData];

document.addEventListener("DOMContentLoaded", () => {
  startLiveClock();
  loadUserProfile();
  loadUsersFromDB();
});

function loadUserProfile() {
  const user = (typeof Auth !== 'undefined' && Auth.getCurrentUser) ? Auth.getCurrentUser() : null;
  const welcomeNameElem = document.getElementById("topbar-welcome-name") || document.querySelector(".welcome-name");
  const userNameElem = document.getElementById("topbar-user-name") || document.querySelector(".user-name");
  const userRoleElem = document.getElementById("topbar-user-role") || document.querySelector(".user-role");
  const avatarElem = document.getElementById("topbar-avatar") || document.querySelector(".avatar-letter");

  if (user) {
    const fullName = `${user.fname || ''} ${user.lname || ''}`.trim() || user.username || "Admin";
    const welcomeName = user.fname || user.username || "Admin";
    const initial = (fullName.charAt(0) || "A").toUpperCase();

    if (welcomeNameElem) welcomeNameElem.textContent = welcomeName;
    if (userNameElem) userNameElem.textContent = fullName;
    if (userRoleElem) userRoleElem.textContent = (user.role || "ADMIN").toUpperCase();
    if (avatarElem) avatarElem.textContent = initial;
  } else {
    if (welcomeNameElem) welcomeNameElem.textContent = "Admin";
    if (userNameElem) userNameElem.textContent = "System Admin";
    if (userRoleElem) userRoleElem.textContent = "ADMIN";
    if (avatarElem) avatarElem.textContent = "A";
  }
}

async function loadUsersFromDB() {
  if (typeof Auth !== 'undefined') {
    const result = await Auth.getUsers();
    if (result.success && Array.isArray(result.users) && result.users.length > 0) {
      userData = result.users.map(u => {
        const normRole = normalizeRole(u.role);
        const rawId = parseInt(u.id);
        const uid = `${normRole}_${rawId}`;
        return {
          id: rawId,
          uid: uid,
          name: `${u.fname || ''} ${u.lname || ''}`.trim() || u.username,
          fname: u.fname || '',
          lname: u.lname || '',
          email: u.email || u.username,
          username: u.username,
          phone: "+94 77 000 0000",
          idNumber: u.username,
          role: normRole,
          original_role: u.role || normRole,
          status: u.status || "Active"
        };
      });
      // Sort newest users first by ID
      userData.sort((a, b) => b.id - a.id);
    }
  }
  filterByUsername();
  updateMetrics();
}

// ==========================================
// LIVE CLOCK & DASHBOARD METRICS
// ==========================================
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

function updateMetrics() {
  document.getElementById("total-user-count").textContent = userData.length;
  document.getElementById("active-user-count").textContent = userData.filter(u => u.status === "Active").length;
  document.getElementById("deactivated-user-count").textContent = userData.filter(u => u.status === "Deactivated").length;
}

// ==========================================
// USERNAME SEARCH & PAGINATION
// ==========================================
function filterByUsername() {
  const queryInput = document.getElementById("user-search-input");
  const query = queryInput ? queryInput.value.toLowerCase().trim() : "";
  const subtitleElem = document.getElementById("directory-subtitle");

  if (query === "") {
    // Show only recent 25 accounts when search is empty
    currentFilteredData = userData.slice(0, 25);
    if (subtitleElem) {
      subtitleElem.textContent = `Showing recent ${currentFilteredData.length} accounts. Use search to find any user across the system.`;
    }
  } else {
    // Search across ALL registered accounts in system by username, email, or name
    currentFilteredData = userData.filter(user => {
      const uName = (user.username || "").toLowerCase();
      const uEmail = (user.email || "").toLowerCase();
      const fullName = (user.name || "").toLowerCase();
      return uName.includes(query) || uEmail.includes(query) || fullName.includes(query);
    });
    if (subtitleElem) {
      subtitleElem.textContent = `Search results for "${query}" (${currentFilteredData.length} matching account${currentFilteredData.length === 1 ? '' : 's'}).`;
    }
  }

  currentPage = 1; // Reset to page 1 whenever search query changes
  renderUserTable();
}

function renderUserTable(dataToRender = currentFilteredData) {
  const tbody = document.getElementById("user-table-body");
  tbody.innerHTML = "";

  const total = dataToRender.length;
  const totalPages = Math.ceil(total / rowsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * rowsPerPage;
  const end = Math.min(start + rowsPerPage, total);
  const paginatedUsers = dataToRender.slice(start, end);

  if (paginatedUsers.length === 0) {
    const queryInput = document.getElementById("user-search-input");
    const query = queryInput ? queryInput.value.trim() : "";
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2.5rem; color: #64748b;">
      <i class="fa-solid fa-user-slash" style="font-size: 2rem; color: #cbd5e1; display: block; margin-bottom: 0.5rem;"></i>
      No user account found matching "${query || 'search'}".
    </td></tr>`;
  } else {
    paginatedUsers.forEach((user) => {
      const tr = document.createElement("tr");
      const statusClass = user.status === "Active" ? "active" : "deactivated";

      tr.innerHTML = `
        <td>
          <div class="officer-name">${user.name}</div>
          <div class="officer-badge"><i class="fa-solid fa-phone"></i> ${user.phone} ${user.idNumber ? `| ${user.idNumber}` : ''}</div>
        </td>
        <td>${user.email}</td>
        <td><span class="status-badge active" style="background:#eaf4ff;color:#0088ff;">${user.role}</span></td>
        <td><span class="status-badge ${statusClass}">${user.status}</span></td>
        <td class="text-right">
          <div class="action-btns">
            <button class="btn-icon" title="Edit Account" onclick="openEditModal('${user.uid}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon delete" title="Delete Account" onclick="deleteUser('${user.uid}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Update Pagination Controls UI
  document.getElementById("page-start").innerText = total === 0 ? 0 : start + 1;
  document.getElementById("page-end").innerText = end;
  document.getElementById("total-records").innerText = total;
  document.getElementById("page-number-display").innerText = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prev-page-btn").disabled = currentPage === 1;
  document.getElementById("next-page-btn").disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(direction) {
  currentPage += direction;
  renderUserTable();
}

// ==========================================
// MODAL & USER ACTIONS
// ==========================================
function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

function openAddModal() {
  document.getElementById("modalTitle").textContent = "Add New User";
  document.getElementById("userForm").reset();
  document.getElementById("user-id").value = "";
  document.getElementById("user-uid").value = "";
  document.getElementById("user-original-role").value = "";

  const passwordInput = document.getElementById("user-password");
  if (passwordInput) {
    passwordInput.setAttribute("required", "required");
    passwordInput.placeholder = "Account Password";
  }

  const statusElem = document.getElementById("user-status");
  if (statusElem) statusElem.value = "Active";

  openModal("userModal");
}

function openEditModal(uid) {
  const user = userData.find(item => item.uid === String(uid) || String(item.id) === String(uid));
  if (!user) return;

  document.getElementById("modalTitle").textContent = "Edit User Account";
  document.getElementById("user-id").value = user.id;
  document.getElementById("user-uid").value = user.uid || '';
  document.getElementById("user-original-role").value = user.original_role || user.role || '';
  document.getElementById("user-name").value = user.name || `${user.fname || ''} ${user.lname || ''}`.trim();
  document.getElementById("user-email").value = user.email || '';

  const passwordInput = document.getElementById("user-password");
  if (passwordInput) {
    passwordInput.removeAttribute("required");
    passwordInput.value = "";
    passwordInput.placeholder = "Leave blank to keep current password";
  }

  const roleElem = document.getElementById("user-role");
  if (roleElem) roleElem.value = user.role || '';

  const statusElem = document.getElementById("user-status");
  if (statusElem) statusElem.value = user.status || 'Active';

  openModal("userModal");
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const id = document.getElementById("user-id").value;
  const originalRole = document.getElementById("user-original-role").value;
  const fullName = document.getElementById("user-name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const passwordInput = document.getElementById("user-password");
  const password = passwordInput ? passwordInput.value.trim() : "";
  const role = document.getElementById("user-role").value;
  const status = document.getElementById("user-status").value;

  const nameParts = fullName.split(" ");
  const fname = nameParts[0] || fullName;
  const lname = nameParts.slice(1).join(" ") || "";
  const username = email;

  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }

  try {
    if (typeof Auth !== 'undefined') {
      if (id) {
        // Edit User
        const payload = {
          id: parseInt(id),
          fname,
          lname,
          email,
          username,
          role,
          original_role: originalRole || role,
          status
        };
        if (password) {
          payload.password = password;
        }

        const result = await Auth.updateUser(payload);
        if (result.success) {
          alert(`User account updated successfully! Status set to ${status}.`);
        } else {
          alert(result.message || "Failed to update user.");
          return;
        }
      } else {
        // Add New User
        if (!password) {
          alert("Password is required for creating a new user account.");
          return;
        }
        const result = await Auth.addUser({
          fname,
          lname,
          email,
          username,
          password,
          role,
          status
        });
        if (result.success) {
          alert("New user account added successfully!");
        } else {
          alert(result.message || "Failed to create user.");
          return;
        }
      }
    }
  } catch (err) {
    console.error("Form submit error:", err);
    alert("An unexpected error occurred while saving user data.");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Account";
    }
  }

  closeModal("userModal");
  await loadUsersFromDB();
}

async function toggleStatus(uid) {
  const user = userData.find(item => item.uid === String(uid) || String(item.id) === String(uid));
  if (!user) return;

  const newStatus = user.status === "Active" ? "Deactivated" : "Active";

  if (typeof Auth !== 'undefined') {
    const result = await Auth.updateUser({
      id: user.id,
      fname: user.fname || user.name.split(' ')[0] || user.name,
      lname: user.lname || user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      username: user.username || user.email,
      role: user.role,
      original_role: user.original_role || user.role,
      status: newStatus
    });

    if (result.success) {
      await loadUsersFromDB();
      return;
    } else {
      alert(result.message || "Failed to update account status.");
      return;
    }
  }

  user.status = newStatus;
  filterByUsername();
  updateMetrics();
}

async function deleteUser(uid) {
  const user = userData.find(item => item.uid === String(uid) || String(item.id) === String(uid));
  const userName = user ? user.name : `User #${uid}`;

  if (confirm(`Are you sure you want to permanently delete account "${userName}"?`)) {
    if (user && typeof Auth !== 'undefined') {
      const result = await Auth.deleteUser(user.id, user.original_role || user.role);
      if (result.success) {
        alert("User account deleted successfully.");
        await loadUsersFromDB();
        return;
      } else {
        alert(result.message || "Failed to delete user.");
        return;
      }
    }
    userData = userData.filter(item => item.uid !== String(uid) && String(item.id) !== String(uid));
    filterByUsername();
    updateMetrics();
  }
}

// ==========================================
// ==========================================
// BULK IMPORT (CSV & EXCEL PARSER)
// ==========================================
const VALID_ROLES = [
  "Student", "Staff", "Security Officer", "Chief Security Officer", "CSO", "JSO", "OIC",
  "University Management", "Admin", "Visitor", "Support Account"
];
let bulkImportRows = [];

function openBulkImportModal() {
  bulkImportRows = [];
  document.getElementById("csvFileInput").value = "";
  document.getElementById("dropzoneFileName").textContent = "No file selected";
  document.getElementById("previewImportBtn").disabled = true;
  document.getElementById("bulkImportError").style.display = "none";
  document.getElementById("bulkImportStep1").style.display = "block";
  document.getElementById("bulkImportStep2").style.display = "none";
  openModal("bulkImportModal");
}

function downloadBulkImportSample() {
  const sampleContent = "name,email,phone,idNumber,role,status\n" +
                        "Anura Kumara,anura@stu.cmb.ac.lk,+94 77 123 4567,2021/CS/088,Student,Active\n" +
                        "Nimal Perera,nimal.staff@cmb.ac.lk,+94 71 987 6543,STF-302,Staff,Active\n" +
                        "Kamal Gunaratne,kamal@uniguard.lk,+94 76 555 4433,SEC-042,Security Officer,Active\n";
  const blob = new Blob([sampleContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "uniguard_bulk_user_import_sample.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const IMPORT_FILE_EXTENSIONS = [".csv", ".xlsx", ".xls"];

function handleCsvFileSelect(event) {
  const file = event.target.files[0];
  const errorBox = document.getElementById("bulkImportError");
  errorBox.style.display = "none";

  if (!file) {
    document.getElementById("dropzoneFileName").textContent = "No file selected";
    document.getElementById("previewImportBtn").disabled = true;
    return;
  }

  const lowerName = file.name.toLowerCase();
  const isSupported = IMPORT_FILE_EXTENSIONS.some(ext => lowerName.endsWith(ext));

  if (!isSupported) {
    errorBox.textContent = "Please select a valid .csv, .xlsx, or .xls file.";
    errorBox.style.display = "block";
    document.getElementById("previewImportBtn").disabled = true;
    return;
  }

  document.getElementById("dropzoneFileName").textContent = file.name;
  document.getElementById("previewImportBtn").disabled = false;
  document.getElementById("csvFileInput")._selectedFile = file;
}

function parseCsvLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

function previewBulkImport() {
  const file = document.getElementById("csvFileInput")._selectedFile;
  const errorBox = document.getElementById("bulkImportError");
  errorBox.style.display = "none";

  if (!file) {
    errorBox.textContent = "Please choose a CSV or Excel file first.";
    errorBox.style.display = "block";
    return;
  }

  const lowerName = file.name.toLowerCase();
  const isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");

  const reader = new FileReader();

  reader.onload = (e) => {
    let rows;

    if (isExcel) {
      try {
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "", blankrows: false })
          .map(row => row.map(cell => String(cell).trim()));
      } catch (err) {
        errorBox.textContent = "Could not read that Excel file. Please make sure it's a valid .xlsx or .xls file.";
        errorBox.style.display = "block";
        return;
      }
    } else {
      const lines = e.target.result.split(/\r?\n/).filter(l => l.trim().length > 0);
      rows = lines.map(parseCsvLine);
    }

    if (rows.length < 2) {
      errorBox.textContent = "The file has no data rows to import.";
      errorBox.style.display = "block";
      return;
    }

    const header = rows[0].map(h => String(h).toLowerCase().trim());
    const nameIdx = header.indexOf("name");
    const emailIdx = header.indexOf("email");
    const phoneIdx = header.indexOf("phone");
    const idIdx = header.indexOf("idnumber");
    const roleIdx = header.indexOf("role");
    const statusIdx = header.indexOf("status");

    if (nameIdx === -1 || emailIdx === -1) {
      errorBox.textContent = 'The header row must at least include "name" and "email" columns.';
      errorBox.style.display = "block";
      return;
    }

    const existingEmails = new Set(userData.map(u => (u.email || "").toLowerCase()));
    const validRolesLower = VALID_ROLES.map(r => r.toLowerCase());
    bulkImportRows = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      const name = (cols[nameIdx] || "").trim();
      const email = (cols[emailIdx] || "").trim();
      const phone = phoneIdx !== -1 ? (cols[phoneIdx] || "").trim() : "";
      const idNumber = idIdx !== -1 ? (cols[idIdx] || "").trim() : "";
      let role = roleIdx !== -1 ? (cols[roleIdx] || "").trim() : "Student";
      if (!role) role = "Student";
      let status = statusIdx !== -1 ? (cols[statusIdx] || "").trim() : "Active";
      if (!status) status = "Active";

      let error = "";
      if (!name) error = "Missing name";
      else if (!email || !email.includes("@")) error = "Invalid email";
      else if (existingEmails.has(email.toLowerCase())) error = "Email already registered";
      else if (!validRolesLower.includes(role.toLowerCase())) error = "Invalid role";
      else if (status.toLowerCase() !== "active" && status.toLowerCase() !== "deactivated") error = "Invalid status";

      if (!error) existingEmails.add(email.toLowerCase());

      bulkImportRows.push({ name, email, phone, idNumber, role, status, error, valid: !error });
    }

    renderBulkImportPreview();
    document.getElementById("bulkImportStep1").style.display = "none";
    document.getElementById("bulkImportStep2").style.display = "block";
  };

  reader.onerror = () => {
    errorBox.textContent = "Could not read that file. Please try again.";
    errorBox.style.display = "block";
  };

  if (isExcel) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

function renderBulkImportPreview() {
  const tbody = document.getElementById("bulkImportPreviewBody");
  tbody.innerHTML = "";

  bulkImportRows.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name || "—"}</td>
      <td>${row.email || "—"}</td>
      <td>${row.idNumber || "—"}</td>
      <td>${row.role || "—"}</td>
      <td>${row.status || "—"}</td>
      <td>${row.valid
        ? `<span class="import-result-ok"><i class="fa-solid fa-circle-check"></i> Ready</span>`
        : `<span class="import-result-fail"><i class="fa-solid fa-circle-exclamation"></i> ${row.error}</span>`}
      </td>
    `;
    tbody.appendChild(tr);
  });

  const validCount = bulkImportRows.filter(r => r.valid).length;
  const invalidCount = bulkImportRows.length - validCount;
  document.getElementById("bulkImportSummaryText").textContent =
    `Found ${bulkImportRows.length} row(s): ${validCount} ready to import, ${invalidCount} will be skipped.`;

  document.getElementById("confirmImportBtn").disabled = validCount === 0;
}

function backToBulkImportUpload() {
  document.getElementById("bulkImportStep1").style.display = "block";
  document.getElementById("bulkImportStep2").style.display = "none";
}

async function confirmBulkImport() {
  const validRows = bulkImportRows.filter(r => r.valid);
  if (validRows.length === 0) return;

  const confirmBtn = document.getElementById("confirmImportBtn");
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Importing...`;
  }

  let importedCount = 0;
  let failCount = 0;

  for (const row of validRows) {
    const nameParts = row.name.split(" ");
    const fname = nameParts[0] || row.name;
    const lname = nameParts.slice(1).join(" ") || "";
    const username = row.email;
    const password = "Password@123"; // Initial password for bulk imported accounts

    try {
      if (typeof Auth !== 'undefined') {
        const result = await Auth.addUser({
          fname,
          lname,
          email: row.email,
          username,
          password,
          role: row.role,
          status: row.status || 'Active'
        });
        if (result && result.success) {
          importedCount++;
        } else {
          failCount++;
        }
      } else {
        importedCount++;
      }
    } catch (err) {
      console.error("Bulk import error for user", row.email, err);
      failCount++;
    }
  }

  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `<i class="fa-solid fa-check"></i> Import Valid Rows`;
  }

  closeModal("bulkImportModal");
  await loadUsersFromDB();
  alert(`Bulk Import Summary:\n• Successfully imported: ${importedCount} account(s)\n• Failed / Skipped: ${failCount}`);
}

// ==========================================
// DRAG AND DROP SETUP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  if (!dropzone) return;
  ["dragenter", "dragover"].forEach(evt =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); })
  );
  ["dragleave", "drop"].forEach(evt =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("drag-over"); })
  );
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file) {
      document.getElementById("csvFileInput").files = e.dataTransfer.files;
      handleCsvFileSelect({ target: { files: [file] } });
    }
  });
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
