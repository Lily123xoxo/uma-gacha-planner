// public/js/timeline.js

// ---------- utils ----------
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function formatLocalDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function addDays(dateString, days) {
  if (!dateString) return null;
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

function enableDragScroll(container) {
  let isDragging = false;
  let startX;
  let scrollLeft;

  function onMouseMove(e) {
    if (!isDragging) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 0.8;
    container.scrollLeft = scrollLeft - walk;
  }

  function onMouseUp() {
    isDragging = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    container.style.cursor = 'grab';
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    container.style.cursor = 'grabbing';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    e.preventDefault();
  });
}

// Coalesce likely end-date fields from a banner-like object
function pickEndDateLike(b) {
  if (!b) return null;
  return (
    b.global_actual_end_date ??
    b.global_est_end_date ??
    b.actual_end_date ??
    b.est_end_date ??
    b.end_date ??
    null
  );
}

// Force any date-ish value to "YYYY-MM-DD" (UTC) or null
function toYMDUTC(v) {
  if (v == null) return null;

  if (typeof v === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v.trim());
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }

  if (typeof v === 'number' && isFinite(v)) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  return null;
}


// ---- helpers ----
function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Only allow relative URLs / same-origin
function safeImageSrc(url) {
  try {
    const u = new URL(url, location.origin); // supports relative
    if (u.origin === location.origin) return u.toString();
  } catch {}
  return '/images/default.png';
}

// ---------- small element builder ----------
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  if (!Array.isArray(children)) children = [children];
  for (const c of children) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function buildBannerSection(imgAlt, imgSrc, titleText, placeholder, kind) {
  const img = el('img', {
    class: 'banner-img',
    alt: imgAlt,
    loading: 'lazy',
    decoding: 'async',
    fetchpriority: 'low',
    src: placeholder,
    'data-src': imgSrc
  });

  const title = el('h3', { class: 'mb-2', text: titleText });
  title.classList.add(kind === 'support' ? 'support-name' : 'uma-name');

  const section = el('div', { class: 'banner-section' }, [img, title]);

  img.addEventListener('error', function () {
    if (!this.src.endsWith(placeholder)) this.src = placeholder;
  });

  return section;
}

function buildCard(i, charBanner, supportBanner, startDate, endDate, placeholder) {
  const wrapper = el('div', { class: 'timeline-card' });

  const body = el('div', { class: 'card-body' }, [
    el('p', { class: 'mb-2 date-span', text: `${startDate} → ${endDate}` }),
    el('hr', { class: 'my-2' }),
    buildBannerSection(charBanner.uma_name,     charBanner.image_path,     charBanner.uma_name,     placeholder, 'uma'),
    buildBannerSection(supportBanner.support_name, supportBanner.image_path, supportBanner.support_name, placeholder, 'support')
  ]);

  const card = el('div', { class: 'card select-banner-card', 'data-index': String(i) }, body);
  wrapper.appendChild(card);
  return wrapper;
}

// ---------- calculate ----------
function triggerCalculate(characterBanner, supportBanner) {

  // Build a stable YMD end date for the request (prefer character, then support)
  const rawEnd =
  pickEndDateLike(characterBanner) ??
  pickEndDateLike(supportBanner);
  const bannerEndDate = toYMDUTC(rawEnd); // "YYYY-MM-DD" or null

  const payload = {
    carats: parseInt(document.querySelector('#carats')?.value) || 0,
    clubRank: document.querySelector('#clubRank')?.value || 'C',
    teamTrialsRank: document.querySelector('#teamTrialsRank')?.value || 'Class3',
    champMeeting: parseInt(document.querySelector('#champMeeting')?.value) || 1000,
    characterTickets: parseInt(document.querySelector('#characterTickets')?.value) || 0,
    supportTickets: parseInt(document.querySelector('#supportTickets')?.value) || 0,
    monthlyPass: document.querySelector('#monthlyPass')?.checked || false,
    dailyLogin: document.querySelector('#dailyLogin')?.checked || false,
    legendRace: document.querySelector('#legendRace')?.checked || false,
    dailyMission: document.querySelector('#dailyMission')?.checked || false,
    rainbowCleat: document.querySelector('#rainbowCleat')?.checked || false,
    goldCleat: document.querySelector('#goldCleat')?.checked || false,
    silverCleat: document.querySelector('#silverCleat')?.checked || false,
    bannerEndDate,
    characterBanner,
    supportBanner
  };

  fetch('/api/planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      const resultsDiv = document.querySelector('#results');
      if (!resultsDiv) return;

      // clear safely
      resultsDiv.textContent = '';

      if (data.errors) {
        resultsDiv.appendChild(el('div', { class: 'result-column', text: `Error: ${data.errors.map(e => e.msg).join(', ')}` }));
        return;
      }

      resultsDiv.appendChild(el('div', { class: 'result-column', text: `Rolls: ${data.rolls}` }));
      resultsDiv.appendChild(el('div', { class: 'result-column', text: `Support Tickets: ${data.supportTickets}` }));
      resultsDiv.appendChild(el('div', { class: 'result-column', text: `Character Tickets: ${data.characterTickets}` }));
    })
    .catch(err => {
      const resultsDiv = document.querySelector('#results');
      if (resultsDiv) resultsDiv.textContent = `Calculation failed: ${err.message}`;
    });
}

