export class InvalidSeatHoldResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidSeatHoldResponseError";
  }
}

function expiryTimestamp(expiresAt) {
  const timestamp = Date.parse(expiresAt);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function normalizeOwnedHolds(response, expectedSeatNumbers) {
  const responseSeats = Array.isArray(response?.seats) ? response.seats : [];
  if (responseSeats.length !== expectedSeatNumbers.length) {
    throw new InvalidSeatHoldResponseError(
      "점유 응답의 좌석 수가 요청한 좌석 수와 일치하지 않습니다.",
    );
  }

  const holdsBySeat = new Map(
    responseSeats
      .filter((seat) => typeof seat?.seatNumber === "string")
      .map((seat) => [seat.seatNumber, seat.expiresAt]),
  );

  if (holdsBySeat.size !== expectedSeatNumbers.length) {
    throw new InvalidSeatHoldResponseError(
      "점유 응답에 중복되거나 식별할 수 없는 좌석이 있습니다.",
    );
  }

  return Object.fromEntries(
    expectedSeatNumbers.map((seatNumber) => {
      const expiresAt = holdsBySeat.get(seatNumber);
      if (!expiresAt || expiryTimestamp(expiresAt) === null) {
        throw new InvalidSeatHoldResponseError(
          `점유 응답에 ${seatNumber} 좌석의 유효한 만료 시각이 없습니다.`,
        );
      }
      return [seatNumber, expiresAt];
    }),
  );
}

export function earliestHoldExpiry(ownedHolds) {
  const timestamps = Object.values(ownedHolds)
    .map(expiryTimestamp)
    .filter((timestamp) => timestamp !== null);

  return timestamps.length > 0 ? Math.min(...timestamps) : null;
}

export function holdRemainingSeconds(ownedHolds, now = Date.now()) {
  const earliestExpiry = earliestHoldExpiry(ownedHolds);
  if (earliestExpiry === null) return null;

  return Math.max(0, Math.ceil((earliestExpiry - now) / 1000));
}

export function activeOwnedHolds(ownedHolds, now = Date.now()) {
  return Object.fromEntries(
    Object.entries(ownedHolds).filter(([, expiresAt]) => {
      const timestamp = expiryTimestamp(expiresAt);
      return timestamp !== null && timestamp > now;
    }),
  );
}

export function formatHoldCountdown(remainingSeconds) {
  if (remainingSeconds === null) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

export function seatHoldErrorMessage(error) {
  switch (error?.response?.status) {
    case 400:
      return "좌석 또는 공연 회차 정보를 다시 확인해주세요.";
    case 401:
      return "로그인 후 좌석을 선택할 수 있습니다.";
    case 409:
      return "다른 사용자가 먼저 선택한 좌석입니다. 최신 좌석 상태를 불러왔습니다.";
    default:
      return "좌석 점유 처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
}
