import Script from 'next/script';

export default function Timeline() {
  return (
    <>
      {/* Row containing title and search */}
      <div className="d-flex justify-content-between align-items-center banner-search">
        <div className="banner-title-wrapper">
          <h2 className="banner-title">
            <span className="gradient-text">Banner Timeline</span>
            </h2>
        </div>

        {/* Results output */}
          <div id="results">
            <div className="result-column">Rolls: 0</div>
            <div className="result-column">Support Tickets: 0</div>
            <div className="result-column">Character Tickets: 0</div>
          </div>

        {/* Search Bar */}
        <div className="input-group search-bar">
          <input
            type="text" 
            id="timeline-search" 
            className="form-control" 
            placeholder="Search character..."
            aria-label="Search character"
          />
          <button id="search-prev" className="btn search-btn" type="button" aria-label="Previous">
            <i className="bi bi-arrow-left"></i>
          </button>
          <button id="search-next" className="btn search-btn" type="button" aria-label="Next">
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>

      <div className="timeline-wrapper">
          <div className="timeline-scroll">
            {/* Cards injected here */}
          </div>
      </div>

      {/* Timeline JS */}
      <Script src="/js/timeline.js" strategy="afterInteractive" />
    </>
  );
}
