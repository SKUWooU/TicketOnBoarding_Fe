import Header from "../components/MainHeader";
import Footer from "../components/MainFooter";
import style from "../styles/ConcertDetail.module.scss";
import Btn from "../components/LoginBtn";
import SeatSelectionGrid from "../components/SeatSelectionGrid";
import SeatSectionSelector from "../components/SeatSectionSelector";
import useSeatHoldManager from "../hooks/useSeatHoldManager";
import {
  getLegacySeats,
  getSeatSection,
  getSeatSections,
} from "../api/seatLayoutApi";
import { prepareCheckout } from "../api/checkoutApi";
import { createIdempotencyKey } from "../utils/idempotencyKey";
import { saveCheckoutSession } from "../utils/checkoutSession";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import { useContext } from "react";
import AuthContext from "../components/AuthContext";

import {
  SEAT_AVAILABILITY,
  isSeatSelectable,
  mapSeatResponseToLayout,
} from "../utils/seatAvailability";
import {
  legacyRows,
  mapSectionDetailToRows,
  normalizeSectionSummary,
} from "../utils/seatLayout";

// MUIX DateCalendar를 위한 import 구문
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

import kakaoPay from "../assets/kakaoPay.svg";

const INITIAL_SEAT_LAYOUT = [
  ["A1", "A2", null, "A3", "A4", "A5", "A6", null, "A7", "A8"],
  ["B1", "B2", null, "B3", "B4", "B5", "B6", null, "B7", "B8"],
  ["C1", "C2", null, "C3", "C4", "C5", "C6", null, "C7", "C8"],
].map((row) =>
  row.map((seatNumber) =>
    seatNumber
      ? {
          id: seatNumber,
          availability: SEAT_AVAILABILITY.UNAVAILABLE,
          holdExpiresAt: null,
        }
      : null,
  ),
);

