import { SEAT_AVAILABILITY } from "../utils/seatAvailability";

export function createVirtualSeatRows({
  rows,
  seatsPerRow,
  availability = SEAT_AVAILABILITY.AVAILABLE,
}) {
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: seatsPerRow }, (_, seatIndex) => ({
      id: `R${String(rowIndex + 1).padStart(3, "0")}-S${String(
        seatIndex + 1,
      ).padStart(3, "0")}`,
      availability,
      holdExpiresAt: null,
    })),
  );
}

export function replaceFirstSeatAvailability(rows, availability) {
  return rows.map((row, rowIndex) =>
    row.map((seat, seatIndex) =>
      rowIndex === 0 && seatIndex === 0 ? { ...seat, availability } : seat,
    ),
  );
}
