import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SEAT_AVAILABILITY } from "../utils/seatAvailability";
import SeatSelectionGrid from "./SeatSelectionGrid";

describe("SeatSelectionGrid section layout", () => {
  it("shortens the visible seat label while retaining the full seat identifier", () => {
    render(
      <SeatSelectionGrid
        seats={[
          {
            rowLabel: "R001",
            seats: [
              {
                id: "R001-S001",
                availability: SEAT_AVAILABILITY.AVAILABLE,
              },
            ],
          },
        ]}
        selectedSeats={[]}
        onSeatClick={vi.fn()}
      />,
    );

    const seatButton = screen.getByRole("button", { name: /R001-S001/ });

    expect(screen.getByText("R001")).toBeVisible();
    expect(seatButton).toHaveTextContent("S001");
    expect(seatButton).toHaveAttribute("title", expect.stringContaining("R001-S001"));
  });
});
