import {
  SEAT_AVAILABILITY,
  normalizeSeatAvailability,
} from "./seatAvailability";

function requireNonBlank(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`좌석 layout의 ${field} 값이 올바르지 않습니다.`);
  }
  return value;
}

function requirePositiveInteger(value, field) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`좌석 layout의 ${field} 값이 올바르지 않습니다.`);
  }
  return value;
}

export function normalizeSectionSummary(response) {
  requireNonBlank(response?.layoutVersion, "layoutVersion");
  if (!Array.isArray(response?.sections) || response.sections.length === 0) {
    throw new Error("좌석 구역이 비어 있습니다.");
  }

  const sections = response.sections.map((section) => ({
    sectionCode: requireNonBlank(section?.sectionCode, "sectionCode"),
    sectionName: requireNonBlank(section?.sectionName, "sectionName"),
    sectionOrder: requirePositiveInteger(section?.sectionOrder, "sectionOrder"),
    totalSeats: requireNonNegativeInteger(section?.totalSeats, "totalSeats"),
    availableSeats: requireNonNegativeInteger(
      section?.availableSeats,
      "availableSeats",
    ),
    heldSeats: requireNonNegativeInteger(section?.heldSeats, "heldSeats"),
    reservedSeats: requireNonNegativeInteger(
      section?.reservedSeats,
      "reservedSeats",
    ),
  }));

  sections.forEach((section) => {
    if (
      section.availableSeats + section.heldSeats + section.reservedSeats !==
      section.totalSeats
    ) {
      throw new Error("좌석 구역 집계가 전체 좌석 수와 일치하지 않습니다.");
    }
  });

  return {
    layoutVersion: response.layoutVersion,
    sections: sections.sort((left, right) => left.sectionOrder - right.sectionOrder),
  };
}

function requireNonNegativeInteger(value, field) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`좌석 layout의 ${field} 값이 올바르지 않습니다.`);
  }
  return value;
}

export function mapSectionDetailToRows(response, expectedSectionCode) {
  if (response?.sectionCode !== expectedSectionCode) {
    throw new Error("요청한 구역과 좌석 상세 응답이 일치하지 않습니다.");
  }
  if (!Array.isArray(response?.seats) || response.seats.length === 0) {
    throw new Error("좌석 상세가 비어 있습니다.");
  }

  const rowMap = new Map();
  response.seats.forEach((seat) => {
    const rowLabel = requireNonBlank(seat?.rowLabel, "rowLabel");
    const rowOrder = requirePositiveInteger(seat?.rowOrder, "rowOrder");
    const seatIndex = requirePositiveInteger(seat?.seatIndex, "seatIndex");
    const seatNumber = requireNonBlank(seat?.seatNumber, "seatNumber");
    const availability = normalizeSeatAvailability(seat);
    const rowKey = `${rowOrder}:${rowLabel}`;
    const row = rowMap.get(rowKey) ?? { rowLabel, rowOrder, seats: [] };
    row.seats.push({
      id: seatNumber,
      rowLabel,
      rowOrder,
      seatIndex,
      availability,
      holdExpiresAt:
        availability === SEAT_AVAILABILITY.HELD
          ? seat.holdExpiresAt ?? null
          : null,
    });
    rowMap.set(rowKey, row);
  });

  return [...rowMap.values()]
    .sort((left, right) => left.rowOrder - right.rowOrder)
    .map((row) => ({
      ...row,
      seats: row.seats.sort((left, right) => left.seatIndex - right.seatIndex),
    }));
}

export function legacyRows(mappedSeats) {
  return mappedSeats.map((seats, index) => ({
    rowLabel: String.fromCharCode(65 + index),
    rowOrder: index + 1,
    seats,
  }));
}
