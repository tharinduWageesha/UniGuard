// ==========================================
// INITIAL SAMPLE DATA (MY REPORTS)
// ==========================================
let lfData = [
  { id: 1, item: "Black Leather Wallet", category: "Bags & Wallets", type: "Lost", date: "2026-07-18", status: "Pending", location: "Faculty of Science Canteen", description: "Contains student ID and a few cards.", photo: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80" },
  { id: 2, item: "Casio Scientific Calculator", category: "Electronics", type: "Found", date: "2026-07-15", status: "Matched", location: "Exam Hall 2", description: "Fx-991 model, name tag partially worn off.", photo: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=500&q=80" },
  { id: 3, item: "University ID Card", category: "Documents / ID Cards", type: "Lost", date: "2026-07-10", status: "Claimed", location: "UCSC Main Gate", description: "Lost near the security checkpoint.", photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80" }
];;

// ==========================================
// PUBLIC CAMPUS FEED DATA
// ==========================================
const feedData = [
  {
    id: 1,
    title: "Black Umbrella",
    location: "Main Library Entrance",
    type: "Found",
    time: "Today, 09:15 AM",
    author: "JSO K.L. Perera",
    icon: "fa-solid fa-box",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=500&q=80",
    claimed: false
  },
  {
    id: 2,
    title: "Student ID Card - W.W.",
    location: "Cafeteria",
    type: "Found",
    time: "Today, 11:40 AM",
    author: "JSO K.L. Perera",
    icon: "fa-solid fa-id-card",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80",
    claimed: false
  },
  {
    id: 3,
    title: "Grey Laptop Bag",
    location: "Lecture Hall B",
    type: "Lost",
    time: "Yesterday",
    author: "JSO K.L. Perera",
    icon: "fa-solid fa-building-columns",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
    claimed: false
  },
  {
    id: 4,
    title: "Silver Wristwatch",
    location: "Sports Complex",
    type: "Found",
    time: "2 days ago",
    author: "JSO K.L. Perera",
    icon: "fa-solid fa-box",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
    claimed: false
  }
];

let currentFeedFilter = "all";
let currentPhotoDataUrl = null;

document.addEventListener("DOMContentLoaded", () => {
  startLiveClock();
  renderTable();
  updateMetrics();
  renderPublicFeed();
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
      dateElem.textContent = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };
  updateClock();
  setInterval(updateClock, 1000);
}

// ==========================================
// MY REPORTS TABLE
// ==========================================
function renderTable(dataToRender = lfData) {
  const tbody = document.getElementById("lf-table-body");
  tbody.innerHTML = "";

  if (dataToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #94a3b8;">No reports submitted yet.</td></tr>`;
    return;
  }

  dataToRender.forEach((entry) => {
    const statusClass = entry.status.toLowerCase();
    const tr = document.createElement("tr");
    tr.setAttribute("onclick", `viewReportDetails(${entry.id})`);
    tr.innerHTML = `
      <td class="officer-name">${escapeHTML(entry.item)}${entry.photo ? '<i class="fa-solid fa-camera row-photo-tag" title="Photo attached"></i>' : ''}</td>
      <td>${escapeHTML(entry.category)}</td>
      <td>${escapeHTML(entry.type)}</td>
      <td>${escapeHTML(entry.date)}</td>
      <td><span class="status-badge ${statusClass}">${escapeHTML(entry.status)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function updateMetrics() {
  document.getElementById("total-reports").textContent = lfData.length;
  document.getElementById("pending-reports").textContent = lfData.filter(e => e.status === "Pending").length;
  document.getElementById("claimed-reports").textContent = lfData.filter(e => e.status === "Claimed").length;
}

function filterTable() {
  const query = document.getElementById("lf-search-input").value.toLowerCase();
  const filtered = lfData.filter(e =>
    e.item.toLowerCase().includes(query) ||
    e.category.toLowerCase().includes(query)
  );
  renderTable(filtered);
}

// ==========================================
// MODAL HELPERS
// ==========================================
function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// ==========================================
// REPORT LOST / FOUND ITEM
// ==========================================
function openReportModal(type) {
  document.getElementById("report-type").value = type;
  document.getElementById("reportForm").reset();
  document.getElementById("report-type").value = type;
  resetPhotoPicker();

  if (type === "lost") {
    document.getElementById("reportModalTitle").innerHTML = '<i class="fa-solid fa-box-open"></i> Report Lost Item';
    document.getElementById("location-label").textContent = "Last Seen Location";
    document.getElementById("location-date-label").textContent = "Date Lost";
    document.getElementById("reportSubmitBtn").textContent = "Submit Lost Report";
  } else {
    document.getElementById("reportModalTitle").innerHTML = '<i class="fa-solid fa-hand-holding"></i> Report Found Item';
    document.getElementById("location-label").textContent = "Location Found";
    document.getElementById("location-date-label").textContent = "Date Found";
    document.getElementById("reportSubmitBtn").textContent = "Submit Found Report";
  }

  openModal("reportModal");
}

function handlePhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    currentPhotoDataUrl = e.target.result;
    const box = document.getElementById("photo-preview-box");
    box.innerHTML = `<img src="${currentPhotoDataUrl}" alt="Selected item photo">`;
  };
  reader.readAsDataURL(file);
}

function resetPhotoPicker() {
  currentPhotoDataUrl = null;
  const box = document.getElementById("photo-preview-box");
  if (box) box.innerHTML = '<i class="fa-solid fa-image"></i>';
}

function handleReportSubmit(event) {
  event.preventDefault();
  const type = document.getElementById("report-type").value;
  const name = document.getElementById("item-name").value;
  const category = document.getElementById("item-category").value;
  const date = document.getElementById("item-date").value;
  const location = document.getElementById("item-location").value;
  const description = document.getElementById("item-description").value;

  const newId = lfData.length > 0 ? Math.max(...lfData.map(e => e.id)) + 1 : 1;
  lfData.unshift({
    id: newId,
    item: name,
    category: category,
    type: type === "lost" ? "Lost" : "Found",
    date: date || new Date().toISOString().split("T")[0],
    status: "Pending",
    location: location,
    description: description,
    photo: currentPhotoDataUrl
  });

  renderTable();
  updateMetrics();
  closeModal("reportModal");
  resetPhotoPicker();
  alert(`Your ${type} item report has been submitted successfully.`);
}

// ==========================================
// REPORT DETAILS / WITHDRAW
// ==========================================
function viewReportDetails(id) {
  const entry = lfData.find(e => e.id === id);
  if (!entry) return;

  const body = document.getElementById("details-modal-body");
  const statusClass = entry.status.toLowerCase();

  body.innerHTML = `
    ${entry.photo ? `<img src="${entry.photo}" alt="${escapeHTML(entry.item)}" class="details-photo">` : ''}
    <div class="details-grid">
      <div class="details-field"><span>Item</span><p>${escapeHTML(entry.item)}</p></div>
      <div class="details-field"><span>Category</span><p>${escapeHTML(entry.category)}</p></div>
      <div class="details-field"><span>Type</span><p>${escapeHTML(entry.type)}</p></div>
      <div class="details-field"><span>Date</span><p>${escapeHTML(entry.date)}</p></div>
      <div class="details-field"><span>Location</span><p>${escapeHTML(entry.location || 'Not specified')}</p></div>
      <div class="details-field"><span>Status</span><p><span class="status-badge ${statusClass}">${escapeHTML(entry.status)}</span></p></div>
    </div>
    <div class="details-field" style="margin-bottom: 1rem;">
      <span>Description</span>
      <p>${escapeHTML(entry.description || 'No description provided.')}</p>
    </div>
    <div class="modal-footer">
      ${entry.status === "Pending" ? `<button type="button" class="btn-secondary" onclick="withdrawReport(${entry.id})"><i class="fa-solid fa-trash"></i> Withdraw Report</button>` : ''}
      <button type="button" class="btn-primary" onclick="closeModal('detailsModal')">Close</button>
    </div>
  `;

  openModal("detailsModal");
}

function withdrawReport(id) {
  if (!confirm("Withdraw this report? This cannot be undone.")) return;
  lfData = lfData.filter(e => e.id !== id);
  renderTable();
  updateMetrics();
  closeModal("detailsModal");
}

// ==========================================
// PUBLIC FEED
// ==========================================
function renderPublicFeed() {
  const container = document.getElementById("public-feed-grid");
  if (!container) return;

  const items = currentFeedFilter === "all"
    ? feedData
    : feedData.filter(i => i.type.toLowerCase() === currentFeedFilter);

  if (!items.length) {
    container.innerHTML = `<p style="color:#94a3b8; font-size:0.85rem; grid-column: 1 / -1;">No items match this filter.</p>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const isFound = item.type.toLowerCase() === "found";
    const badgeClass = isFound ? "feed-badge-found" : "feed-badge-lost";

    return `
      <div class="feed-item-card" data-id="${item.id}">
        <div class="feed-item-banner">
          ${item.image ? `<img src="${item.image}" alt="${escapeHTML(item.title)}" class="feed-photo">` : `<i class="${item.icon}"></i>`}
        </div>
        <div class="feed-item-body">
          <h4 class="feed-item-title">${escapeHTML(item.title)}</h4>
          <p class="feed-item-location">${escapeHTML(item.location)}</p>
          <span class="feed-type-badge ${badgeClass}">${escapeHTML(item.type)}</span>
          <button type="button" class="btn-claim ${item.claimed ? 'claimed' : ''}" onclick="claimFeedItem(${item.id})" ${item.claimed ? 'disabled' : ''}>
            <i class="fa-solid ${item.claimed ? 'fa-check' : 'fa-hand'}"></i> ${item.claimed ? 'Claim Submitted' : (isFound ? 'This Is Mine' : 'I Found This')}
          </button>
        </div>
        <div class="feed-item-footer">
          <span>${escapeHTML(item.time)}</span>
          <span>Posted by ${escapeHTML(item.author)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function setFeedFilter(filter) {
  currentFeedFilter = filter;
  document.querySelectorAll("#feed-filter-chips .chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.filter === filter);
  });
  renderPublicFeed();
}

function claimFeedItem(id) {
  const item = feedData.find(i => i.id === id);
  if (!item || item.claimed) return;
  item.claimed = true;
  renderPublicFeed();
  alert(`Your claim for "${item.title}" has been submitted to campus security for verification.`);
}

// ==========================================
// XSS Utility Helper
// ==========================================
function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
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
