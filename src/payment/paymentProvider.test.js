import { describe, expect, it, vi } from "vitest";
import {
  PaymentProviderUnavailableError,
  requestPayment,
} from "./paymentProvider";

describe("paymentProvider", () => {
  it("fails closed without loading or invoking an external PG SDK", async () => {
    const requestPay = vi.fn();
    window.IMP = { request_pay: requestPay };

    await expect(requestPayment({ amount: 1000 })).rejects.toBeInstanceOf(
      PaymentProviderUnavailableError,
    );
    expect(requestPay).not.toHaveBeenCalled();
    expect(
      document.querySelector('script[src*="iamport"], script[src*="portone"]'),
    ).not.toBeInTheDocument();

    delete window.IMP;
  });
});
