/* ========================================
   LUXURY STAY — MAIN SITE JS
   Auth-gated: redirects to login if no session
======================================== */

// ===== AUTH GUARD =====
(function authGuard() {
  const auth = sessionStorage.getItem('ls_auth');
  if (!auth) {
    document.documentElement.style.visibility = 'hidden';
    window.location.replace('login.html');
    return;
  }
  document.documentElement.style.visibility = 'visible';
})();

// ===== USER SESSION DATA =====
function getUser() {
  try { return JSON.parse(sessionStorage.getItem('ls_user')) || {}; }
  catch { return {}; }
}

// ===== BOOKINGS STORAGE =====
function getBookings() {
  try { return JSON.parse(sessionStorage.getItem('ls_bookings')) || []; }
  catch { return []; }
}
function saveBooking(booking) {
  const bookings = getBookings();
  booking.id = 'BK' + Date.now();
  booking.createdAt = new Date().toISOString();
  bookings.unshift(booking);
  sessionStorage.setItem('ls_bookings', JSON.stringify(bookings));
  return booking;
}

// ===== LOGOUT =====
function logout() {
  sessionStorage.removeItem('ls_auth');
  sessionStorage.removeItem('ls_user');
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,22,18,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;animation:fadeIn 0.3s ease;';
  overlay.innerHTML = '<div style="text-align:center;"><div style="font-size:2rem;color:#C9A84C;margin-bottom:1rem;animation:spin 1.5s linear infinite;display:inline-block;">✦</div><p style="font-family:\'Cormorant Garamond\',serif;font-size:1.8rem;color:white;font-weight:300;">Signing out...</p><p style="font-family:\'Jost\',sans-serif;font-size:0.8rem;color:rgba(255,255,255,0.4);margin-top:0.5rem;letter-spacing:0.15em;">Thank you for staying with us</p></div>';
  document.body.appendChild(overlay);
  setTimeout(() => window.location.replace('login.html'), 1600);
}

// ===== INJECT USER INFO INTO NAVBAR =====
function injectUserBadge() {
  const user = getUser();
  if (!user.name) return;
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;
  const loginLink = navActions.querySelector('.login-btn');
  if (loginLink) loginLink.remove();
  const badge = document.createElement('div');
  badge.className = 'user-badge';
  badge.innerHTML = `
    <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
    <div class="user-meta">
      <span class="user-name">${user.name.split(' ')[0]}</span>
      <span class="user-role">${user.role}</span>
    </div>
    <div class="user-dropdown">
      <div class="ud-item ud-info">
        <span class="ud-icon">👤</span>
        <div><strong>${user.name}</strong><small>${user.email}</small></div>
      </div>
      <div class="ud-divider"></div>
      <div class="ud-item" onclick="openMyBookings()"><span class="ud-icon">📋</span> My Bookings</div>
      <div class="ud-item" onclick="openBookingModal()"><span class="ud-icon">📅</span> Book a Stay</div>
      <div class="ud-item" onclick="scrollTo('#rooms')"><span class="ud-icon">🛏️</span> Browse Rooms</div>
      <div class="ud-item" onclick="scrollTo('#hotels')"><span class="ud-icon">🏨</span> All Hotels</div>
      <div class="ud-divider"></div>
      <div class="ud-item ud-logout" onclick="logout()"><span class="ud-icon">🚪</span> Sign Out</div>
    </div>
  `;
  navActions.insertBefore(badge, navActions.querySelector('.book-btn'));
}

// ===== CUSTOM CURSOR =====
document.addEventListener('mousemove', (e) => {
  document.documentElement.style.setProperty('--cx', e.clientX + 'px');
  document.documentElement.style.setProperty('--cy', e.clientY + 'px');
});

// ===== PRELOADER =====
window.addEventListener('load', () => {
  injectUserBadge();
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 200);
    });
    const user = getUser();
    if (user.name) setTimeout(() => showMainToast('Welcome back, ' + user.name.split(' ')[0] + '! ✦'), 2200);
  }, 1800);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
  const backToTop = document.getElementById('backToTop');
  if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
});

// ===== HAMBURGER =====
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
  });
});

// ===== SMOOTH SCROLL =====
function scrollTo(target) {
  const el = document.querySelector(target);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const id = section.getAttribute('id');
    const link = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (link) {
      const inView = scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight;
      link.classList.toggle('active-link', inView);
    }
  });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const step = target / (2000 / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 16);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.count').forEach(counter => counterObserver.observe(counter));

// ===== TESTIMONIAL SLIDER =====
let currentSlide = 0;
const totalSlides = document.querySelectorAll('.testimonial-slide').length;
let autoSlideInterval;
function goToSlide(index) {
  currentSlide = index;
  const track = document.getElementById('testimonialTrack');
  if (track) track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
  document.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}
function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; goToSlide(currentSlide); }
autoSlideInterval = setInterval(nextSlide, 4500);
const slider = document.getElementById('testimonialSlider');
if (slider) {
  slider.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
  slider.addEventListener('mouseleave', () => { autoSlideInterval = setInterval(nextSlide, 4500); });
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : (currentSlide = (currentSlide - 1 + totalSlides) % totalSlides, goToSlide(currentSlide)); }
  });
}

// ===========================
// ===== BOOKING SYSTEM  =====
// ===========================

const HOTEL_OPTIONS = [
  { name: 'The Imperial Palace – New Delhi', price: 12000 },
  { name: 'Rambagh Palace – Jaipur', price: 32000 },
  { name: 'Grand Harbour Suites – Mumbai', price: 28000 },
  { name: 'The Leela Beach Resort – Goa', price: 16500 },
  { name: 'Falaknuma Sky Palace – Hyderabad', price: 38000 },
  { name: 'Vivanta Beachfront – Kovalam', price: 14000 },
  { name: 'Umaid Bhawan Palace – Jodhpur', price: 50000 },
  { name: 'The Grand Oberoi – Kolkata', price: 11000 },
  { name: 'ITC Grand Chola – Chennai', price: 15000 },
  { name: 'Wildflower Hall – Shimla', price: 22000 },
  { name: 'Taj Exotica Resort – South Goa', price: 19500 },
  { name: 'Kumarakom Lake Resort – Kerala', price: 18000 },
  { name: 'Samode Haveli – Jaipur', price: 9500 },
  { name: 'Mayfair Himalayan – Darjeeling', price: 8000 },
  { name: 'Lake Palace – Udaipur', price: 55000 },
  { name: 'Coral Reef Retreat – Andaman', price: 20000 },
  { name: 'Amanbagh Haveli – Alwar', price: 62000 },
  { name: 'Ahilya Fort – Maheshwar', price: 17000 },
  { name: 'Mayfair Lagoon – Bhubaneswar', price: 7500 },
  { name: 'The Leela Palace – Bengaluru', price: 13000 },
  { name: 'Ananda in the Himalayas – Rishikesh', price: 35000 },
  { name: "Fisherman's Cove – Mahabalipuram", price: 11500 },
];
const ROOM_OPTIONS = [
  { name: 'Deluxe Room', price: 8500 },
  { name: 'Executive Suite', price: 18000 },
  { name: 'Presidential Suite', price: 45000 },
];

