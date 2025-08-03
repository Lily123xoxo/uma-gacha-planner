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

  // Mouse down
  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.classList.add('dragging');
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  // Mouse leave/up
  ['mouseleave', 'mouseup'].forEach(evt => {
    container.addEventListener(evt, () => {
      isDown = false;
      container.classList.remove('dragging');
    });
  });

  // Mouse move
  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // Adjust speed
    container.scrollLeft = scrollLeft - walk;
  });

  // Touch events for mobile
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
    // Fetch both character and support banners
    const [charRes, supportRes] = await Promise.all([
      fetch(`/banners/api/character-banners`),
      fetch(`/banners/api/support-banners`)
    ]);

    const characters = await charRes.json();
    const supports = await supportRes.json();

    const container = document.querySelector('.timeline-scroll');
    container.innerHTML = ''; // reset container

    for (let i = 0; i < characters.length; i++) {
      const charBanner = characters[i];
      const supportBanner = supports[i];

      // Pick correct global start date
      const startDateRaw = charBanner.global_actual_date || charBanner.global_est_date;
      
      // Calculate end date = start + 11 days
      const endDateObj = addDays(startDateRaw, 11);

      const startDate = formatLocalDate(startDateRaw);
      const endDate = endDateObj ? endDateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown';

      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'timeline-card';

      cardWrapper.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="mb-2">${charBanner.uma_name}</h6>
            <p class="mb-1 text-muted small">${supportBanner.support_name}</p>
            <hr class="my-2">
            <p class="mb-0"><small>${startDate} → ${endDate}</small></p>
          </div>
        </div>
      `;

      container.appendChild(cardWrapper);
    }
  } catch (err) {
    console.error('Failed to load banners:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadTimeline();
  const container = document.querySelector('.timeline-scroll');
  enableDragScroll(container);
});