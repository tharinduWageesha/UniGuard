// Reports - generate form + search/filter + download
document.addEventListener("DOMContentLoaded", () => {
  initFormValidation(document.getElementById("reportForm"));

  initTableSearchFilter({
    searchInput: document.getElementById("reportsSearch"),
    filterSelects: [document.getElementById("reportsCategoryFilter")],
    tableBody: document.getElementById("reportsTableBody"),
    emptyStateEl: document.getElementById("reportsEmptyState"),
  });

  document.getElementById("reportsTableBody")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".icon-btn");
    if (btn && !btn.disabled) showToast("Report download started.", "success");
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