let bookingContext = { hotelName: '', hotelPrice: 0, roomType: '', roomPrice: 0, mode: 'both' };
let currentStep = 1;
let wizardData = {};
let selectedPaymentMethod = 'card';

function openHotelBooking(hotelName, pricePerNight) {
  bookingContext = { hotelName, hotelPrice: pricePerNight, roomType: '', roomPrice: 0, mode: 'hotel' };
  startBookingWizard();
}
function openRoomBooking(roomType, pricePerNight) {
  bookingContext = { hotelName: '', hotelPrice: 0, roomType, roomPrice: pricePerNight, mode: 'room' };
  startBookingWizard();
}
function openBookingModal() {
  bookingContext = { hotelName: '', hotelPrice: 0, roomType: '', roomPrice: 0, mode: 'both' };
  startBookingWizard();
}
function openModal() { openBookingModal(); }

function startBookingWizard() {
  wizardData = {};
  currentStep = 1;
  renderStep();
  const overlay = document.getElementById('bookingOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal(event) {
  if (!event || event.target === document.getElementById('bookingOverlay') || (event.currentTarget && event.currentTarget.classList.contains('bm-close'))) {
    document.getElementById('bookingOverlay').classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderStep() {
  const body = document.getElementById('bookingBody');
  document.querySelectorAll('.bm-step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === currentStep);
    s.classList.toggle('done', i + 1 < currentStep);
  });
  if (currentStep === 1) renderStep1(body);
  else if (currentStep === 2) renderStep2(body);
  else if (currentStep === 3) renderStep3(body);
  else if (currentStep === 4) renderStep4(body);
}

function renderStep1(body) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  let selectorHTML = '';
  if (bookingContext.mode === 'hotel') {
    selectorHTML = `
      <div class="bm-field">
        <label>Hotel Property</label>
        <div class="bm-preset-tag">🏨 ${bookingContext.hotelName}</div>
      </div>
      <div class="bm-field">
        <label>Select Room Type</label>
        <div class="bm-room-cards" id="roomPicker">
          ${ROOM_OPTIONS.map(r => '<div class="bm-room-card' + (wizardData.roomType === r.name ? ' selected' : '') + '" onclick="selectRoom(\'' + r.name + '\',' + r.price + ',event)"><div class="bm-rc-name">' + r.name + '</div><div class="bm-rc-price">₹' + r.price.toLocaleString() + '<small>/night</small></div></div>').join('')}
        </div>
      </div>`;
  } else if (bookingContext.mode === 'room') {
    selectorHTML = `
      <div class="bm-field">
        <label>Room Type</label>
        <div class="bm-preset-tag">🛏️ ${bookingContext.roomType} — ₹${bookingContext.roomPrice.toLocaleString()}/night</div>
      </div>
      <div class="bm-field">
        <label>Select Hotel Property</label>
        <select id="hotelPicker" class="bm-select" onchange="updateHotelPrice()">
          <option value="">— Choose a hotel —</option>
          ${HOTEL_OPTIONS.map(h => '<option value="' + h.name + '" data-price="' + h.price + '"' + (wizardData.hotelName === h.name ? ' selected' : '') + '>' + h.name + '</option>').join('')}
        </select>
      </div>`;
  } else {
    selectorHTML = `
      <div class="bm-field">
        <label>Hotel Property</label>
        <select id="hotelPicker" class="bm-select" onchange="updateHotelPrice()">
          <option value="">— Choose a hotel —</option>
          ${HOTEL_OPTIONS.map(h => '<option value="' + h.name + '" data-price="' + h.price + '"' + (wizardData.hotelName === h.name ? ' selected' : '') + '>' + h.name + '</option>').join('')}
        </select>
      </div>
      <div class="bm-field">
        <label>Select Room Type</label>
        <div class="bm-room-cards">
          ${ROOM_OPTIONS.map(r => '<div class="bm-room-card' + (wizardData.roomType === r.name ? ' selected' : '') + '" onclick="selectRoom(\'' + r.name + '\',' + r.price + ',event)"><div class="bm-rc-name">' + r.name + '</div><div class="bm-rc-price">₹' + r.price.toLocaleString() + '<small>/night</small></div></div>').join('')}
        </div>
      </div>`;
  }

  body.innerHTML = `
    <div class="bm-step-content">
      <h4 class="bm-step-title">Select Your Stay</h4>
      ${selectorHTML}
      <div class="bm-field-row">
        <div class="bm-field"><label>Check-In</label><input type="date" id="checkIn" class="bm-input" min="${today}" value="${wizardData.checkIn || today}" onchange="updateDates()"/></div>
        <div class="bm-field"><label>Check-Out</label><input type="date" id="checkOut" class="bm-input" min="${tomorrowStr}" value="${wizardData.checkOut || tomorrowStr}" onchange="updateDates()"/></div>
      </div>
      <div class="bm-field">
        <label>Guests</label>
        <select id="guestCount" class="bm-select">
          <option ${wizardData.guests === '1 Guest' ? 'selected' : ''}>1 Guest</option>
          <option ${!wizardData.guests || wizardData.guests === '2 Guests' ? 'selected' : ''}>2 Guests</option>
          <option ${wizardData.guests === '3 Guests' ? 'selected' : ''}>3 Guests</option>
          <option ${wizardData.guests === '4+ Guests' ? 'selected' : ''}>4+ Guests</option>
        </select>
      </div>
      <div class="bm-price-preview" id="pricePreview"></div>
      <button class="bm-btn-primary" onclick="goStep2()">Continue →</button>
    </div>`;
  updatePricePreview();
}

function selectRoom(name, price, e) {
  wizardData.roomType = name;
  wizardData.roomPrice = price;
  document.querySelectorAll('.bm-room-card').forEach(c => c.classList.remove('selected'));
  if (e && e.currentTarget) e.currentTarget.classList.add('selected');
  else { document.querySelectorAll('.bm-room-card').forEach(c => { if (c.querySelector('.bm-rc-name').textContent === name) c.classList.add('selected'); }); }
  updatePricePreview();
}

function updateHotelPrice() {
  const sel = document.getElementById('hotelPicker');
  if (sel && sel.value) {
    const opt = sel.options[sel.selectedIndex];
    wizardData.hotelName = sel.value;
    wizardData.hotelPrice = parseInt(opt.getAttribute('data-price')) || 0;
  }
  updatePricePreview();
}

function updateDates() {
  const ci = document.getElementById('checkIn');
  const co = document.getElementById('checkOut');
  if (ci) wizardData.checkIn = ci.value;
  if (co) wizardData.checkOut = co.value;
  updatePricePreview();
}

function updatePricePreview() {
  const preview = document.getElementById('pricePreview');
  if (!preview) return;
  const ci = document.getElementById('checkIn') ? document.getElementById('checkIn').value : wizardData.checkIn;
  const co = document.getElementById('checkOut') ? document.getElementById('checkOut').value : wizardData.checkOut;
  if (!ci || !co) return;
  const nights = Math.max(1, Math.round((new Date(co) - new Date(ci)) / 86400000));
  const roomP = wizardData.roomPrice || (bookingContext.mode === 'room' ? bookingContext.roomPrice : 0);
  const hotelP = wizardData.hotelPrice || (bookingContext.mode === 'hotel' ? bookingContext.hotelPrice : 0);
  const basePrice = Math.max(roomP, hotelP) || 8500;
  const total = basePrice * nights;
  const taxes = Math.round(total * 0.18);
  preview.innerHTML = '<div class="bm-price-row"><span>' + nights + ' night' + (nights > 1 ? 's' : '') + ' × ₹' + basePrice.toLocaleString() + '</span><span>₹' + total.toLocaleString() + '</span></div><div class="bm-price-row"><span>Taxes & fees (18%)</span><span>₹' + taxes.toLocaleString() + '</span></div><div class="bm-price-row bm-price-total"><span>Total</span><span>₹' + (total + taxes).toLocaleString() + '</span></div>';
  wizardData._nights = nights;
  wizardData._basePrice = basePrice;
  wizardData._total = total + taxes;
}

function goStep2() {
  const ci = document.getElementById('checkIn') ? document.getElementById('checkIn').value : '';
  const co = document.getElementById('checkOut') ? document.getElementById('checkOut').value : '';
  if (!ci || !co) { showMainToast('Please select check-in and check-out dates', 'error'); return; }
  if (new Date(co) <= new Date(ci)) { showMainToast('Check-out must be after check-in', 'error'); return; }
  if (bookingContext.mode === 'hotel') {
    wizardData.hotelName = bookingContext.hotelName;
    wizardData.hotelPrice = bookingContext.hotelPrice;
    if (!wizardData.roomType) { showMainToast('Please select a room type', 'error'); return; }
  } else if (bookingContext.mode === 'room') {
    wizardData.roomType = bookingContext.roomType;
    wizardData.roomPrice = bookingContext.roomPrice;
    const sel = document.getElementById('hotelPicker');
    if (sel && sel.value) { const opt = sel.options[sel.selectedIndex]; wizardData.hotelName = sel.value; wizardData.hotelPrice = parseInt(opt.getAttribute('data-price')) || 0; }
    if (!wizardData.hotelName) { showMainToast('Please select a hotel property', 'error'); return; }
  } else {
    const sel = document.getElementById('hotelPicker');
    if (sel && sel.value) { const opt = sel.options[sel.selectedIndex]; wizardData.hotelName = sel.value; wizardData.hotelPrice = parseInt(opt.getAttribute('data-price')) || 0; }
    if (!wizardData.roomType) { showMainToast('Please select a room type', 'error'); return; }
    if (!wizardData.hotelName) { showMainToast('Please select a hotel', 'error'); return; }
  }
  wizardData.checkIn = ci;
  wizardData.checkOut = co;
  wizardData.guests = document.getElementById('guestCount') ? document.getElementById('guestCount').value : '2 Guests';
  updatePricePreview();
  currentStep = 2;
  renderStep();
}

function renderStep2(body) {
  const user = getUser();
  body.innerHTML = `
    <div class="bm-step-content">
      <h4 class="bm-step-title">Guest Details</h4>
      <div class="bm-field-row">
        <div class="bm-field"><label>Full Name</label><input type="text" id="guestName" class="bm-input" placeholder="Your full name" value="${wizardData.guestName || user.name || ''}"/></div>
        <div class="bm-field"><label>Email</label><input type="email" id="guestEmail" class="bm-input" placeholder="your@email.com" value="${wizardData.guestEmail || user.email || ''}"/></div>
      </div>
      <div class="bm-field-row">
        <div class="bm-field"><label>Phone</label><input type="tel" id="guestPhone" class="bm-input" placeholder="+91 00000 00000" value="${wizardData.guestPhone || ''}"/></div>
        <div class="bm-field"><label>Nationality</label><select id="guestNationality" class="bm-select"><option ${wizardData.nationality === 'Indian' ? 'selected' : ''}>Indian</option><option ${wizardData.nationality === 'NRI' ? 'selected' : ''}>NRI</option><option ${wizardData.nationality === 'International' ? 'selected' : ''}>International</option></select></div>
      </div>
      <div class="bm-field"><label>Special Requests <span style="opacity:0.5;font-weight:300;">(optional)</span></label><textarea id="guestRequests" class="bm-input bm-textarea" placeholder="Dietary requirements, accessibility needs, anniversary arrangements...">${wizardData.specialRequests || ''}</textarea></div>
      <div class="bm-booking-summary">
        <div class="bm-sum-row"><span>🏨 Hotel</span><span>${wizardData.hotelName || bookingContext.hotelName}</span></div>
        <div class="bm-sum-row"><span>🛏️ Room</span><span>${wizardData.roomType || bookingContext.roomType}</span></div>
        <div class="bm-sum-row"><span>📅 Dates</span><span>${formatDate(wizardData.checkIn)} → ${formatDate(wizardData.checkOut)}</span></div>
        <div class="bm-sum-row"><span>👥 Guests</span><span>${wizardData.guests}</span></div>
        <div class="bm-sum-row bm-sum-total"><span>Total</span><span>₹${(wizardData._total || 0).toLocaleString()}</span></div>
      </div>
      <div class="bm-btn-row">
        <button class="bm-btn-back" onclick="currentStep=1;renderStep()">← Back</button>
        <button class="bm-btn-primary" onclick="goStep3()">Continue →</button>
      </div>
    </div>`;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function goStep3() {
  const name = document.getElementById('guestName') ? document.getElementById('guestName').value.trim() : '';
  const email = document.getElementById('guestEmail') ? document.getElementById('guestEmail').value.trim() : '';
  if (!name) { showMainToast('Please enter your name', 'error'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMainToast('Please enter a valid email', 'error'); return; }
  wizardData.guestName = name;
  wizardData.guestEmail = email;
  wizardData.guestPhone = document.getElementById('guestPhone') ? document.getElementById('guestPhone').value : '';
  wizardData.nationality = document.getElementById('guestNationality') ? document.getElementById('guestNationality').value : 'Indian';
  wizardData.specialRequests = document.getElementById('guestRequests') ? document.getElementById('guestRequests').value : '';
  currentStep = 3;
  renderStep();
}

function renderStep3(body) {
  const total = wizardData._total || 0;
  body.innerHTML = `
    <div class="bm-step-content">
      <h4 class="bm-step-title">Payment</h4>
      <div class="bm-payment-amount">
        <span class="bm-pay-label">Amount to Pay</span>
        <span class="bm-pay-total">₹${total.toLocaleString()}</span>
      </div>
      <div class="bm-payment-methods">
        <div class="bm-pm-option active" id="pm-card" onclick="selectPaymentMethod('card')"><span>💳</span> Credit / Debit Card</div>
        <div class="bm-pm-option" id="pm-upi" onclick="selectPaymentMethod('upi')"><span>📱</span> UPI</div>
        <div class="bm-pm-option" id="pm-netbanking" onclick="selectPaymentMethod('netbanking')"><span>🏦</span> Net Banking</div>
      </div>
      <div id="payment-card" class="bm-payment-form">
        <div class="bm-field"><label>Card Number</label><input type="text" id="cardNumber" class="bm-input" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCardNumber(this)"/></div>
        <div class="bm-field"><label>Cardholder Name</label><input type="text" id="cardName" class="bm-input" placeholder="As on card" value="${wizardData.guestName || ''}"/></div>
        <div class="bm-field-row">
          <div class="bm-field"><label>Expiry</label><input type="text" id="cardExpiry" class="bm-input" placeholder="MM / YY" maxlength="7" oninput="formatExpiry(this)"/></div>
          <div class="bm-field"><label>CVV</label><input type="password" id="cardCvv" class="bm-input" placeholder="•••" maxlength="4"/></div>
        </div>
        <div class="bm-secure-note">🔒 Your payment is secured with 256-bit SSL encryption</div>
      </div>
      <div id="payment-upi" class="bm-payment-form hidden">
        <div class="bm-field"><label>UPI ID</label><input type="text" id="upiId" class="bm-input" placeholder="yourname@upi"/></div>
        <div class="bm-upi-apps">
          <div class="bm-upi-app" onclick="fillUpiApp('GPay',event)">GPay</div>
          <div class="bm-upi-app" onclick="fillUpiApp('PhonePe',event)">PhonePe</div>
          <div class="bm-upi-app" onclick="fillUpiApp('Paytm',event)">Paytm</div>
          <div class="bm-upi-app" onclick="fillUpiApp('BHIM',event)">BHIM</div>
        </div>
        <div class="bm-secure-note">🔒 UPI payments are instant and secure</div>
      </div>
      <div id="payment-netbanking" class="bm-payment-form hidden">
        <div class="bm-field"><label>Select Bank</label><select id="bankSelect" class="bm-select"><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option><option>Punjab National Bank</option><option>Bank of Baroda</option><option>Other</option></select></div>
        <div class="bm-secure-note">🔒 You'll be redirected to your bank's secure portal</div>
      </div>
      <div class="bm-btn-row">
        <button class="bm-btn-back" onclick="currentStep=2;renderStep()">← Back</button>
        <button class="bm-btn-primary" id="payBtn" onclick="processPayment()">Pay ₹${total.toLocaleString()} →</button>
      </div>
    </div>`;
  selectedPaymentMethod = 'card';
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.bm-pm-option').forEach(o => o.classList.remove('active'));
  const el = document.getElementById('pm-' + method);
  if (el) el.classList.add('active');
  document.querySelectorAll('.bm-payment-form').forEach(f => f.classList.add('hidden'));
  const form = document.getElementById('payment-' + method);
  if (form) form.classList.remove('hidden');
}
function formatCardNumber(input) { let v = input.value.replace(/\D/g, '').substring(0, 16); input.value = v.replace(/(.{4})/g, '$1 ').trim(); }
function formatExpiry(input) { let v = input.value.replace(/\D/g, '').substring(0, 4); if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2); input.value = v; }
function fillUpiApp(app, e) { const el = document.getElementById('upiId'); if (el) el.value = app.toLowerCase() + '@ybl'; document.querySelectorAll('.bm-upi-app').forEach(a => a.classList.remove('selected')); if (e && e.currentTarget) e.currentTarget.classList.add('selected'); }

function processPayment() {
  if (selectedPaymentMethod === 'card') {
    const num = document.getElementById('cardNumber') ? document.getElementById('cardNumber').value.replace(/\s/g, '') : '';
    const name = document.getElementById('cardName') ? document.getElementById('cardName').value.trim() : '';
    const expiry = document.getElementById('cardExpiry') ? document.getElementById('cardExpiry').value.trim() : '';
    const cvv = document.getElementById('cardCvv') ? document.getElementById('cardCvv').value.trim() : '';
    if (!num || num.length < 16) { showMainToast('Please enter a valid card number', 'error'); return; }
    if (!name) { showMainToast('Please enter cardholder name', 'error'); return; }
    if (!expiry || expiry.length < 7) { showMainToast('Please enter a valid expiry date', 'error'); return; }
    if (!cvv || cvv.length < 3) { showMainToast('Please enter CVV', 'error'); return; }
    wizardData.paymentMethod = 'Card ending ' + num.slice(-4);
  } else if (selectedPaymentMethod === 'upi') {
    const upi = document.getElementById('upiId') ? document.getElementById('upiId').value.trim() : '';
    if (!upi || !upi.includes('@')) { showMainToast('Please enter a valid UPI ID', 'error'); return; }
    wizardData.paymentMethod = 'UPI: ' + upi;
  } else {
    wizardData.paymentMethod = 'Net Banking: ' + (document.getElementById('bankSelect') ? document.getElementById('bankSelect').value : '');
  }
  const btn = document.getElementById('payBtn');
  if (btn) { btn.textContent = 'Processing...'; btn.disabled = true; }
  setTimeout(() => { currentStep = 4; renderStep(); }, 2000);
}

function renderStep4(body) {
  const booking = {
    hotelName: wizardData.hotelName || bookingContext.hotelName,
    roomType: wizardData.roomType || bookingContext.roomType,
    checkIn: wizardData.checkIn,
    checkOut: wizardData.checkOut,
    guests: wizardData.guests,
    guestName: wizardData.guestName,
    guestEmail: wizardData.guestEmail,
    nights: wizardData._nights,
    total: wizardData._total,
    paymentMethod: wizardData.paymentMethod,
    status: 'Confirmed'
  };
  const saved = saveBooking(booking);
  body.innerHTML = `
    <div class="bm-step-content bm-success-step">
      <div class="bm-success-icon">✦</div>
      <h3>Booking Confirmed!</h3>
      <p class="bm-success-sub">Booking ID: <strong>${saved.id}</strong></p>
      <div class="bm-confirmed-details">
        <div class="bm-cd-row"><span>🏨</span><div><strong>${booking.hotelName}</strong><small>${booking.roomType}</small></div></div>
        <div class="bm-cd-row"><span>📅</span><div><strong>${formatDate(booking.checkIn)} → ${formatDate(booking.checkOut)}</strong><small>${booking.nights} night${booking.nights > 1 ? 's' : ''} · ${booking.guests}</small></div></div>
        <div class="bm-cd-row"><span>💳</span><div><strong>₹${(booking.total || 0).toLocaleString()} Paid</strong><small>${booking.paymentMethod}</small></div></div>
      </div>
      <p class="bm-confirm-note">A confirmation has been sent to <strong>${booking.guestEmail}</strong></p>
      <div class="bm-btn-row" style="justify-content:center;gap:1rem;flex-wrap:wrap;">
        <button class="bm-btn-back" onclick="document.getElementById('bookingOverlay').classList.remove('active');document.body.style.overflow='';">Close</button>
        <button class="bm-btn-primary" style="flex:none;width:auto;padding:0.9rem 1.5rem;" onclick="document.getElementById('bookingOverlay').classList.remove('active');document.body.style.overflow='';setTimeout(openMyBookings,200);">View My Bookings</button>
      </div>
    </div>`;
  wizardData = {};
}

// ===========================
// ===== MY BOOKINGS PANEL ===
// ===========================
function openMyBookings() {
  const overlay = document.getElementById('myBookingsOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderMyBookings();
}

function closeMyBookings(event) {
  if (!event || event.target === document.getElementById('myBookingsOverlay') || (event.currentTarget && event.currentTarget.classList.contains('mb-close'))) {
    document.getElementById('myBookingsOverlay').classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderMyBookings() {
  const bookings = getBookings();
  const container = document.getElementById('myBookingsList');
  if (!container) return;
  if (bookings.length === 0) {
    container.innerHTML = '<div class="mb-empty"><div class="mb-empty-icon">🏨</div><h4>No Bookings Yet</h4><p>Your confirmed reservations will appear here.</p><button class="bm-btn-primary" style="margin:0 auto;display:block;max-width:220px;" onclick="closeMyBookings();setTimeout(openBookingModal,200);">Book Your First Stay →</button></div>';
    return;
  }
  const now = new Date();
  container.innerHTML = bookings.map(b => {
    const checkIn = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    const isActive = checkIn <= now && checkOut >= now;
    const isUpcoming = checkIn > now;
    const badge = isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed';
    const badgeClass = isActive ? 'mb-badge-active' : isUpcoming ? 'mb-badge-upcoming' : 'mb-badge-past';
    return '<div class="mb-booking-card">' +
      '<div class="mb-booking-header"><div><div class="mb-booking-id">' + b.id + '</div><div class="mb-booking-hotel">' + b.hotelName + '</div></div><span class="mb-badge ' + badgeClass + '">' + badge + '</span></div>' +
      '<div class="mb-booking-body">' +
        '<div class="mb-booking-detail"><span class="mb-detail-icon">🛏️</span><div><strong>' + b.roomType + '</strong><small>' + b.nights + ' night' + (b.nights > 1 ? 's' : '') + ' · ' + b.guests + '</small></div></div>' +
        '<div class="mb-booking-detail"><span class="mb-detail-icon">📅</span><div><strong>' + formatDate(b.checkIn) + '</strong><small>to ' + formatDate(b.checkOut) + '</small></div></div>' +
        '<div class="mb-booking-detail"><span class="mb-detail-icon">💳</span><div><strong>₹' + (b.total || 0).toLocaleString() + '</strong><small>' + (b.paymentMethod || 'Paid') + '</small></div></div>' +
      '</div>' +
      (isUpcoming ? '<button class="mb-cancel-btn" onclick="cancelBooking(\'' + b.id + '\')">Cancel Booking</button>' : '') +
      '</div>';
  }).join('');
}

function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  const bookings = getBookings().filter(b => b.id !== id);
  sessionStorage.setItem('ls_bookings', JSON.stringify(bookings));
  renderMyBookings();
  showMainToast('Booking cancelled.', 'success');
}

// ===== CONTACT FORM =====
function submitForm(e) {
  e.preventDefault();
  const name = document.getElementById('cName') ? document.getElementById('cName').value : '';
  const email = document.getElementById('cEmail') ? document.getElementById('cEmail').value : '';
  const message = document.getElementById('cMessage') ? document.getElementById('cMessage').value : '';
  if (!name || !email || !message) { showMainToast('Please fill in all required fields.', 'error'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  setTimeout(() => {
    const success = document.getElementById('formSuccess');
    if (success) success.classList.add('show');
    if (btn) { btn.textContent = 'Sent ✓'; btn.style.background = '#7bc47b'; }
    e.target.reset();
    setTimeout(() => { if (success) success.classList.remove('show'); if (btn) { btn.textContent = 'Send Message'; btn.style.background = ''; btn.disabled = false; } }, 5000);
  }, 1200);
}

// ===== NEWSLETTER =====
function subscribeNewsletter() {
  const input = document.querySelector('.newsletter-input input');
  if (!input) return;
  const email = input.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    input.style.borderColor = '#e87878'; input.placeholder = 'Enter a valid email!';
    setTimeout(() => { input.style.borderColor = ''; input.placeholder = 'Enter your email'; }, 2500);
    return;
  }
  input.value = ''; input.placeholder = '✓ Subscribed! Thank you.'; input.style.borderColor = '#7bc47b';
  setTimeout(() => { input.placeholder = 'Enter your email'; input.style.borderColor = ''; }, 4000);
}
document.querySelector('.newsletter-input input') && document.querySelector('.newsletter-input input').addEventListener('keydown', e => { if (e.key === 'Enter') subscribeNewsletter(); });

// ===== GALLERY LIGHTBOX =====
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const url = item.style.backgroundImage.replace(/url\(["']?/, '').replace(/["']?\)/, '');
    const label = item.querySelector('.gallery-overlay span') ? item.querySelector('.gallery-overlay span').textContent : '';
    const lb = document.createElement('div');
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.96);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;cursor:pointer;animation:fadeIn 0.3s ease;';
    lb.innerHTML = '<button style="position:absolute;top:1.5rem;right:2rem;background:none;border:none;color:rgba(255,255,255,0.6);font-size:1.5rem;cursor:pointer;">✕</button><img src="' + url + '" style="max-width:90vw;max-height:80vh;object-fit:contain;border:1px solid rgba(201,168,76,0.3);" /><p style="color:rgba(201,168,76,0.8);font-family:\'Cormorant Garamond\',serif;font-size:1.2rem;margin-top:1rem;letter-spacing:0.2em;">' + label + '</p>';
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';
    const close = () => { lb.style.opacity = '0'; lb.style.transition = 'opacity 0.3s'; setTimeout(() => { document.body.removeChild(lb); document.body.style.overflow = ''; }, 300); };
    lb.addEventListener('click', close);
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
  });
});

// ===== PARALLAX HERO =====
window.addEventListener('scroll', () => {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) heroBg.style.transform = 'scale(1.05) translateY(' + (window.scrollY * 0.3) + 'px)';
});

// ===== STAGGERED HOTEL CARDS =====
const hotelObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => { if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add('visible'), i * 60); hotelObserver.unobserve(entry.target); } });
}, { threshold: 0.05 });
document.querySelectorAll('.hotel-card, .room-card, .amenity-card').forEach(c => hotelObserver.observe(c));

