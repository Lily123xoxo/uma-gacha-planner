import { describe, it, expect, beforeEach, vi } from "vitest";

// ----- Hoisted mocks (MUST be defined via vi.hoisted) -----
const { redisGet, redisSet } = vi.hoisted(() => ({
  redisGet: vi.fn(),
  redisSet: vi.fn(),
}));

vi.mock("@upstash/redis", () => {
  // This factory is hoisted; it can safely reference redisGet/redisSet
  return {
    Redis: vi.fn(() => ({ get: redisGet, set: redisSet })),
  };
});

const { sqlMock } = vi.hoisted(() => ({
  sqlMock: vi.fn(),
}));

vi.mock("../lib/db", () => {
  // mimic a tagged template fn: forward all args to sqlMock
  const sql = (...args: any[]) => (sqlMock as any)(...args);
  return { sql };
});

// ----- Import SUT AFTER mocks -----
import {
  getCharacterBanners,
  getSupportBanners,
  type CharacterRow,
  type SupportRow,
} from "../lib/bannerDaoDispatcher";

const characterRows: CharacterRow[] = [
  {
    id: 1,
    uma_name: "Special Week",
    jp_release_date: "2021-02-24",
    global_actual_date: "2024-01-10",
    global_actual_end_date: "2024-01-21",
    global_est_date: null,
    global_est_end_date: null,
    jp_days_until_next: 90,
    global_days_until_next: 120,
    image_path: "uma/1001.png",
  },
];

const supportRows: SupportRow[] = [
  {
    id: 1,
    support_name: "SSR Fine Motion",
    jp_release_date: "2021-02-24",
    global_actual_date: "2024-01-10",
    global_actual_end_date: "2024-01-21",
    global_est_date: null,
    global_est_end_date: null,
    jp_days_until_next: 90,
    global_days_until_next: 120,
    image_path: "support/10001.png",
  },
];

describe("bannerDao Redis caching", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("character banners: cache MISS -> hits DB and sets Redis", async () => {
    redisGet.mockResolvedValueOnce(null);
    sqlMock.mockResolvedValueOnce(characterRows);

    const res = await getCharacterBanners(2);

    expect(res).toEqual(characterRows);
    expect(sqlMock).toHaveBeenCalledTimes(1);
    expect(redisSet).toHaveBeenCalledTimes(1);
  });

  it("character banners: cache HIT -> returns from Redis, skips DB", async () => {
    redisGet.mockResolvedValueOnce(characterRows);
    sqlMock.mockResolvedValueOnce([]); // should not be used

    const res = await getCharacterBanners(2);

    expect(res).toEqual(characterRows);
    expect(sqlMock).not.toHaveBeenCalled();
    expect(redisSet).not.toHaveBeenCalled();
  });

  it("support banners: cache MISS -> hits DB and sets Redis", async () => {
    redisGet.mockResolvedValueOnce(null);
    sqlMock.mockResolvedValueOnce(supportRows);

    const res = await getSupportBanners(5);

    expect(res).toEqual(supportRows);
    expect(sqlMock).toHaveBeenCalledTimes(1);
    expect(redisSet).toHaveBeenCalledTimes(1);
  });

  it("support banners: cache HIT -> returns from Redis, skips DB", async () => {
    redisGet.mockResolvedValueOnce(supportRows);
    sqlMock.mockResolvedValueOnce([]);

    const res = await getSupportBanners(5);

    expect(res).toEqual(supportRows);
    expect(sqlMock).not.toHaveBeenCalled();
    expect(redisSet).not.toHaveBeenCalled();
  });
});
