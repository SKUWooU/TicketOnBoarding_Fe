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
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, reject, resolve };
}

function loadTestSectionDetail(sectionCode, firstRow) {
  return {
    layoutVersion: "loadtest-sectioned-v1",
    sectionCode,
    sectionName: `${Number(sectionCode.slice(1))}구역`,
    sectionOrder: Number(sectionCode.slice(1)),
    seats: Array.from({ length: 200 }, (_, index) => {
      const rowOrder = firstRow + Math.floor(index / 40);
      const seatIndex = (index % 40) + 1;
      return {
        seatNumber: `R${String(rowOrder).padStart(3, "0")}-S${String(seatIndex).padStart(3, "0")}`,
        rowLabel: `R${String(rowOrder).padStart(3, "0")}`,
        rowOrder,
        seatIndex,
        availability: "AVAILABLE",
        holdExpiresAt: null,
      };
    }),
  };
}

function mockConcertRequests(firstSeatResponse, secondSeatResponse) {
  const sectionSummary = (seatResponse) =>
    seatResponse.then(({ data }) => {
      const availableSeats = data.filter(
        (seat) => seat.availability === "AVAILABLE" || seat.reserved === false,
      ).length;
      const heldSeats = data.filter(
        (seat) => seat.availability === "HELD",
      ).length;
      const reservedSeats = data.length - availableSeats - heldSeats;
      return {
        data: {
          layoutVersion: "virtual-24-v1",
          sections: [
            {
              sectionCode: "GENERAL",
              sectionName: "일반석",
              sectionOrder: 1,
              totalSeats: data.length,
              availableSeats,
              heldSeats,
              reservedSeats,
            },
          ],
        },
      };
    });
  const sectionDetail = (seatResponse) =>
    seatResponse.then(({ data }) => ({
      data: {
        layoutVersion: "virtual-24-v1",
        sectionCode: "GENERAL",
        sectionName: "일반석",
        sectionOrder: 1,
        seats: data.map((seat, index) => ({
          ...seat,
          rowLabel: "A",
          rowOrder: 1,
          seatIndex: index + 1,
        })),
      },
    }));

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

    if (url.endsWith("/calendar/1/seat-sections")) {
      return sectionSummary(firstSeatResponse);
    }
    if (url.endsWith("/calendar/2/seat-sections")) {
      return sectionSummary(secondSeatResponse);
    }
    if (url.endsWith("/calendar/1/seat-sections/GENERAL")) {
      return sectionDetail(firstSeatResponse);
    }
    if (url.endsWith("/calendar/2/seat-sections/GENERAL")) {
      return sectionDetail(secondSeatResponse);
    }

    return Promise.reject(new Error(`unexpected fixture URL: ${url}`));
  });
}

