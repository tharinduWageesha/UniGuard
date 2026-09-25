// ==========================================
// SHARED NOTIFICATION BELL DROPDOWN
// Click the bell icon in the topbar to open a
// small dropdown right there — no separate
// notifications page needed.
// ==========================================
(function () {
  const NOTIFS = [
    { id: 1, type: "alert", title: "Incident Update", message: "Your reported incident is now being looked into by campus security.", time: "2h ago", read: false },
    { id: 2, type: "success", title: "Vehicle Pass Approved", message: "Your vehicle pass request has been approved and is active.", time: "1d ago", read: false },
    { id: 3, type: "info", title: "Lost & Found Match", message: "A found item matching one of your reports was logged. Visit the security office to claim it.", time: "3d ago", read: true },
    { id: 4, type: "warning", title: "Security Notice", message: "Expect extra security checks near the Main Auditorium this week.", time: "5d ago", read: true }
  ];

  const ICONS = {
    info: "fa-circle-info",
    alert: "fa-triangle-exclamation",
    success: "fa-circle-check",
    warning: "fa-shield-halved"
  };

  function init() {
    updateGreeting();
    const bell = document.querySelector(".notification-icon");
    if (!bell) return;

    const panel = document.createElement("div");
    panel.className = "uniguard-notif-panel";
    panel.innerHTML =
      '<div class="uniguard-notif-head">' +
        "<span>Notifications</span>" +
        '<button type="button" class="uniguard-notif-markread">Mark all read</button>' +
      "</div>" +
      '<div class="uniguard-notif-list"></div>';
    bell.appendChild(panel);

    const list = panel.querySelector(".uniguard-notif-list");
    const badge = bell.querySelector(".badge");

    function render() {
      const unread = NOTIFS.filter((n) => !n.read).length;
      if (badge) badge.textContent = unread;

      if (!NOTIFS.length) {
        list.innerHTML = '<div class="uniguard-notif-empty"><i class="fa-regular fa-bell-slash"></i>You\'re all caught up.</div>';
        return;
      }

      list.innerHTML = NOTIFS.map((n) => (
        '<div class="uniguard-notif-item ' + (n.read ? "" : "unread") + '">' +
          '<div class="uniguard-notif-icon ' + n.type + '"><i class="fa-solid ' + (ICONS[n.type] || "fa-bell") + '"></i></div>' +
          '<div class="uniguard-notif-body">' +
            '<div class="uniguard-notif-title-row"><span>' + n.title + "</span><span class=\"uniguard-notif-time\">" + n.time + "</span></div>" +
            "<p>" + n.message + "</p>" +
          "</div>" +
          (!n.read ? '<span class="uniguard-notif-dot"></span>' : "") +
        "</div>"
      )).join("");
    }

    render();

    bell.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("open");
    });

    panel.addEventListener("click", (e) => e.stopPropagation());

    const markReadBtn = panel.querySelector(".uniguard-notif-markread");
    markReadBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      NOTIFS.forEach((n) => (n.read = true));
      render();
    });

    document.addEventListener("click", () => panel.classList.remove("open"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


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
