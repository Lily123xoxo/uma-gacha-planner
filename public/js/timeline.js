function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function formatLocalDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
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
    const walk = (x - startX) * 0.8; // adjust multiplier for weight
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

    // Attach global listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    e.preventDefault(); // prevent text selection
  });
}

// ---- helpers (define once) ----
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

async function loadTimeline() {
  const container = document.querySelector('.timeline-scroll');
  if (!container) return;

  try {
    const [charRes, supportRes] = await Promise.all([
      fetch('/banners/api/character-banners', { credentials: 'same-origin' }),
      fetch('/banners/api/support-banners',   { credentials: 'same-origin' })
    ]);

    const characters = await charRes.json();
    const supports   = await supportRes.json();

    container.innerHTML = '';

    const len = Math.min(characters.length, supports.length);
    if (characters.length !== supports.length) {
      console.warn(`Mismatched data — characters (${characters.length}) vs supports (${supports.length}). Truncating to ${len}.`);
    }

    // ---- Observer: hydrate cards when near viewport ----
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const imgs = e.target.querySelectorAll('img[data-src]');
        imgs.forEach(img => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
        e.target.classList.add('is-hydrated');
        io.unobserve(e.target);
      }
    }, { root: container, rootMargin: '300px 0px', threshold: 0.01 });

    const placeholder = '/images/default.png'; // tiny or existing default

    for (let i = 0; i < len; i++) {
      const charBanner    = characters[i];
      const supportBanner = supports[i];

      const startDateRaw = charBanner.global_actual_date || charBanner.global_est_date;
      const endDateObj   = addDays(startDateRaw, 11);

      const startDate = formatLocalDate(startDateRaw);
      const endDate   = endDateObj
        ? endDateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Unknown';

      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'timeline-card';

      // build card markup (no inline JS)
      cardWrapper.innerHTML = `
        <div class="card select-banner-card" data-index="${i}">
          <div class="card-body">
            <p class="mb-2 date-span">${startDate} → ${endDate}</p>
            <hr class="my-2">

            <div class="banner-section">
              <img
                class="banner-img"
                alt="${charBanner.uma_name}"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
                src="${placeholder}"
                data-src="${charBanner.image_path}">
              <h3 class="mb-2 uma-name">${charBanner.uma_name}</h3>
            </div>

            <div class="banner-section">
              <img
                class="banner-img"
                alt="${supportBanner.support_name}"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
                src="${placeholder}"
                data-src="${supportBanner.image_path}">
              <h3 class="mb-2 support-name">${supportBanner.support_name}</h3>
            </div>
          </div>
        </div>
      `;

      // error fallback (CSP-safe)
      cardWrapper.querySelectorAll('img.banner-img').forEach(img => {
        img.addEventListener('error', function onErr() {
          if (this.src !== location.origin + placeholder && !this.src.endsWith(placeholder)) {
            this.src = placeholder;
          }
        }, { once: false });
      });

      container.appendChild(cardWrapper);
      io.observe(cardWrapper);
    }

    // Drag vs click detection (unchanged)
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

    // Handle banner click
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


function triggerCalculate(characterBanner, supportBanner) {
  const payload = {
    carats: parseInt(document.querySelector('#carats')?.value) || 0,
    clubRank: document.querySelector('#clubRank')?.value || 'C',
    teamTrialsRank: document.querySelector('#teamTrialsRank')?.value || 'Class3',
    champMeeting: parseInt(document.querySelector('#champMeeting')?.value) || 1000,
    monthlyPass: document.querySelector('#monthlyPass')?.checked || false,
    dailyLogin: document.querySelector('#dailyLogin')?.checked || false,
    legendRace: document.querySelector('#legendRace')?.checked || false,
    dailyMission: document.querySelector('#dailyMission')?.checked || false,
    rainbowCleat: document.querySelector('#rainbowCleat')?.checked || false,
    goldCleat: document.querySelector('#goldCleat')?.checked || false,
    silverCleat: document.querySelector('#silverCleat')?.checked || false,
    characterBanner,
    supportBanner
  };

  fetch('/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      const resultsDiv = document.querySelector('#results');
      if (data.errors) {
        resultsDiv.textContent = `Error: ${data.errors.map(e => e.msg).join(', ')}`;
      } else {
        resultsDiv.innerHTML = `
        <div class="result-column">Rolls: ${data.rolls}</div>
        <div class="result-column">Support Tickets: ${data.supportTickets}</div>
        <div class="result-column">Character Tickets: ${data.characterTickets}</div>
      `;
      }
    })
    .catch(err => {
      document.querySelector('#results').textContent = `Calculation failed: ${err.message}`;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadTimeline();
  const container = document.querySelector('.timeline-scroll');
  enableDragScroll(container);
});

let searchMatches = [];
let currentMatchIndex = -1;

function performSearch(query) {
  // Clear previous highlights on inner cards
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

document.querySelector('#timeline-search').addEventListener('input', (e) => {
  performSearch(e.target.value);
});

document.querySelector('#search-next').addEventListener('click', () => {
  if (searchMatches.length === 0) return;
  currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
  scrollToCurrentMatch();
});

document.querySelector('#search-prev').addEventListener('click', () => {
  if (searchMatches.length === 0) return;
  currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
  scrollToCurrentMatch();
});

// Debounced wrapper for triggerCalculate()
const debouncedCalculate = debounce((characterBanner, supportBanner) => {
  triggerCalculate(characterBanner, supportBanner);
}, 400);