function ConcertReservation() {
  const [concertDetail, setConcertDetail] = useState({});
  // 공연 정보를 받아오는 API response State
  const [availableDates, setAvailableDates] = useState([]);
  // 해당 공연의 예매 가능한 날짜 정보 API response State
  const mapServiceKey = import.meta.env.VITE_REACT_APP_KAKAOMAP_SERVICE_KEY;

  /* Response의 형태 
  1. date: "2024-06-15"
  2. dayOfWeek: "토요일"
  3. id: 1 / 공연의 특정 시간대 ID 
  4. seatAmount: 24
  5. seatList: null
  6. startTime: "17:00:00"
  */
  const [selectedDatePerformances, setSelectedDatePerformances] = useState([]);

  const [selectedPerformance, setSelectedPerformance] = useState(null);
  // 선택된 공연의 시간
  const [dateChosen, setDateChosen] = useState(null);
  //선택된 날짜
  const seatRequestSequence = useRef(0);
  const selectedSectionRef = useRef(null);
  const checkoutAttempt = useRef(null);
  const checkoutInFlight = useRef(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const navigate = useNavigate();

  const { isLoggedIn } = useContext(AuthContext);
  const { concertID } = useParams();

  const [seats, setSeats] = useState(INITIAL_SEAT_LAYOUT);
  const [seatSections, setSeatSections] = useState([]);
  const [selectedSectionCode, setSelectedSectionCode] = useState(null);
  const [seatLayoutMessage, setSeatLayoutMessage] = useState("");

  const loadSeats = useCallback(
    async (performance, preferredSectionCode = selectedSectionRef.current) => {
      const requestSequence = ++seatRequestSequence.current;
      setSeatLayoutMessage("좌석 구역을 불러오고 있습니다.");

      try {
        const summary = normalizeSectionSummary(
          await getSeatSections(concertID, performance.id),
        );
        const sectionCode = summary.sections.some(
          (section) => section.sectionCode === preferredSectionCode,
        )
          ? preferredSectionCode
          : summary.sections[0].sectionCode;
        const detail = await getSeatSection(
          concertID,
          performance.id,
          sectionCode,
        );
        if (requestSequence !== seatRequestSequence.current) return false;

        selectedSectionRef.current = sectionCode;
        setSelectedSectionCode(sectionCode);
        setSeatSections(summary.sections);
        setSeats(mapSectionDetailToRows(detail, sectionCode));
        setSeatLayoutMessage("");
        return true;
      } catch (error) {
        if (requestSequence !== seatRequestSequence.current) return false;

        if (error?.response?.status === 409) {
          try {
            const legacySeats = await getLegacySeats(
              concertID,
              performance.id,
            );
            if (requestSequence !== seatRequestSequence.current) return false;

            selectedSectionRef.current = null;
            setSelectedSectionCode(null);
            setSeatSections([]);
            setSeats(
              legacyRows(
                mapSeatResponseToLayout(INITIAL_SEAT_LAYOUT, legacySeats),
              ),
            );
            setSeatLayoutMessage(
              "기존 24석 좌석 배치로 표시하고 있습니다.",
            );
            return true;
          } catch {
            // 공통 실패 상태로 처리한다.
          }

          if (requestSequence !== seatRequestSequence.current) return false;
        }

        selectedSectionRef.current = null;
        setSelectedSectionCode(null);
        setSeatSections([]);
        setSeats(INITIAL_SEAT_LAYOUT);
        setSeatLayoutMessage("좌석 배치를 불러오지 못했습니다.");
        return false;
      }
    },
    [concertID],
  );

  const {
    countdown,
    holdMessage,
    holdPending,
    keepForPayment,
    ownedHolds,
    releaseAll,
    selectedSeats,
    toggleSeat,
  } = useSeatHoldManager({
    concertId: concertID,
    isLoggedIn,
    navigate,
    selectedPerformance,
    refreshSeats: loadSeats,
  });

  const price = 30000;
  // 가격 고정
  const totalPrice = price * selectedSeats.length;

  const handleSeatClick = async (seat) => {
    if (!dateChosen || !selectedPerformance) return;
    if (!ownedHolds[seat.id] && !isSeatSelectable(seat)) return;

    await toggleSeat(seat);
  };

  // 공연 상세 정보 Axios.Get
  useEffect(() => {
    axiosBackend
      .get(`/main/detail/${concertID}`)
      .then((response) => {
        setConcertDetail(response.data);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, [concertID]);

  // 공연 예매 가능 날짜 Axios.Get
  useEffect(() => {
    axiosBackend
      .get(`/main/detail/${concertID}/calendar`)
      .then((response) => {
        setAvailableDates(response.data); // 날짜 데이터를 상태에 저장
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, [concertID]);

  const handlePerformanceClick = async (performance) => {
    if (holdPending) return;

    //performance는 달력에서 특정 날짜 선택 -> 특정 시간 선택 시의 이벤트 핸들러
    if (selectedPerformance === performance) {
      await releaseAll();
      seatRequestSequence.current += 1;
      setSelectedPerformance(null); // 같은 공연 선택 -> 선택 취소
      setSeats(INITIAL_SEAT_LAYOUT);
      selectedSectionRef.current = null;
      setSelectedSectionCode(null);
      setSeatSections([]);
      setSeatLayoutMessage("");
    } else {
      await releaseAll();
      setSelectedPerformance(performance);
      setSeats(INITIAL_SEAT_LAYOUT);
      selectedSectionRef.current = null;
      setSelectedSectionCode(null);
      setSeatSections([]);
      await loadSeats(performance, null);
    }
    // 특정 시간대 선택 시 -> 해당 공연의 특정 시간대를 ID로 get 호출
    // 특정 시간대의 빈 좌석 조회
  };

  useEffect(() => {
    if (!mapServiceKey) return undefined;

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${mapServiceKey}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (concertDetail.la && concertDetail.lo) {
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: new window.kakao.maps.LatLng(
              concertDetail.la,
              concertDetail.lo,
            ),
            level: 3,
          };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);
          const markerPosition = new window.kakao.maps.LatLng(
            concertDetail.la,
            concertDetail.lo,
          );
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
          });
          marker.setMap(map);
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [concertDetail.la, concertDetail.lo, mapServiceKey]);

  if (!concertDetail.concertName) return <div>Loading...</div>;

  const rows = [
    ["공연 장소", concertDetail.placeName],
    ["공연 시간", concertDetail.startTime],
    ["관람 연령", concertDetail.age],
    ["티켓 가격", concertDetail.price],
    ["출연진", concertDetail.performers],
    ["제작진", concertDetail.crew],
    ["공연 장르명", concertDetail.genre],
  ];

  async function goBack() {
    if (holdPending) return;

    await releaseAll();
    navigate(`/concertDetail/${concertID}`);
  }

  const formatTime = (time) => {
    return time.slice(0, 5);
  };

  // 날짜 선택 불가 기능 추가
  const isDateAvailable = (date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    return availableDates.some((item) => item.date === formattedDate);
  };

  const handleDateChange = async (newValue) => {
    if (holdPending) return;

    await releaseAll();
    seatRequestSequence.current += 1;
    setDateChosen(newValue);
    setSelectedPerformance(null);
    setSeats(INITIAL_SEAT_LAYOUT);
    selectedSectionRef.current = null;
    setSelectedSectionCode(null);
    setSeatSections([]);
    setSeatLayoutMessage("");
    const formattedDate = dayjs(newValue).format("YYYY-MM-DD");

    // 선택된 날짜에 해당하는 공연 시간 가져오기
    const performances = availableDates.filter(
      (dateItem) => dateItem.date === formattedDate,
    );
    setSelectedDatePerformances(performances);
  };

  const handleSectionSelect = async (sectionCode) => {
    if (
      holdPending ||
      !selectedPerformance ||
      sectionCode === selectedSectionRef.current
    ) {
      return;
    }
    await loadSeats(selectedPerformance, sectionCode);
  };

  const handleReservation = () => {
    return {
      concertDate: dayjs(dateChosen).format("YYYY-MM-DD"),
      concertTimeId: selectedPerformance.id,
      concertTime: selectedPerformance.startTime,
      seatNumberList: selectedSeats,
    };
  };

  async function startCheckout(paymentMethod) {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (
      checkoutInFlight.current ||
      !selectedPerformance ||
      !selectedSeats.length
    ) {
      return;
    }

    const reservationData = handleReservation();
    const fingerprint = JSON.stringify({ concertID, reservationData });
    if (checkoutAttempt.current?.fingerprint !== fingerprint) {
      checkoutAttempt.current = {
        fingerprint,
        key: createIdempotencyKey("checkout"),
      };
    }

    checkoutInFlight.current = true;
    setCheckoutPending(true);
    setCheckoutMessage("");

    try {
      const checkout = await prepareCheckout(
        concertID,
        reservationData,
        checkoutAttempt.current.key,
      );

      if (checkout.status !== "READY") {
        const statusMessage = {
          PAYMENT_VERIFYING:
            "결제 확인이 진행 중입니다. 잠시 후 다시 확인해 주세요.",
          PAYMENT_VERIFICATION_UNKNOWN:
            "결제 결과를 확인할 수 없습니다. 다시 결제하지 말고 확인을 요청해 주세요.",
          RESERVATION_CONFIRMED: "이미 예약이 확정된 Checkout입니다.",
          EXPIRED:
            "좌석 임시 점유가 만료되었습니다. 좌석을 다시 선택해 주세요.",
        };
        setCheckoutMessage(
          statusMessage[checkout.status] ??
            "Checkout 상태를 확인할 수 없습니다.",
        );
        return;
      }

      const checkoutSession = {
        concertId: concertID,
        concertName: concertDetail.concertName,
        paymentMethod,
        reservationData,
        checkout,
        checkoutKey: checkoutAttempt.current.key,
        reservationKey: createIdempotencyKey("reservation"),
      };

      saveCheckoutSession(checkoutSession);
      keepForPayment();
      navigate("/payment", { state: checkoutSession });
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        navigate("/login");
      } else if (status === 409) {
        setCheckoutMessage(
          "선택한 좌석 상태가 변경되었습니다. 최신 좌석을 확인해 주세요.",
        );
        await loadSeats(selectedPerformance);
      } else if (status === 410) {
        setCheckoutMessage(
          "좌석 임시 점유가 만료되었습니다. 좌석을 다시 선택해 주세요.",
        );
        await loadSeats(selectedPerformance);
      } else if (status === 422) {
        setCheckoutMessage(
          "같은 요청 키에 다른 예약 정보가 전달되었습니다. 좌석을 다시 선택해 주세요.",
        );
      } else if (status === 503) {
        setCheckoutMessage(
          "Checkout 서비스를 사용할 수 없습니다. 잠시 후 같은 요청으로 다시 시도해 주세요.",
        );
      } else {
        setCheckoutMessage(
          "Checkout을 준비하지 못했습니다. 다시 시도해 주세요.",
        );
      }
    } finally {
      checkoutInFlight.current = false;
      setCheckoutPending(false);
    }
  }

  function paymentKakao() {
    return startCheckout("KAKAO_PAY");
  }

  function paymentDefault() {
    return startCheckout("CARD");
  }

  return (
    <div className={style.mainContainer}>
      <Header />
      <div className={style.concertName}>
        <h1>{concertDetail.concertName}</h1>
      </div>
      <div className={style.detailContainer}>
        <img
          className={style.poster}
          src={concertDetail.posterUrl}
          alt="공연포스터"
        />
        <table className={style.table}>
          <thead>
            <tr>
              {/* <th>항목명</th>
              <th>세부 내용</th> */}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row[0]}</td>
                <td>{row[1] && row[1].trim() !== "" ? row[1] : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={style.mapContainer}>
          <div>
            <p className={style.mainStyle}>{concertDetail.placeName}</p>
            <p className={style.subStyle}>{concertDetail.addr}</p>
          </div>
          <div id="map" className={style.kakaoMap}></div>
        </div>
      </div>
      <div className={style.btnContainer}>
        <Btn className="reservation" buttonText="뒤로가기" onClick={goBack} />
      </div>
      <div>
        <p className={style.mainStyle}>예매할 시간과 좌석을 선택하세요</p>
        {concertDetail.startDate !== concertDetail.endDate ? (
          <p className={style.subStyle}>
            {" "}
            공연 기간 :{concertDetail.startDate} ~ {concertDetail.endDate}
          </p>
        ) : (
          <p className={style.subStyle}>
            {" "}
            공연 기간 : {concertDetail.startDate} (1일)
          </p>
        )}
      </div>
      <div className={style.selectionArea}>
        <div className={style.calendarContainer}>
          <LocalizationProvider dateAdapter={AdapterDayjs} locale="ko">
            <DateCalendar
              value={dateChosen}
              onChange={handleDateChange}
              shouldDisableDate={(date) => !isDateAvailable(date)}
              sx={{
                "& .MuiTypography-root": {
                  fontSize: "18px",
                  fontFamily: "pretendard",
                  fontWeight: "700",
                },
                "& .MuiPickersDay-root": {
                  fontSize: "18px",
                  fontFamily: "pretendard",
                  fontWeight: "500",
                  borderRadius: "8px",
                  "&.Mui-selected": {
                    backgroundColor: "#6E30BF",
                    color: "#FFFFFF",
                    fontWeight: "700",
                  },
                  "&.MuiPickersDay-today": {
                    border: "2px solid #9C27B0",
                  },
                  "&:hover": {
                    backgroundColor: "#E1BEE7",
                  },
                  "&:focus": {
                    backgroundColor: "#CE93D8",
                  },
                },
              }}
            />
          </LocalizationProvider>
        </div>
        <div className={style.performanceCardsContainer}>
          {selectedDatePerformances.map((performance, index) => (
            <div
              key={index}
              className={`${style.performanceCard} ${
                selectedPerformance === performance ? style.selected : ""
              }`}
              onClick={() => handlePerformanceClick(performance)}
            >
              <p>{formatTime(performance.startTime)}</p>
              <p>{performance.dayOfWeek}</p>
              <p>잔여석 : {performance.seatAmount}</p>
            </div>
          ))}
        </div>
        <div className={style.seats}>
          <div className={style.reservationContainer}>
            <div className={style.screens}>
              <h2 className={style.screen}>무대 앞쪽 방향</h2>
            </div>
            <p className={style.seat_price}>
              {selectedDatePerformances && selectedPerformance
                ? dayjs(dateChosen).format("YYYY년 MM월 DD일") +
                  " / " +
                  formatTime(selectedPerformance.startTime) +
                  "시 공연"
                : "먼저 날짜와 시간을 선택해주세요!"}
            </p>
            <SeatSectionSelector
              sections={seatSections}
              selectedSectionCode={selectedSectionCode}
              disabled={holdPending}
              onSelect={handleSectionSelect}
            />
            <p className={style.layoutFeedback} aria-live="polite">
              {seatLayoutMessage}
            </p>
            <SeatSelectionGrid
              seats={seats}
              selectedSeats={selectedSeats}
              interactionDisabled={holdPending}
              onSeatClick={handleSeatClick}
            />
            <p className={style.holdFeedback} aria-live="polite">
              {holdPending ? "좌석 상태를 처리하고 있습니다." : holdMessage}
            </p>
            <p className={style.holdFeedback} aria-live="polite">
              {checkoutPending
                ? "Checkout을 준비하고 있습니다."
                : checkoutMessage}
            </p>
            <p className={style.seatsSelect}>
              {selectedSeats.length
                ? "선택한 좌석 수 : " +
                  selectedSeats.length +
                  " (" +
                  selectedSeats.toString() +
                  ")"
                : ""}
            </p>
          </div>
        </div>
      </div>
      <div className={style.summary}>
        {selectedSeats.length !== 0 && (
          <>
            <p className={style.afterChoose}>예상 결제 금액</p>
            <p className={style.totalPrice}>
              {selectedSeats.length}석 일반석 : {totalPrice}원
            </p>
            <p className={style.selectedDate}>
              선택한 날짜 : {dayjs(dateChosen).format("YYYY년 MM월 DD일")} 및{" "}
              {selectedPerformance
                ? formatTime(selectedPerformance.startTime) + "시 공연"
                : ""}
            </p>

            <p className={style.holdCountdown} role="timer">
              결제까지 남은 시간 {countdown}
            </p>

            {!holdPending && countdown !== "00:00" && (
              <div className={style.payment}>
                <p className={style.afterChoose}>결제 수단을 선택해주세요</p>
                <div className={style.paymentBtnContainer}>
                  <img
                    className={style.kakaoPay}
                    src={kakaoPay}
                    alt="카카오페이 이미지"
                    onClick={paymentKakao}
                    aria-disabled={checkoutPending}
                  />
                  <Btn
                    className="reservation"
                    buttonText="일반 결제"
                    onClick={paymentDefault}
                    disabled={checkoutPending}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ConcertReservation;
