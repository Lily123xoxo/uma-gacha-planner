/**
 * GachaService roll calculation tests (UTC ticks, production signature).
 *
 * IMPORTANT:
 * - We DO NOT modify the production method. We only freeze time with Vitest fake timers.
 * - All tests assume: daily reset = 15:00 UTC, weekly reset = Monday 15:00 UTC,
 *   monthly reset = 1st 15:00 UTC, and banners end 21:59 UTC on bannerEndDate.
 * - DB dates are always "YYYY-MM-DD".
 */

import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { calculateRolls } from '../services/gachaService';

function baseOptions(overrides: Partial<Parameters<typeof calculateRolls>[0]> = {}) {
  return {
    carats: 0,
    clubRank: 'A',
    teamTrialsRank: 'Class6',
    champMeeting: 1800,
    characterTickets: 0,
    supportTickets: 0,
    monthlyPass: true,
    dailyLogin: true,
    legendRace: true,
    dailyMission: true,
    rainbowCleat: false,
    goldCleat: true,
    silverCleat: true,
    bannerEndDate: null as unknown as string,
    ...overrides,
  };
}

describe('calculateRolls (UTC ticks, Vitest fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-19T14:00:00Z')); // baseline: before daily reset
    process.env.TZ = 'UTC';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Base behavior: No end date → pass through current holdings only. */
  it('BASELINE: no end date → returns current holdings', () => {
    const res = calculateRolls(baseOptions({ carats: 150, bannerEndDate: null as any }));
    expect(res.carats).toBe(150);
    expect(res.rolls).toBe(1);
    expect(res.supportTickets).toBe(0);
    expect(res.characterTickets).toBe(0);
  });



  it('TODAY (STATIC UTC): now=2025-08-19T05:22:47Z, end=2025-09-08 → 21 daily, 3 weekly, 1 monthly', () => {
    // Freeze to today's current UTC (static)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-19T05:22:47Z'));

    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-08' }));

    // Exact expected values for this specific now/end pair
    expect(res.carats).toBe(7560);          // 21*80 + 3*360 + 4800
    expect(res.rolls).toBe(50);             // floor(7560/150)
    expect(res.supportTickets).toBe(4);     // 1 monthly * (gold 2 + silver 2)
    expect(res.characterTickets).toBe(4);

    vi.useRealTimers();
  });


  /** Normal case across mid-month: includes expected daily + a single weekly, no monthly. */
  it('MID-MONTH: end=2025-08-31 → 13 daily, 1 weekly, 0 monthly', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-08-31' }));
    expect(res.carats).toBe(1400);
    expect(res.rolls).toBe(9);
    expect(res.supportTickets).toBe(0);
    expect(res.characterTickets).toBe(0);
  });

  /** Longer span into next month: exercises daily + weekly + monthly + cleat tickets together. */
  it('CROSS-MONTH: end=2025-09-08 → 21 daily, 3 weekly, 1 monthly', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-08' }));
    expect(res.carats).toBe(7560);
    expect(res.rolls).toBe(50);
    expect(res.supportTickets).toBe(4);
    expect(res.characterTickets).toBe(4);
  });

  /** Daily fencepost: same as above but move "now" to AFTER the 15:00 daily reset (one fewer daily). */
  it('DAILY FENCEPOST: same end=2025-09-08; now AFTER reset → minus one daily (−80 carats)', () => {
    vi.setSystemTime(new Date('2025-08-19T16:00:00Z'));
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-08' }));
    expect(res.carats).toBe(7480);
    expect(res.rolls).toBe(49);
  });

  /** Weekly boundary included: period crosses Monday 15:00Z, so weekly triggers exactly once. */
  it('WEEKLY BOUNDARY (INCLUDED): now=Sun 2025-08-24 14:00Z, end=Mon 2025-08-25 → weekly counted', () => {
    vi.setSystemTime(new Date('2025-08-24T14:00:00Z'));
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-08-25' }));
    expect(res.carats).toBe(520);
    expect(res.rolls).toBe(3);
  });

  /** Weekly boundary excluded: "now" is AFTER Monday 15:00Z, end is the same Monday night → no weekly tick. */
  it('WEEKLY BOUNDARY (EXCLUDED): now=Mon 2025-08-25 16:00Z, end=Mon 2025-08-25 → weekly NOT counted', () => {
    vi.setSystemTime(new Date('2025-08-25T16:00:00Z'));
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-08-25' }));
    expect(res.carats).toBe(0);
    expect(res.rolls).toBe(0);
  });

  /** Monthly boundary included: "now" before 1st 15:00Z, end=Sep 1 → monthly + weekly + 2 dailies. */
  it('MONTHLY BOUNDARY (INCLUDED): now=Sun 2025-08-31 14:00Z, end=Mon 2025-09-01 → monthly counted', () => {
    vi.setSystemTime(new Date('2025-08-31T14:00:00Z'));
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-01' }));
    expect(res.carats).toBe(5320);
    expect(res.rolls).toBe(35);
    expect(res.supportTickets).toBe(4);
    expect(res.characterTickets).toBe(4);
  });

  /** Monthly boundary excluded: "now" AFTER 1st 15:00Z, end=Sep 1 same day → no monthly, no weekly, no daily. */
  it('MONTHLY BOUNDARY (EXCLUDED): now=Mon 2025-09-01 16:00Z, end=Mon 2025-09-01 → monthly NOT counted', () => {
    vi.setSystemTime(new Date('2025-09-01T16:00:00Z'));
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-01' }));
    expect(res.carats).toBe(0);
    expect(res.rolls).toBe(0);
    expect(res.supportTickets).toBe(0);
    expect(res.characterTickets).toBe(0);
  });

  /** Already ended: end date behind "now" → pass through current holdings. */
  it('ALREADY ENDED: end <= now → returns holdings only', () => {
    vi.setSystemTime(new Date('2025-09-10T00:00:00Z'));
    const res = calculateRolls(baseOptions({ carats: 150, bannerEndDate: '2025-09-08' }));
    expect(res.carats).toBe(150);
    expect(res.rolls).toBe(1);
  });

  /** Parser robustness: impossible date → safe fallback to current holdings only. */
  it('INVALID DATE: 2025-02-30 → safe fallback to holdings', () => {
    const res = calculateRolls(baseOptions({ carats: 150, bannerEndDate: '2025-02-30' }));
    expect(res.carats).toBe(150);
    expect(res.rolls).toBe(1);
  });

  /** Same-day end: now before daily reset, end is same day → exactly one daily tick should apply. */
  it('SAME-DAY END (BEFORE RESET): now=Tue 2025-08-19 14:00Z, end=2025-08-19 → one daily tick', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-08-19' }));
    expect(res.carats).toBe(80);
    expect(res.rolls).toBe(0);
  });

  /** Tomorrow end: now before reset → exactly two daily ticks should apply. */
  it('NEXT-DAY END (BEFORE RESET): now=Tue 2025-08-19 14:00Z, end=2025-08-20 → two daily ticks', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-08-20' }));
    expect(res.carats).toBe(160);
    expect(res.rolls).toBe(1);
  });

  /** Multiple weeklies: span includes five Mondays; expect five weekly ticks plus daily + one monthly. */
  it('MULTI-WEEK: end=2025-09-22 → 35 daily, 5 weekly, 1 monthly', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-22' }));
    expect(res.carats).toBe(9400); // 35*80 + 5*360 + 4800
    expect(res.rolls).toBe(62);
    expect(res.supportTickets).toBe(4);
    expect(res.characterTickets).toBe(4);
  });

  /** Two monthly ticks: span crosses Sep 1 and Oct 1; expect two monthly payouts and tickets. */
  it('DOUBLE-MONTH: end=2025-10-01 → 44 daily, 6 weekly, 2 monthly', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-10-01' }));
    expect(res.carats).toBe(15280); // 44*80 + 6*360 + 2*4800
    expect(res.rolls).toBe(101);
    expect(res.supportTickets).toBe(8);
    expect(res.characterTickets).toBe(8);
  });

  /** No daily login: weekly should exclude the +110 but still include team trials +250. */
  it('NO DAILY LOGIN: weekly gives trials only; end=Mon 2025-08-25 with weekly included', () => {
    vi.setSystemTime(new Date('2025-08-24T14:00:00Z'));
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-08-25', dailyLogin: false }));
    expect(res.carats).toBe(410); // 2*80 + 1*250
    expect(res.rolls).toBe(2);
  });

  /** No monthly pass: remove daily +50 and monthly +500 components; other sources remain. */
  it('NO MONTHLY PASS: end=2025-09-08 → removes pass daily and pass immediate', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-08', monthlyPass: false }));
    expect(res.carats).toBe(6010); // 7560 - 1050 (daily pass) - 500 (immediate)
    expect(res.rolls).toBe(40);
  });

  /** No legend race: monthly payout should drop by 1000. */
  it('NO LEGEND RACE: end=2025-09-08 → monthly reduced by 1000', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-08', legendRace: false }));
    expect(res.carats).toBe(6560); // 7560 - 1000
    expect(res.rolls).toBe(43);
  });

  /** No daily missions: daily component should drop by 30 per tick. */
  it('NO DAILY MISSIONS: end=2025-09-08 → remove 30 per daily tick', () => {
    const res = calculateRolls(baseOptions({ bannerEndDate: '2025-09-08', dailyMission: false }));
    expect(res.carats).toBe(6930); // 7560 - (21*30)
    expect(res.rolls).toBe(46);
  });

  /** Monotonicity: later end date should never reduce total carats. */
  it('MONOTONICITY: end=2025-09-08 should be >= end=2025-09-01', () => {
    const a = calculateRolls(baseOptions({ bannerEndDate: '2025-09-01' }));
    const b = calculateRolls(baseOptions({ bannerEndDate: '2025-09-08' }));
    expect(b.carats).toBeGreaterThanOrEqual(a.carats);
  });
});