// ===== HOTELS FILTER =====
let activeCategory = 'all';
function filterHotels() {
  const query = document.getElementById('hotelSearch') ? document.getElementById('hotelSearch').value.toLowerCase().trim() : '';
  const cards = document.querySelectorAll('.hotel-card');
  let visible = 0;
  cards.forEach(card => {
    const name = (card.getAttribute('data-name') || '').toLowerCase();
    const category = card.getAttribute('data-category') || '';
    if ((!query || name.includes(query)) && (activeCategory === 'all' || category.includes(activeCategory))) { card.classList.remove('hidden-card'); visible++; }
    else card.classList.add('hidden-card');
  });
  const noResults = document.getElementById('noResults');
  const count = document.getElementById('showingCount');
  if (noResults) noResults.classList.toggle('hidden', visible > 0);
  if (count) count.textContent = visible === 22 ? 'Showing all 22 properties' : 'Showing ' + visible + ' of 22 properties';
}
function filterByCategory(category, btn) {
  activeCategory = category;
  document.querySelectorAll('.hf-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const search = document.getElementById('hotelSearch');
  if (search) search.value = '';
  filterHotels();
}

// ===== MAIN SITE TOAST =====
function showMainToast(message, type) {
  type = type || 'gold';
  const existing = document.getElementById('mainToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'mainToast';
  const bg = type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : 'rgba(201,168,76,0.97)';
  const color = (type === 'error' || type === 'success') ? '#fff' : '#1a1612';
  toast.style.cssText = 'position:fixed;bottom:2.5rem;left:50%;transform:translateX(-50%) translateY(20px);background:' + bg + ';color:' + color + ';padding:0.85rem 2rem;font-family:\'Jost\',sans-serif;font-size:0.82rem;letter-spacing:0.1em;box-shadow:0 8px 40px rgba(0,0,0,0.25);z-index:99999;opacity:0;transition:all 0.35s ease;border-radius:2px;white-space:nowrap;';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(20px)'; setTimeout(() => toast.remove(), 350); }, 3500);
}

// Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const booking = document.getElementById('bookingOverlay');
    if (booking && booking.classList.contains('active')) { closeBookingModal(); return; }
    const myb = document.getElementById('myBookingsOverlay');
    if (myb && myb.classList.contains('active')) closeMyBookings();
  }
});

