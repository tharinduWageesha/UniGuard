/**
 * Dynamic Header & Profile Loader for all CSO pages
 * Fetches real logged-in CSO user data from database/session, populates greeting, real name, profile picture (or icon fallback), live clock, and dashboard stats.
 */

// Immediate Live Clock Initialization (Runs independently without waiting for APIs)
function initLiveClock() {
  function update() {
    const timeElem = document.getElementById('current-time');
    const dateElem = document.getElementById('current-date');
    if (!timeElem && !dateElem) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
    const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options).toUpperCase();

    if (timeElem) timeElem.textContent = timeStr;
    if (dateElem) dateElem.textContent = dateStr;
  }

  update();
  if (!window.__ug_clock_interval) {
    window.__ug_clock_interval = setInterval(update, 1000);
  }
}

// Trigger clock immediately
initLiveClock();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLiveClock);
}
window.addEventListener('load', initLiveClock);

// Helper function to apply user profile data to DOM header elements
function applyCsoUserData(user) {
  if (!user) return;

  const fname = (user.fname || '').trim();
  const lname = (user.lname || '').trim();
  
  // Ignore dummy placeholder values if passed
  if (fname.toLowerCase() === 'officer' && (!lname || lname.toLowerCase() === 'officer')) {
    return;
  }

  const fullName = (fname || lname) ? `${fname} ${lname}`.trim() : (user.username || 'CSO Officer');
  const greetingFirstName = fname || fullName.split(' ')[0] || 'Officer';

  // 1. Update Welcome Greeting Name (.welcome-name)
  const welcomeNameElem = document.querySelector('.welcome-name');
  if (welcomeNameElem) {
    welcomeNameElem.textContent = greetingFirstName;
  }

  // 2. Update Welcome Time-based Greeting ("Good morning", "Good afternoon", "Good evening")
  const welcomeHiElems = document.querySelectorAll('.welcome-hi');
  if (welcomeHiElems.length > 0) {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    } else if (hour >= 17) {
      greeting = 'Good evening';
    }
    welcomeHiElems.forEach(el => {
      const text = (el.textContent || '').trim();
      const hasComma = text.endsWith(',');
      el.textContent = greeting + (hasComma ? ',' : '');
    });
  }

  // 3. Update User Name in Topbar Profile (.user-name)
  const userNameElems = document.querySelectorAll('.user-profile .user-name, #displayUserName');
  userNameElems.forEach(el => {
    el.textContent = fullName;
  });

  // 4. Update User Role (.user-role)
  const userRoleElem = document.querySelector('.user-profile .user-role');
  if (userRoleElem) {
    userRoleElem.textContent = (user.role || 'CHIEF SECURITY OFFICER').toUpperCase();
  }

  // 5. Update Profile Picture in Topbar Profile (.user-profile)
  const userProfileContainer = document.querySelector('.user-profile');
  if (userProfileContainer) {
    const picUrl = user.profile_picture || (user.meta_data ? user.meta_data.profile_picture : null);

    // Remove old avatar elements
    const existingAvatars = userProfileContainer.querySelectorAll('img.avatar, .avatar-initial, .avatar-icon');
    existingAvatars.forEach(el => el.remove());

    if (picUrl && picUrl.trim() !== '') {
      // Real Profile picture exists -> show img
      const img = document.createElement('img');
      img.className = 'avatar';
      img.src = picUrl;
      img.alt = fullName;
      img.style.width = '34px';
      img.style.height = '34px';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';
      userProfileContainer.insertBefore(img, userProfileContainer.firstChild);
    } else {
      // Profile picture does NOT exist -> show profile picture icon fallback
      const iconDiv = document.createElement('div');
      iconDiv.className = 'avatar-initial';
      iconDiv.style.width = '34px';
      iconDiv.style.height = '34px';
      iconDiv.style.borderRadius = '50%';
      iconDiv.style.background = 'linear-gradient(135deg, #0088ff, #0f172a)';
      iconDiv.style.color = '#ffffff';
      iconDiv.style.display = 'flex';
      iconDiv.style.alignItems = 'center';
      iconDiv.style.justifyContent = 'center';
      iconDiv.style.fontSize = '14px';
      iconDiv.style.flexShrink = '0';
      iconDiv.innerHTML = `<i class="fa-solid fa-user"></i>`;
      userProfileContainer.insertBefore(iconDiv, userProfileContainer.firstChild);
    }
  }

  // 6. If on myprofile.html page, populate main profile card & form fields
  const cardDisplayName = document.getElementById('cardDisplayName');
  if (cardDisplayName) {
    cardDisplayName.textContent = fullName;
  }

  const mainAvatar = document.getElementById('mainAvatar');
  if (mainAvatar) {
    const picUrl = user.profile_picture || (user.meta_data ? user.meta_data.profile_picture : null);
    if (picUrl && picUrl.trim() !== '') {
      mainAvatar.src = picUrl;
    } else {
      mainAvatar.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230f172a"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="40" font-family="sans-serif">👤</text></svg>`;
    }
  }

  const firstNameInput = document.getElementById('firstName');
  if (firstNameInput && !firstNameInput.dataset.userEdited) {
    firstNameInput.value = fname;
  }

  const lastNameInput = document.getElementById('lastName');
  if (lastNameInput && !lastNameInput.dataset.userEdited) {
    lastNameInput.value = lname;
  }

  const emailInput = document.getElementById('email');
  if (emailInput && !emailInput.dataset.userEdited) {
    emailInput.value = user.email || '';
  }

  const phoneInput = document.getElementById('phone');
  if (phoneInput && !phoneInput.dataset.userEdited) {
    phoneInput.value = user.phone || (user.meta_data ? user.meta_data.phone : '') || '';
  }
}

