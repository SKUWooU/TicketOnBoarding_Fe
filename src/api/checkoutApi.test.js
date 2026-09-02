import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosBackend from "../AxiosConfig";
import { confirmVerifiedReservation, prepareCheckout } from "./checkoutApi";

vi.mock("../AxiosConfig", () => ({
  default: { post: vi.fn() },
}));

describe("checkoutApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("prepares a checkout with the caller-owned idempotency key", async () => {
    const reservation = {
      concertDate: "2030-01-01",
      concertTimeId: 7,
      concertTime: "19:00:00",
      seatNumberList: ["A1", "A2"],
    };
    axiosBackend.post.mockResolvedValue({ data: { status: "READY" } });

    await prepareCheckout("concert-1", reservation, "checkout-key");

    expect(axiosBackend.post).toHaveBeenCalledWith(
      "/main/detail/concert-1/checkouts",
      reservation,
      {
        withCredentials: true,
        headers: { "Idempotency-Key": "checkout-key" },
      },
    );
  });

  it("confirms only through the verified-reservation endpoint", async () => {
    const reservation = {
      concertDate: "2030-01-01",
      concertTimeId: 7,
      concertTime: "19:00:00",
      seatNumberList: ["A1"],
    };
    axiosBackend.post.mockResolvedValue({ data: { createdAt: "2030-01-01" } });

    await confirmVerifiedReservation(
      "concert-1",
      "merchant-1",
      reservation,
      "payment-1",
      "reservation-key",
    );

    expect(axiosBackend.post).toHaveBeenCalledWith(
      "/main/detail/concert-1/checkouts/merchant-1/verified-reservation",
      { ...reservation, paymentId: "payment-1" },
      {
        withCredentials: true,
        headers: { "Idempotency-Key": "reservation-key" },
      },
    );
  });
});
