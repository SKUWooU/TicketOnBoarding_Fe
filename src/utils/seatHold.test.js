import { describe, expect, it } from "vitest";

import {
  InvalidSeatHoldResponseError,
  activeOwnedHolds,
  earliestHoldExpiry,
  formatHoldCountdown,
  holdRemainingSeconds,
  normalizeOwnedHolds,
  seatHoldErrorMessage,
} from "./seatHold";

describe("seat hold contract", () => {
  it("keeps each seat expiry and uses the earliest as the payment deadline", () => {
    const ownedHolds = normalizeOwnedHolds(
      {
        seats: [
          { seatNumber: "A2", expiresAt: "2030-01-01T12:05:30" },
          { seatNumber: "A1", expiresAt: "2030-01-01T12:04:00" },
        ],
      },
      ["A1", "A2"],
    );

    expect(ownedHolds).toEqual({
      A1: "2030-01-01T12:04:00",
      A2: "2030-01-01T12:05:30",
    });
    expect(earliestHoldExpiry(ownedHolds)).toBe(
      Date.parse("2030-01-01T12:04:00"),
    );
    expect(
      holdRemainingSeconds(ownedHolds, Date.parse("2030-01-01T12:03:01")),
    ).toBe(59);
  });

  it("rejects a partial or malformed successful response", () => {
    expect(() =>
      normalizeOwnedHolds(
        { seats: [{ seatNumber: "A1", expiresAt: "not-a-date" }] },
        ["A1"],
      ),
    ).toThrow(InvalidSeatHoldResponseError);
    expect(() =>
      normalizeOwnedHolds(
        { seats: [{ seatNumber: "A1", expiresAt: "2030-01-01T12:05:00" }] },
        ["A1", "A2"],
      ),
    ).toThrow(/좌석 수/);
  });

  it("rejects extra or duplicate seats in a successful response", () => {
    expect(() =>
      normalizeOwnedHolds(
        {
          seats: [
            { seatNumber: "A1", expiresAt: "2030-01-01T12:05:00" },
            { seatNumber: "A2", expiresAt: "2030-01-01T12:05:00" },
          ],
        },
        ["A1"],
      ),
    ).toThrow(/좌석 수/);

    expect(() =>
      normalizeOwnedHolds(
        {
          seats: [
            { seatNumber: "A1", expiresAt: "2030-01-01T12:05:00" },
            { seatNumber: "A1", expiresAt: "2030-01-01T12:05:00" },
          ],
        },
        ["A1", "A2"],
      ),
    ).toThrow(/중복/);
  });

  it("removes expired ownership without extending later seats", () => {
    expect(
      activeOwnedHolds(
        {
          A1: "2030-01-01T12:04:00",
          A2: "2030-01-01T12:05:30",
        },
        Date.parse("2030-01-01T12:04:00"),
      ),
    ).toEqual({ A2: "2030-01-01T12:05:30" });
  });

  it("formats the earliest remaining time as a countdown", () => {
    expect(formatHoldCountdown(272)).toBe("04:32");
    expect(formatHoldCountdown(0)).toBe("00:00");
    expect(formatHoldCountdown(null)).toBeNull();
  });

  it.each([
    [400, "좌석 또는 공연 회차 정보를 다시 확인해주세요."],
    [401, "로그인 후 좌석을 선택할 수 있습니다."],
    [409, "다른 사용자가 먼저 선택한 좌석입니다."],
    [500, "좌석 점유 처리에 실패했습니다."],
  ])("maps HTTP %s to user feedback", (status, expected) => {
    expect(seatHoldErrorMessage({ response: { status } })).toContain(expected);
  });
});
