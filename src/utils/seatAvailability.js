export const SEAT_AVAILABILITY = Object.freeze({
  AVAILABLE: "AVAILABLE",
  HELD: "HELD",
  RESERVED: "RESERVED",
  UNAVAILABLE: "UNAVAILABLE",
});

const KNOWN_AVAILABILITIES = new Set([
  SEAT_AVAILABILITY.AVAILABLE,
  SEAT_AVAILABILITY.HELD,
  SEAT_AVAILABILITY.RESERVED,
]);

export function normalizeSeatAvailability(seat) {
  if (typeof seat?.availability === "string") {
    const availability = seat.availability.toUpperCase();

    return KNOWN_AVAILABILITIES.has(availability)
      ? availability
      : SEAT_AVAILABILITY.UNAVAILABLE;
  }

  if (seat?.reserved === true) {
    return SEAT_AVAILABILITY.RESERVED;
  }

  if (seat?.reserved === false) {
    return SEAT_AVAILABILITY.AVAILABLE;
  }

  return SEAT_AVAILABILITY.UNAVAILABLE;
}

export function mapSeatResponseToLayout(layout, seatResponse) {
  const seatsByNumber = new Map(
    (Array.isArray(seatResponse) ? seatResponse : [])
      .filter((seat) => typeof seat?.seatNumber === "string")
      .map((seat) => [seat.seatNumber, seat]),
  );

  return layout.map((row) =>
    row.map((layoutSeat) => {
      if (!layoutSeat) return null;

      const responseSeat = seatsByNumber.get(layoutSeat.id);
      const availability = normalizeSeatAvailability(responseSeat);

      return {
        ...layoutSeat,
        availability,
        holdExpiresAt:
          availability === SEAT_AVAILABILITY.HELD
            ? responseSeat?.holdExpiresAt ?? null
            : null,
      };
    }),
  );
}

export function isSeatSelectable(seat) {
  return seat?.availability === SEAT_AVAILABILITY.AVAILABLE;
}
