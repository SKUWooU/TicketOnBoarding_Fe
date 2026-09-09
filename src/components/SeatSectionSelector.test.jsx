import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SeatSectionSelector from "./SeatSectionSelector";

describe("SeatSectionSelector", () => {
  it("shows inventory and exposes the selected section", () => {
    const onSelect = vi.fn();
    render(
      <SeatSectionSelector
        sections={[
          {
            sectionCode: "S01",
            sectionName: "1구역",
            availableSeats: 198,
            heldSeats: 1,
            reservedSeats: 1,
            totalSeats: 200,
          },
          {
            sectionCode: "S02",
            sectionName: "2구역",
            availableSeats: 200,
            heldSeats: 0,
            reservedSeats: 0,
            totalSeats: 200,
          },
        ]}
        selectedSectionCode="S01"
        disabled={false}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("button", { name: /1구역/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", {
        name: /선택 가능 198 · 선택 중 1 · 예약 완료 1 \/ 전체 200/,
      }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /2구역/ }));
    expect(onSelect).toHaveBeenCalledWith("S02");
  });
});
