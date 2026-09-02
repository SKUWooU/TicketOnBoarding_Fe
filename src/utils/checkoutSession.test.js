import { describe, expect, it } from "vitest";
import {
  clearCheckoutSession,
  loadCheckoutSession,
  saveCheckoutSession,
} from "./checkoutSession";

const fixture = {
  concertId: "concert-1",
  checkoutKey: "checkout-key",
  reservationKey: "reservation-key",
  reservationData: { seatNumberList: ["A1"] },
  checkout: { merchantUid: "merchant-1", status: "READY" },
};

describe("checkoutSession", () => {
  it("restores the same idempotency keys after a refresh", () => {
    saveCheckoutSession(fixture);

    expect(loadCheckoutSession()).toEqual(fixture);
  });

  it("discards malformed session data", () => {
    sessionStorage.setItem("ticketonboarding.active-checkout.v1", "{broken");

    expect(loadCheckoutSession()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it("clears a completed checkout", () => {
    saveCheckoutSession(fixture);
    clearCheckoutSession();

    expect(loadCheckoutSession()).toBeNull();
  });
});
