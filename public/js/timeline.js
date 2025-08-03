async function loadTimeline() {
  try {
    const [charactersRes, supportsRes] = await Promise.all([
      fetch('/banners/characters'),
      fetch('/banners/supports')
    ]);

    const characters = await charactersRes.json();
    const supports = await supportsRes.json();

    const timelineDiv = document.getElementById('timeline');
    timelineDiv.innerHTML = `
      <h3>Characters</h3>
      <ul>${characters.map(c => `<li>${c.uma_name}</li>`).join('')}</ul>

      <h3>Supports</h3>
      <ul>${supports.map(s => `<li>${s.support_name}</li>`).join('')}</ul>
    `;
  } catch (err) {
    console.error('Error loading timeline:', err);
    document.getElementById('timeline').innerHTML = `<p class="text-danger">Failed to load banners.</p>`;
  }
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', loadTimeline);
