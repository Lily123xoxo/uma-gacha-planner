// services/gachaService.js

// ======== CONFIG (UTC) ========
const RESET_UTC_HOUR = 15;  // daily reset 15:00 UTC
const RESET_UTC_MIN = 0;
const WEEKLY_RESET_DOW = 1; // Monday

// ======== REWARD MAPS / CONSTANTS ========
const clubRankMap = {
  SS: 3000, Splus: 2400, S: 2100, Aplus: 1800, A: 1500,
  Bplus: 1200, B: 900, Cplus: 600, C: 300, Dplus: 150
};

const teamTrialsRankMap = {
  Class6: 250, Class5: 150, Class4: 100, Class3: 50, Class2: 25, Class1: 0
};

const CARATS_PER_ROLL = 150;
const WEEKLY_LOGIN_CARATS = 110;
const MONTHLY_PASS_DAILY_CARATS = 50;
const MONTHLY_PASS_IMMEDIATE_CARATS = 500;
const DAILY_MISSION_CARATS = 30;
const LEGEND_RACE_MONTHLY_CARATS = 1000;

// ======== UTC HELPERS ========
const MS_PER_DAY = 86400000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function toUTCDate(d = new Date()) {
  return new Date(Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
  ));
}

// Accepts "YYYY-MM-DD", ISO, or "YYYY-MM-DD HH:mm:ss" → returns first 10 chars.
function normalizeToYMD(str) {
  if (typeof str !== 'string') return null;
  const s = str.trim();
  if (s.length < 10) return null;
  return s.slice(0, 10); // "YYYY-MM-DD"
}

function parseYYYYMMDD(str) {
  const ymd = normalizeToYMD(str);
  if (!ymd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;

  const y = +m[1], mm = +m[2], dd = +m[3];
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  const d = new Date(Date.UTC(y, mm - 1, dd, 0, 0, 0, 0));
  if (d.getUTCFullYear() !== y || d.getUTCMonth() !== (mm - 1) || d.getUTCDate() !== dd) {
    return null;
  }
  return { year: y, month: mm, day: dd };
}

// Build end instant as 21:59 UTC on that day
function endInstantFromLastDayUTC(lastDayStr) {
  const parts = parseYYYYMMDD(lastDayStr);
  if (!parts) return null;
  const { year, month, day } = parts;
  return new Date(Date.UTC(year, month - 1, day, 21, 59, 0, 0));
}

function nextDailyReset(afterUtc) {
  const base = new Date(Date.UTC(
    afterUtc.getUTCFullYear(), afterUtc.getUTCMonth(), afterUtc.getUTCDate(),
    RESET_UTC_HOUR, RESET_UTC_MIN, 0, 0
  ));
  if (base <= afterUtc) base.setUTCDate(base.getUTCDate() + 1);
  return base;
}

function countDailyTicks(fromUtc, toUtc) {
  if (toUtc <= fromUtc) return 0;
  let tick = nextDailyReset(fromUtc);
  if (tick > toUtc) return 0;
  return 1 + Math.floor((toUtc - tick) / MS_PER_DAY);
}

function countWeeklyTicks(fromUtc, toUtc) {
  if (toUtc <= fromUtc) return 0;
  let tick = nextDailyReset(fromUtc);
  if (tick > toUtc) return 0;

  const deltaDays = (WEEKLY_RESET_DOW - tick.getUTCDay() + 7) % 7;
  if (deltaDays > 0) tick = new Date(tick.getTime() + deltaDays * MS_PER_DAY);
  if (tick > toUtc) return 0;

  return 1 + Math.floor((toUtc - tick) / MS_PER_WEEK);
}

function countMonthlyTicksUTC(fromUtc, toUtc) {
  if (toUtc <= fromUtc) return 0;
  let tick = nextDailyReset(fromUtc);
  if (tick > toUtc) return 0;

  let count = 0;
  while (tick <= toUtc) {
    if (tick.getUTCDate() === 1) count++;
    tick = new Date(tick.getTime() + MS_PER_DAY);
  }
  return count;
}

// ======== CALC HELPERS ========
function calculateMonthlyCarats(options, monthsCrossed) {
  let carats = 0, supportTicketsGain = 0, characterTicketsGain = 0;
  for (let i = 0; i < monthsCrossed; i++) {
    carats += clubRankMap[options.clubRank] || 0;
    carats += options.champMeeting || 0;
    if (options.monthlyPass) carats += MONTHLY_PASS_IMMEDIATE_CARATS;
    if (options.legendRace) carats += LEGEND_RACE_MONTHLY_CARATS;
    if (options.rainbowCleat) { supportTicketsGain += 2; characterTicketsGain += 2; }
    if (options.goldCleat)   { supportTicketsGain += 2; characterTicketsGain += 2; }
    if (options.silverCleat) { supportTicketsGain += 2; characterTicketsGain += 2; }
  }
  return { carats, supportTickets: supportTicketsGain, characterTickets: characterTicketsGain };
}

function calculateWeeklyCarats(options, weeksCrossed) {
  let carats = 0;
  if (options.dailyLogin) carats += WEEKLY_LOGIN_CARATS * weeksCrossed;
  carats += (teamTrialsRankMap[options.teamTrialsRank] || 0) * weeksCrossed;
  return carats;
}

function calculateDailyCarats(options, daysCrossed) {
  let carats = 0;
  if (options.monthlyPass) carats += MONTHLY_PASS_DAILY_CARATS * daysCrossed;
  if (options.dailyMission) carats += DAILY_MISSION_CARATS * daysCrossed;
  return carats;
}

// ======== MAIN ========
function calculateRolls(options) {
  const lastDay = options.bannerEndDate; // string; we accept ISO or 'YYYY-MM-DD'
  let totalCarats = options.carats || 0;
  let supportTickets = options.supportTickets || 0;
  let characterTickets = options.characterTickets || 0;

  if (!lastDay) {
    return { rolls: Math.floor(totalCarats / CARATS_PER_ROLL), carats: totalCarats, supportTickets, characterTickets };
  }

  const nowUtc = toUTCDate(new Date());
  const endUtc = endInstantFromLastDayUTC(lastDay);

  // TEMP: debug if needed
  // console.log('[gachaService] nowUtc:', nowUtc.toISOString(), 'endUtc:', endUtc?.toISOString(), 'raw:', lastDay);

  if (!endUtc || isNaN(endUtc.getTime()) || endUtc <= nowUtc) {
    return { rolls: Math.floor(totalCarats / CARATS_PER_ROLL), carats: totalCarats, supportTickets, characterTickets };
  }

  const dailyTicks   = countDailyTicks(nowUtc, endUtc);
  const weeklyTicks  = countWeeklyTicks(nowUtc, endUtc);
  const monthlyTicks = countMonthlyTicksUTC(nowUtc, endUtc);

  const monthly = calculateMonthlyCarats(options, monthlyTicks);
  totalCarats += monthly.carats;
  supportTickets += monthly.supportTickets;
  characterTickets += monthly.characterTickets;

  totalCarats += calculateWeeklyCarats(options, weeklyTicks);
  totalCarats += calculateDailyCarats(options, dailyTicks);

  return {
    rolls: Math.floor(totalCarats / CARATS_PER_ROLL),
    carats: totalCarats,
    supportTickets,
    characterTickets
  };
}

const gachaService = { calculateRolls };
export { calculateRolls };
export default gachaService;