describe("ConcertReservation seat selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosBackend.delete.mockResolvedValue({ status: 204 });
    axiosBackend.post.mockImplementation((...requestArguments) => {
      const url = requestArguments[0];
      const request = requestArguments[1];
      if (url.endsWith("/checkouts")) {
        return Promise.resolve({
          data: {
            merchantUid: "checkout-1",
            amount: 45000,
            expiresAt: "2030-01-01T12:05:00",
            status: "READY",
          },
        });
      }

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

  it("loads only the selected two-hundred-seat section from a 2,000-seat fixture", async () => {
    const sections = Array.from({ length: 10 }, (_, index) => ({
      sectionCode: `S${String(index + 1).padStart(2, "0")}`,
      sectionName: `${index + 1}구역`,
      sectionOrder: index + 1,
      totalSeats: 200,
      availableSeats: 200,
      heldSeats: 0,
      reservedSeats: 0,
    }));
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
      if (url.endsWith("/calendar/1/seat-sections")) {
        return Promise.resolve({
          data: { layoutVersion: "loadtest-sectioned-v1", sections },
        });
      }
      if (url.endsWith("/seat-sections/S01")) {
        return Promise.resolve({ data: loadTestSectionDetail("S01", 1) });
      }
      if (url.endsWith("/seat-sections/S02")) {
        return Promise.resolve({ data: loadTestSectionDetail("S02", 6) });
      }
      return Promise.reject(new Error(`unexpected fixture URL: ${url}`));
    });

    render(<ConcertReservation />);
    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));

    expect(await screen.findByRole("button", { name: /R001-S001/ })).toBeVisible();
    expect(screen.getAllByRole("button", { name: /R\d{3}-S\d{3}/ })).toHaveLength(200);
    expect(screen.queryByRole("button", { name: /R006-S001/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /2구역/ }));
    expect(await screen.findByRole("button", { name: /R006-S001/ })).toBeVisible();
    expect(screen.queryByRole("button", { name: /R001-S001/ })).not.toBeInTheDocument();
    expect(axiosBackend.get).not.toHaveBeenCalledWith(
      "/main/detail/concert-1/calendar/1",
    );
  });

  it("ignores a stale section response after a newer section is selected", async () => {
    const staleSection = createDeferred();
    const sections = ["S01", "S02", "S03"].map((sectionCode, index) => ({
      sectionCode,
      sectionName: `${index + 1}구역`,
      sectionOrder: index + 1,
      totalSeats: 200,
      availableSeats: 200,
      heldSeats: 0,
      reservedSeats: 0,
    }));
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
      if (url.endsWith("/calendar/1/seat-sections")) {
        return Promise.resolve({
          data: { layoutVersion: "loadtest-sectioned-v1", sections },
        });
      }
      if (url.endsWith("/seat-sections/S01")) {
        return Promise.resolve({ data: loadTestSectionDetail("S01", 1) });
      }
      if (url.endsWith("/seat-sections/S02")) return staleSection.promise;
      if (url.endsWith("/seat-sections/S03")) {
        return Promise.resolve({ data: loadTestSectionDetail("S03", 11) });
      }
      return Promise.reject(new Error(`unexpected fixture URL: ${url}`));
    });

    render(<ConcertReservation />);
    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    expect(await screen.findByRole("button", { name: /R001-S001/ })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /2구역/ }));
    fireEvent.click(screen.getByRole("button", { name: /3구역/ }));
    expect(await screen.findByRole("button", { name: /R011-S001/ })).toBeVisible();

    staleSection.resolve({ data: loadTestSectionDetail("S02", 6) });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /R011-S001/ })).toBeVisible();
    });
    expect(screen.queryByRole("button", { name: /R006-S001/ })).not.toBeInTheDocument();
  });

  it("keeps owned holds when leaving and returning to a section", async () => {
    const sections = ["S01", "S02"].map((sectionCode, index) => ({
      sectionCode,
      sectionName: `${index + 1}구역`,
      sectionOrder: index + 1,
      totalSeats: 200,
      availableSeats: 200,
      heldSeats: 0,
      reservedSeats: 0,
    }));
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
      if (url.endsWith("/calendar/1/seat-sections")) {
        return Promise.resolve({
          data: { layoutVersion: "loadtest-sectioned-v1", sections },
        });
      }
      if (url.endsWith("/seat-sections/S01")) {
        return Promise.resolve({ data: loadTestSectionDetail("S01", 1) });
      }
      if (url.endsWith("/seat-sections/S02")) {
        return Promise.resolve({ data: loadTestSectionDetail("S02", 6) });
      }
      return Promise.reject(new Error(`unexpected fixture URL: ${url}`));
    });

    render(<ConcertReservation />);
    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    fireEvent.click(
      await screen.findByRole("button", { name: /R001-S001, 선택 가능/ }),
    );
    expect(
      await screen.findByRole("button", {
        name: /R001-S001, 내가 선택한 좌석/,
      }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /2구역/ }));
    expect(await screen.findByRole("button", { name: /R006-S001/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /1구역/ }));

    expect(
      await screen.findByRole("button", {
        name: /R001-S001, 내가 선택한 좌석/,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/선택한 좌석 수 : 1/)).toBeVisible();
  });

  it("falls back to the legacy 24-seat endpoint only for layout 409", async () => {
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
      if (url.endsWith("/calendar/1/seat-sections")) {
        return Promise.reject({ response: { status: 409 } });
      }
      if (url.endsWith("/calendar/1")) {
        return Promise.resolve({
          data: [{ seatNumber: "A1", availability: "AVAILABLE" }],
        });
      }
      return Promise.reject(new Error(`unexpected fixture URL: ${url}`));
    });

    render(<ConcertReservation />);
    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));

    expect(await screen.findByText(/기존 24석 좌석 배치/)).toBeVisible();
    expect(screen.getByRole("button", { name: "A1, 선택 가능" })).toBeVisible();
    expect(axiosBackend.get).toHaveBeenCalledWith(
      "/main/detail/concert-1/calendar/1",
    );
  });

  it("fails closed without a legacy request when section lookup returns 404", async () => {
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
      if (url.endsWith("/calendar/1/seat-sections")) {
        return Promise.reject({ response: { status: 404 } });
      }
      return Promise.reject(new Error(`unexpected fixture URL: ${url}`));
    });

    render(<ConcertReservation />);
    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));

    expect(await screen.findByText(/좌석 배치를 불러오지 못했습니다/)).toBeVisible();
    expect(axiosBackend.get).not.toHaveBeenCalledWith(
      "/main/detail/concert-1/calendar/1",
    );
  });

  it("ignores a failed legacy fallback from an older performance request", async () => {
    const staleLegacy = createDeferred();
    const currentSummary = {
      layoutVersion: "virtual-24-v1",
      sections: [
        {
          sectionCode: "GENERAL",
          sectionName: "일반석",
          sectionOrder: 1,
          totalSeats: 1,
          availableSeats: 0,
          heldSeats: 0,
          reservedSeats: 1,
        },
      ],
    };
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
      if (url.endsWith("/calendar/1/seat-sections")) {
        return Promise.reject({ response: { status: 409 } });
      }
      if (url.endsWith("/calendar/1")) return staleLegacy.promise;
      if (url.endsWith("/calendar/2/seat-sections")) {
        return Promise.resolve({ data: currentSummary });
      }
      if (url.endsWith("/calendar/2/seat-sections/GENERAL")) {
        return Promise.resolve({
          data: {
            layoutVersion: "virtual-24-v1",
            sectionCode: "GENERAL",
            sectionName: "일반석",
            sectionOrder: 1,
            seats: [
              {
                seatNumber: "A1",
                rowLabel: "A",
                rowOrder: 1,
                seatIndex: 1,
                availability: "RESERVED",
              },
            ],
          },
        });
      }
      return Promise.reject(new Error(`unexpected fixture URL: ${url}`));
    });

    render(<ConcertReservation />);
    expect(await screen.findByText("Fixture 공연")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "2024-06-15 선택" }));
    fireEvent.click((await screen.findByText("17:00")).closest("div"));
    await waitFor(() =>
      expect(axiosBackend.get).toHaveBeenCalledWith(
        "/main/detail/concert-1/calendar/1",
      ),
    );

    fireEvent.click((await screen.findByText("19:00")).closest("div"));
    expect(
      await screen.findByRole("button", { name: "A1, 예약 완료" }),
    ).toBeDisabled();

    staleLegacy.reject(new Error("stale legacy failure"));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "A1, 예약 완료" }),
      ).toBeDisabled();
    });
    expect(screen.queryByText(/좌석 배치를 불러오지 못했습니다/)).not.toBeInTheDocument();
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
      "/main/detail/concert-1/calendar/1/seat-sections",
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
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        "/payment",
        expect.objectContaining({
          state: expect.objectContaining({
            concertId: "concert-1",
            checkout: expect.objectContaining({
              amount: 45000,
              merchantUid: "checkout-1",
              status: "READY",
            }),
            reservationData: expect.objectContaining({
              concertTimeId: 1,
              seatNumberList: ["A1"],
            }),
          }),
        }),
      ),
    );
    expect(axiosBackend.post).toHaveBeenCalledWith(
      "/main/detail/concert-1/checkouts",
      expect.objectContaining({
        concertTimeId: 1,
        seatNumberList: ["A1"],
      }),
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({
          "Idempotency-Key": expect.stringMatching(/^checkout-/),
        }),
      }),
    );

    axiosBackend.delete.mockClear();
    unmount();
    expect(axiosBackend.delete).not.toHaveBeenCalled();
  });

  it.each([
    [409, /선택한 좌석 상태가 변경되었습니다/],
    [410, /좌석 임시 점유가 만료되었습니다/],
    [422, /같은 요청 키에 다른 예약 정보가 전달되었습니다/],
    [503, /Checkout 서비스를 사용할 수 없습니다/],
  ])(
    "keeps checkout error %s out of the payment page",
    async (status, message) => {
      axiosBackend.post.mockImplementation((url, request) => {
        if (url.endsWith("/checkouts")) {
          return Promise.reject({ response: { status } });
        }
        return Promise.resolve({
          data: {
            seats: request.seatNumberList.map((seatNumber) => ({
              seatNumber,
              expiresAt: "2030-01-01T12:05:00",
            })),
          },
        });
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
      fireEvent.click(screen.getByRole("button", { name: "일반 결제" }));

      expect(await screen.findByText(message)).toBeVisible();
      expect(navigate).not.toHaveBeenCalledWith("/payment", expect.anything());
    },
  );

  it("reuses the checkout idempotency key when a 503 preparation is retried", async () => {
    axiosBackend.post.mockImplementation((url, request) => {
      if (url.endsWith("/checkouts")) {
        return Promise.reject({ response: { status: 503 } });
      }
      return Promise.resolve({
        data: {
          seats: request.seatNumberList.map((seatNumber) => ({
            seatNumber,
            expiresAt: "2030-01-01T12:05:00",
          })),
        },
      });
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
    const paymentButton = screen.getByRole("button", { name: "일반 결제" });
    fireEvent.click(paymentButton);
    expect(
      await screen.findByText(/Checkout 서비스를 사용할 수 없습니다/),
    ).toBeVisible();
    fireEvent.click(paymentButton);
    await waitFor(() => {
      const checkoutCalls = axiosBackend.post.mock.calls.filter(([url]) =>
        url.endsWith("/checkouts"),
      );
      expect(checkoutCalls).toHaveLength(2);
      expect(checkoutCalls[0][2].headers["Idempotency-Key"]).toBe(
        checkoutCalls[1][2].headers["Idempotency-Key"],
      );
    });
  });
});