// ===== ALL STYLES =====
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  .active-link { color: var(--gold) !important; }
  .active-link::after { width: 100% !important; }

  .user-badge { position:relative; display:flex; align-items:center; gap:0.6rem; cursor:pointer; padding:0.35rem 0.8rem 0.35rem 0.4rem; border:1px solid rgba(201,168,76,0.3); transition:border-color 0.3s; user-select:none; }
  .user-badge:hover { border-color:var(--gold); }
  .user-avatar { width:32px; height:32px; border-radius:50%; background:var(--gold); color:var(--dark); display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-size:1rem; font-weight:600; flex-shrink:0; }
  .user-meta { display:flex; flex-direction:column; line-height:1.2; }
  .user-name { font-size:0.78rem; color:var(--white); font-weight:500; }
  .user-role { font-size:0.62rem; color:var(--gold); letter-spacing:0.08em; text-transform:uppercase; }
  .user-dropdown { position:absolute; top:calc(100% + 0.8rem); right:0; background:rgba(26,22,18,0.98); border:1px solid rgba(201,168,76,0.2); min-width:230px; padding:0.5rem 0; backdrop-filter:blur(16px); box-shadow:0 20px 50px rgba(0,0,0,0.5); opacity:0; visibility:hidden; transform:translateY(8px); transition:all 0.3s ease; z-index:2000; }
  .user-badge:hover .user-dropdown { opacity:1; visibility:visible; transform:translateY(0); }
  .ud-item { display:flex; align-items:center; gap:0.8rem; padding:0.7rem 1.2rem; font-size:0.8rem; color:rgba(255,255,255,0.7); letter-spacing:0.05em; transition:background 0.2s, color 0.2s; cursor:pointer; }
  .ud-item:hover { background:rgba(201,168,76,0.08); color:var(--gold); }
  .ud-icon { font-size:1rem; flex-shrink:0; }
  .ud-info { cursor:default; flex-direction:column; align-items:flex-start; gap:0.2rem; }
  .ud-info:hover { background:none; color:rgba(255,255,255,0.7); }
  .ud-info strong { display:block; color:var(--white); font-size:0.85rem; }
  .ud-info small { color:rgba(255,255,255,0.4); font-size:0.7rem; }
  .ud-divider { height:1px; background:rgba(201,168,76,0.12); margin:0.3rem 0; }
  .ud-logout { color:rgba(232,120,120,0.85) !important; }
  .ud-logout:hover { background:rgba(232,120,120,0.08) !important; color:#e87878 !important; }

  /* BOOKING OVERLAY */
  #bookingOverlay { position:fixed; inset:0; background:rgba(10,8,6,0.88); backdrop-filter:blur(10px); z-index:9000; display:flex; align-items:center; justify-content:center; opacity:0; visibility:hidden; transition:all 0.4s ease; padding:1rem; }
  #bookingOverlay.active { opacity:1; visibility:visible; }
  .bm-modal { background:linear-gradient(145deg,#1e1a14,#16120d); border:1px solid rgba(201,168,76,0.22); width:100%; max-width:560px; max-height:90vh; overflow-y:auto; animation:slideUp 0.4s ease; position:relative; scrollbar-width:thin; scrollbar-color:rgba(201,168,76,0.2) transparent; }
  @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  .bm-modal::-webkit-scrollbar { width:4px; }
  .bm-modal::-webkit-scrollbar-track { background:transparent; }
  .bm-modal::-webkit-scrollbar-thumb { background:rgba(201,168,76,0.2); }
  .bm-header { display:flex; align-items:center; justify-content:space-between; padding:1.5rem 1.8rem 1rem; border-bottom:1px solid rgba(201,168,76,0.12); position:sticky; top:0; background:#1e1a14; z-index:10; }
  .bm-header h3 { font-family:'Cormorant Garamond',serif; font-size:1.5rem; color:#fff; font-weight:400; }
  .bm-close { background:none; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); font-size:1rem; cursor:pointer; padding:0.3rem 0.5rem; transition:all 0.2s; }
  .bm-close:hover { border-color:#C9A84C; color:#C9A84C; }
  .bm-steps { display:flex; align-items:center; padding:0.8rem 1.8rem; border-bottom:1px solid rgba(201,168,76,0.08); gap:0; }
  .bm-step { display:flex; align-items:center; gap:0.4rem; font-family:'Jost',sans-serif; font-size:0.62rem; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.2); transition:color 0.3s; }
  .bm-step.active { color:#C9A84C; }
  .bm-step.done { color:rgba(201,168,76,0.45); }
  .bm-step-num { width:20px; height:20px; border-radius:50%; border:1px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:0.6rem; flex-shrink:0; }
  .bm-step.done .bm-step-num { background:rgba(201,168,76,0.15); }
  .bm-step-sep { flex:1; height:1px; background:rgba(201,168,76,0.1); margin:0 0.4rem; }
  #bookingBody { padding:1.5rem 1.8rem; }
  .bm-step-title { font-family:'Cormorant Garamond',serif; font-size:1.35rem; font-weight:400; color:#fff; margin-bottom:1.2rem; }
  .bm-field { margin-bottom:1rem; }
  .bm-field label { display:block; font-size:0.62rem; letter-spacing:0.18em; text-transform:uppercase; color:#9e7d2e; margin-bottom:0.4rem; font-weight:500; }
  .bm-input { width:100%; padding:0.72rem 0.9rem; background:rgba(255,255,255,0.04); border:1px solid rgba(201,168,76,0.18); color:#fff; font-family:'Jost',sans-serif; font-size:0.85rem; outline:none; transition:border-color 0.3s, background 0.3s; }
  .bm-input:focus { border-color:#C9A84C; background:rgba(201,168,76,0.05); }
  .bm-input::placeholder { color:rgba(255,255,255,0.2); }
  .bm-textarea { min-height:75px; resize:vertical; }
  .bm-select { width:100%; padding:0.72rem 0.9rem; background:rgba(20,16,12,0.9); border:1px solid rgba(201,168,76,0.18); color:#fff; font-family:'Jost',sans-serif; font-size:0.85rem; outline:none; cursor:pointer; }
  .bm-select option { background:#1e1a14; }
  .bm-field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .bm-preset-tag { padding:0.72rem 0.9rem; background:rgba(201,168,76,0.07); border:1px solid rgba(201,168,76,0.22); color:#C9A84C; font-size:0.85rem; }
  .bm-room-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; }
  .bm-room-card { padding:0.75rem 0.5rem; border:1px solid rgba(201,168,76,0.13); cursor:pointer; transition:all 0.22s; text-align:center; }
  .bm-room-card:hover { border-color:rgba(201,168,76,0.4); background:rgba(201,168,76,0.04); }
  .bm-room-card.selected { border-color:#C9A84C; background:rgba(201,168,76,0.1); }
  .bm-rc-name { font-size:0.68rem; color:rgba(255,255,255,0.65); margin-bottom:0.3rem; line-height:1.3; }
  .bm-rc-price { font-size:0.75rem; color:#C9A84C; font-weight:500; }
  .bm-rc-price small { font-size:0.58rem; opacity:0.7; }
  .bm-price-preview { margin:1rem 0; padding:0.9rem 1rem; background:rgba(201,168,76,0.04); border:1px solid rgba(201,168,76,0.1); }
  .bm-price-row { display:flex; justify-content:space-between; font-size:0.78rem; color:rgba(255,255,255,0.5); padding:0.22rem 0; }
  .bm-price-total { border-top:1px solid rgba(201,168,76,0.15); margin-top:0.3rem; padding-top:0.45rem !important; font-size:0.88rem !important; color:#C9A84C !important; font-weight:500; }
  .bm-price-total span { color:#C9A84C !important; }
  .bm-btn-primary { width:100%; padding:0.88rem; background:#C9A84C; color:#1a1612; border:none; font-family:'Jost',sans-serif; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; cursor:pointer; font-weight:600; transition:all 0.3s; margin-top:0.5rem; }
  .bm-btn-primary:hover:not(:disabled) { background:#e8c97a; transform:translateY(-1px); }
  .bm-btn-primary:disabled { opacity:0.55; cursor:not-allowed; }
  .bm-btn-back { padding:0.88rem 1.3rem; background:none; border:1px solid rgba(201,168,76,0.22); color:rgba(255,255,255,0.45); font-family:'Jost',sans-serif; font-size:0.72rem; letter-spacing:0.1em; cursor:pointer; transition:all 0.3s; margin-top:0.5rem; flex-shrink:0; }
  .bm-btn-back:hover { border-color:#C9A84C; color:#C9A84C; }
  .bm-btn-row { display:flex; gap:0.8rem; }
  .bm-btn-row .bm-btn-primary { flex:1; }
  .bm-booking-summary { background:rgba(255,255,255,0.02); border:1px solid rgba(201,168,76,0.1); padding:1rem; margin:1rem 0; }
  .bm-sum-row { display:flex; justify-content:space-between; font-size:0.76rem; padding:0.28rem 0; color:rgba(255,255,255,0.5); }
  .bm-sum-row span:last-child { color:rgba(255,255,255,0.75); text-align:right; max-width:58%; }
  .bm-sum-total { border-top:1px solid rgba(201,168,76,0.14); margin-top:0.3rem; padding-top:0.45rem !important; color:#C9A84C !important; font-weight:500; font-size:0.84rem !important; }
  .bm-sum-total span { color:#C9A84C !important; }
  .bm-payment-amount { text-align:center; padding:0.8rem; margin-bottom:1rem; }
  .bm-pay-label { display:block; font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:0.3rem; }
  .bm-pay-total { font-family:'Cormorant Garamond',serif; font-size:2.3rem; color:#C9A84C; font-weight:300; }
  .bm-payment-methods { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin-bottom:1.2rem; }
  .bm-pm-option { padding:0.7rem 0.4rem; border:1px solid rgba(201,168,76,0.13); text-align:center; cursor:pointer; font-size:0.68rem; color:rgba(255,255,255,0.45); letter-spacing:0.06em; transition:all 0.22s; display:flex; flex-direction:column; align-items:center; gap:0.28rem; }
  .bm-pm-option span { font-size:1.2rem; }
  .bm-pm-option:hover { border-color:rgba(201,168,76,0.4); color:rgba(255,255,255,0.75); }
  .bm-pm-option.active { border-color:#C9A84C; background:rgba(201,168,76,0.08); color:#C9A84C; }
  .bm-payment-form { animation:fadeIn 0.3s ease; }
  .bm-payment-form.hidden { display:none; }
  .bm-secure-note { font-size:0.68rem; color:rgba(255,255,255,0.28); text-align:center; margin-top:0.8rem; letter-spacing:0.05em; }
  .bm-upi-apps { display:flex; gap:0.5rem; flex-wrap:wrap; margin:0.8rem 0; }
  .bm-upi-app { padding:0.4rem 0.85rem; border:1px solid rgba(201,168,76,0.18); font-size:0.7rem; color:rgba(255,255,255,0.45); cursor:pointer; transition:all 0.2s; letter-spacing:0.06em; }
  .bm-upi-app:hover, .bm-upi-app.selected { border-color:#C9A84C; color:#C9A84C; background:rgba(201,168,76,0.08); }
  .bm-success-step { text-align:center; padding:0.8rem 0 0.5rem; }
  .bm-success-icon { width:72px; height:72px; background:#C9A84C; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.8rem; color:#1a1612; margin:0 auto 1rem; animation:successPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
  @keyframes successPop { from{transform:scale(0)} to{transform:scale(1)} }
  .bm-success-step h3 { font-family:'Cormorant Garamond',serif; font-size:1.9rem; color:#fff; font-weight:400; margin-bottom:0.3rem; }
  .bm-success-sub { font-size:0.78rem; color:rgba(201,168,76,0.65); margin-bottom:1.2rem; letter-spacing:0.08em; }
  .bm-confirmed-details { border:1px solid rgba(201,168,76,0.13); margin:1rem 0; overflow:hidden; text-align:left; }
  .bm-cd-row { display:flex; align-items:center; gap:0.9rem; padding:0.75rem 1rem; border-bottom:1px solid rgba(201,168,76,0.08); }
  .bm-cd-row:last-child { border-bottom:none; }
  .bm-cd-row > span { font-size:1.1rem; flex-shrink:0; }
  .bm-cd-row strong { display:block; color:#fff; font-size:0.82rem; font-weight:500; }
  .bm-cd-row small { color:rgba(255,255,255,0.38); font-size:0.7rem; }
  .bm-confirm-note { font-size:0.72rem; color:rgba(255,255,255,0.35); margin-bottom:1.2rem; }

  /* MY BOOKINGS OVERLAY */
  #myBookingsOverlay { position:fixed; inset:0; background:rgba(10,8,6,0.88); backdrop-filter:blur(10px); z-index:9000; display:flex; align-items:center; justify-content:center; opacity:0; visibility:hidden; transition:all 0.4s ease; padding:1rem; }
  #myBookingsOverlay.active { opacity:1; visibility:visible; }
  .mb-panel { background:linear-gradient(145deg,#1e1a14,#16120d); border:1px solid rgba(201,168,76,0.22); width:100%; max-width:620px; max-height:88vh; overflow-y:auto; animation:slideUp 0.4s ease; scrollbar-width:thin; scrollbar-color:rgba(201,168,76,0.2) transparent; }
  .mb-panel::-webkit-scrollbar { width:4px; }
  .mb-panel::-webkit-scrollbar-thumb { background:rgba(201,168,76,0.2); }
  .mb-header { display:flex; align-items:flex-start; justify-content:space-between; padding:1.5rem 1.8rem 1rem; border-bottom:1px solid rgba(201,168,76,0.12); position:sticky; top:0; background:#1e1a14; z-index:10; }
  .mb-header h3 { font-family:'Cormorant Garamond',serif; font-size:1.7rem; color:#fff; font-weight:400; }
  .mb-header-sub { font-size:0.66rem; color:rgba(255,255,255,0.3); letter-spacing:0.14em; text-transform:uppercase; margin-top:0.18rem; }
  .mb-close { background:none; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); font-size:1rem; cursor:pointer; padding:0.3rem 0.5rem; transition:all 0.2s; flex-shrink:0; }
  .mb-close:hover { border-color:#C9A84C; color:#C9A84C; }
  #myBookingsList { padding:1.2rem 1.8rem; }
  .mb-empty { text-align:center; padding:3rem 1rem; }
  .mb-empty-icon { font-size:3rem; margin-bottom:1rem; opacity:0.35; }
  .mb-empty h4 { font-family:'Cormorant Garamond',serif; font-size:1.5rem; color:#fff; font-weight:400; margin-bottom:0.5rem; }
  .mb-empty p { font-size:0.8rem; color:rgba(255,255,255,0.32); margin-bottom:1.5rem; }
  .mb-booking-card { border:1px solid rgba(201,168,76,0.14); margin-bottom:1rem; overflow:hidden; transition:border-color 0.3s; }
  .mb-booking-card:hover { border-color:rgba(201,168,76,0.32); }
  .mb-booking-header { display:flex; justify-content:space-between; align-items:flex-start; padding:1rem 1.2rem 0.75rem; border-bottom:1px solid rgba(201,168,76,0.08); }
  .mb-booking-id { font-size:0.62rem; letter-spacing:0.14em; color:rgba(201,168,76,0.55); text-transform:uppercase; margin-bottom:0.2rem; }
  .mb-booking-hotel { font-family:'Cormorant Garamond',serif; font-size:1.1rem; color:#fff; font-weight:400; }
  .mb-badge { font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; padding:0.22rem 0.65rem; font-weight:500; flex-shrink:0; }
  .mb-badge-upcoming { background:rgba(201,168,76,0.12); color:#C9A84C; border:1px solid rgba(201,168,76,0.28); }
  .mb-badge-active { background:rgba(46,204,113,0.12); color:#2ecc71; border:1px solid rgba(46,204,113,0.28); }
  .mb-badge-past { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.3); border:1px solid rgba(255,255,255,0.08); }
  .mb-booking-body { display:grid; grid-template-columns:repeat(3,1fr); }
  .mb-booking-detail { display:flex; align-items:flex-start; gap:0.55rem; padding:0.75rem 1rem; border-right:1px solid rgba(201,168,76,0.07); }
  .mb-booking-detail:last-child { border-right:none; }
  .mb-detail-icon { font-size:0.95rem; flex-shrink:0; margin-top:0.1rem; }
  .mb-booking-detail strong { display:block; font-size:0.8rem; color:#fff; font-weight:500; }
  .mb-booking-detail small { font-size:0.66rem; color:rgba(255,255,255,0.32); }
  .mb-cancel-btn { width:100%; padding:0.55rem; background:none; border:none; border-top:1px solid rgba(232,120,120,0.12); color:rgba(232,120,120,0.55); font-family:'Jost',sans-serif; font-size:0.68rem; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
  .mb-cancel-btn:hover { background:rgba(232,120,120,0.04); color:#e87878; }

  .hidden { display:none !important; }

  @media (max-width: 600px) {
    .bm-field-row, .mb-booking-body { grid-template-columns:1fr; }
    .bm-room-cards { grid-template-columns:1fr 1fr; }
    .bm-payment-methods { grid-template-columns:1fr; }
    .mb-booking-detail { border-right:none; border-bottom:1px solid rgba(201,168,76,0.07); }
    .mb-booking-detail:last-child { border-bottom:none; }
  }
`;
document.head.appendChild(styleEl);

console.log('%c✦ Luxury Stay — Ultimate Comfort ✦', 'color:#C9A84C;font-family:serif;font-size:16px;font-style:italic;');
