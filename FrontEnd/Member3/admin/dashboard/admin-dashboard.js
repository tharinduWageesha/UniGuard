// ==========================================
// UNIGUARD ADMIN DASHBOARD JS - REAL DB DATA
// ==========================================

let dbUsersData = null;
let trendsChartInstance = null;
let distChartInstance = null;

document.addEventListener("DOMContentLoaded", async () => {
  startLiveClock();
  loadUserProfile();
  await fetchDashboardDataFromDB();
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
      dateElem.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
      }).toUpperCase();
    }
  };
  updateClock();
  setInterval(updateClock, 1000);
}

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

async function fetchDashboardDataFromDB() {
  let users = null;

  try {
    if (typeof Auth !== 'undefined') {
      const result = await Auth.getUsers();
      if (result && result.success && Array.isArray(result.users)) {
        users = result.users;
      }
    }
  } catch (err) {
    console.error("Error fetching users for admin dashboard:", err);
  }

  dbUsersData = users;
  renderStats(users);
  renderActivity(users);
  renderCharts(users);
}

function renderStats(users) {
  const totalElem = document.getElementById("total-users");
  const studentStaffElem = document.getElementById("students-staff");
  const securityElem = document.getElementById("security-personnel");
  const deactivatedElem = document.getElementById("deactivated-count");

  if (!users || users.length === 0) {
    if (totalElem) totalElem.textContent = "null";
    if (studentStaffElem) studentStaffElem.textContent = "null";
    if (securityElem) securityElem.textContent = "null";
    if (deactivatedElem) deactivatedElem.textContent = "null";
    return;
  }

  const total = users.length;
  const studentsStaff = users.filter(u => {
    const r = (u.role || '').toLowerCase().trim();
    return r === 'student' || r === 'staff';
  }).length;

  const security = users.filter(u => {
    const r = (u.role || '').toLowerCase().trim();
    const isSecRole = ['security officer', 'chief security officer', 'cso', 'oic', 'jso'].includes(r);
    const isAct = (u.status || '').toLowerCase() === 'active';
    return isSecRole && isAct;
  }).length;

  const deactivated = users.filter(u => {
    return (u.status || '').toLowerCase() === 'deactivated';
  }).length;

  if (totalElem) totalElem.textContent = total;
  if (studentStaffElem) studentStaffElem.textContent = studentsStaff;
  if (securityElem) securityElem.textContent = security;
  if (deactivatedElem) deactivatedElem.textContent = deactivated;
}

function renderActivity(users) {
  const tbody = document.getElementById("recent-activity-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #94a3b8; font-weight:600;">null</td></tr>`;
    return;
  }

  // Sort users by highest ID (newest entry)
  const sortedUsers = [...users].sort((a, b) => parseInt(b.id || 0) - parseInt(a.id || 0));
  const recentUsers = sortedUsers.slice(0, 10);

  recentUsers.forEach(u => {
    const tr = document.createElement("tr");

    let formattedTime = "null";
    if (u.created_at) {
      try {
        const d = new Date(u.created_at);
        if (!isNaN(d.getTime())) {
          formattedTime = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
                          ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
      } catch (e) {}
    }

    const userName = `${u.fname || ''} ${u.lname || ''}`.trim() || u.username || 'User';
    const userDisplay = `${userName} (${u.role || 'User'})`;
    const actionText = (u.status || '').toLowerCase() === 'deactivated' ?
      `Account deactivated: ${u.username}` :
      `User account created (${u.role || 'User'})`;

    const isSuccess = (u.status || '').toLowerCase() === 'active';
    const statusClass = isSuccess ? "active" : "suspended";
    const statusText = u.status || "Active";

    tr.innerHTML = `
      <td>${formattedTime}</td>
      <td>${userDisplay}</td>
      <td>${actionText}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCharts(users) {
  // 1. Line chart - registrations trend over last 6 months
  const ctxTrendsElem = document.getElementById('trendsChart');
  if (ctxTrendsElem) {
    const ctxTrends = ctxTrendsElem.getContext('2d');

    if (trendsChartInstance) {
      trendsChartInstance.destroy();
    }

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label, yearMonth, count: 0 });
    }

    if (Array.isArray(users) && users.length > 0) {
      users.forEach(u => {
        if (u.created_at) {
          const ym = u.created_at.substring(0, 7);
          const match = months.find(m => m.yearMonth === ym);
          if (match) {
            match.count++;
          }
        }
      });
    }

    const trendLabels = months.map(m => m.label);
    const trendData = months.map(m => m.count);

    const gradient = ctxTrends.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(0, 136, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 136, 255, 0.0)');

    trendsChartInstance = new Chart(ctxTrends, {
      type: 'line',
      data: {
        labels: trendLabels,
        datasets: [{
          data: trendData,
          borderColor: '#0088ff',
          borderWidth: 3,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#0088ff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#94a3b8', precision: 0 }, grid: { color: '#f1f5f9' } },
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
        }
      }
    });
  }

  // 2. Doughnut chart - role distribution from DB
  const ctxDistElem = document.getElementById('distributionChart');
  if (ctxDistElem) {
    const ctxDist = ctxDistElem.getContext('2d');

    if (distChartInstance) {
      distChartInstance.destroy();
    }

    let studentsCount = 0;
    let staffCount = 0;
    let secCount = 0;
    let mgmtCount = 0;

    if (Array.isArray(users) && users.length > 0) {
      users.forEach(u => {
        const r = (u.role || '').toLowerCase().trim();
        if (r === 'student') {
          studentsCount++;
        } else if (r === 'staff') {
          staffCount++;
        } else if (['security officer', 'chief security officer', 'cso', 'oic', 'jso'].includes(r)) {
          secCount++;
        } else {
          mgmtCount++;
        }
      });
    }

    const distData = (!users || users.length === 0) ? [0, 0, 0, 0] : [studentsCount, staffCount, secCount, mgmtCount];

    distChartInstance = new Chart(ctxDist, {
      type: 'doughnut',
      data: {
        labels: ['Students', 'Staff', 'Security Officers', 'Management'],
        datasets: [{
          data: distData,
          backgroundColor: ['#0088ff', '#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, pointStyle: 'rect', boxWidth: 10, padding: 12, font: { size: 10, weight: '600' } }
          }
        }
      }
    });
  }
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
