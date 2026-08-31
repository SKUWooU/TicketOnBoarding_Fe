import { describe, expect, it } from "vitest";

import {
  SEAT_AVAILABILITY,
  isSeatSelectable,
  mapSeatResponseToLayout,
  normalizeSeatAvailability,
} from "./seatAvailability";

describe("seat availability contract", () => {
  it.each([
    [{ availability: "AVAILABLE", reserved: true }, "AVAILABLE"],
    [{ availability: "held", reserved: false }, "HELD"],
    [{ availability: "RESERVED", reserved: false }, "RESERVED"],
    [{ reserved: false }, "AVAILABLE"],
    [{ reserved: true }, "RESERVED"],
    [{ availability: "UNKNOWN", reserved: false }, "UNAVAILABLE"],
    [{}, "UNAVAILABLE"],
  ])("normalizes %o to %s", (seat, expected) => {
    expect(normalizeSeatAvailability(seat)).toBe(expected);
  });

  it("maps API seats while making missing layout seats unavailable", () => {
    const layout = [
      [
        { id: "A1", availability: SEAT_AVAILABILITY.UNAVAILABLE },
        { id: "A2", availability: SEAT_AVAILABILITY.UNAVAILABLE },
        null,
        { id: "A3", availability: SEAT_AVAILABILITY.UNAVAILABLE },
      ],
    ];

    const [mappedRow] = mapSeatResponseToLayout(layout, [
      {
        seatNumber: "A1",
        availability: "HELD",
        holdExpiresAt: "2030-01-01T12:05:00",
      },
      { seatNumber: "A2", reserved: false },
    ]);

    expect(mappedRow).toEqual([
      {
        id: "A1",
        availability: "HELD",
        holdExpiresAt: "2030-01-01T12:05:00",
      },
      { id: "A2", availability: "AVAILABLE", holdExpiresAt: null },
      null,
      { id: "A3", availability: "UNAVAILABLE", holdExpiresAt: null },
    ]);
  });

  it("allows only explicitly available seats to be selected", () => {
    expect(isSeatSelectable({ availability: "AVAILABLE" })).toBe(true);
    expect(isSeatSelectable({ availability: "HELD" })).toBe(false);
    expect(isSeatSelectable({ availability: "RESERVED" })).toBe(false);
    expect(isSeatSelectable({ availability: "UNAVAILABLE" })).toBe(false);
  });
});
