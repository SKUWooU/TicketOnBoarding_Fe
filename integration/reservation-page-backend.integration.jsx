/* eslint-disable react/prop-types */
import axios from "axios";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import axiosBackend from "../src/AxiosConfig";
import ConcertReservation from "../src/pages/ConcertReservation";

const testState = vi.hoisted(() => ({
  navigate: vi.fn(),
  selectedDate: "2030-01-10",
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => testState.navigate,
  useParams: () => ({ concertID: testState.fixture?.concertId ?? "pending" }),
}));

vi.mock("../src/components/AuthContext", async () => {
  const { createContext } = await import("react");
  return { default: createContext({ isLoggedIn: true }) };
});

vi.mock("../src/components/MainHeader", () => ({ default: () => <header /> }));
vi.mock("../src/components/MainFooter", () => ({ default: () => <footer /> }));
vi.mock("../src/components/LoginBtn", () => ({
  default: ({ buttonText, onClick, disabled }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {buttonText}
    </button>
  ),
}));
vi.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }) => children,
}));
vi.mock("@mui/x-date-pickers/AdapterDayjs", () => ({
  AdapterDayjs: function AdapterDayjs() {},
}));
vi.mock("@mui/x-date-pickers/DateCalendar", () => ({
  DateCalendar: ({ onChange }) => (
    <button type="button" onClick={() => onChange(testState.selectedDate)}>
      fixture 날짜 선택
    </button>
  ),
}));

const RUN_ID = `fe-page-${Date.now()}`;
const BACKEND_BASE_URL =
  globalThis.process?.env.ONTICKET_INTEGRATION_BASE_URL ??
  "http://127.0.0.1:18080";
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
      "Reservation page integration test only permits a local HTTP Backend.",
    );
  }
}

describe("Reservation page Frontend-Backend contract", () => {
  beforeAll(async () => {
    try {
      assertLoopbackBackend(BACKEND_BASE_URL);
      const adapter = axios.getAdapter(["http", "fetch"]);
      const client = axios.create({
        adapter,
        baseURL: BACKEND_BASE_URL,
        timeout: 10_000,
      });
      const fixtureResponse = await client.post(
        `/loadtest/runs?runId=${RUN_ID}`,
      );
      const tokenResponse = await client.get(
        `/loadtest/tokens?runId=${RUN_ID}&count=1`,
      );

      testState.fixture = fixtureResponse.data;
      testState.selectedDate = (
        await client.get(`/main/detail/${testState.fixture.concertId}/calendar`)
      ).data[0].date;

      axiosBackend.defaults.adapter = adapter;
      axiosBackend.defaults.baseURL = BACKEND_BASE_URL;
      axiosBackend.defaults.headers.common.Cookie = `accessToken=${tokenResponse.data[0].accessToken}`;
      axiosBackend.defaults.timeout = 10_000;
    } catch (error) {
      throw new Error(
        `fixture setup failed: ${error.response?.status ?? "network"} ${JSON.stringify(error.response?.data ?? error.message)}`,
      );
    }
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

  it("renders one server-owned section at a time and reflects a held seat", async () => {
    render(<ConcertReservation />);

    expect(await screen.findByText(/가상 고경합 부하 공연/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "fixture 날짜 선택" }));
    fireEvent.click((await screen.findByText(/잔여석 : 2000/)).closest("div"));

    const sectionButtons = await screen.findAllByRole("button", {
      name: /^\d+구역/,
    });
    expect(sectionButtons).toHaveLength(10);
    expect(sectionButtons[0]).toHaveAttribute("aria-pressed", "true");
    const seatButtons = await screen.findAllByRole("button", {
      name: /^R\d{3}-S\d{3}, 선택 가능$/,
    });
    expect(testState.fixture.totalSeats).toBe(2000);
    expect(seatButtons).toHaveLength(200);

    fireEvent.click(
      screen.getByRole("button", {
        name: "R001-S001, 선택 가능",
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "R001-S001, 내가 선택한 좌석" }),
      ).toHaveAttribute("aria-pressed", "true"),
    );
  });
});
