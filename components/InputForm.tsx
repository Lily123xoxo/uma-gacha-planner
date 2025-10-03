'use client';

export default function InputForm() {
  return (
    <>
      <p className="lead text-center mb-3 mt-3">
        Plan your pulls with Uma Planner — a free, easy-to-use timeline and tracker for Uma Musume banners. <br></br>
        Updated with the latest carat values as of 24 September 2025. <br></br>
        Club values will be updated when new carat values are confirmed. <br></br>
        N.B. The end date of is used banners for calculations.
      </p>
      

      {/* Full-width section for the form */}
      <section className="form-container" data-nosnippet>
        <form id="planner-form" className="form-wrapper card rounded p-4 pb-3">
          <div className="row g-4 align-items-start">
  
            {/* Current Stockpiles (Warchest) */}
            <div className="col-12 col-lg-4 d-flex flex-column">
              <section className="stockpile-card flex-grow-1">
                <h2 className="h2-form-titles mb-3 warchest">My Warchest</h2>

                {/* Current Carats */}
                <label htmlFor="carats" className="form-label text-end">Carats:</label>
                <input
                  type="number"
                  min={0}
                  id="carats"
                  name="carats"
                  required
                  className="form-control mb-3"
                  // IMPORTANT: do NOT add value={...} here
                  // leave it uncontrolled so index.js can set .value at runtime
                />

                {/* Tickets */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-sm-6 d-flex flex-column">
                    <label htmlFor="characterTickets" className="form-label">Uma tickets:</label>
                    <input
                      type="number"
                      min={0}
                      defaultValue={0}
                      id="characterTickets"
                      name="characterTickets"
                      required
                      className="form-control ticket-input"
                    />
                  </div>
                  <div className="col-12 col-sm-6 d-flex flex-column">
                    <label htmlFor="supportTickets" className="form-label">Support tickets:</label>
                    <input
                      type="number"
                      min={0}
                      defaultValue={0}
                      id="supportTickets"
                      name="supportTickets"
                      required
                      className="form-control ticket-input"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Right-hand side content */}
            <div className="col-12 col-lg">
              {/* Row 1: dropdowns */}
              <div className="row row-cols-1 row-cols-md-3 g-4 mb-4 selectors-row">
                <div className="col dropdown-box">
                  <label htmlFor="clubRank" className="form-label">Club Rank:</label>
                  <select id="clubRank" name="clubRank" required className="form-select" defaultValue="">
                    <option value="" disabled>Select a value</option>
                    <option value="SS">SS (4500)</option>
                    <option value="Splus">S+ (3600)</option>
                    <option value="S">S (3150)</option>
                    <option value="Aplus">A+ (2700)</option>
                    <option value="A">A (2250)</option>
                    <option value="Bplus">B+ (1800)</option>
                    <option value="B">B (1350)</option>
                    <option value="Cplus">C+ (900)</option>
                    <option value="C">C (450)</option>
                    <option value="Dplus">D+ (225)</option>
                  </select>
                </div>

                <div className="col dropdown-box">
                  <label htmlFor="teamTrialsRank" className="form-label">Team Trials Class:</label>
                  <select id="teamTrialsRank" name="teamTrialsRank" required className="form-select" defaultValue="">
                    <option value="" disabled>Select a value</option>
                    <option value="Class6">Class 6 (375)</option>
                    <option value="Class5">Class 5 (225)</option>
                    <option value="Class4">Class 4 (150)</option>
                    <option value="Class3">Class 3 (75)</option>
                    <option value="Class2">Class 2 (35)</option>
                    <option value="Class1">Class 1 (0)</option>
                  </select>
                </div>


                {/* Flow for CM still to be implemented in drop down: r1 [groupA or B] -> [Group A finals or B finals or bow out] -> [Group a position or group B position]
                  Therefore: possible rewards are: group A 1st, 2nd, 3rd; group B 1st, 2nd, 3rd; group A or group B bow out
                  Also possible to go group A then win 1-2 for group B
                  implementation to follow after carat values are known
                */}

                <div className="col dropdown-box">
                  <label htmlFor="champMeeting" className="form-label">Champions Meeting:</label>
                  <select id="champMeeting" name="champMeeting" required className="form-select" defaultValue="">
                    <option value="" disabled>Select a value</option>
                    <option value="2500">2500</option>
                    <option value="1800">1800</option>
                    <option value="1200">1200</option>
                    <option value="1000">1000</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Bonus Income + Monthly Purchases */}
              <div className="row g-4 booleans-row">
                <div className="col-12 col-sm-5 col-lg-5">
                  <fieldset className="form-group">
                    <legend className="form-label">Bonuses</legend>

                    <div className="form-check">
                      <input type="checkbox" id="dailyLogin" name="dailyLogin" className="form-check-input" />
                      <label htmlFor="dailyLogin" className="form-check-label">Daily login</label>
                    </div>

                    <div className="form-check">
                      <input type="checkbox" id="legendRace" name="legendRace" className="form-check-input" />
                      <label htmlFor="legendRace" className="form-check-label">Legend races</label>
                    </div>

                    <div className="form-check">
                      <input type="checkbox" id="dailyMission" name="dailyMission" className="form-check-input" />
                      <label htmlFor="dailyMission" className="form-check-label">Daily missions</label>
                    </div>
                  </fieldset>
                </div>

                <div className="col-12 col-sm-7 col-lg">
                  <fieldset className="form-group">
                    <legend className="form-label">Monthlies</legend>

                    <div className="form-check">
                      <input type="checkbox" id="monthlyPass" name="monthlyPass" className="form-check-input" />
                      <label htmlFor="monthlyPass" className="form-check-label">Daily carat pass</label>
                    </div>

                    <div className="form-check">
                      <input type="checkbox" id="silverCleat" name="silverCleat" className="form-check-input" />
                      <label htmlFor="silverCleat" className="form-check-label">Silver cleats tickets</label>
                    </div>

                    <div className="form-check">
                      <input type="checkbox" id="goldCleat" name="goldCleat" className="form-check-input" />
                      <label htmlFor="goldCleat" className="form-check-label">Gold cleats tickets</label>
                    </div>

                    <div className="form-check">
                      <input type="checkbox" id="rainbowCleat" name="rainbowCleat" className="form-check-input" />
                      <label htmlFor="rainbowCleat" className="form-check-label">Rainbow cleats tickets</label>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Result Display */}
      <aside id="result" className="mt-3" aria-live="polite"></aside>
    </>
  );
}
