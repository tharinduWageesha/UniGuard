/* ==========================================================
   UNIGUARD SHARED SCRIPT
   Used by every role (CSO / OIC / JSO). Pure vanilla JS —
   no external libraries. Provides:
     1. Icon renderer  (replaces <i class="fa-solid fa-x">
        with an inline SVG so the project needs no icon-font
        CDN at all)
     2. Live clock
     3. Mobile sidebar toggle
     4. Generic modal open/close helpers
     5. Logout confirmation
   ========================================================== */

/* ----------------------------------------------------------
   1. ICON LIBRARY
   Minimal hand-drawn line-icon set (24x24, stroke based) so
   pages that used Font Awesome classes keep working with zero
   markup changes — just swap the CDN link for this script.
   ---------------------------------------------------------- */
const UG_ICONS = {
  "shield-halved": '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  "shield": '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/>',
  "shield-cat": '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><circle cx="9.5" cy="11" r="0.8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="11" r="0.8" fill="currentColor" stroke="none"/>',
  "file-shield": '<path d="M6 2h9l4 4v16H6z"/><path d="M12 9l3 1.2v2.3c0 2-1.3 3.3-3 3.9-1.7-.6-3-1.9-3-3.9v-2.3L12 9z"/>',
  "power-off": '<path d="M12 3v9"/><path d="M6.5 6.5a8 8 0 1 0 11 0"/>',
  "gear": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  "magnifying-glass": '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  "magnifying-glass-check": '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8.5 11l1.7 1.7L14 9"/>',
  "bell": '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  "chart-line": '<path d="M4 19h16"/><path d="M4 19V5"/><path d="M4 15l4-5 3 3 6-8"/>',
  "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "clock-rotate-left": '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/>',
  "users": '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17.5" cy="9" r="2.6"/><path d="M15.7 13.8c2.6.5 4.8 2.8 4.8 6.2"/>',
  "user-plus": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><path d="M19 8v6M16 11h6"/>',
  "user-shield": '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><path d="M18 3l3.3 1.4v2.7c0 2-1.3 3.4-3.3 4-2-.6-3.3-2-3.3-4V4.4L18 3z"/>',
  "id-card": '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16c0-1.5 1.1-2.5 2.5-2.5s2.5 1 2.5 2.5"/><path d="M14 10h5M14 13h5M14 16h3"/>',
  "address-card": '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16c0-1.5 1.1-2.5 2.5-2.5s2.5 1 2.5 2.5"/><path d="M14 10h5M14 13h5M14 16h3"/>',
  "building-user": '<path d="M4 21V4h10v17"/><path d="M14 8h6v13"/><path d="M7 8h1M7 12h1M7 16h1"/><circle cx="17.5" cy="12.5" r="1.3"/><path d="M15.8 16c.2-1 .8-1.5 1.7-1.5s1.5.5 1.7 1.5"/>',
  "car": '<path d="M3.5 16.5l1.4-5A2 2 0 0 1 6.8 10h10.4a2 2 0 0 1 1.9 1.5l1.4 5"/><rect x="2.5" y="16.5" width="19" height="4" rx="1.2"/><circle cx="7" cy="18.5" r="1"/><circle cx="17" cy="18.5" r="1"/>',
  "car-side": '<path d="M2.5 16l1.2-4.4A2.4 2.4 0 0 1 6 10h9.2a2.4 2.4 0 0 1 2.1 1.3l2.2 4.2"/><rect x="1.5" y="16" width="21" height="3.5" rx="1"/><circle cx="6.5" cy="19.5" r="1.3"/><circle cx="17.5" cy="19.5" r="1.3"/><path d="M6 10l1.2-2.6A2 2 0 0 1 9 6.3h4.3a2 2 0 0 1 1.8 1.1L16.5 10"/>',
  "barcode": '<path d="M3 4v16M7 4v16M10 4v16M13 4v16M15.5 4v16M19 4v16M21 4v16"/>',
  "qrcode": '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z"/>',
  "camera": '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.3"/>',
  "gate": '<path d="M3 21V6l4-2v17M17 21V6l4-2v17M7 4l5-2 5 2"/><path d="M3 12h4M13 12h4M9 8v13M15 8v13"/>',
  "eye": '<path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/>',
  "download": '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/>',
  "file-export": '<path d="M6 2h9l4 4v16H6z"/><path d="M9 15h5M11.2 13l1.8 2-1.8 2"/>',
  "file-invoice": '<path d="M6 2h9l4 4v16H6z"/><path d="M9 11h6M9 14h6M9 17h4"/>',
  "file-pdf": '<path d="M6 2h9l4 4v16H6z"/><path d="M9 14h1.2a1.3 1.3 0 0 0 0-2.6H9zM13 14v-2.6h1.6M13 12.8h1.3M17.5 11.4V14M16.5 12.6h2"/>',
  "file-circle-plus": '<path d="M6 2h8l4 4v6.2"/><path d="M18 16v5M15.5 18.5h5"/>',
  "cloud-arrow-up": '<path d="M7 18a4.5 4.5 0 0 1-.5-9 5.5 5.5 0 0 1 10.7-1.7A4 4 0 0 1 17 18H7z"/><path d="M12 10v7M9.3 12.7L12 10l2.7 2.7"/>',
  "paper-plane": '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  "reply": '<path d="M9 14l-5-5 5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v3"/>',
  "rotate-left": '<path d="M3 12a9 9 0 1 0 2.6-6.3"/><path d="M3 4v5h5"/>',
  "check": '<path d="M4 12l6 6L20 6"/>',
  "check-double": '<path d="M2 12l5 5L18 6"/><path d="M9 17l2 2L22 8"/>',
  "circle-check": '<circle cx="12" cy="12" r="9.3"/><path d="M8 12.2l2.7 2.7L16 9.3"/>',
  "circle-exclamation": '<circle cx="12" cy="12" r="9.3"/><path d="M12 7.5v6"/><circle cx="12" cy="16.7" r="0.2" fill="currentColor" stroke="none"/>',
  "triangle-exclamation": '<path d="M12 3.5L22 20H2L12 3.5z"/><path d="M12 10v4.2"/><circle cx="12" cy="17.2" r="0.2" fill="currentColor" stroke="none"/>',
  "xmark": '<path d="M5 5l14 14M19 5L5 19"/>',
  "plus-circle": '<circle cx="12" cy="12" r="9.3"/><path d="M12 8v8M8 12h8"/>',
  "plus": '<path d="M12 5v14M5 12h14"/>',
  "trash": '<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  "spinner": '<path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  "tasks": '<rect x="3" y="4.5" width="4" height="4"/><path d="M9.5 6.5h11"/><rect x="3" y="14.5" width="4" height="4"/><path d="M9.5 16.5h11"/>',
  "list-check": '<path d="M4 6.5l1.5 1.5L8 5.5"/><path d="M11 6.5h9"/><path d="M4 12.5l1.5 1.5 2.5-2.5"/><path d="M11 12.5h9"/><path d="M4 18.5l1.5 1.5 2.5-2.5"/><path d="M11 18.5h9"/>',
  "hourglass-half": '<path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 4 6 5 8-1 2-5 3-5 8M17 3c0 5-4 6-5 8 1 2 5 3 5 8"/>',
  "calendar-check": '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M8.5 14l2 2 4-4"/>',
  "calendar-plus": '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M12 12.5v6M9 15.5h6"/>',
  "lightbulb": '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.1.9 1.9V16h5.2v-.2c0-.8.4-1.4.9-1.9A6 6 0 0 0 12 3z"/>',
  "comment-dots": '<path d="M4 5h16v11H8l-4 4z"/><circle cx="8.5" cy="10.5" r="0.2" fill="currentColor" stroke="none"/><circle cx="12" cy="10.5" r="0.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10.5" r="0.2" fill="currentColor" stroke="none"/>',
  "id-badge": '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="9" r="2.3"/><path d="M8.5 16c0-1.7 1.4-3 3.5-3s3.5 1.3 3.5 3"/>',
  "box": '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
  "boxes-stacked": '<path d="M3 13l5-2.2 5 2.2-5 2.2-5-2.2z"/><path d="M3 13v5l5 2.2 5-2.2v-5"/><path d="M13 8l4-1.8 4 1.8-4 1.8-4-1.8z"/><path d="M13 8v4.5l4 1.8 4-1.8V8"/>',
  "warehouse": '<path d="M3 21V10l9-5 9 5v11"/><path d="M7 21v-7h10v7"/>',
  "bullhorn": '<path d="M3 11v2a2 2 0 0 0 2 2h1l2 5 2-1-1.6-4H9l10 3V6L9 9H5a2 2 0 0 0-2 2z"/>',
  "filter": '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
  "arrow-right-arrow-left": '<path d="M3 8h14M13 4l4 4-4 4"/><path d="M21 16H7M11 12l-4 4 4 4"/>',
  "clipboard-check": '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4"/><path d="M9 13l2 2 4-4"/>',
  "image": '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M5 18l5-5 3 3 3-4 3 6"/>',
  "location-dot": '<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/>',
  "phone": '<path d="M5 4h4l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2L20 15v4a1.5 1.5 0 0 1-1.6 1.5A15 15 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>'
};

