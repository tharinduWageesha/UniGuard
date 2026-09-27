// Visitor Approvals - search, filter, approve/reject actions
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("approvalsTableBody");

  initTableSearchFilter({
    searchInput: document.getElementById("approvalsSearch"),
    filterSelects: [document.getElementById("approvalsStatusFilter")],
    tableBody: tableBody,
    emptyStateEl: document.getElementById("approvalsEmptyState"),
  });

  tableBody?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const row = btn.closest("tr");
    const badge = row.querySelector("[data-status-cell]");
    if (btn.dataset.action === "approve") {
      row.dataset.status = "approved";
      badge.textContent = "Approved";
      badge.className = "badge badge-success";
      showToast("Visitor request approved.", "success");
    } else if (btn.dataset.action === "reject") {
      row.dataset.status = "rejected";
      badge.textContent = "Rejected";
      badge.className = "badge badge-danger";
      showToast("Visitor request rejected.", "error");
    }
    const actionsCell = row.querySelector(".row-actions");
    actionsCell.innerHTML =
      '<button class="icon-btn" title="View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg></button>';
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
