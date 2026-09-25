// ==========================================
// DEFAULT SETTINGS
// ==========================================
const DEFAULT_SETTINGS = {
  systemName: "UniGuard Security Management System",
  supportEmail: "admin@uniguard.lk",
  timezone: "Asia/Colombo",
  maintenanceMode: false,
  sessionTimeout: "30",
  passwordLength: 8,
  require2fa: true,
  lockoutAttempts: "5",
  emailIncidents: true,
  smsLogins: false,
  dailySummary: true
};

const SETTINGS_STORAGE_KEY = "uniguard_admin_settings";

document.addEventListener("DOMContentLoaded", () => {
  startLiveClock();
  loadUserProfile();
  loadSettingsIntoForm(getStoredSettings());
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

// NOTE: Settings persist only in memory for this demo build (page reload resets them).
let inMemorySettings = null;

function getStoredSettings() {
  return inMemorySettings ? { ...inMemorySettings } : { ...DEFAULT_SETTINGS };
}

function loadSettingsIntoForm(settings) {
  document.getElementById("setting-system-name").value = settings.systemName;
  document.getElementById("setting-support-email").value = settings.supportEmail;
  document.getElementById("setting-timezone").value = settings.timezone;
  document.getElementById("setting-maintenance-mode").checked = settings.maintenanceMode;
  document.getElementById("setting-session-timeout").value = settings.sessionTimeout;
  document.getElementById("setting-password-length").value = settings.passwordLength;
  document.getElementById("setting-2fa").checked = settings.require2fa;
  document.getElementById("setting-lockout-attempts").value = settings.lockoutAttempts;
  document.getElementById("setting-email-incidents").checked = settings.emailIncidents;
  document.getElementById("setting-sms-logins").checked = settings.smsLogins;
  document.getElementById("setting-daily-summary").checked = settings.dailySummary;
}

function readSettingsFromForm() {
  return {
    systemName: document.getElementById("setting-system-name").value.trim(),
    supportEmail: document.getElementById("setting-support-email").value.trim(),
    timezone: document.getElementById("setting-timezone").value,
    maintenanceMode: document.getElementById("setting-maintenance-mode").checked,
    sessionTimeout: document.getElementById("setting-session-timeout").value,
    passwordLength: parseInt(document.getElementById("setting-password-length").value, 10) || 8,
    require2fa: document.getElementById("setting-2fa").checked,
    lockoutAttempts: document.getElementById("setting-lockout-attempts").value,
    emailIncidents: document.getElementById("setting-email-incidents").checked,
    smsLogins: document.getElementById("setting-sms-logins").checked,
    dailySummary: document.getElementById("setting-daily-summary").checked
  };
}

function saveSettings() {
  const settings = readSettingsFromForm();

  if (!settings.systemName) {
    showToast("System name cannot be empty.", true);
    return;
  }
  if (!settings.supportEmail.includes("@")) {
    showToast("Enter a valid support contact email.", true);
    return;
  }

  inMemorySettings = settings;
  showToast("Settings saved successfully.");
}

function restoreDefaults() {
  if (!confirm("Restore all settings to their default values? Unsaved changes will be lost.")) return;
  inMemorySettings = { ...DEFAULT_SETTINGS };
  loadSettingsIntoForm(inMemorySettings);
  showToast("Defaults restored.");
}

function showToast(message, isError = false) {
  const toast = document.getElementById("saveToast");
  const text = document.getElementById("saveToastText");
  text.textContent = message;
  toast.style.background = isError ? "#b91c1c" : "#0f172a";
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
