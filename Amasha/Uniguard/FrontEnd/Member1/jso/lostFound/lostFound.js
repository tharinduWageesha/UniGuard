/* ==========================================================
   JSO — LOST & FOUND
   Clock, icon rendering, sidebar toggle and modal open/close
   are handled globally by assets/js/common.js. This file
   renders the public feed, records lost/found items, and
   handles ownership claim review.
   ========================================================== */

let feedItems = [
  {
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    icon: "box",
    name: "Black Umbrella",
    location: "Main Library Entrance",
    type: "found",
    date: "Today, 09:15 AM"
  },
  {
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    icon: "id-badge",
    name: "Student ID Card - W.W.",
    location: "Cafeteria",
    type: "found",
    date: "Today, 11:40 AM"
  },
  {
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    icon: "warehouse",
    name: "Grey Laptop Bag",
    location: "Lecture Hall B",
    type: "lost",
    date: "Yesterday"
  },
  {
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    icon: "box",
    name: "Silver Wristwatch",
    location: "Sports Complex",
    type: "found",
    date: "2 days ago"
  },
  {
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    icon: "box",
    name: "Stainless Steel Water Bottle",
    location: "Science Lecture Theatre",
    type: "found",
    date: "3 days ago"
  },
  {
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    icon: "warehouse",
    name: "Wireless Earbuds Case",
    location: "Student Union Lounge",
    type: "lost",
    date: "3 days ago"
  }
];

let claims = [
  { item: "Black Umbrella", claimant: "R. Silva", id: "STU-24019820", notes: "Description matches: black, wooden handle.", status: "pending" },
  { item: "Silver Wristwatch", claimant: "M. Fernando", id: "STU-24020411", notes: "Claims engraved initials 'M.F.' on the back.", status: "pending" },
];

function renderFeed() {
  const grid = document.getElementById("feedGrid");
  grid.innerHTML = feedItems
    .map(
      (item) => `
      <div class="feed-card">
        <div class="feed-card-img">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" class="feed-item-image" loading="lazy">`
              : `<i class="fa-solid fa-${item.icon || "box"}"></i>`
          }
        </div>
        <div class="feed-card-body">
          <h4>${item.name}</h4>
          <p><i class="fa-solid fa-location-dot" style="margin-right:4px; opacity:0.7;"></i>${item.location}</p>
          <span class="status-pill ${item.type === "found" ? "active" : "pending"}">${item.type === "found" ? "Found" : "Lost"}</span>
        </div>
        <div class="feed-card-footer">
          <span>${item.date}</span>
          <span>Posted by K.L. Perera</span>
        </div>
      </div>`
    )
    .join("");
  document.getElementById("statFeed").innerText = feedItems.length;
  ugRenderIcons(grid);
}

function renderClaims() {
  const tbody = document.getElementById("claimsTableBody");
  tbody.innerHTML = claims
    .map(
      (c, i) => `
      <tr>
        <td>${c.item}</td>
        <td>${c.claimant}</td>
        <td>${c.id}</td>
        <td>${c.notes}</td>
        <td><span class="status-pill ${c.status}">${c.status === "pending" ? "Pending" : c.status === "approved" ? "Approved" : "Rejected"}</span></td>
        <td>
          <div class="action-btns">
            ${
              c.status === "pending"
                ? `<button class="btn-xs" onclick="reviewClaim(${i})">Review</button>`
                : `<button class="btn-xs disabled" disabled>Closed</button>`
            }
          </div>
        </td>
      </tr>`
    )
    .join("");
  document.getElementById("statClaims").innerText = claims.filter((c) => c.status === "pending").length;
}

let activeClaimIndex = null;

function reviewClaim(index) {
  activeClaimIndex = index;
  const c = claims[index];
  document.getElementById("claimItem").innerText = c.item;
  document.getElementById("claimName").innerText = c.claimant;
  document.getElementById("claimId").innerText = c.id;
  document.getElementById("claimNotes").innerText = c.notes;
  ugOpenModal("reviewClaimModal");
}

function readFileInput(inputEl) {
  return new Promise((resolve) => {
    if (inputEl && inputEl.files && inputEl.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(inputEl.files[0]);
    } else {
      resolve(null);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeed();
  renderClaims();

  document.getElementById("submitLostBtn").addEventListener("click", async () => {
    const form = document.getElementById("lostForm");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const name = document.getElementById("lostItemName").value;
    const location = document.getElementById("lostLocation").value;
    const fileInput = document.getElementById("lostPhoto");
    let image = await readFileInput(fileInput);

    if (!image) {
      image = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80";
    }

    feedItems.unshift({ image, icon: "warehouse", name, location, type: "lost", date: "Just now" });
    renderFeed();
    ugCloseModal(document.getElementById("submitLostBtn"));
    form.reset();
    alert(`Lost item recorded: "${name}". It has been posted to the Lost & Found feed.`);
  });

  document.getElementById("submitFoundBtn").addEventListener("click", async () => {
    const form = document.getElementById("foundForm");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const name = document.getElementById("foundItemName").value;
    const location = document.getElementById("foundLocation").value;
    const fileInput = document.getElementById("foundPhoto");
    let image = await readFileInput(fileInput);

    if (!image) {
      image = "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80";
    }

    feedItems.unshift({ image, icon: "box", name, location, type: "found", date: "Just now" });
    renderFeed();
    ugCloseModal(document.getElementById("submitFoundBtn"));
    form.reset();
    alert(`Found item posted: "${name}". Students and staff can now view it on the feed.`);
  });

  document.getElementById("approveClaimBtn").addEventListener("click", () => {
    if (activeClaimIndex === null) return;
    claims[activeClaimIndex].status = "approved";
    renderClaims();
    ugCloseModal(document.getElementById("approveClaimBtn"));
    alert(`Ownership verified. "${claims[activeClaimIndex].item}" has been marked as returned to ${claims[activeClaimIndex].claimant}.`);
  });

  document.getElementById("rejectClaimBtn").addEventListener("click", () => {
    if (activeClaimIndex === null) return;
    claims[activeClaimIndex].status = "rejected";
    renderClaims();
    ugCloseModal(document.getElementById("rejectClaimBtn"));
    alert(`Claim rejected for "${claims[activeClaimIndex].item}". The item remains on the feed.`);
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
