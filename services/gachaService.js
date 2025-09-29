// ======== CONFIG (UTC) ========
const RESET_UTC_HOUR = 15;  // daily reset 15:00 UTC
const RESET_UTC_MIN = 0;
const WEEKLY_RESET_DOW = 1; // Monday

// ======== REWARD MAPS / CONSTANTS ========
const clubRankMap = {
  SS: 3000, SPLUS: 2400, S: 2100, APLUS: 1800, A: 1500,
  BPLUS: 1200, B: 900, CPLUS: 600, C: 300, DPLUS: 150
};

const teamTrialsRankMap = {
  CLASS6: 375, CLASS5: 225, CLASS4: 150, CLASS3: 75, CLASS2: 35, CLASS1: 0
};

const CARATS_PER_ROLL = 150;
const DAILY_LOGIN_CARATS = 150; // 150 a week
const MONTHLY_PASS_DAILY_CARATS = 50;
const MONTHLY_PASS_IMMEDIATE_CARATS = 500;
const DAILY_MISSION_CARATS = 75;
const LEGEND_RACE_MONTHLY_CARATS = 1000;

// ======== GENERIC COERCION ========
function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    return t === 'true' || t === '1' || t === 'yes' || t === 'on';
  }
  return false;
}

function toNum(v, fallback = 0) {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.trim());
    return isFinite(n) ? n : fallback;
  }
  return fallback;
}

function normClubRank(s) {
  if (!s) return null;
  const t = String(s).trim().toUpperCase()
    .replace(/\s+/g, '')
    .replace(/\+/g, 'PLUS');
  return clubRankMap.hasOwnProperty(t) ? t : null;
}

function normTeamTrialsRank(s) {
  if (!s) return null;
  const t = String(s).trim().toUpperCase().replace(/\s+/g, '');
  return teamTrialsRankMap.hasOwnProperty(t) ? t : null;
}

