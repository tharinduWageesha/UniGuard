// Profile - real-time database data loading, tab switching + form validation & submission
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  // Tab switching setup
  const tabs = document.querySelectorAll(".profile-tab");
  const contents = document.querySelectorAll(".profile-tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const target = document.querySelector(`[data-tab-content="${tab.dataset.tab}"]`);
      if (target) target.classList.add("active");
    });
  });

  // Load live user data from backend DB
  await loadProfileData();

  // Attach form submit handlers
  setupFormSubmissions();
});

async function loadProfileData() {
  if (window.Auth && typeof window.Auth.checkAuth === "function") {
    currentUser = await window.Auth.checkAuth();
  }
  if (!currentUser) {
    try {
      const cached = sessionStorage.getItem("uniguard_user");
      if (cached) currentUser = JSON.parse(cached);
    } catch (e) {}
  }

  if (currentUser) {
    populateProfileUI(currentUser);
  }
}

function populateProfileUI(user) {
  const fullName = [user.fname, user.lname].filter(Boolean).join(" ") || user.username || "User";
  const department = user.department || (user.meta_data && user.meta_data.department) || "Registrar's Office, University of Colombo";
  const staffId = user.employee_id || (user.meta_data && user.meta_data.employee_id) || user.username || "";
  const phone = user.phone || (user.meta_data && user.meta_data.phone) || user.contact_phone || "";
  const role = user.role || "University Management";

  // Header card
  const h3El = document.querySelector(".profile-header h3");
  const pEl = document.querySelector(".profile-header p");
  const avatarEls = document.querySelectorAll(".profile-avatar-wrap img, .topbar-user img");

  if (h3El) h3El.textContent = fullName;
  if (pEl) pEl.textContent = `${role} • ${department}`;

  const pic = user.profile_picture || (user.meta_data && user.meta_data.profile_picture);
  if (pic) {
    avatarEls.forEach(img => img.src = pic);
  }

  // Personal Info Form
  const pFullName = document.getElementById("pFullName");
  const pStaffId = document.getElementById("pStaffId");
  const pEmail = document.getElementById("pEmail");
  const pContact = document.getElementById("pContact");
  const pDept = document.getElementById("pDept");

  if (pFullName) pFullName.value = fullName;
  if (pStaffId) pStaffId.value = staffId;
  if (pEmail) pEmail.value = user.email || "";
  if (pContact) pContact.value = phone;
  if (pDept) pDept.value = department;

  // Emergency Contact Form
  const eName = document.getElementById("eName");
  const eRelation = document.getElementById("eRelation");
  const ePhone = document.getElementById("ePhone");

  if (eName && user.meta_data && user.meta_data.emergency_name) eName.value = user.meta_data.emergency_name;
  if (eRelation && user.meta_data && user.meta_data.emergency_relation) eRelation.value = user.meta_data.emergency_relation;
  if (ePhone && user.meta_data && user.meta_data.emergency_phone) ePhone.value = user.meta_data.emergency_phone;
}

