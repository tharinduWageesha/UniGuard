// ==========================================
// PROFILE - PERSONAL INFORMATION VALIDATION
// ==========================================

document.a// ==========================================
// PROFILE - PERSONAL INFORMATION VALIDATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const personalInfoForm = document.getElementById("personalInfoForm");

    // Check if the form exists
    if (!personalInfoForm) return;

    // Form validation
    initFormValidation(personalInfoForm, {

        // Email validation
        pEmail: (value) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },

        // Contact number validation
        pContact: (value) => {
            return /^[0-9+()\s-]{7,15}$/.test(value);
        }

    });

});ddEventListener("DOMContentLoaded", () => {

    const personalInfoForm = document.getElementById("personalInfoForm");

    // Check if the form exists
    if (!personalInfoForm) return;

    // Form validation
    initFormValidation(personalInfoForm, {

        // Email validation
        pEmail: (value) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },

        // Contact number validation
        pContact: (value) => {
            return /^[0-9+()\s-]{7,15}$/.test(value);
        }

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
