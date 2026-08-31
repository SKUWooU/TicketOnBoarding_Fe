/* eslint-disable react/prop-types */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import axiosBackend from "../AxiosConfig";
import ConcertReservation from "./ConcertReservation";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("../AxiosConfig", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigate,
    useParams: () => ({ concertID: "concert-1" }),
  };
});

vi.mock("../components/AuthContext", async () => {
  const { createContext } = await import("react");
  return {
    default: createContext({ isLoggedIn: true }),
  };
});

vi.mock("../components/MainHeader", () => ({
  default: () => <header>header</header>,
}));

vi.mock("../components/MainFooter", () => ({
  default: () => <footer>footer</footer>,
}));

vi.mock("../components/LoginBtn", () => ({
  default: ({ buttonText, onClick }) => (
    <button type="button" onClick={onClick}>
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
    <button type="button" onClick={() => onChange("2024-06-15")}>
      2024-06-15 선택
    </button>
  ),
}));

const performances = [
  {
    id: 1,
    date: "2024-06-15",
    dayOfWeek: "토요일",
    seatAmount: 24,
    startTime: "17:00:00",
  },
  {
    id: 2,
    date: "2024-06-15",
    dayOfWeek: "토요일",
    seatAmount: 23,
    startTime: "19:00:00",
  },
];

function createDeferred() {
  let resolve;
  const promise = new Promise((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

function mockConcertRequests(firstSeatResponse, secondSeatResponse) {
  axiosBackend.get.mockImplementation((url) => {
    if (url === "/main/detail/concert-1") {
      return Promise.resolve({
        data: {
          concertName: "Fixture 공연",
          startDate: "2024-06-15",
          endDate: "2024-06-15",
        },
      });
    }

    if (url === "/main/detail/concert-1/calendar") {
      return Promise.resolve({ data: performances });
    }

    if (url.endsWith("/calendar/1")) return firstSeatResponse;
    if (url.endsWith("/calendar/2")) return secondSeatResponse;

    return Promise.reject(new Error(`unexpected fixture URL: ${url}`));
  });
}

describe("ConcertReservation seat selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConcertRequests(
      Promise.resolve({
        data: [
          { seatNumber: "A1", availability: "AVAILABLE" },
          { seatNumber: "A2", availability: "HELD" },
        ],
      }),
      Promise.resolve({
        data: [{ seatNumber: "A1", availability: "RESERVED" }],
      }),
    );
  });

  it("clears a previous seat selection when the performance changes", async () => {
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));

    fireEvent.click(screen.getByText("17:00").closest("div"));
    const availableSeat = await screen.findByRole("button", {
      name: "A1, 선택 가능",
    });
    fireEvent.click(availableSeat);

    expect(
      screen.getByRole("button", { name: "A1, 선택 좌석" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/선택한 좌석 수 : 1/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "A1, 선택 좌석" }));
    expect(
      screen.getByRole("button", { name: "A1, 선택 가능" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText(/선택한 좌석 수/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "A1, 선택 가능" }));
    fireEvent.click(screen.getByText("19:00").closest("div"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "A1, 예약 완료" }),
      ).toBeDisabled();
    });
    expect(screen.queryByText(/선택한 좌석 수/)).not.toBeInTheDocument();
    expect(screen.queryByText("총 결제 금액")).not.toBeInTheDocument();
  });

  it("ignores a stale seat response from a previously selected performance", async () => {
    const firstResponse = createDeferred();
    const secondResponse = createDeferred();
    mockConcertRequests(firstResponse.promise, secondResponse.promise);
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click(screen.getByText("17:00").closest("div"));
    fireEvent.click(screen.getByText("19:00").closest("div"));

    secondResponse.resolve({
      data: [{ seatNumber: "A1", availability: "RESERVED" }],
    });
    expect(
      await screen.findByRole("button", { name: "A1, 예약 완료" }),
    ).toBeDisabled();

    firstResponse.resolve({
      data: [{ seatNumber: "A1", availability: "AVAILABLE" }],
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "A1, 예약 완료" }),
      ).toBeDisabled();
    });
    expect(
      screen.queryByRole("button", { name: "A1, 선택 가능" }),
    ).not.toBeInTheDocument();
  });
});
