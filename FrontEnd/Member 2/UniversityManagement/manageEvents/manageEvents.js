// Manage Events - Real-time Database Operations (CRUD: Create, Read, Update, Delete)
const API_URL = '/Uniguard/BackEnd/index.php';
let allEvents = [];

document.addEventListener("DOMContentLoaded", () => {
  startLiveClock();
  loadEventsFromDB();

  const eventForm = document.getElementById("eventForm");
  if (eventForm) {
    eventForm.addEventListener("submit", handleRegisterEvent);
  }

  const searchInput = document.getElementById("eventsSearch");
  if (searchInput) {
    searchInput.addEventListener("input", filterAndRenderEvents);
  }

  const statusFilter = document.getElementById("eventsStatusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", filterAndRenderEvents);
  }
});

/**
 * Fetch all events from the MySQL Database via BackEnd API
 */
async function loadEventsFromDB() {
  try {
    const response = await fetch(`${API_URL}?action=get_events`);
    const result = await response.json();

    if (response.ok && result.status === 'success' && Array.isArray(result.data)) {
      allEvents = result.data;
      filterAndRenderEvents();
    } else {
      console.error("Failed to load events:", result.message);
    }
  } catch (err) {
    console.error("Error connecting to server:", err);
  }
}

/**
 * Filter and render events in the table
 */