const debouncedCalculate = debounce((characterBanner, supportBanner) => {
  triggerCalculate(characterBanner, supportBanner);
}, 600);

// ---------- search ----------
let searchMatches = [];
let currentMatchIndex = -1;

function performSearch(query) {
  // Clear previous highlights
  document.querySelectorAll('.timeline-card .card.highlight').forEach(el =>
    el.classList.remove('highlight')
  );

  if (!query) {
    searchMatches = [];
    currentMatchIndex = -1;
    return;
  }

  const cards = [...document.querySelectorAll('.timeline-card')];
  searchMatches = cards.filter(card =>
    card.textContent.toLowerCase().includes(query.toLowerCase())
  );

  searchMatches.forEach(card =>
    card.querySelector('.card').classList.add('highlight')
  );

  currentMatchIndex = searchMatches.length > 0 ? 0 : -1;
  scrollToCurrentMatch();
}

function scrollToCurrentMatch() {
  if (currentMatchIndex === -1) return;
  const card = searchMatches[currentMatchIndex];
  card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

// ---------- timeline load ----------
async function loadTimeline() {
  const container = document.querySelector('.timeline-scroll');
  if (!container) return;

  try {

    const res = await fetch(`/api/banners`, { credentials: 'same-origin' });
    const { characters, supports } = await res.json();

    container.textContent = '';

    // Lazy load when card enters viewport
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const imgs = e.target.querySelectorAll('img[data-src]');
        imgs.forEach(img => {
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
        });
        e.target.classList.add('is-hydrated');
        io.unobserve(e.target);
      }
    }, { root: container, rootMargin: '300px 0px', threshold: 0.01 });

    const placeholder = "/images/placeholder.png";

    for (let i = 0; i < len; i++) {
      const charBanner    = characters[i];
      const supportBanner = supports[i];

      const startDateRaw = charBanner.global_actual_date || charBanner.global_est_date;
      const endDateRaw   = charBanner.global_actual_end_date || charBanner.global_est_end_date;

      const startDate = startDateRaw ? formatLocalDate(startDateRaw) : 'Unknown';
      const endDate   = endDateRaw   ? formatLocalDate(endDateRaw)   : 'Unknown';

      const cardWrapper = buildCard(i, charBanner, supportBanner, startDate, endDate, placeholder);

      container.appendChild(cardWrapper);
      io.observe(cardWrapper);
    }

    // Drag vs click detection
    let dragStartX = 0;
    let isDragging = false;
    const dragThreshold = 15;

    container.addEventListener('mousedown', (e) => {
      dragStartX = e.clientX;
      isDragging = false;
    });
    container.addEventListener('mousemove', (e) => {
      if (Math.abs(e.clientX - dragStartX) > dragThreshold) isDragging = true;
    });

    // Click to select + calculate
    container.addEventListener('click', (e) => {
      const card = e.target.closest('.select-banner-card');
      if (!card || isDragging) return;

      const index = parseInt(card.dataset.index, 10);

      container.querySelectorAll('.timeline-card .card')
        .forEach(el => el.classList.remove('selected', 'calculating'));

      card.classList.add('selected', 'calculating');

      const saved = JSON.parse(localStorage.getItem('plannerSelections')) || {};
      saved.characterBanner = characters[index];
      saved.supportBanner   = supports[index];
      localStorage.setItem('plannerSelections', JSON.stringify(saved));

      debouncedCalculate(characters[index], supports[index]);
    });

    window.dispatchEvent(new Event('timelineLoaded'));
  } catch (err) {
    console.error('Failed to load banners:', err);
  }
}

// ---------- boot ----------
async function initTimeline() {
  await loadTimeline();

  // search wiring
  const input = document.querySelector('#timeline-search');
  const prev  = document.querySelector('#search-prev');
  const next  = document.querySelector('#search-next');

  if (input) input.addEventListener('input', (e) => performSearch(e.target.value));
  if (next)  next.addEventListener('click', () => {
    if (!searchMatches.length) return;
    currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
    scrollToCurrentMatch();
  });
  if (prev)  prev.addEventListener('click', () => {
    if (!searchMatches.length) return;
    currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    scrollToCurrentMatch();
  });

  const container = document.querySelector('.timeline-scroll');
  if (container) enableDragScroll(container);
}

// Run now if DOM is ready; otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTimeline, { once: true });
} else {
  initTimeline();
}