function ugSvgIcon(name, extraClass) {
  const body = UG_ICONS[name];
  if (!body) return null;
  return `<svg class="icon-svg ${extraClass || ""}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}

function ugRenderIcons(root) {
  const scope = root || document;
  const nodes = scope.querySelectorAll('i[class*="fa-"]');
  nodes.forEach((node) => {
    const classes = node.className.split(/\s+/).filter(Boolean);
    // last class that isn't a style keyword is usually the icon name
    const skip = new Set(["fa-solid", "fa-regular", "fa-brands", "fa-spin", "fa-fw"]);
    const nameClass = classes.find((c) => c.startsWith("fa-") && !skip.has(c));
    if (!nameClass) return;
    const name = nameClass.replace("fa-", "");
    const svg = ugSvgIcon(name);
    if (!svg) return;
    const spinning = classes.includes("fa-spin") ? " ug-spin" : "";
    const wrapper = document.createElement("span");
    wrapper.innerHTML = svg;
    const svgEl = wrapper.firstElementChild;
    svgEl.classList.add(...classes.filter((c) => !c.startsWith("fa-")));
    if (spinning) svgEl.classList.add("ug-spin");
    node.replaceWith(svgEl);
  });
}

/* small spin keyframes for spinner icons, injected once */
(function injectSpinStyle() {
  if (document.getElementById("ug-spin-style")) return;
  const style = document.createElement("style");
  style.id = "ug-spin-style";
  style.textContent = "@keyframes ug-spin{to{transform:rotate(360deg)}}.ug-spin{animation:ug-spin 1s linear infinite;}";
  document.head.appendChild(style);
})();

/* ----------------------------------------------------------
   2. LIVE CLOCK
   Any page with #current-time / #current-date elements gets
   an automatically updating clock.
   ---------------------------------------------------------- */
function ugStartClock() {
  const timeEl = document.getElementById("current-time");
  const dateEl = document.getElementById("current-date");
  if (!timeEl && !dateEl) return;

  function tick() {
    const now = new Date();
    if (timeEl) timeEl.innerText = now.toLocaleTimeString("en-US", { hour12: true });
    if (dateEl) {
      const options = { weekday: "long", day: "2-digit", month: "short", year: "numeric" };
      dateEl.innerText = now.toLocaleDateString("en-US", options).toUpperCase();
    }
  }
  tick();
  setInterval(tick, 1000);
}

/* ----------------------------------------------------------
   3. MOBILE SIDEBAR TOGGLE
   Works automatically if the page markup has .sidebar inside
   .dashboard-container. No markup changes required beyond an
   optional button with [data-menu-toggle].
   ---------------------------------------------------------- */
function ugInitSidebarToggle() {
  const sidebar = document.querySelector(".sidebar");
  const container = document.querySelector(".dashboard-container");
  if (!sidebar || !container) return;

  let overlay = document.querySelector(".sidebar-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    container.appendChild(overlay);
  }

  let toggleBtn = document.querySelector("[data-menu-toggle]");
  if (!toggleBtn) {
    const topbar = document.querySelector(".topbar");
    if (topbar) {
      toggleBtn = document.createElement("button");
      toggleBtn.className = "menu-toggle";
      toggleBtn.setAttribute("data-menu-toggle", "");
      toggleBtn.setAttribute("aria-label", "Toggle menu");
      toggleBtn.innerHTML = ugSvgIcon("tasks") || "☰";
      topbar.prepend(toggleBtn);
    }
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("active");
    });
  }
  overlay.addEventListener("click", closeSidebar);
}

/* ----------------------------------------------------------
   4. MODAL HELPERS
   Any element with [data-open-modal="modalId"] opens
   #modalId (must have class="modal-overlay"). Any element
   with [data-close-modal] closes its nearest modal-overlay.
   ---------------------------------------------------------- */
function ugOpenModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}

function ugCloseModal(el) {
  const modal = el.closest ? el.closest(".modal-overlay") : null;
  if (modal) modal.classList.remove("active");
}

function ugInitModals() {
  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => ugOpenModal(btn.getAttribute("data-open-modal")));
  });
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", (e) => ugCloseModal(e.currentTarget));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("active");
    });
  });
}

/* ----------------------------------------------------------
   5. LOGOUT CONFIRMATION
   Any element with .btn-logout confirms, then returns to the
   shared login page.
   ---------------------------------------------------------- */
function ugInitLogout() {
  document.querySelectorAll(".btn-logout").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to log out?")) {
        let targetUrl = btn.getAttribute("data-href") || btn.getAttribute("href");
        if (!targetUrl || targetUrl === "#" || targetUrl.startsWith("javascript:")) {
          const path = window.location.pathname.replace(/\\/g, "/");
          if (path.includes("/jso/")) {
            targetUrl = (path.endsWith("/jso/myprofile.html") || path.endsWith("/jso/")) ? "loginPage.html" : "../loginPage.html";
          } else if (path.includes("/cso/")) {
            targetUrl = (path.endsWith("/cso/myprofile.html") || path.endsWith("/cso/")) ? "loginPage.html" : "../loginPage.html";
          } else if (path.includes("/oic/")) {
            targetUrl = (path.endsWith("/oic/myprofile.html") || path.endsWith("/oic/")) ? "loginPage.html" : "../loginPage.html";
          } else {
            targetUrl = "../loginPage.html";
          }
        }

        if (typeof Auth !== "undefined" && Auth.logout) {
          await Auth.logout();
        } else {
          sessionStorage.removeItem("uniguard_user");
          window.location.href = targetUrl;
        }
      }
    });
  });
}

/* ----------------------------------------------------------
   BOOTSTRAP — runs on every page that includes common.js
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  ugRenderIcons(document);
  ugStartClock();
  ugInitSidebarToggle();
  ugInitModals();
  ugInitLogout();
  ugSyncUserDataWithDB();
});

/* ----------------------------------------------------------
   REAL-TIME USER & PROFILE DB SYNCHRONIZER
   ---------------------------------------------------------- */
async function ugSyncUserDataWithDB() {
  let cachedUser = null;
  try {
    const raw = sessionStorage.getItem("uniguard_user") || localStorage.getItem("uniguard_user");
    if (raw) cachedUser = JSON.parse(raw);
  } catch (e) {}

  if (cachedUser) {
    ugApplyUserDataToDOM(cachedUser);
  }

  try {
    const res = await fetch('/Uniguard/BackEnd/index.php?action=check_auth');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.user) {
        sessionStorage.setItem("uniguard_user", JSON.stringify(data.user));
        localStorage.setItem("uniguard_user", JSON.stringify(data.user));
        ugApplyUserDataToDOM(data.user);
        return;
      }
    }
  } catch (err) {
    console.warn("UniGuard DB User Sync check_auth error:", err);
  }

  // Fallback: If no session user exists, fetch active DB user for role so sample UI text is never shown
  if (!cachedUser) {
    try {
      const pathStr = window.location.pathname.toLowerCase();
      let targetRole = 'OIC';
      if (pathStr.includes('/jso/')) targetRole = 'JSO';
      else if (pathStr.includes('/cso/')) targetRole = 'CSO';

      const uRes = await fetch(`/Uniguard/BackEnd/index.php?action=get_users&role=${targetRole}`);
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.status === 'success' && Array.isArray(uData.data) && uData.data.length > 0) {
          const defaultUser = uData.data[0];
          sessionStorage.setItem("uniguard_user", JSON.stringify(defaultUser));
          ugApplyUserDataToDOM(defaultUser);
        }
      }
    } catch (fallbackErr) {
      console.warn("UniGuard DB User Sync fallback error:", fallbackErr);
    }
  }
}

function ugApplyUserDataToDOM(user) {
  if (!user) return;

  const fname = user.fname || '';
  const lname = user.lname || '';
  const fullName = `${fname} ${lname}`.trim() || user.username || 'User';
  const role = user.role || 'User';
  const meta = user.meta_data || {};
  const sector = user.assigned_sector || meta.assigned_sector || meta.department || '';
  const badge = user.badge_id || meta.badge_id || meta.badge || (`ID-${user.id}`);
  const phone = user.phone || meta.phone || meta.contact_phone || '';
  const shift = user.shift_schedule || meta.shift_schedule || 'Day Shift (06:00 AM - 06:00 PM)';
  const cso = user.reporting_cso || meta.reporting_cso || 'Susantha De Silva (CSO)';
  const created = user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Active';
  const initials = ((fname[0] || '') + (lname[0] || '')).toUpperCase() || 'UG';

  // 1. Welcome Greeting Name
  const welcomeNameElems = document.querySelectorAll(".welcome-name");
  welcomeNameElems.forEach(el => {
    el.textContent = fname || fullName;
  });

  // 2. User Profile Full Name
  const userNameElems = document.querySelectorAll(".user-name");
  userNameElems.forEach(el => {
    el.textContent = fullName;
  });

  // 3. User Role & Subtitle
  const userRoleElems = document.querySelectorAll(".user-role");
  userRoleElems.forEach(el => {
    const roleUpper = role.toUpperCase();
    if (roleUpper === 'OIC') {
      el.textContent = sector ? `OIC - ${sector.toUpperCase()}` : 'OFFICER IN CHARGE';
    } else if (roleUpper === 'JSO') {
      el.textContent = sector ? `JSO - ${sector.toUpperCase()}` : `JSO (${badge})`;
    } else if (roleUpper === 'CSO') {
      el.textContent = 'CHIEF SECURITY OFFICER';
    } else {
      el.textContent = roleUpper;
    }
  });

  // 4. Avatar Images / SVGs
  const avatars = document.querySelectorAll(".user-profile img.avatar, img.avatar, .avatar-img");
  avatars.forEach(img => {
    if (user.profile_picture && user.profile_picture.trim() !== '') {
      img.src = user.profile_picture;
    } else {
      const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#0088ff"/><text x="50%" y="55%" font-family="Inter, sans-serif" font-size="38" font-weight="800" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`;
      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svgData)}`;
    }
  });

  // 5. My Profile Page Inputs (if present)
  const fnInput = document.getElementById('prof-fullname');
  if (fnInput) fnInput.value = fullName;

  const cardNameElem = document.getElementById('prof-card-name');
  if (cardNameElem) cardNameElem.textContent = fullName;

  const cardIdElem = document.getElementById('prof-card-id');
  if (cardIdElem) cardIdElem.textContent = `ID: ${badge}`;

  const badgeInput = document.getElementById('prof-service-id');
  if (badgeInput) badgeInput.value = badge;

  const emailInput = document.getElementById('prof-email');
  if (emailInput) emailInput.value = user.email || '';

  const phoneInput = document.getElementById('prof-phone');
  if (phoneInput && phone) phoneInput.value = phone;

  const sectorInput = document.getElementById('prof-sector');
  if (sectorInput && sector) sectorInput.value = sector;

  const shiftInput = document.getElementById('prof-shift');
  if (shiftInput && shift) shiftInput.value = shift;

  const csoInput = document.getElementById('prof-cso');
  if (csoInput && cso) csoInput.value = cso;

  const createdInput = document.getElementById('prof-created');
  if (createdInput && created) createdInput.value = created;

  const avatarBox = document.getElementById('prof-avatar');
  if (avatarBox) {
    if (user.profile_picture && user.profile_picture.trim() !== '') {
      avatarBox.innerHTML = `<img src="${user.profile_picture}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      avatarBox.textContent = initials;
    }
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
