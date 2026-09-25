// ==========================================
// INITIAL SAMPLE DATA
// ==========================================
let backupData = [
  { id: 1, filename: "uniguard_backup_2026-08-04_0200.zip", created: "04 Aug 2026, 02:00 AM", type: "Automatic", sizeMb: 18.4 },
  { id: 2, filename: "uniguard_backup_2026-08-03_0200.zip", created: "03 Aug 2026, 02:00 AM", type: "Automatic", sizeMb: 18.2 },
  { id: 3, filename: "uniguard_backup_2026-08-02_1130.zip", created: "02 Aug 2026, 11:30 AM", type: "Manual", sizeMb: 18.1 },
  { id: 4, filename: "uniguard_backup_2026-08-01_0200.zip", created: "01 Aug 2026, 02:00 AM", type: "Automatic", sizeMb: 17.9 }
];

let restoreTargetId = null;

document.addEventListener("DOMContentLoaded", () => {
  startLiveClock();
  loadUserProfile();
  renderBackupTable();
  updateBackupMetrics();
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

function renderBackupTable() {
  const tbody = document.getElementById("backup-table-body");
  tbody.innerHTML = "";

  const sorted = [...backupData].sort((a, b) => b.id - a.id);

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #94a3b8;">No backups yet. Click "Create Backup Now" to make one.</td></tr>`;
    return;
  }

  sorted.forEach((backup) => {
    const typeClass = backup.type === "Manual" ? "manual" : "automatic";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="file-cell">
          <i class="fa-solid fa-file-zipper"></i>
          <span>${backup.filename}</span>
        </div>
      </td>
      <td>${backup.created}</td>
      <td><span class="backup-type-badge ${typeClass}">${backup.type}</span></td>
      <td>${backup.sizeMb.toFixed(1)} MB</td>
      <td class="text-right">
        <div class="action-btns">
          <button class="btn-icon" title="Download Backup" onclick="downloadBackup(${backup.id})">
            <i class="fa-solid fa-download"></i>
          </button>
          <button class="btn-icon" title="Restore From This Backup" onclick="openRestoreModal(${backup.id})">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </button>
          <button class="btn-icon delete" title="Remove Backup" onclick="deleteBackup(${backup.id})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateBackupMetrics() {
  const sorted = [...backupData].sort((a, b) => b.id - a.id);
  document.getElementById("last-backup-time").textContent = sorted.length > 0 ? sorted[0].created : "—";
  document.getElementById("total-backup-count").textContent = backupData.length;
  const totalMb = backupData.reduce((sum, b) => sum + b.sizeMb, 0);
  document.getElementById("storage-used").textContent = `${totalMb.toFixed(1)} MB`;
}

function createBackup() {
  const btn = document.getElementById("createBackupBtn");
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Backup...`;

  setTimeout(() => {
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10) + "_" + now.toTimeString().slice(0, 5).replace(":", "");
    const newId = backupData.length > 0 ? Math.max(...backupData.map(b => b.id)) + 1 : 1;

    backupData.push({
      id: newId,
      filename: `uniguard_backup_${stamp}.zip`,
      created: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + now.toLocaleTimeString('en-US', { hour12: true }),
      type: "Manual",
      sizeMb: Math.round((17.5 + Math.random() * 2) * 10) / 10
    });

    renderBackupTable();
    updateBackupMetrics();

    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Create Backup Now`;
    showToast("Backup created successfully.");
  }, 900);
}

function downloadBackup(id) {
  const backup = backupData.find(b => b.id === id);
  if (!backup) return;
  // Simulated download for this demo build — a real deployment would stream the file from the server.
  showToast(`Preparing "${backup.filename}" for download...`);
}

function openRestoreModal(id) {
  const backup = backupData.find(b => b.id === id);
  if (!backup) return;
  restoreTargetId = id;
  document.getElementById("restoreModalText").textContent =
    `You are about to restore the system to the state saved in "${backup.filename}" (${backup.created}).`;
  openModal("restoreModal");
}

function confirmRestore() {
  const backup = backupData.find(b => b.id === restoreTargetId);
  closeModal("restoreModal");
  if (!backup) return;
  showToast(`System restored from "${backup.filename}".`);
}

function deleteBackup(id) {
  const backup = backupData.find(b => b.id === id);
  if (backup && confirm(`Remove backup "${backup.filename}"? This cannot be undone.`)) {
    backupData = backupData.filter(b => b.id !== id);
    renderBackupTable();
    updateBackupMetrics();
    showToast("Backup removed.");
  }
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

function showToast(message) {
  const toast = document.getElementById("saveToast");
  const text = document.getElementById("saveToastText");
  text.textContent = message;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
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
