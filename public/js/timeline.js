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

async function loadTimeline() {
  try {
    const [charRes, supportRes] = await Promise.all([
      fetch('/banners/api/character-banners'),
      fetch('/banners/api/support-banners')
    ]);

    const characters = await charRes.json();
    const supports = await supportRes.json();

    const container = document.querySelector('.timeline-scroll');
    container.textContent = '';

    if (!Array.isArray(characters) || !Array.isArray(supports)) {
      console.warn('Unexpected response shape for banners.');
      return;
    }

    const len = Math.min(characters.length, supports.length);
    if (characters.length !== supports.length) {
      console.warn(
        `Warning: Mismatched data — characters (${characters.length}) vs supports (${supports.length}). Truncating to ${len}.`
      );
    }

    // Simple allowlist for image URLs (adjust as needed)
    const isSafeImgUrl = (u) => {
      try {
        const url = new URL(u, location.origin); // resolves relative paths
        return (
          url.origin === location.origin ||
          url.hostname.endsWith('gametora.com') ||
          url.hostname.endsWith('yourcdn.example') // <- edit if you use a CDN
        );
      } catch {
        return false;
      }
    };

    const toLocalDate = (d) => {
      if (!d) return 'Unknown';
      const dt = new Date(d);
      if (Number.isNaN(+dt)) return 'Unknown';
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const addDays = (d, n) => {
      const dt = new Date(d);
      if (Number.isNaN(+dt)) return null;
      dt.setDate(dt.getDate() + n);
      return dt;
    };

    for (let i = 0; i < len; i++) {
      const charBanner = characters[i] ?? {};
      const supportBanner = supports[i] ?? {};

      const startDateRaw = charBanner.global_actual_date || charBanner.global_est_date;
      const endDateObj = addDays(startDateRaw, 11);
      const startDate = toLocalDate(startDateRaw);
      const endDate = endDateObj ? toLocalDate(endDateObj) : 'Unknown';

      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'timeline-card';

      const card = document.createElement('div');
      card.className = 'card select-banner-card';
      card.dataset.index = String(i);

      const body = document.createElement('div');
      body.className = 'card-body';

      const dateP = document.createElement('p');
      dateP.className = 'mb-2 date-span';
      dateP.textContent = `${startDate} → ${endDate}`;

      const hr = document.createElement('hr');
      hr.className = 'my-2';

      // Character banner section
      const charSec = document.createElement('div');
      charSec.className = 'banner-section';

      const charImg = document.createElement('img');
      charImg.className = 'banner-img';
      charImg.alt = String(charBanner.uma_name || 'Character Banner');
      if (isSafeImgUrl(charBanner.image_path)) {
        charImg.src = new URL(charBanner.image_path, location.origin).toString();
      } else {
        charImg.src = '/images/default.png';
      }
      charImg.addEventListener('error', () => { charImg.src = '/images/default.png'; });

      const charH3 = document.createElement('h3');
      charH3.className = 'mb-2 uma-name';
      charH3.textContent = String(charBanner.uma_name || 'Unknown');

      charSec.append(charImg, charH3);

      // Support banner section
      const suppSec = document.createElement('div');
      suppSec.className = 'banner-section';

      const suppImg = document.createElement('img');
      suppImg.className = 'banner-img';
      suppImg.alt = String(supportBanner.support_name || 'Support Banner');
      if (isSafeImgUrl(supportBanner.image_path)) {
        suppImg.src = new URL(supportBanner.image_path, location.origin).toString();
      } else {
        suppImg.src = '/images/default.png';
      }
      suppImg.addEventListener('error', () => { suppImg.src = '/images/default.png'; });

      const suppH3 = document.createElement('h3');
      suppH3.className = 'mb-2 support-name';
      suppH3.textContent = String(supportBanner.support_name || 'Unknown');

      suppSec.append(suppImg, suppH3);

      body.append(dateP, hr, charSec, suppSec);
      card.append(body);
      cardWrapper.append(card);
      container.append(cardWrapper);
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

    container.addEventListener('click', (e) => {
      const cardEl = e.target.closest('.select-banner-card');
      if (cardEl && !isDragging) {
        const index = Number(cardEl.dataset.index);

        container.querySelectorAll('.timeline-card .card')
          .forEach(el => el.classList.remove('selected', 'calculating'));

        cardEl.classList.add('selected', 'calculating');

        const saved = JSON.parse(localStorage.getItem('plannerSelections') || '{}');
        saved.characterBanner = characters[index];
        saved.supportBanner = supports[index];
        localStorage.setItem('plannerSelections', JSON.stringify(saved));

        debouncedCalculate(characters[index], supports[index]);
      }
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