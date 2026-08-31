import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { holdSeats, releaseSeats } from "../api/seatHoldApi";
import {
  activeOwnedHolds,
  formatHoldCountdown,
  holdRemainingSeconds,
  normalizeOwnedHolds,
  seatHoldErrorMessage,
} from "../utils/seatHold";

function useSeatHoldManager({
  concertId,
  isLoggedIn,
  navigate,
  selectedPerformance,
  refreshSeats,
}) {
  const [ownedHolds, setOwnedHolds] = useState({});
  const [holdPending, setHoldPending] = useState(false);
  const [holdMessage, setHoldMessage] = useState("");
  const [clockNow, setClockNow] = useState(() => Date.now());
  const mutationSequence = useRef(0);
  const ownedHoldContext = useRef({ concertTimeId: null, holds: {} });
  const preserveForPayment = useRef(false);

  const selectedSeats = useMemo(() => Object.keys(ownedHolds), [ownedHolds]);
  const remainingSeconds = holdRemainingSeconds(ownedHolds, clockNow);
  const countdown = formatHoldCountdown(remainingSeconds);

  const replaceOwnedHolds = useCallback((concertTimeId, nextHolds) => {
    ownedHoldContext.current = { concertTimeId, holds: nextHolds };
    setOwnedHolds(nextHolds);
  }, []);

  const acquireSeat = useCallback(
    async (seat) => {
      if (!selectedPerformance || holdPending) return;
      if (!isLoggedIn) {
        setHoldMessage("로그인 후 좌석을 선택할 수 있습니다.");
        navigate("/login");
        return;
      }

      const targetSeatNumbers = [...selectedSeats, seat.id].sort();
      const requestSequence = ++mutationSequence.current;
      setHoldPending(true);
      setHoldMessage("");

      try {
        const response = await holdSeats(
          concertId,
          selectedPerformance.id,
          targetSeatNumbers,
        );
        if (requestSequence !== mutationSequence.current) return;

        const nextHolds = normalizeOwnedHolds(response, targetSeatNumbers);
        preserveForPayment.current = false;
        replaceOwnedHolds(selectedPerformance.id, nextHolds);
        setClockNow(Date.now());
        setHoldMessage("좌석을 결제 전까지 임시 점유했습니다.");
        await refreshSeats(selectedPerformance);
      } catch (error) {
        if (requestSequence !== mutationSequence.current) return;

        setHoldMessage(seatHoldErrorMessage(error));
        await refreshSeats(selectedPerformance);
        if (error?.response?.status === 401) navigate("/login");
      } finally {
        if (requestSequence === mutationSequence.current) {
          setHoldPending(false);
        }
      }
    },
    [
      concertId,
      holdPending,
      isLoggedIn,
      navigate,
      refreshSeats,
      replaceOwnedHolds,
      selectedPerformance,
      selectedSeats,
    ],
  );

  const releaseSeat = useCallback(
    async (seatNumber) => {
      if (!selectedPerformance || holdPending) return;

      const requestSequence = ++mutationSequence.current;
      setHoldPending(true);
      setHoldMessage("");

      try {
        await releaseSeats(concertId, selectedPerformance.id, [seatNumber]);
        if (requestSequence !== mutationSequence.current) return;

        const nextHolds = { ...ownedHolds };
        delete nextHolds[seatNumber];
        replaceOwnedHolds(selectedPerformance.id, nextHolds);
        setHoldMessage("선택한 좌석의 임시 점유를 해제했습니다.");
        await refreshSeats(selectedPerformance);
      } catch (error) {
        if (requestSequence !== mutationSequence.current) return;

        setHoldMessage(seatHoldErrorMessage(error));
        await refreshSeats(selectedPerformance);
      } finally {
        if (requestSequence === mutationSequence.current) {
          setHoldPending(false);
        }
      }
    },
    [
      concertId,
      holdPending,
      ownedHolds,
      refreshSeats,
      replaceOwnedHolds,
      selectedPerformance,
    ],
  );

  const toggleSeat = useCallback(
    async (seat) => {
      if (ownedHolds[seat.id]) {
        await releaseSeat(seat.id);
        return;
      }
      await acquireSeat(seat);
    },
    [acquireSeat, ownedHolds, releaseSeat],
  );

  const releaseAll = useCallback(async () => {
    const { concertTimeId, holds } = ownedHoldContext.current;
    const seatNumbers = Object.keys(holds);
    const requestSequence = ++mutationSequence.current;
    replaceOwnedHolds(null, {});
    preserveForPayment.current = false;

    if (concertTimeId === null || seatNumbers.length === 0) return true;

    setHoldPending(true);
    try {
      await releaseSeats(concertId, concertTimeId, seatNumbers);
      return true;
    } catch (error) {
      setHoldMessage(
        `${seatHoldErrorMessage(error)} 서버 점유는 만료 시각에 자동 해제됩니다.`,
      );
      return false;
    } finally {
      if (requestSequence === mutationSequence.current) {
        setHoldPending(false);
      }
    }
  }, [concertId, replaceOwnedHolds]);

  const keepForPayment = useCallback(() => {
    preserveForPayment.current = true;
  }, []);

  useEffect(() => {
    if (selectedSeats.length === 0) return undefined;

    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [selectedSeats.length]);

  useEffect(() => {
    if (remainingSeconds !== 0 || selectedSeats.length === 0) return;

    const activeHolds = activeOwnedHolds(ownedHolds, clockNow);
    if (Object.keys(activeHolds).length === selectedSeats.length) return;

    replaceOwnedHolds(selectedPerformance?.id ?? null, activeHolds);
    setHoldMessage(
      "좌석 임시 점유 시간이 만료되어 최신 좌석 상태를 불러왔습니다.",
    );
    if (selectedPerformance) refreshSeats(selectedPerformance);
  }, [
    clockNow,
    ownedHolds,
    refreshSeats,
    remainingSeconds,
    replaceOwnedHolds,
    selectedPerformance,
    selectedSeats.length,
  ]);

  useEffect(
    () => () => {
      const { concertTimeId, holds } = ownedHoldContext.current;
      const seatNumbers = Object.keys(holds);
      if (
        preserveForPayment.current ||
        concertTimeId === null ||
        seatNumbers.length === 0
      ) {
        return;
      }

      releaseSeats(concertId, concertTimeId, seatNumbers).catch(() => {
        // Browser teardown에서는 전송 성공을 보장할 수 없으며 Backend TTL이 회수한다.
      });
    },
    [concertId],
  );

  return {
    countdown,
    holdMessage,
    holdPending,
    keepForPayment,
    ownedHolds,
    releaseAll,
    selectedSeats,
    toggleSeat,
  };
}

export default useSeatHoldManager;
