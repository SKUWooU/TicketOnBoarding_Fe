import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Payment from "./Payment";
import {
  confirmVerifiedReservation,
  prepareCheckout,
} from "../api/checkoutApi";
import {
  PaymentProviderUnavailableError,
  requestPayment,
} from "../payment/paymentProvider";
import {
  loadCheckoutSession,
  saveCheckoutSession,
} from "../utils/checkoutSession";

const router = vi.hoisted(() => ({
  navigate: vi.fn(),
  location: { state: null },
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => router.navigate,
  useLocation: () => router.location,
}));

vi.mock("../api/checkoutApi", () => ({
  confirmVerifiedReservation: vi.fn(),
  prepareCheckout: vi.fn(),
}));

vi.mock("../payment/paymentProvider", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requestPayment: vi.fn() };
});

vi.mock("../components/LoginHeader", () => ({
  default: ({ page }) => <header>{page}</header>,
}));

const checkoutSession = {
  concertId: "concert-1",
  concertName: "Fixture Concert",
  paymentMethod: "CARD",
  reservationData: {
    concertDate: "2030-01-01",
    concertTimeId: 7,
    concertTime: "19:00:00",
    seatNumberList: ["A1"],
  },
  checkout: {
    merchantUid: "merchant-1",
    amount: 45000,
    expiresAt: "2030-01-01T12:05:00",
    status: "READY",
  },
  checkoutKey: "checkout-key",
  reservationKey: "reservation-key",
};

function deferred() {
  let resolve;
  const promise = new Promise((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("Payment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router.location = { state: checkoutSession };
  });

  it("uses the server amount and confirms one reservation despite a double click", async () => {
    const payment = deferred();
    requestPayment.mockReturnValue(payment.promise);
    confirmVerifiedReservation.mockResolvedValue({ createdAt: "2030-01-01" });
    render(<Payment />);

    expect(screen.getByText("서버 확인 금액: 45000원")).toBeVisible();
    const button = screen.getByRole("button", { name: "결제 후 예약 확정" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(requestPayment).toHaveBeenCalledOnce();
    payment.resolve({ paymentId: "payment-1" });

    await waitFor(() =>
      expect(confirmVerifiedReservation).toHaveBeenCalledWith(
        "concert-1",
        "merchant-1",
        checkoutSession.reservationData,
        "payment-1",
        "reservation-key",
      ),
    );
    expect(router.navigate).toHaveBeenCalledWith("/reservSuccess", {
      state: { name: "Fixture Concert", amount: 45000 },
    });
  });

  it("restores the checkout on refresh without creating new keys", () => {
    saveCheckoutSession(checkoutSession);
    router.location = { state: null };

    render(<Payment />);

    expect(screen.getByText("Checkout: merchant-1")).toBeVisible();
    expect(screen.getByText("결제 준비가 완료되었습니다.")).toBeVisible();
  });

  it("shows the fail-closed message without calling the Backend confirmation", async () => {
    const requestPay = vi.fn();
    window.IMP = { request_pay: requestPay };
    requestPayment.mockRejectedValue(new PaymentProviderUnavailableError());
    render(<Payment />);

    fireEvent.click(screen.getByRole("button", { name: "결제 후 예약 확정" }));

    expect(
      await screen.findByText(/실제 결제 연동은 비활성 상태/),
    ).toBeVisible();
    expect(confirmVerifiedReservation).not.toHaveBeenCalled();
    expect(requestPay).not.toHaveBeenCalled();
    delete window.IMP;
  });

  it("reconciles a 503 result and blocks repayment when verification is unknown", async () => {
    requestPayment.mockResolvedValue({ paymentId: "payment-1" });
    confirmVerifiedReservation.mockRejectedValue({ response: { status: 503 } });
    prepareCheckout.mockResolvedValue({
      ...checkoutSession.checkout,
      status: "PAYMENT_VERIFICATION_UNKNOWN",
    });
    render(<Payment />);

    fireEvent.click(screen.getByRole("button", { name: "결제 후 예약 확정" }));

    expect(
      await screen.findByText(/다시 결제하지 말고 관리자에게 확인/),
    ).toBeVisible();
    expect(prepareCheckout).toHaveBeenCalledWith(
      "concert-1",
      checkoutSession.reservationData,
      "checkout-key",
    );
    expect(
      screen.getByRole("button", { name: "결제 후 예약 확정" }),
    ).toBeDisabled();
    expect(loadCheckoutSession().checkout.status).toBe(
      "PAYMENT_VERIFICATION_UNKNOWN",
    );
  });

  it("retries Backend verification with the same payment result without charging again", async () => {
    requestPayment.mockResolvedValue({ paymentId: "payment-1" });
    confirmVerifiedReservation
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValueOnce({ createdAt: "2030-01-01" });
    prepareCheckout.mockResolvedValue(checkoutSession.checkout);
    render(<Payment />);

    const button = screen.getByRole("button", {
      name: "결제 후 예약 확정",
    });
    fireEvent.click(button);
    expect(
      await screen.findByText("결제 준비가 완료되었습니다."),
    ).toBeVisible();
    fireEvent.click(button);

    await waitFor(() =>
      expect(confirmVerifiedReservation).toHaveBeenCalledTimes(2),
    );
    expect(requestPayment).toHaveBeenCalledOnce();
    expect(confirmVerifiedReservation.mock.calls[0][3]).toBe("payment-1");
    expect(confirmVerifiedReservation.mock.calls[1][3]).toBe("payment-1");
  });

  it("blocks a second payment when the provider result itself is unknown", async () => {
    requestPayment.mockRejectedValue(new Error("provider timeout"));
    render(<Payment />);

    fireEvent.click(screen.getByRole("button", { name: "결제 후 예약 확정" }));

    expect(
      await screen.findByText(/결제 요청 결과를 확인할 수 없습니다/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "결제 후 예약 확정" }),
    ).toBeDisabled();
    expect(loadCheckoutSession().paymentAttemptStarted).toBe(true);
  });

  it("does not mistake a provider 503 for a Backend verification failure", async () => {
    requestPayment.mockRejectedValue({ response: { status: 503 } });
    render(<Payment />);

    fireEvent.click(screen.getByRole("button", { name: "결제 후 예약 확정" }));

    expect(
      await screen.findByText(/결제 요청 결과를 확인할 수 없습니다/),
    ).toBeVisible();
    expect(prepareCheckout).not.toHaveBeenCalled();
    expect(confirmVerifiedReservation).not.toHaveBeenCalled();
    expect(requestPayment).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "결제 후 예약 확정" }),
    ).toBeDisabled();
  });
});
