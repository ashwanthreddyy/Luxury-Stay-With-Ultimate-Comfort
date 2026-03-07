/* ========================================
   LUXURY STAY — LOGIN PAGE JS
   Auth-protected: sets session on success
======================================== */

// ===== AUTH GUARD (on login page itself) =====
// If already logged in, skip login and go straight to site
window.addEventListener('DOMContentLoaded', () => {
  const session = sessionStorage.getItem('ls_auth');
  if (session) {
    window.location.replace('index.html');
    return;
  }
  initLoginPage();
});

function initLoginPage() {
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) {
    emailInput.addEventListener('focus', () => {
      if (!emailInput.value) emailInput.placeholder = 'Try: guest@luxurystay.in';
    });
    emailInput.addEventListener('blur', () => {
      emailInput.placeholder = 'your@email.com';
    });
  }
}

// ===== DEMO USERS =====
const DEMO_USERS = [
  { email: 'guest@luxurystay.in',  password: 'luxury123', name: 'Anika Sharma',   role: 'Gold Member' },
  { email: 'admin@luxurystay.in',  password: 'admin2025', name: 'Administrator',  role: 'Admin'       },
  { email: 'demo@demo.com',        password: 'demo1234',  name: 'Demo User',      role: 'Silver Member'},
];

// Registered users (from Register form this session)
let registeredUsers = [];

// ===== TAB SWITCHER =====
function switchTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm   = document.getElementById('forgotForm');
  const tabLogin     = document.getElementById('tabLogin');
  const tabRegister  = document.getElementById('tabRegister');
  const tabSlider    = document.getElementById('tabSlider');
  const success      = document.getElementById('loginSuccess');

  [loginForm, registerForm, forgotForm, success].forEach(el => {
    if (el) el.classList.add('hidden');
  });

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    tabSlider.classList.remove('right');
  } else {
    registerForm.classList.remove('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    tabSlider.classList.add('right');
  }
}

// ===== FORGOT PASSWORD =====
function showForgot() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('forgotForm').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('forgotForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

// ===== PASSWORD TOGGLE =====
function togglePassword(fieldId, btn) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = 'Hide';
  } else {
    input.type = 'password';
    btn.textContent = 'Show';
  }
}

// ===== PASSWORD STRENGTH =====
function checkStrength(password) {
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (!fill || !label) return;

  let score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;

  const levels = [
    { pct: '15%',  color: '#e74c3c', text: 'Weak'   },
    { pct: '40%',  color: '#e67e22', text: 'Fair'   },
    { pct: '70%',  color: '#f1c40f', text: 'Good'   },
    { pct: '100%', color: '#2ecc71', text: 'Strong' },
  ];

  const level = levels[Math.max(0, score - 1)] || levels[0];
  fill.style.width      = password.length ? level.pct   : '0%';
  fill.style.background = password.length ? level.color : '';
  label.textContent     = password.length ? level.text  : '';
}

// ===== LOGIN HANDLER =====
function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const btn      = document.getElementById('loginBtn');

  btn.querySelector('.btn-text').style.display  = 'none';
  btn.querySelector('.btn-loader').style.display = 'inline-block';
  btn.disabled = true;

  setTimeout(() => {
    // Check demo users + runtime-registered users
    const allUsers = [...DEMO_USERS, ...registeredUsers];
    const user = allUsers.find(u => u.email.toLowerCase() === email && u.password === password);

    btn.querySelector('.btn-text').style.display  = '';
    btn.querySelector('.btn-loader').style.display = 'none';
    btn.disabled = false;

    if (user) {
      grantAccess(user);
    } else {
      showLoginError();
    }
  }, 1400);
}

// ===== GRANT ACCESS — writes session then redirects =====
function grantAccess(user) {
  // Store auth info in sessionStorage (cleared when tab closes)
  sessionStorage.setItem('ls_auth', 'true');
  sessionStorage.setItem('ls_user', JSON.stringify({
    name: user.name,
    email: user.email,
    role: user.role || 'Guest',
    loginTime: new Date().toISOString()
  }));

  // Show success UI
  document.getElementById('loginForm').classList.add('hidden');
  const successEl = document.getElementById('loginSuccess');
  successEl.classList.remove('hidden');

  // Update success message with name
  const h3 = successEl.querySelector('h3');
  if (h3) h3.textContent = `Welcome, ${user.name.split(' ')[0]}!`;

  // Animate progress bar then redirect
  setTimeout(() => {
    document.getElementById('successFill').style.width = '100%';
  }, 100);

  setTimeout(() => {
    window.location.replace('index.html');
  }, 2600);
}