function filterAndRenderEvents() {
  const searchQuery = (document.getElementById("eventsSearch")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("eventsStatusFilter")?.value || "all";

  const filtered = allEvents.filter(event => {
    const nameMatch = (event.event_name || "").toLowerCase().includes(searchQuery);
    const venueMatch = (event.venue || "").toLowerCase().includes(searchQuery);
    const organizerMatch = (event.organizer || "").toLowerCase().includes(searchQuery);
    const matchesSearch = nameMatch || venueMatch || organizerMatch;

    const matchesStatus = (statusFilter === "all") || (event.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  renderEventsTable(filtered);
}

/**
 * Render dynamic event rows into table body
 */
function renderEventsTable(events) {
  const tbody = document.getElementById("eventsTableBody");
  const emptyState = document.getElementById("eventsEmptyState");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (events.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  events.forEach(evt => {
    const tr = document.createElement("tr");

    const formattedDate = formatDateDisplay(evt.event_date, evt.start_time);
    const statusClass = (evt.status || "upcoming").toLowerCase();
    const statusLabel = statusClass.charAt(0).toUpperCase() + statusClass.slice(1);

    tr.innerHTML = `
      <td>
        <div class="event-name">${escapeHtml(evt.event_name)}</div>
        <div class="event-ref">Ref: ${escapeHtml(evt.ref_no || ('EVT-' + evt.id))} | Dept: ${escapeHtml(formatOrganizer(evt.organizer))}</div>
      </td>
      <td>
        <div class="venue-location">
          <span class="location-icon">●</span> ${escapeHtml(formatVenue(evt.venue))}
        </div>
      </td>
      <td>
        <div class="scheduled-date">
          ${formattedDate}
        </div>
      </td>
      <td>
        <span class="event-status ${statusClass}">
          <span class="status-dot"></span>
          ${statusLabel}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="table-action-btn edit-btn" title="Edit Event" onclick="openEditModal(${evt.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
            </svg>
          </button>
          <button class="table-action-btn delete-btn" title="Delete Event" onclick="deleteEventFromDB(${evt.id}, '${escapeHtml(evt.event_name)}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M3 6h18"/>
              <path d="M8 6V4h8v2"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v5M14 11v5"/>
            </svg>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Handle new event registration (CREATE CRUD action)
 */
async function handleRegisterEvent(e) {
  e.preventDefault();

  const eventName = document.getElementById("eventName")?.value.trim();
  const eventOrganizer = document.getElementById("eventOrganizer")?.value;
  const eventDate = document.getElementById("eventDate")?.value;
  const startTime = document.getElementById("startTime")?.value;
  const endTime = document.getElementById("endTime")?.value;
  const eventVenue = document.getElementById("eventVenue")?.value;
  const expectedAttendees = document.getElementById("expectedAttendees")?.value;
  const eventContact = document.getElementById("eventContact")?.value.trim();
  const eventDescription = document.getElementById("eventDescription")?.value.trim();

  if (!eventName || !eventOrganizer || !eventDate || !eventVenue) {
    alert("Please fill in all required fields (Event Name, Department, Date, Venue).");
    return;
  }

  const payload = {
    eventName,
    organizer: eventOrganizer,
    eventDate,
    startTime,
    endTime,
    venue: eventVenue,
    expectedAttendees,
    contactNumber: eventContact,
    description: eventDescription
  };

  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";
  }

  try {
    const response = await fetch(`${API_URL}?action=create_event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.status === "success") {
      alert("🎉 Event successfully registered in database!");
      e.target.reset();
      await loadEventsFromDB();
    } else {
      alert(result.message || "Failed to register event.");
    }
  } catch (err) {
    console.error("Event registration error:", err);
    alert("Server connection error while registering event.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M12 5v14M5 12h14"/></svg>Register Event`;
    }
  }
}

/**
 * Open Edit Modal and pre-populate event details (UPDATE CRUD action)
 */
function openEditModal(eventId) {
  const evt = allEvents.find(e => parseInt(e.id) === parseInt(eventId));
  if (!evt) return;

  document.getElementById("editEventId").value = evt.id;
  document.getElementById("editEventName").value = evt.event_name || "";
  document.getElementById("editEventOrganizer").value = evt.organizer || "";
  document.getElementById("editEventDate").value = evt.event_date || "";
  document.getElementById("editStartTime").value = evt.start_time || "";
  document.getElementById("editEndTime").value = evt.end_time || "";
  document.getElementById("editEventVenue").value = evt.venue || "";
  document.getElementById("editExpectedAttendees").value = evt.expected_attendees || "";
  document.getElementById("editEventContact").value = evt.contact_number || "";
  document.getElementById("editEventStatus").value = evt.status || "upcoming";
  document.getElementById("editEventDescription").value = evt.description || "";

  const modal = document.getElementById("editEventModal");
  if (modal) {
    modal.classList.add("active");
  }
}

/**
 * Close Edit Modal
 */
function closeEditModal() {
  const modal = document.getElementById("editEventModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

/**
 * Handle updating an event (UPDATE CRUD action)
 */
async function handleUpdateEvent(e) {
  e.preventDefault();

  const id = document.getElementById("editEventId")?.value;
  const eventName = document.getElementById("editEventName")?.value.trim();
  const eventOrganizer = document.getElementById("editEventOrganizer")?.value;
  const eventDate = document.getElementById("editEventDate")?.value;
  const startTime = document.getElementById("editStartTime")?.value;
  const endTime = document.getElementById("editEndTime")?.value;
  const eventVenue = document.getElementById("editEventVenue")?.value;
  const expectedAttendees = document.getElementById("editExpectedAttendees")?.value;
  const eventContact = document.getElementById("editEventContact")?.value.trim();
  const eventStatus = document.getElementById("editEventStatus")?.value;
  const eventDescription = document.getElementById("editEventDescription")?.value.trim();

  if (!id || !eventName || !eventOrganizer || !eventDate || !eventVenue) {
    alert("Please fill in all required fields (Event Name, Department, Date, Venue).");
    return;
  }

  const payload = {
    id: parseInt(id),
    eventName,
    organizer: eventOrganizer,
    eventDate,
    startTime,
    endTime,
    venue: eventVenue,
    expectedAttendees,
    contactNumber: eventContact,
    status: eventStatus,
    description: eventDescription
  };

  const updateBtn = document.getElementById("updateEventBtn");
  if (updateBtn) {
    updateBtn.disabled = true;
    updateBtn.textContent = "Saving...";
  }

  try {
    const response = await fetch(`${API_URL}?action=update_event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.status === "success") {
      alert("✅ Event details updated successfully!");
      closeEditModal();
      await loadEventsFromDB();
    } else {
      alert(result.message || "Failed to update event.");
    }
  } catch (err) {
    console.error("Event update error:", err);
    alert("Server error while updating event.");
  } finally {
    if (updateBtn) {
      updateBtn.disabled = false;
      updateBtn.textContent = "Save Changes";
    }
  }
}

/**
 * Handle event deletion (DELETE CRUD action)
 */
async function deleteEventFromDB(eventId, eventTitle) {
  if (!confirm(`Are you sure you want to permanently delete event "${eventTitle}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}?action=delete_event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: eventId })
    });

    const result = await response.json();

    if (response.ok && result.status === "success") {
      alert("Event deleted successfully from database.");
      await loadEventsFromDB();
    } else {
      alert(result.message || "Failed to delete event.");
    }
  } catch (err) {
    console.error("Delete event error:", err);
    alert("Server error while deleting event.");
  }
}

/**
 * Display Event details modal / alert
 */
function viewEventDetails(eventId) {
  const evt = allEvents.find(e => parseInt(e.id) === parseInt(eventId));
  if (!evt) return;

  alert(`📅 EVENT DETAILS\n\nName: ${evt.event_name}\nRef: ${evt.ref_no || ('EVT-' + evt.id)}\nOrganizer: ${evt.organizer}\nVenue: ${evt.venue}\nDate: ${evt.event_date}\nTime: ${evt.start_time || 'N/A'} to ${evt.end_time || 'N/A'}\nExpected Attendees: ${evt.expected_attendees || 'N/A'}\nContact: ${evt.contact_number || 'N/A'}\nStatus: ${(evt.status || 'upcoming').toUpperCase()}\nDescription: ${evt.description || 'None'}`);
}

// Format helpers
function formatDateDisplay(dateStr, timeStr) {
  if (!dateStr) return "--";
  const dateObj = new Date(dateStr);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  let formattedTime = "";
  if (timeStr) {
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    formattedTime = `, ${String(hour).padStart(2, '0')}:${m} ${ampm}`;
  }
  return `${formattedDate}${formattedTime}`;
}

function formatOrganizer(val) {
  if (!val) return 'University Admin';
  const map = {
    'ucsc': 'UCSC',
    'fos-chemistry': 'FOS Chemistry',
    'fos-physical': 'FOS Physical',
    'stat-department': 'Stat Department',
    'arts-block': 'Arts Block',
    'management-faculty': 'Management Faculty',
    'foe': 'FOE',
    'help-zone': 'Help Zone',
    'faculty-of-technology': 'Faculty of Technology',
    'law-faculty': 'Law Faculty'
  };
  return map[val] || val;
}

function formatVenue(val) {
  if (!val) return 'Campus Premises';
  const map = {
    'auditorium': 'UCSC Auditorium',
    'grounds': 'University Grounds',
    'main-campus': 'Main Campus',
    'arts-block': 'Arts Block'
  };
  return map[val] || val;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function startLiveClock() {
  updateGreeting();
  const updateClock = () => {
    updateGreeting();
    const now = new Date();
    const timeElem = document.querySelector("[data-clock-time]");
    const dateElem = document.querySelector("[data-clock-date]");
    if (timeElem && dateElem) {
      timeElem.textContent = now.toLocaleTimeString('en-US', { hour12: true });
      dateElem.textContent = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    }
  };
  updateClock();
  setInterval(updateClock, 1000);
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
