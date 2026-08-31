/* eslint-disable react/prop-types */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import axiosBackend from "../AxiosConfig";
import ConcertReservation from "./ConcertReservation";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("../AxiosConfig", () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
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
    axiosBackend.delete.mockResolvedValue({ status: 204 });
    axiosBackend.post.mockImplementation((...requestArguments) => {
      const request = requestArguments[1];
      return Promise.resolve({
        data: {
          seats: request.seatNumberList.map((seatNumber, index) => ({
            seatNumber,
            expiresAt: `2030-01-01T12:0${4 + index}:00`,
          })),
        },
      });
    });
    mockConcertRequests(
      Promise.resolve({
        data: [
          { seatNumber: "A1", availability: "AVAILABLE" },
          { seatNumber: "A2", availability: "HELD" },
          { seatNumber: "A3", availability: "AVAILABLE" },
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

    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    const availableSeat = await screen.findByRole("button", {
      name: "A1, 선택 가능",
    });
    fireEvent.click(availableSeat);

    expect(
      await screen.findByRole("button", { name: "A1, 내가 선택한 좌석" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/선택한 좌석 수 : 1/)).toBeVisible();
    expect(screen.getByText(/결제까지 남은 시간/)).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: "A1, 내가 선택한 좌석" }),
    );
    expect(
      await screen.findByRole("button", { name: "A1, 선택 가능" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText(/선택한 좌석 수/)).not.toBeInTheDocument();
    expect(axiosBackend.delete).toHaveBeenLastCalledWith(
      "/main/detail/concert-1/seat-holds",
      {
        withCredentials: true,
        data: { concertTimeId: 1, seatNumberList: ["A1"] },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "A1, 선택 가능" }));
    expect(
      await screen.findByRole("button", { name: "A1, 내가 선택한 좌석" }),
    ).toBeVisible();
    fireEvent.click((await screen.findByText("19:00")).closest("div"));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "A1, 예약 완료" }),
      ).toBeDisabled();
    });
    expect(screen.queryByText(/선택한 좌석 수/)).not.toBeInTheDocument();
    expect(screen.queryByText("총 결제 금액")).not.toBeInTheDocument();
    expect(axiosBackend.delete).toHaveBeenLastCalledWith(
      "/main/detail/concert-1/seat-holds",
      {
        withCredentials: true,
        data: { concertTimeId: 1, seatNumberList: ["A1"] },
      },
    );
  });

  it("ignores a stale seat response from a previously selected performance", async () => {
    const firstResponse = createDeferred();
    const secondResponse = createDeferred();
    mockConcertRequests(firstResponse.promise, secondResponse.promise);
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    fireEvent.click((await screen.findByText("19:00")).closest("div"));

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

  it("posts the complete owned seat set and keeps the earliest deadline", async () => {
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));

    fireEvent.click(
      await screen.findByRole("button", { name: "A1, 선택 가능" }),
    );
    expect(
      await screen.findByRole("button", { name: "A1, 내가 선택한 좌석" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "A3, 선택 가능" }));

    expect(
      await screen.findByRole("button", { name: "A3, 내가 선택한 좌석" }),
    ).toBeVisible();
    expect(axiosBackend.post).toHaveBeenLastCalledWith(
      "/main/detail/concert-1/seat-holds",
      { concertTimeId: 1, seatNumberList: ["A1", "A3"] },
      { withCredentials: true },
    );
    expect(screen.getByText(/선택한 좌석 수 : 2/)).toBeVisible();
  });

  it("recovers the latest seats after a 409 conflict", async () => {
    axiosBackend.post.mockRejectedValueOnce({ response: { status: 409 } });
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    fireEvent.click(
      await screen.findByRole("button", { name: "A1, 선택 가능" }),
    );

    expect(
      await screen.findByText(/다른 사용자가 먼저 선택한 좌석/),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "A1, 내가 선택한 좌석" }),
    ).not.toBeInTheDocument();
    expect(axiosBackend.get).toHaveBeenCalledWith(
      "/main/detail/concert-1/calendar/1",
    );
  });

  it("redirects an unauthenticated hold response to login", async () => {
    axiosBackend.post.mockRejectedValueOnce({ response: { status: 401 } });
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    fireEvent.click(
      await screen.findByRole("button", { name: "A1, 선택 가능" }),
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/login"));
    expect(screen.getByText(/로그인 후 좌석을 선택/)).toBeVisible();
  });

  it("keeps a 400 response out of the payment selection", async () => {
    axiosBackend.post.mockRejectedValueOnce({ response: { status: 400 } });
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    fireEvent.click(
      await screen.findByRole("button", { name: "A1, 선택 가능" }),
    );

    expect(
      await screen.findByText(/좌석 또는 공연 회차 정보를 다시 확인/),
    ).toBeVisible();
    expect(screen.queryByText("총 결제 금액")).not.toBeInTheDocument();
  });

  it("removes an expired owned seat and reloads server availability", async () => {
    const expiresAt = new Date(Date.now() + 100).toISOString();
    axiosBackend.post.mockResolvedValueOnce({
      data: { seats: [{ seatNumber: "A1", expiresAt }] },
    });
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    fireEvent.click(
      await screen.findByRole("button", { name: "A1, 선택 가능" }),
    );

    expect(
      await screen.findByRole("button", { name: "A1, 내가 선택한 좌석" }),
    ).toBeVisible();
    expect(await screen.findByText(/좌석 임시 점유 시간이 만료/)).toBeVisible();
    expect(screen.queryByText(/선택한 좌석 수/)).not.toBeInTheDocument();
  });

  it("blocks back navigation until a pending hold can be released", async () => {
    const holdResponse = createDeferred();
    axiosBackend.post.mockReturnValueOnce(holdResponse.promise);
    render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    fireEvent.click(
      await screen.findByRole("button", { name: "A1, 선택 가능" }),
    );

    expect(await screen.findByText(/좌석 상태를 처리/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "뒤로가기" }));
    expect(navigate).not.toHaveBeenCalledWith("/concertDetail/concert-1");
    expect(axiosBackend.delete).not.toHaveBeenCalled();

    holdResponse.resolve({
      data: {
        seats: [{ seatNumber: "A1", expiresAt: "2030-01-01T12:05:00" }],
      },
    });
    expect(
      await screen.findByRole("button", { name: "A1, 내가 선택한 좌석" }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "뒤로가기" }));
    await waitFor(() =>
      expect(axiosBackend.delete).toHaveBeenCalledWith(
        "/main/detail/concert-1/seat-holds",
        {
          withCredentials: true,
          data: { concertTimeId: 1, seatNumberList: ["A1"] },
        },
      ),
    );
    expect(navigate).toHaveBeenCalledWith("/concertDetail/concert-1");
  });

  it("preserves owned holds when navigating to payment", async () => {
    const { unmount } = render(<ConcertReservation />);

    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    fireEvent.click(
      await screen.findByRole("button", { name: "A1, 선택 가능" }),
    );
    expect(
      await screen.findByRole("button", { name: "A1, 내가 선택한 좌석" }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "일반 결제" }));
    expect(navigate).toHaveBeenCalledWith(
      "/payment/inosis",
      expect.objectContaining({
        state: expect.objectContaining({
          concertID: "concert-1",
          reservationData: expect.objectContaining({
            concertTimeId: 1,
            seatNumberList: ["A1"],
          }),
        }),
      }),
    );

    axiosBackend.delete.mockClear();
    unmount();
    expect(axiosBackend.delete).not.toHaveBeenCalled();
  });
});
