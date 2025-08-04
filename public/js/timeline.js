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
      fetch(`/banners/api/character-banners`),
      fetch(`/banners/api/support-banners`)
    ]);

    const characters = await charRes.json();
    const supports = await supportRes.json();

    const container = document.querySelector('.timeline-scroll');
    container.innerHTML = '';

    for (let i = 0; i < characters.length; i++) {
      const charBanner = characters[i];
      const supportBanner = supports[i];

      const startDateRaw = charBanner.global_actual_date || charBanner.global_est_date;
      const endDateObj = addDays(startDateRaw, 11);

      const startDate = formatLocalDate(startDateRaw);
      const endDate = endDateObj
        ? endDateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Unknown';

      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'timeline-card';

      cardWrapper.innerHTML = `
        <div class="card shadow-sm select-banner-card" data-index="${i}" style="min-height: 15rem; max-width: 20rem;">
          <div class="card-body">
            <p class="mb-3 date-span"><small>${startDate} → ${endDate}</small></p>
            <hr class="my-2">
            <h6 class="mb-2 uma-name">${charBanner.uma_name}</h6>
            <h6 class="mb-2 support-name">${supportBanner.support_name}</h6>
          </div>
        </div>
      `;

      container.appendChild(cardWrapper);
    }

    // Drag vs click detection
    let dragStartX = 0;
    let isDragging = false;
    const dragThreshold = 5;

    container.addEventListener('mousedown', (e) => {
      dragStartX = e.clientX;
      isDragging = false;
    });

    container.addEventListener('mousemove', (e) => {
      if (Math.abs(e.clientX - dragStartX) > dragThreshold) {
        isDragging = true;
      }
    });

    // Handle banner click
    container.addEventListener('click', (e) => {
  const card = e.target.closest('.select-banner-card');
  if (card && !isDragging) {
    const index = parseInt(card.dataset.index, 10);

    // Clear previous selection and animations
    container.querySelectorAll('.timeline-card .card').forEach(cardEl =>
      cardEl.classList.remove('selected', 'calculating')
    );

    card.classList.add('selected', 'calculating');

    // Save banner selection
    const saved = JSON.parse(localStorage.getItem('plannerSelections')) || {};
    saved.characterBanner = characters[index];
    saved.supportBanner = supports[index];
    localStorage.setItem('plannerSelections', JSON.stringify(saved));

    // Trigger debounced calculate (server call still happens)
    debouncedCalculate(characters[index], supports[index]);
  }
});

    // Emit event for index.js to restore banner highlight
    const event = new Event('timelineLoaded');
    window.dispatchEvent(event);

  } catch (err) {
    console.error('Failed to load banners:', err);
  }
}

function triggerCalculate(characterBanner, supportBanner) {
  // Gather form data with safe defaults
  const payload = {
    carats: parseInt(document.querySelector('#carats')?.value) || 0,
    clubRank: document.querySelector('#clubRank')?.value || 'C',
    champMeeting: parseInt(document.querySelector('#champMeeting')?.value) || 1000,
    monthlyPass: document.querySelector('#monthlyPass')?.checked || false,
    dailyLogin: document.querySelector('#dailyLogin')?.checked || false,
    legendRace: document.querySelector('#legendRace')?.checked || false,
    dailyMission: document.querySelector('#dailyMission')?.checked || false,
    rainbowCleat: document.querySelector('#rainbowCleat')?.checked || false,
    goldCleat: document.querySelector('#goldCleat')?.checked || false,
    silverCleat: document.querySelector('#silverCleat')?.checked || false,

    // Banner selection
    characterBanner,
    supportBanner
  };

  // Call API
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
        resultsDiv.textContent = `Rolls: ${data.rolls} (${data.carats} carats) | 
          Support Tickets: ${data.supportTickets} | 
          Character Tickets: ${data.characterTickets}`;
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

  // Get all timeline-card wrappers
  const cards = [...document.querySelectorAll('.timeline-card')];

  // Filter matches by text content
  searchMatches = cards.filter(card =>
    card.textContent.toLowerCase().includes(query.toLowerCase())
  );

  // Highlight inner .card of matched results
  searchMatches.forEach(card =>
    card.querySelector('.card').classList.add('highlight')
  );

  // Reset to first match and scroll
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

// Debounced version of triggerCalculate
const debouncedCalculate = debounce((characterBanner, supportBanner) => {
  triggerCalculate(characterBanner, supportBanner);
}, 400);