// API Helper with endpoint fallback
async function fetchApi(action) {
  const primaryUrl = `/Uniguard/BackEnd/index.php?action=${action}`;
  const relativeUrls = [
    primaryUrl,
    `../../BackEnd/index.php?action=${action}`,
    `../../../BackEnd/index.php?action=${action}`,
    `../BackEnd/index.php?action=${action}`
  ];

  for (const url of relativeUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {}
  }
  return null;
}

// Main Loader Function
(function () {
  async function loadCsoHeader() {
    try {
      initLiveClock();

      let user = null;

      // A. Try loading the specific logged-in user from sessionStorage first
      try {
        const storedUserStr = sessionStorage.getItem('uniguard_user');
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          const fname = (storedUser.fname || '').trim();
          if (storedUser && storedUser.role && fname && fname.toLowerCase() !== 'officer') {
            const r = storedUser.role.toLowerCase();
            if (r === 'cso' || r === 'chief security officer') {
              user = storedUser;
              applyCsoUserData(user);
            }
          }
        }
      } catch (e) {}

      // B. Fetch active logged-in user session from backend API (csos database table)
      try {
        const authData = await fetchApi('check_auth');
        if (authData && authData.status === 'success' && authData.user) {
          const authUser = authData.user;
          const r = (authUser.role || '').toLowerCase();
          if (r === 'cso' || r === 'chief security officer') {
            user = authUser;
            sessionStorage.setItem('uniguard_user', JSON.stringify(user));
            applyCsoUserData(user);
          }
        }
      } catch (e) {}

      // C. Fetch all users from backend for live counts; ONLY fallback if NO logged-in user session exists
      try {
        const usersData = await fetchApi('get_users');
        if (usersData && usersData.status === 'success' && Array.isArray(usersData.data)) {
          const allUsers = usersData.data;

          // ONLY fallback if no active logged-in user session was found
          if (!user) {
            const dbCsoUser = allUsers.find(u => {
              const r = (u.role || '').toLowerCase();
              return r === 'cso' || r === 'chief security officer';
            }) || (allUsers.length > 0 ? allUsers[0] : null);

            if (dbCsoUser) {
              user = dbCsoUser;
              sessionStorage.setItem('uniguard_user', JSON.stringify(user));
              applyCsoUserData(user);
            }
          }

          // D. Update Dashboard Live Counts (if elements exist on page)
          const oicCount = allUsers.filter(u => {
            const r = (u.role || '').toLowerCase();
            return r === 'oic' || r === 'officer in charge';
          }).length;

          const jsoCount = allUsers.filter(u => {
            const r = (u.role || '').toLowerCase();
            return r === 'jso' || r === 'junior security officer' || r === 'security officer';
          }).length;

          const oicStatNum = document.getElementById('stat-oic-count');
          if (oicStatNum) {
            oicStatNum.textContent = oicCount;
          }

          const jsoStatNum = document.getElementById('stat-jso-count');
          if (jsoStatNum) {
            jsoStatNum.textContent = jsoCount;
          }
        }
      } catch (e) {}

    } catch (err) {
      console.error('Failed to load CSO header profile:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCsoHeader);
  } else {
    loadCsoHeader();
  }

  window.addEventListener('load', loadCsoHeader);
})();
