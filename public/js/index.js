window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('planner-form');

  // Restore saved data
  const saved = localStorage.getItem('plannerSelections');
  if (saved) {
    const data = JSON.parse(saved);

    // Restore inputs
    document.getElementById('carats').value = data.carats || '';
    document.getElementById('clubRank').value = data.clubRank || '';
    document.getElementById('champMeeting').value = data.champMeeting || '';

    document.getElementById('monthlyPass').checked = data.monthlyPass || false;
    document.getElementById('dailyLogin').checked = data.dailyLogin || false;
    document.getElementById('legendRace').checked = data.legendRace || false;
    document.getElementById('dailyMission').checked = data.dailyMission || false;
    document.getElementById('rainbowCleat').checked = data.rainbowCleat || false;
    document.getElementById('goldCleat').checked = data.goldCleat || false;
    document.getElementById('silverCleat').checked = data.silverCleat || false;

    // Restore banner selection after timeline is rendered
    if (data.characterBanner && data.supportBanner) {
      window.addEventListener('timelineLoaded', () => {
        const cards = document.querySelectorAll('.select-banner-card');
        cards.forEach(card => {
          if (
            card.querySelector('.uma-name').textContent === data.characterBanner.uma_name &&
            card.querySelector('.support-name').textContent === data.supportBanner.support_name
          ) {
            card.classList.add('selected');
          }
        });
      });
    }
  }

  // Auto-save when form fields change
  form.addEventListener('input', () => savePlannerSelections());
  form.addEventListener('change', () => savePlannerSelections());

  // Form submit (still does calculation)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = getPlannerSelections();
    localStorage.setItem('plannerSelections', JSON.stringify(formData));

    const response = await fetch('/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    document.getElementById('result').textContent =
      `You will have ${result.rolls} rolls by this banner and ${result.carats} carats.`;
  });
});

function getPlannerSelections() {
  return {
    carats: Number(document.getElementById('carats').value),
    clubRank: document.getElementById('clubRank').value,
    champMeeting: Number(document.getElementById('champMeeting').value),
    monthlyPass: document.getElementById('monthlyPass').checked,
    dailyLogin: document.getElementById('dailyLogin').checked,
    legendRace: document.getElementById('legendRace').checked,
    dailyMission: document.getElementById('dailyMission').checked,
    rainbowCleat: document.getElementById('rainbowCleat').checked,
    goldCleat: document.getElementById('goldCleat').checked,
    silverCleat: document.getElementById('silverCleat').checked,

    // Banner selections (saved by timeline.js)
    characterBanner: JSON.parse(localStorage.getItem('plannerSelections'))?.characterBanner || null,
    supportBanner: JSON.parse(localStorage.getItem('plannerSelections'))?.supportBanner || null
  };
}

function savePlannerSelections() {
  const current = getPlannerSelections();
  localStorage.setItem('plannerSelections', JSON.stringify(current));
}
