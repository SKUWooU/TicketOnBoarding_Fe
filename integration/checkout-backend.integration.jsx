import axios from "axios";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import axiosBackend from "../src/AxiosConfig";
import { holdSeats } from "../src/api/seatHoldApi";
import {
  confirmVerifiedReservation,
  prepareCheckout,
} from "../src/api/checkoutApi";
import Payment from "../src/pages/Payment";

const testState = vi.hoisted(() => ({
  location: { state: null },
  navigate: vi.fn(),
  payment: null,
  requestPayment: vi.fn(() => Promise.resolve(testState.payment)),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: () => testState.location,
  useNavigate: () => testState.navigate,
}));

vi.mock("../src/payment/paymentProvider", async (importOriginal) => ({
  ...(await importOriginal()),
  requestPayment: testState.requestPayment,
}));

vi.mock("../src/components/LoginHeader", () => ({
  default: ({ page }) => <header>{page}</header>,
}));

const RUN_ID = `fe-contract-${Date.now()}`;
const SEAT_NUMBER = "R001-S001";
const CONCERT_DATE = "2030-01-10";
const CONCERT_TIME = "19:00:00";
const BACKEND_BASE_URL =
  globalThis.process?.env.ONTICKET_INTEGRATION_BASE_URL ??
  "http://127.0.0.1:18080";

let fixture;
let token;
let integrationClient;
const originalBackendDefaults = {
  adapter: axiosBackend.defaults.adapter,
  baseURL: axiosBackend.defaults.baseURL,
  cookie: axiosBackend.defaults.headers.common.Cookie,
  timeout: axiosBackend.defaults.timeout,
};

function assertLoopbackBackend(baseUrl) {
  const url = new URL(baseUrl);
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost"].includes(url.hostname)
  ) {
    throw new Error(
      "Checkout integration test only permits a local HTTP Backend.",
    );
  }
}

describe("Checkout Frontend-Backend contract", () => {
  beforeAll(async () => {
    assertLoopbackBackend(BACKEND_BASE_URL);
    const adapter = axios.getAdapter(["http", "fetch"]);
    integrationClient = axios.create({
      adapter,
      baseURL: BACKEND_BASE_URL,
      timeout: 10_000,
    });

    const fixtureResponse = await integrationClient.post(
      `/loadtest/runs?runId=${RUN_ID}`,
    );
    const tokenResponse = await integrationClient.get(
      `/loadtest/tokens?runId=${RUN_ID}&count=1`,
    );
    fixture = fixtureResponse.data;
    token = tokenResponse.data[0];

    axiosBackend.defaults.adapter = adapter;
    axiosBackend.defaults.baseURL = BACKEND_BASE_URL;
    axiosBackend.defaults.headers.common.Cookie = `accessToken=${token.accessToken}`;
    axiosBackend.defaults.timeout = 10_000;
  });

  afterAll(() => {
    axiosBackend.defaults.adapter = originalBackendDefaults.adapter;
    axiosBackend.defaults.baseURL = originalBackendDefaults.baseURL;
    axiosBackend.defaults.timeout = originalBackendDefaults.timeout;
    if (originalBackendDefaults.cookie === undefined) {
      delete axiosBackend.defaults.headers.common.Cookie;
    } else {
      axiosBackend.defaults.headers.common.Cookie =
        originalBackendDefaults.cookie;
    }
  });

  it("holds one virtual seat and confirms exactly one verified reservation", async () => {
    expect(fixture.totalSeats).toBe(2000);

    await holdSeats(fixture.concertId, fixture.concertTimeId, [SEAT_NUMBER]);
    const reservationData = {
      concertDate: CONCERT_DATE,
      concertTimeId: fixture.concertTimeId,
      concertTime: CONCERT_TIME,
      seatNumberList: [SEAT_NUMBER],
    };
    const checkoutKey = `fe-${RUN_ID}-checkout`;
    const reservationKey = `lt-${RUN_ID}.fe-reservation`;
    const checkout = await prepareCheckout(
      fixture.concertId,
      reservationData,
      checkoutKey,
    );

    expect(checkout).toMatchObject({ amount: 30000, status: "READY" });

    const paymentId = `LT:${token.username}:${checkout.amount}:${checkout.merchantUid}`;
    testState.payment = { paymentId };
    testState.location = {
      state: {
        concertId: fixture.concertId,
        concertName: "Local contract fixture",
        paymentMethod: "FIXTURE",
        reservationData,
        checkout,
        checkoutKey,
        reservationKey,
      },
    };

    render(<Payment />);
    fireEvent.click(screen.getByRole("button", { name: "결제 후 예약 확정" }));

    await waitFor(() =>
      expect(testState.navigate).toHaveBeenCalledWith("/reservSuccess", {
        state: { name: "Local contract fixture", amount: 30000 },
      }),
    );
    expect(testState.requestPayment).toHaveBeenCalledOnce();

    const firstResult = await confirmVerifiedReservation(
      fixture.concertId,
      checkout.merchantUid,
      reservationData,
      paymentId,
      reservationKey,
    );
    const secondResult = await confirmVerifiedReservation(
      fixture.concertId,
      checkout.merchantUid,
      reservationData,
      paymentId,
      reservationKey,
    );
    expect(secondResult).toEqual(firstResult);

    const snapshot = (
      await integrationClient.get(`/loadtest/snapshot?runId=${RUN_ID}`)
    ).data;
    expect(snapshot).toMatchObject({
      expectedTotalSeats: 2000,
      actualSeatCount: 2000,
      remainingSeats: 1999,
      reservedSeats: 1,
      reservations: 1,
      bookings: 1,
      payments: 1,
      invariantSatisfied: true,
    });
  });
});
