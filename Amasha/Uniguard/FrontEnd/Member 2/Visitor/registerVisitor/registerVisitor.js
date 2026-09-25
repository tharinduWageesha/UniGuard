// Visitor Registration - Real-Time Database operations
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("registerVisitorForm");

  // Pre-fill user details if logged in
  if (window.Auth) {
    let currentUser = window.Auth.getCurrentUser();
    if (!currentUser && typeof window.Auth.checkAuth === "function") {
      currentUser = await window.Auth.checkAuth();
    }
    if (currentUser) {
      const fullNameEl = document.getElementById("fullName");
      const emailEl = document.getElementById("email");
      const contactEl = document.getElementById("contact");
      const nicEl = document.getElementById("nic");

      const name = [currentUser.fname, currentUser.lname].filter(Boolean).join(" ");
      if (fullNameEl && name) fullNameEl.value = name;
      if (emailEl && currentUser.email) emailEl.value = currentUser.email;
      if (contactEl && (currentUser.phone || (currentUser.meta_data && currentUser.meta_data.phone))) {
        contactEl.value = currentUser.phone || currentUser.meta_data.phone;
      }
      if (nicEl && (currentUser.nic || (currentUser.meta_data && currentUser.meta_data.nic))) {
        nicEl.value = currentUser.nic || currentUser.meta_data.nic;
      }
    }
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = (document.getElementById("fullName")?.value || "").trim();
      const nic = (document.getElementById("nic")?.value || "").trim();
      const contact = (document.getElementById("contact")?.value || "").trim();
      const email = (document.getElementById("email")?.value || "").trim();
      const purpose = document.getElementById("purpose")?.value || "";
      const hostDept = document.getElementById("hostDept")?.value || "";
      const visitDate = document.getElementById("visitDate")?.value || "";
      const visitTime = document.getElementById("visitTime")?.value || "";
      const vehicleNo = (document.getElementById("vehicleNo")?.value || "").trim();
      const notes = (document.getElementById("notes")?.value || "").trim();

      // Form Validation
      if (!fullName || !nic || !contact || !email || !purpose || !hostDept || !visitDate || !visitTime) {
        if (typeof showToast === "function") {
          showToast("Please fill in all required fields.", "error");
        } else {
          alert("Please fill in all required fields.");
        }
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (typeof showToast === "function") showToast("Please enter a valid email address.", "error");
        return;
      }

      const payload = {
        fullName: fullName,
        nic: nic,
        contact: contact,
        email: email,
        purpose: purpose,
        hostDept: hostDept,
        visitDate: visitDate,
        visitTime: visitTime,
        vehicleNo: vehicleNo,
        notes: notes
      };

      try {
        const response = await fetch("/Uniguard/BackEnd/index.php?action=create_visitor_request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
          const successMsg = `Visitor Request Submitted! Ref: ${data.ref_no || "Success"}`;
          if (typeof showToast === "function") {
            showToast(successMsg, "success");
          } else {
            alert(successMsg);
          }
          form.reset();
        } else {
          const errorMsg = data.message || "Failed to submit visitor request.";
          if (typeof showToast === "function") {
            showToast(errorMsg, "error");
          } else {
            alert(errorMsg);
          }
        }
      } catch (err) {
        console.error("Submission error:", err);
        if (typeof showToast === "function") {
          showToast("Server connection error. Please try again.", "error");
        }
      }
    });
  }
});
