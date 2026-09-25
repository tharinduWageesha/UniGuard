// Notifications - search, filter, mark as read
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("notifList");

  initTableSearchFilter({
    searchInput: document.getElementById("notifSearch"),
    filterSelects: [document.getElementById("notifCategoryFilter")],
    tableBody: list,
    emptyStateEl: document.getElementById("notifEmptyState"),
  });

  list?.querySelectorAll("[data-mark-read]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".notif-panel-item");
      item.style.opacity = "0.5";
      btn.disabled = true;
      showToast("Notification marked as read.", "success");
    });
  });

  document.getElementById("markAllReadBtn")?.addEventListener("click", () => {
    list?.querySelectorAll(".notif-panel-item").forEach((item) => (item.style.opacity = "0.5"));
    showToast("All notifications marked as read.", "success");
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
