import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SEAT_AVAILABILITY } from "../utils/seatAvailability";
import SeatSelectionGrid from "./SeatSelectionGrid";

const seats = [
  [
    { id: "A1", availability: SEAT_AVAILABILITY.AVAILABLE },
    {
      id: "A2",
      availability: SEAT_AVAILABILITY.HELD,
      holdExpiresAt: "2030-01-01T12:05:00",
    },
    { id: "A3", availability: SEAT_AVAILABILITY.RESERVED },
    { id: "A4", availability: SEAT_AVAILABILITY.UNAVAILABLE },
    { id: "A5", availability: SEAT_AVAILABILITY.HELD },
  ],
];

describe("SeatSelectionGrid", () => {
  it("allows only available seats to invoke selection", () => {
    const onSeatClick = vi.fn();
    render(
      <SeatSelectionGrid
        seats={seats}
        selectedSeats={[]}
        onSeatClick={onSeatClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "A1, 선택 가능" }));

    expect(onSeatClick).toHaveBeenCalledOnce();
    expect(onSeatClick).toHaveBeenCalledWith(seats[0][0]);
    expect(
      screen.getByRole("button", { name: "A2, 임시 점유, 12:05까지" }),
    ).toBeDisabled();
    expect(screen.getByText("12:05")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "A3, 예약 완료" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "A4, 상태 확인 불가" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "A5, 임시 점유" }),
    ).toBeDisabled();
  });

  it("announces a selected available seat separately", () => {
    render(
      <SeatSelectionGrid
        seats={seats}
        selectedSeats={["A1"]}
        onSeatClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "A1, 선택 좌석" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("임시 점유")).toBeVisible();
    expect(screen.getByText(/서버 재조회 결과/)).toBeVisible();
  });
});
