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
      screen.getByRole("button", { name: "A2, 다른 사용자가 선택 중" }),
    ).toBeDisabled();
    expect(screen.queryByText("12:05")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "A3, 예약 완료" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "A4, 상태 확인 불가" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "A5, 다른 사용자가 선택 중" }),
    ).toBeDisabled();
  });

  it("keeps an owned held seat interactive for explicit release", () => {
    render(
      <SeatSelectionGrid
        seats={seats}
        selectedSeats={["A2"]}
        onSeatClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "A2, 내가 선택한 좌석" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "A2, 내가 선택한 좌석" }),
    ).not.toBeDisabled();
    expect(screen.getByText("다른 사용자 선택 중")).toBeVisible();
    expect(screen.getByText(/정확한 점유 만료 시각/)).toBeVisible();
  });

  it("disables every seat while a hold mutation is pending", () => {
    const { container } = render(
      <SeatSelectionGrid
        seats={seats}
        selectedSeats={["A1"]}
        interactionDisabled
        onSeatClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "A1, 내가 선택한 좌석" }),
    ).toBeDisabled();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });
});
