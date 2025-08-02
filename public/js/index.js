window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('planner-form');
  
  // load data from cookie
  const saved = localStorage.getItem('plannerSelections');
  if (saved) {
    const data = JSON.parse(saved);

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
  }
  
  // ajax post for handling form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clubRankValue = document.getElementById('clubRank').value;
    const champMeetingValue = document.getElementById('champMeeting').value;

    const formData = {
      carats: Number(document.getElementById('carats').value),
      clubRank: clubRankValue,
      champMeeting: Number(champMeetingValue),
      monthlyPass: document.getElementById('monthlyPass').checked,
      dailyLogin: document.getElementById('dailyLogin').checked,
      legendRace: document.getElementById('legendRace').checked,
      dailyMission: document.getElementById('dailyMission').checked,
      rainbowCleat: document.getElementById('rainbowCleat').checked,
      goldCleat: document.getElementById('goldCleat').checked,
      silverCleat: document.getElementById('silverCleat').checked
    };

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