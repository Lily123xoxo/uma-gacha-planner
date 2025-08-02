document.getElementById('planner-form').addEventListener('submit', async (e) => {
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

  const response = await fetch('/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const result = await response.json();
  document.getElementById('result').textContent =
  `You will have ${result.rolls} rolls by this banner and ${result.carats} carats.`;
});
