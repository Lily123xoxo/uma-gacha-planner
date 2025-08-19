(function () {
  function safeParse(json) {
    try { return JSON.parse(json); } catch { return null; }
  }

  function loadSaved() {
    const savedRaw = localStorage.getItem('plannerSelections');
    const saved = safeParse(savedRaw) || {};

    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
    const setNum = (id, v) => { const el = document.getElementById(id); if (el) el.value = (v ?? '') === '' ? '' : Number(v); };
    const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };

    setNum('carats', saved.carats);
    setVal('clubRank', saved.clubRank);
    setVal('teamTrialsRank', saved.teamTrialsRank);
    setVal('champMeeting', saved.champMeeting);
    setNum('characterTickets', saved.characterTickets);
    setNum('supportTickets', saved.supportTickets);
    setChk('monthlyPass', saved.monthlyPass);
    setChk('dailyLogin', saved.dailyLogin);
    setChk('legendRace', saved.legendRace);
    setChk('dailyMission', saved.dailyMission);
    setChk('rainbowCleat', saved.rainbowCleat);
    setChk('goldCleat', saved.goldCleat);
    setChk('silverCleat', saved.silverCleat);
  }

  function getPlannerSelections() {
    const prev = safeParse(localStorage.getItem('plannerSelections')) || {};
    const byId = (id) => document.getElementById(id);

    return {
      carats: Number(byId('carats')?.value || 0),
      clubRank: byId('clubRank')?.value || '',
      teamTrialsRank: byId('teamTrialsRank')?.value || '',
      champMeeting: Number(byId('champMeeting')?.value || 0),
      characterTickets: Number(byId('characterTickets')?.value || 0),
      supportTickets: Number(byId('supportTickets')?.value || 0),
      monthlyPass: !!byId('monthlyPass')?.checked,
      dailyLogin: !!byId('dailyLogin')?.checked,
      legendRace: !!byId('legendRace')?.checked,
      dailyMission: !!byId('dailyMission')?.checked,
      rainbowCleat: !!byId('rainbowCleat')?.checked,
      goldCleat: !!byId('goldCleat')?.checked,
      silverCleat: !!byId('silverCleat')?.checked,
      characterBanner: prev.characterBanner || null,
      supportBanner: prev.supportBanner || null,
    };
  }

  function savePlannerSelections() {
    localStorage.setItem('plannerSelections', JSON.stringify(getPlannerSelections()));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const formData = getPlannerSelections();
    localStorage.setItem('plannerSelections', JSON.stringify(formData));

    const response = await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    const resultEl = document.getElementById('result');
    if (resultEl) {
      resultEl.textContent =
        `You will have ${result.rolls} rolls by this banner and ${result.carats} carats.`;
    }
  }

  function init() {
    const form = document.getElementById('planner-form');
    if (!form) return;

    loadSaved();

    form.addEventListener('input', savePlannerSelections);
    form.addEventListener('change', savePlannerSelections);
    form.addEventListener('submit', onSubmit);
  }

  // Ensure init runs whether the script loads before or after DOMContentLoaded
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
