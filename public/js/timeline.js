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
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.classList.add('dragging');
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  ['mouseleave', 'mouseup'].forEach(evt => {
    container.addEventListener(evt, () => {
      isDown = false;
      container.classList.remove('dragging');
    });
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  container.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener('touchend', () => isDown = false);

  container.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
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
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="mb-2 uma-name">${charBanner.uma_name}</h6>
            <h6 class="mb-2 support-name">${supportBanner.support_name}</h6>
            <hr class="my-2">
            <p class="mb-3 date-span"><small>${startDate} → ${endDate}</small></p>
            <button class="btn btn-primary btn-sm select-banner-btn" data-index="${i}">
              Select
            </button>
          </div>
        </div>
      `;

      container.appendChild(cardWrapper);
    }

    // Handle selection & trigger calculation
    container.querySelectorAll('.select-banner-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);

        // Clear previous selection
        container.querySelectorAll('.timeline-card .card').forEach(card =>
          card.classList.remove('selected')
        );

        // Highlight current
        e.target.closest('.card').classList.add('selected');

        // Send calculation request
        triggerCalculate(characters[index], supports[index]);
      });
    });

  } catch (err) {
    console.error('Failed to load banners:', err);
  }
}

function triggerCalculate(characterBanner, supportBanner) {
  // Gather form data with safe defaults
  const payload = {
    carats: parseInt(document.querySelector('#carats')?.value) || 0,
    clubRank: document.querySelector('#clubRank')?.value || 'C',
    champMeeting: parseInt(document.querySelector('#champMeeting')?.value) || 0,
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
        // Show validation errors
        resultsDiv.textContent = `Error: ${data.errors.map(e => e.msg).join(', ')}`;
      } else {
        // Show calculation results
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



// Search functionality for timeline

function performSearch(query) {
  // Clear previous highlights
  document.querySelectorAll('.timeline-card.highlight').forEach(el => el.classList.remove('highlight'));

  if (!query) {
    searchMatches = [];
    currentMatchIndex = -1;
    return;
  }

  // Find matches
  const cards = [...document.querySelectorAll('.timeline-card')];
  searchMatches = cards.filter(card =>
    card.textContent.toLowerCase().includes(query.toLowerCase())
  );

  // Highlight matches
  searchMatches.forEach(card => card.classList.add('highlight'));

  // Reset to first match
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
