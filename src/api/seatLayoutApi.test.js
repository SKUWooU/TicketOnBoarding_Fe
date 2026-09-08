import { beforeEach, describe, expect, it, vi } from "vitest";

import axiosBackend from "../AxiosConfig";
import {
  getLegacySeats,
  getSeatSection,
  getSeatSections,
} from "./seatLayoutApi";

vi.mock("../AxiosConfig", () => ({ default: { get: vi.fn() } }));

describe("seat layout API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses separate summary and encoded section detail endpoints", async () => {
    axiosBackend.get
      .mockResolvedValueOnce({ data: { sections: [] } })
      .mockResolvedValueOnce({ data: { seats: [] } })
      .mockResolvedValueOnce({ data: [] });

    await getSeatSections("concert-1", 7);
    await getSeatSection("concert-1", 7, "VIP A");
    await getLegacySeats("concert-1", 7);

    expect(axiosBackend.get.mock.calls).toEqual([
      ["/main/detail/concert-1/calendar/7/seat-sections"],
      ["/main/detail/concert-1/calendar/7/seat-sections/VIP%20A"],
      ["/main/detail/concert-1/calendar/7"],
    ]);
  });
});