function setupFormSubmissions() {
  // 1. Personal Info Form Submission
  const personalForm = document.getElementById("personalInfoForm");
  if (personalForm) {
    personalForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!currentUser) {
        if (typeof showToast === "function") showToast("Session not found. Please log in.", "error");
        return;
      }

      const fullNameVal = (document.getElementById("pFullName")?.value || "").trim();
      const staffIdVal = (document.getElementById("pStaffId")?.value || "").trim();
      const emailVal = (document.getElementById("pEmail")?.value || "").trim();
      const contactVal = (document.getElementById("pContact")?.value || "").trim();
      const deptVal = (document.getElementById("pDept")?.value || "").trim();

      if (!fullNameVal || !staffIdVal || !emailVal) {
        if (typeof showToast === "function") showToast("Please fill in required fields.", "error");
        return;
      }

      const nameParts = fullNameVal.split(" ");
      const fname = nameParts[0] || "";
      const lname = nameParts.slice(1).join(" ") || "";

      const payload = {
        id: currentUser.id,
        fname: fname,
        lname: lname,
        email: emailVal,
        username: currentUser.username,
        role: currentUser.role,
        status: currentUser.status || "Active",
        meta_data: Object.assign({}, currentUser.meta_data || {}, {
          employee_id: staffIdVal,
          phone: contactVal,
          department: deptVal
        })
      };

      if (window.Auth && typeof window.Auth.updateUser === "function") {
        const result = await window.Auth.updateUser(payload);
        if (result.success) {
          if (typeof showToast === "function") showToast("Profile updated successfully!", "success");
          currentUser = await window.Auth.checkAuth();
          if (currentUser) {
            populateProfileUI(currentUser);
            if (typeof loadUserProfileHeader === "function") {
              loadUserProfileHeader();
            }
          }
        } else {
          if (typeof showToast === "function") showToast(result.message || "Failed to update profile.", "error");
        }
      }
    });
  }

  // 2. Security / Password Form Submission
  const securityForm = document.getElementById("securityForm");
  if (securityForm) {
    securityForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!currentUser) {
        if (typeof showToast === "function") showToast("Session not found. Please log in.", "error");
        return;
      }

      const currentPass = (document.getElementById("currentPassword")?.value || "").trim();
      const newPass = (document.getElementById("newPassword")?.value || "").trim();
      const confirmPass = (document.getElementById("confirmPassword")?.value || "").trim();

      if (!currentPass) {
        if (typeof showToast === "function") showToast("Current password is required.", "error");
        return;
      }
      if (newPass.length < 8) {
        if (typeof showToast === "function") showToast("New password must be at least 8 characters.", "error");
        return;
      }
      if (newPass !== confirmPass) {
        if (typeof showToast === "function") showToast("New passwords do not match.", "error");
        return;
      }

      const payload = {
        id: currentUser.id,
        fname: currentUser.fname,
        lname: currentUser.lname,
        email: currentUser.email,
        username: currentUser.username,
        role: currentUser.role,
        status: currentUser.status || "Active",
        password: newPass
      };

      if (window.Auth && typeof window.Auth.updateUser === "function") {
        const result = await window.Auth.updateUser(payload);
        if (result.success) {
          if (typeof showToast === "function") showToast("Password updated successfully!", "success");
          securityForm.reset();
        } else {
          if (typeof showToast === "function") showToast(result.message || "Failed to update password.", "error");
        }
      }
    });
  }

  // 3. Emergency Contact Form Submission
  const emergencyForm = document.getElementById("emergencyForm");
  if (emergencyForm) {
    emergencyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!currentUser) {
        if (typeof showToast === "function") showToast("Session not found. Please log in.", "error");
        return;
      }

      const eNameVal = (document.getElementById("eName")?.value || "").trim();
      const eRelationVal = document.getElementById("eRelation")?.value || "spouse";
      const ePhoneVal = (document.getElementById("ePhone")?.value || "").trim();

      if (!eNameVal || !ePhoneVal) {
        if (typeof showToast === "function") showToast("Emergency contact name and phone are required.", "error");
        return;
      }

      const payload = {
        id: currentUser.id,
        fname: currentUser.fname,
        lname: currentUser.lname,
        email: currentUser.email,
        username: currentUser.username,
        role: currentUser.role,
        status: currentUser.status || "Active",
        meta_data: Object.assign({}, currentUser.meta_data || {}, {
          emergency_name: eNameVal,
          emergency_relation: eRelationVal,
          emergency_phone: ePhoneVal
        })
      };

      if (window.Auth && typeof window.Auth.updateUser === "function") {
        const result = await window.Auth.updateUser(payload);
        if (result.success) {
          if (typeof showToast === "function") showToast("Emergency contact saved successfully!", "success");
          currentUser = await window.Auth.checkAuth();
        } else {
          if (typeof showToast === "function") showToast(result.message || "Failed to update emergency contact.", "error");
        }
      }
    });
  }
}
