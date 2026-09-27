/* =========================================================
   UNIGUARD SECURITY MANAGEMENT SYSTEM
   Shared Base Script
   Common UI behaviour used by every page in the Visitor and
   University Management modules (mirrors the CSO module).
   ========================================================= */

/* ---------- Live date & time in the header ---------- */
function initClock() {
    updateGreeting();
  const timeEl = document.querySelector("[data-clock-time]");
  const dateEl = document.querySelector("[data-clock-date]");
  if (!timeEl && !dateEl) return;

  function tick() {
    const now = new Date();
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    }
    if (dateEl) {
      dateEl.textContent = now
        .toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase();
    }
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- Notification bell dropdown ---------- */
/*function initNotifDropdown() {
  const btn = document.querySelector("[data-notif-btn]");
  const dropdown = document.querySelector("[data-notif-dropdown]");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove("open");
    }
  });
}
*/
 /*function initNotifDropdown() {
  const btn = document.querySelector("[data-notif-btn]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.location.href = "../notifications/notifications.html";
  });
}*/

function initNotifDropdown() {
  const btn = document.querySelector("[data-notif-btn]");
  const dropdown = document.querySelector("[data-notif-dropdown]");

  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
}

/* ---------- Mobile sidebar toggle ---------- */
function initMobileSidebar() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const sidebar = document.querySelector(".sidebar");
  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      e.target !== toggle &&
      !toggle.contains(e.target)
    ) {
      sidebar.classList.remove("open");
    }
  });
}

/* ---------- Toast notifications ---------- */
function showToast(message, type = "default") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = "toast " + type;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* ---------- Generic table search + filter ----------
   Pass in the <input> for search, an array of <select> filters
   (each select's value is matched against a data-* attribute on
   the row with the same name as the select's data-filter-key),
   and the table body element containing <tr> rows.
------------------------------------------------------------ */
function initTableSearchFilter({ searchInput, filterSelects = [], tableBody, emptyStateEl }) {
  if (!tableBody) return;
  const rows = Array.from(tableBody.querySelectorAll("tr"));

  function applyFilters() {
    const term = (searchInput?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      let matchesSearch = !term || text.includes(term);

      let matchesFilters = true;
      filterSelects.forEach((select) => {
        const key = select.dataset.filterKey;
        const value = select.value;
        if (value && value !== "all") {
          const rowValue = row.dataset[key];
          if (rowValue !== value) matchesFilters = false;
        }
      });

      const show = matchesSearch && matchesFilters;
      row.style.display = show ? "" : "none";
      if (show) visibleCount++;
    });

    if (emptyStateEl) {
      emptyStateEl.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  filterSelects.forEach((select) => select.addEventListener("change", applyFilters));
}

/* ---------- Simple required / pattern form validation ---------- */
function initFormValidation(form, rules = {}) {
  if (!form) return;

  function validateField(field) {
    const group = field.closest(".form-group");
    if (!group) return true;

    let valid = true;
    if (field.hasAttribute("required") && !field.value.trim()) {
      valid = false;
    }
    if (valid && rules[field.name]) {
      valid = rules[field.name](field.value);
    }

    group.classList.toggle("invalid", !valid);
    return valid;
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let formValid = true;
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      if (!validateField(field)) formValid = false;
    });

    if (formValid) {
      showToast("Form submitted successfully.", "success");
      form.reset();
    } else {
      showToast("Please fix the highlighted fields.", "error");
    }
  });
}

/* ---------- User Profile Synchronization in Header ---------- */
async function loadUserProfileHeader() {
  function updateHeaderDOM(u) {
    if (!u) return;
    const welcomeNameEl = document.querySelector(".welcome-name");
    const userNameEl = document.querySelector(".user-name");
    const roleBadgeEl = document.querySelector(".role-badge");
    const topbarImgEls = document.querySelectorAll(".topbar-user img");

    const firstName = u.fname || u.username || "User";
    const fullName = [u.fname, u.lname].filter(Boolean).join(" ") || u.username || "User";
    const roleText = u.role || "UNIVERSITY MANAGEMENT";

    if (welcomeNameEl) welcomeNameEl.textContent = firstName;
    if (userNameEl) userNameEl.textContent = fullName;
    if (roleBadgeEl) roleBadgeEl.textContent = roleText.toUpperCase();

    const pic = u.profile_picture || (u.meta_data && u.meta_data.profile_picture);
    if (pic) {
      topbarImgEls.forEach(img => img.src = pic);
    }
  }

  // 1. Instantly render cached user details from sessionStorage
  try {
    const cached = sessionStorage.getItem("uniguard_user");
    if (cached) {
      updateHeaderDOM(JSON.parse(cached));
    }
  } catch (e) {}

  // 2. Fetch fresh user session from database via check_auth
  try {
    const res = await fetch("/Uniguard/BackEnd/index.php?action=check_auth");
    const data = await res.json();
    if (res.ok && data.authenticated && data.user) {
      sessionStorage.setItem("uniguard_user", JSON.stringify(data.user));
      updateHeaderDOM(data.user);
    }
  } catch (e) {
    console.warn("Could not fetch user session for header:", e);
  }
}

/* ---------- Logout button ---------- */
function initLogoutButton() {
  const btns = document.querySelectorAll("[data-logout], #logoutButton, .btn-logout");
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const path = decodeURIComponent(window.location.pathname);
      let targetUrl = "/Uniguard/FrontEnd/Member 2/UniversityManagement/Login/login.html";

      if (path.includes("Member 4") || path.includes("Member%204")) {
        targetUrl = "/Uniguard/FrontEnd/Member 4/login.html";
      } else if (path.includes("Member3") || path.includes("Member 3") || path.includes("Member%203")) {
        targetUrl = "/Uniguard/FrontEnd/Member3/admin/loginPage.html";
      } else if (path.includes("Member1") || path.includes("Member 1") || path.includes("Member%201")) {
        targetUrl = "/Uniguard/FrontEnd/Member1/cso/loginPage.html";
      } else if (path.includes("Visitor")) {
        targetUrl = "/Uniguard/FrontEnd/Member 2/Visitor/Login/login.html";
      }

      if (window.Auth && typeof window.Auth.logout === "function") {
        await window.Auth.logout(targetUrl);
      } else {
        try {
          await fetch("/Uniguard/BackEnd/index.php?action=logout", { method: "POST" });
        } catch (err) {}
        sessionStorage.removeItem("uniguard_user");
        sessionStorage.clear();
        window.location.href = targetUrl;
      }
    });
  });
}

/* ---------- Boot shared behaviour on every page ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initClock();
  initNotifDropdown();
  initMobileSidebar();
  initLogoutButton();
  loadUserProfileHeader();
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
