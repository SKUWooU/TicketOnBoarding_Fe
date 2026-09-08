import { describe, expect, it } from "vitest";

import {
  mapSectionDetailToRows,
  normalizeSectionSummary,
} from "./seatLayout";

describe("seat layout contract", () => {
  it("sorts sections and rejects an inconsistent inventory summary", () => {
    const normalized = normalizeSectionSummary({
      layoutVersion: "loadtest-sectioned-v1",
      sections: [
        section("S02", 2),
        section("S01", 1),
      ],
    });
    expect(normalized.sections.map(({ sectionCode }) => sectionCode)).toEqual([
      "S01",
      "S02",
    ]);

    expect(() =>
      normalizeSectionSummary({
        layoutVersion: "v1",
        sections: [{ ...section("S01", 1), availableSeats: 199 }],
      }),
    ).toThrow(/전체 좌석 수/);
  });

  it("groups and sorts one two-hundred-seat section without parsing seat numbers", () => {
    const seats = Array.from({ length: 200 }, (_, index) => {
      const rowOrder = Math.floor(index / 40) + 1;
      const seatIndex = (index % 40) + 1;
      return {
        seatNumber: `opaque-${200 - index}`,
        rowLabel: `R${rowOrder}`,
        rowOrder,
        seatIndex,
        availability: "AVAILABLE",
      };
    }).reverse();

    const rows = mapSectionDetailToRows(
      { sectionCode: "S01", seats },
      "S01",
    );

    expect(rows).toHaveLength(5);
    expect(rows.every((row) => row.seats.length === 40)).toBe(true);
    expect(rows[0].rowOrder).toBe(1);
    expect(rows[0].seats.map(({ seatIndex }) => seatIndex)).toEqual(
      Array.from({ length: 40 }, (_, index) => index + 1),
    );
  });

  it("fails closed when the requested and returned sections differ", () => {
    expect(() =>
      mapSectionDetailToRows(
        { sectionCode: "S02", seats: [{ seatNumber: "A1" }] },
        "S01",
      ),
    ).toThrow(/일치하지 않습니다/);
  });
});

function section(sectionCode, sectionOrder) {
  return {
    sectionCode,
    sectionName: `${sectionOrder}구역`,
    sectionOrder,
    totalSeats: 200,
    availableSeats: 200,
    heldSeats: 0,
    reservedSeats: 0,
  };
}