// ===== LOGIN ERROR =====
function showLoginError() {
  const emailInput    = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  [emailInput, passwordInput].forEach(el => {
    el.classList.add('error');
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
      el.classList.remove('error');
      el.style.animation = '';
    }, 2000);
  });

  let errMsg = document.getElementById('loginErrMsg');
  if (!errMsg) {
    errMsg = document.createElement('p');
    errMsg.id = 'loginErrMsg';
    errMsg.className = 'error-msg show';
    errMsg.innerHTML = '✕ Invalid credentials. Try: <strong>guest@luxurystay.in</strong> / <strong>luxury123</strong>';
    const form = document.querySelector('#loginForm form');
    const submitBtn = form.querySelector('.btn-auth');
    form.insertBefore(errMsg, submitBtn);
  } else {
    errMsg.classList.add('show');
  }

  setTimeout(() => { if (errMsg) errMsg.classList.remove('show'); }, 6000);
}

// ===== REGISTER HANDLER =====
function handleRegister(e) {
  e.preventDefault();
  const firstName = e.target.querySelector('input[placeholder="First name"]').value.trim();
  const lastName  = e.target.querySelector('input[placeholder="Last name"]').value.trim();
  const email     = document.getElementById('regEmail').value.trim().toLowerCase();
  const password  = document.getElementById('regPassword').value;
  const confirm   = document.getElementById('regConfirm').value;

  if (password !== confirm) {
    document.getElementById('regConfirm').classList.add('error');
    showToast('Passwords do not match.', 'error');
    return;
  }

  if (password.length < 8) {
    showToast('Password must be at least 8 characters.', 'error');
    return;
  }

  // Check duplicate
  const allUsers = [...DEMO_USERS, ...registeredUsers];
  if (allUsers.find(u => u.email.toLowerCase() === email)) {
    showToast('This email is already registered. Please sign in.', 'error');
    return;
  }

  const btn = e.target.querySelector('.btn-auth');
  btn.textContent = 'Creating Account...';
  btn.disabled = true;

  setTimeout(() => {
    // Save to runtime list
    registeredUsers.push({
      email,
      password,
      name: `${firstName} ${lastName}`.trim() || 'New Guest',
      role: 'Silver Member'
    });

    btn.textContent = 'Create Account';
    btn.disabled = false;

    switchTab('login');
    showToast(`Welcome, ${firstName}! Please sign in with your new credentials.`, 'success');
  }, 1500);
}

// ===== FORGOT PASSWORD =====
function handleForgot(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-auth');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Send Reset Link';
    btn.disabled = false;
    document.getElementById('forgotSuccess').classList.remove('hidden');
    e.target.style.display = 'none';

    setTimeout(() => {
      showLogin();
      document.getElementById('forgotSuccess').classList.add('hidden');
      e.target.style.display = '';
    }, 3500);
  }, 1400);
}

// ===== SOCIAL LOGIN (demo only) =====
function socialLogin(provider) {
  showToast(`Connecting to ${provider}...`, 'info');
  setTimeout(() => {
    // Simulate social grant as demo guest
    grantAccess({ name: `${provider} User`, email: 'social@demo.com', role: 'Social Guest' });
  }, 1400);
}

// ===== GUEST LOGIN =====
function guestLogin() {
  showToast('Entering as guest...', 'info');
  setTimeout(() => {
    grantAccess({ name: 'Guest', email: 'guest@visitor.com', role: 'Guest' });
  }, 900);
}

// ===== TOAST =====
function showToast(message, type = 'info') {
  const existing = document.getElementById('toastNotif');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toastNotif';
  const bg    = type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : 'rgba(201,168,76,0.97)';
  const color = (type === 'success' || type === 'error') ? '#fff' : '#1a1612';

  toast.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(20px);
    background:${bg}; color:${color};
    padding:0.85rem 2rem; font-family:'Jost',sans-serif; font-size:0.82rem;
    letter-spacing:0.06em; box-shadow:0 8px 30px rgba(0,0,0,0.22);
    z-index:9999; opacity:0; transition:all 0.35s ease;
    border-radius:2px; max-width:90vw; text-align:center;
  `;
  toast.innerHTML = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

// ===== SHAKE ANIMATION =====
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60%  { transform: translateX(-6px); }
    40%, 80%  { transform: translateX(6px); }
  }
`;
document.head.appendChild(styleEl);

// ===== KEYBOARD — Enter submits active form =====
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const activeForm = document.querySelector('.auth-form:not(.hidden) form');
    if (activeForm) activeForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
});
