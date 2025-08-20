// components/InputForm.tsx
'use client';

export default function InputForm() {
  return (
    <>
      {/* Full-width section for the form */}
      <section className="form-container">
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
                  // IMPORTANT: do NOT add value={...} here unless you also add onChange
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
                    <option value="SS">SS</option>
                    <option value="Splus">S+</option>
                    <option value="S">S</option>
                    <option value="Aplus">A+</option>
                    <option value="A">A</option>
                    <option value="Bplus">B+</option>
                    <option value="B">B</option>
                    <option value="Cplus">C+</option>
                    <option value="C">C</option>
                    <option value="Dplus">D+</option>
                  </select>
                </div>

                <div className="col dropdown-box">
                  <label htmlFor="teamTrialsRank" className="form-label">Team Trials Class:</label>
                  <select id="teamTrialsRank" name="teamTrialsRank" required className="form-select" defaultValue="">
                    <option value="" disabled>Select a value</option>
                    <option value="Class6">Class 6</option>
                    <option value="Class5">Class 5</option>
                    <option value="Class4">Class 4</option>
                    <option value="Class3">Class 3</option>
                    <option value="Class2">Class 2</option>
                    <option value="Class1">Class 1</option>
                  </select>
                </div>

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
                  <label htmlFor="bonuses" className="form-label">Bonuses:</label>
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
                </div>

                <div className="col-12 col-sm-7 col-lg">
                  <label htmlFor="monthlies" className="form-label">Monthlies:</label>
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
