import { describe, expect, it } from "vitest";

import {
  SEAT_AVAILABILITY,
  mapSeatResponseToLayout,
} from "../utils/seatAvailability";
import {
  createVirtualSeatRows,
  replaceFirstSeatAvailability,
} from "./virtualSeatFixture";

describe("virtual seat measurement fixture", () => {
  it("creates stable row and seat identifiers", () => {
    const rows = createVirtualSeatRows({ rows: 50, seatsPerRow: 40 });

    expect(rows).toHaveLength(50);
    expect(rows.flat()).toHaveLength(2000);
    expect(rows[0][0].id).toBe("R001-S001");
    expect(rows[49][39].id).toBe("R050-S040");
  });

  it("changes one status without mutating the original fixture", () => {
    const rows = createVirtualSeatRows({ rows: 3, seatsPerRow: 8 });
    const changed = replaceFirstSeatAvailability(rows, SEAT_AVAILABILITY.HELD);

    expect(rows[0][0].availability).toBe(SEAT_AVAILABILITY.AVAILABLE);
    expect(changed[0][0].availability).toBe(SEAT_AVAILABILITY.HELD);
    expect(changed[0][1]).toBe(rows[0][1]);
  });

  it("reproduces the current 24-seat layout dropping the 2,000-seat fixture", () => {
    const currentLayout = ["A", "B", "C"].map((row) =>
      Array.from({ length: 8 }, (_, index) => ({
        id: `${row}${index + 1}`,
        availability: SEAT_AVAILABILITY.UNAVAILABLE,
      })),
    );
    const loadTestSeats = createVirtualSeatRows({
      rows: 50,
      seatsPerRow: 40,
    })
      .flat()
      .map(({ id, availability }) => ({ seatNumber: id, availability }));

    const mappedSeats = mapSeatResponseToLayout(
      currentLayout,
      loadTestSeats,
    ).flat();

    expect(loadTestSeats).toHaveLength(2000);
    expect(mappedSeats).toHaveLength(24);
    expect(
      mappedSeats.filter(
        ({ availability }) => availability === SEAT_AVAILABILITY.AVAILABLE,
      ),
    ).toHaveLength(0);
    expect(
      mappedSeats.filter(
        ({ availability }) => availability === SEAT_AVAILABILITY.UNAVAILABLE,
      ),
    ).toHaveLength(24);
  });
});
