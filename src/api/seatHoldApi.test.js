import { beforeEach, describe, expect, it, vi } from "vitest";

import axiosBackend from "../AxiosConfig";
import { holdSeats, releaseSeats } from "./seatHoldApi";

vi.mock("../AxiosConfig", () => ({
  default: {
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe("seat hold API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts the complete target seat set with credentials", async () => {
    axiosBackend.post.mockResolvedValue({
      data: {
        seats: [{ seatNumber: "A1", expiresAt: "2030-01-01T12:05:00" }],
      },
    });

    await expect(holdSeats("concert-1", 7, ["A1"])).resolves.toEqual({
      seats: [{ seatNumber: "A1", expiresAt: "2030-01-01T12:05:00" }],
    });
    expect(axiosBackend.post).toHaveBeenCalledWith(
      "/main/detail/concert-1/seat-holds",
      { concertTimeId: 7, seatNumberList: ["A1"] },
      { withCredentials: true },
    );
  });

  it("sends owned seats in the DELETE request body", async () => {
    axiosBackend.delete.mockResolvedValue({ status: 204 });

    await releaseSeats("concert-1", 7, ["A1", "A2"]);

    expect(axiosBackend.delete).toHaveBeenCalledWith(
      "/main/detail/concert-1/seat-holds",
      {
        withCredentials: true,
        data: { concertTimeId: 7, seatNumberList: ["A1", "A2"] },
      },
    );
  });
});