// Accepts Date, timestamp number, ISO, or "YYYY-MM-DD HH:mm:ss" → "YYYY-MM-DD"
function normalizeToYMD(any) {
  if (any == null) return null;

  // Date instance
  if (any instanceof Date && !isNaN(any.getTime())) {
    const y = any.getUTCFullYear();
    const m = String(any.getUTCMonth() + 1).padStart(2, '0');
    const d = String(any.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // UNIX ms timestamp
  if (typeof any === 'number' && isFinite(any)) {
    const d = new Date(any);
    if (!isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  if (typeof any === 'string') {
    const s = any.trim();
    // Fast path: starts "YYYY-MM-DD"
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    // Fallback: let Date parse ISO/locale-ish strings
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${mo}-${day}`;
    }
  }

  return null;
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

// Coalesce likely end-date fields from various shapes (route/UI/MySQL/Neon)
function pickEndDateLike(obj) {
  if (!obj || typeof obj !== 'object') return null;
  return (
    obj.bannerEndDate ??
    obj.global_actual_end_date ??
    obj.global_est_end_date ??
    obj.actual_end_date ??
    obj.est_end_date ??
    obj.end_date ??
    null
  );
}

// ======== UTC HELPERS ========
const MS_PER_DAY = 86400000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function toUTCDate(d = new Date()) {
  return new Date(Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
  ));
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
  if (!toUtc || toUtc <= fromUtc) return 0;
  let tick = nextDailyReset(fromUtc);
  if (tick > toUtc) return 0;
  return 1 + Math.floor((toUtc - tick) / MS_PER_DAY);
}

function countWeeklyTicks(fromUtc, toUtc) {
  if (!toUtc || toUtc <= fromUtc) return 0;
  let tick = nextDailyReset(fromUtc);
  if (tick > toUtc) return 0;

  const deltaDays = (WEEKLY_RESET_DOW - tick.getUTCDay() + 7) % 7; // Monday align
  if (deltaDays > 0) tick = new Date(tick.getTime() + deltaDays * MS_PER_DAY);
  if (tick > toUtc) return 0;

  return 1 + Math.floor((toUtc - tick) / MS_PER_WEEK);
}

function countMonthlyTicksUTC(fromUtc, toUtc) {
  if (!toUtc || toUtc <= fromUtc) return 0;
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
function calculateMonthlyCarats(opts, monthsCrossed) {
  let carats = 0, supportTicketsGain = 0, characterTicketsGain = 0;
  for (let i = 0; i < monthsCrossed; i++) {
    carats += (clubRankMap[opts.clubRank] || 0);
    carats += opts.champMeeting || 0;
    if (opts.monthlyPass) carats += MONTHLY_PASS_IMMEDIATE_CARATS;
    if (opts.legendRace) carats += LEGEND_RACE_MONTHLY_CARATS;
    if (opts.rainbowCleat) { supportTicketsGain += 2; characterTicketsGain += 2; }
    if (opts.goldCleat)   { supportTicketsGain += 2; characterTicketsGain += 2; }
    if (opts.silverCleat) { supportTicketsGain += 2; characterTicketsGain += 2; }
  }
  return { carats, supportTickets: supportTicketsGain, characterTickets: characterTicketsGain };
}

function calculateWeeklyCarats(opts, weeksCrossed) {
  let carats = 0;
  if (opts.dailyLogin) carats += DAILY_LOGIN_CARATS * weeksCrossed;
  carats += (teamTrialsRankMap[opts.teamTrialsRank] || 0) * weeksCrossed;
  return carats;
}

function calculateDailyCarats(opts, daysCrossed) {
  let carats = 0;
  if (opts.monthlyPass) carats += MONTHLY_PASS_DAILY_CARATS * daysCrossed;
  if (opts.dailyMission) carats += DAILY_MISSION_CARATS * daysCrossed;
  return carats;
}

// ======== NORMALIZATION ENTRYPOINT ========
function normalizeOptions(raw) {
  const o = raw || {};

  // Coalesce banner end date from multiple shapes (route/UI/DB rows)
  const endLike =
    o.bannerEndDate ??
    pickEndDateLike(o) ??
    pickEndDateLike(o.characterBanner) ??
    pickEndDateLike(o.supportBanner) ??
    null;

  const bannerEndDate = normalizeToYMD(endLike);

  // Normalize ranks
  const clubRank = normClubRank(o.clubRank) || null;
  const teamTrialsRank = normTeamTrialsRank(o.teamTrialsRank) || null;

  return {
    // starting resources
    carats: toNum(o.carats, 0),
    supportTickets: toNum(o.supportTickets, 0),
    characterTickets: toNum(o.characterTickets, 0),

    // ranks / monthly values
    clubRank,
    teamTrialsRank,
    champMeeting: toNum(o.champMeeting, 0),

    // toggles (accept "true"/"1"/1/on)
    monthlyPass: toBool(o.monthlyPass),
    dailyLogin: toBool(o.dailyLogin),
    legendRace: toBool(o.legendRace),
    dailyMission: toBool(o.dailyMission),
    rainbowCleat: toBool(o.rainbowCleat),
    goldCleat: toBool(o.goldCleat),
    silverCleat: toBool(o.silverCleat),

    // computed
    bannerEndDate, // "YYYY-MM-DD" or null
  };
}

// ======== MAIN ========
function calculateRolls(rawOptions) {
  const options = normalizeOptions(rawOptions);

  const lastDay = options.bannerEndDate;
  let totalCarats = options.carats || 0;
  let supportTickets = options.supportTickets || 0;
  let characterTickets = options.characterTickets || 0;

  if (!lastDay) {
    return {
      rolls: Math.floor(totalCarats / CARATS_PER_ROLL),
      carats: totalCarats,
      supportTickets,
      characterTickets
    };
  }

  const nowUtc = toUTCDate(new Date());
  const endUtc = endInstantFromLastDayUTC(lastDay);

  if (!endUtc || isNaN(endUtc.getTime()) || endUtc <= nowUtc) {
    return {
      rolls: Math.floor(totalCarats / CARATS_PER_ROLL),
      carats: totalCarats,
      supportTickets,
      characterTickets
    };
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
