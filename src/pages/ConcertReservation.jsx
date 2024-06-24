import Header from "../components/MainHeader";
import Footer from "../components/MainFooter";
import style from "../styles/ConcertDetail.module.scss";
import Btn from "../components/LoginBtn";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import { useContext } from "react";
import AuthContext from "../components/AuthContext";

import { Grid, Paper } from "@mui/material";

// MUIX DateCalendar를 위한 import 구문
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import "dayjs/locale/ko";
dayjs.locale("ko");

import kakaoPay from "../assets/kakaoPay.svg";

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
  const [availableSeat, setAvailableSeat] = useState([]);
  // 해당 시간의 좌석 정보 API response sTATE

  /* 
  array의 형태 
  E.G ) [0] 번 index = A1이라고 할 때

  [0] : {seatId: 1, seatNumber: 'A1', reserved: true}
  [1] : {seatId: 2, seatNumber: 'A2', reserved: false}

  단 seatId 는 일련 번호와 같은 느낌으로 좌석의 수인 1~24 고정이 아님. 
  */

  const [selectedDatePerformances, setSelectedDatePerformances] = useState([]);

  const [selectedPerformance, setSelectedPerformance] = useState(null);
  // 선택된 공연의 시간
  const [dateChosen, setDateChosen] = useState(null);
  //선택된 날짜
  const [selectedSeats, setSelectedSeats] = useState([]);

  const navigate = useNavigate();

  const { isLoggedIn } = useContext(AuthContext);
  const { concertID } = useParams();

  const price = 30000;
  // 가격 고정
  const totalPrice = price * selectedSeats.length;

  const [seats, setSeats] = useState([
    [
      { id: "A1", status: "available" },
      { id: "A2", status: "available" },
      null,
      { id: "A3", status: "available" },
      { id: "A4", status: "available" },
      { id: "A5", status: "available" },
      { id: "A6", status: "available" },
      null,
      { id: "A7", status: "available" },
      { id: "A8", status: "available" },
    ],
    [
      { id: "B1", status: "available" },
      { id: "B2", status: "available" },
      null,
      { id: "B3", status: "available" },
      { id: "B4", status: "available" },
      { id: "B5", status: "available" },
      { id: "B6", status: "available" },
      null,
      { id: "B7", status: "available" },
      { id: "B8", status: "available" },
    ],
    [
      { id: "C1", status: "available" },
      { id: "C2", status: "available" },
      null,
      { id: "C3", status: "available" },
      { id: "C4", status: "available" },
      { id: "C5", status: "available" },
      { id: "C6", status: "available" },
      null,
      { id: "C7", status: "available" },
      { id: "C8", status: "available" },
    ],
  ]);

  const handleSeatClick = (seat) => {
    if (!dateChosen || !selectedPerformance) return;
    // 날짜와 시간이 선택되지 않았으면 클릭 무시

    if (seat.status === "reserved") return;
    // 예약된 자리일 경우 좌석 선택 불가

    if (selectedSeats.includes(seat.id)) {
      //selectedSeates(배열) : 선택된 좌석으로 이루어짐. includes - 특정 요소 포함
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.id));
      //filter 로 새로운 좌석들만으로 배열 재구성
    } else {
      setSelectedSeats([...selectedSeats, seat.id]);
      //스프레드 문법 [기존의 배열, 추가할 항목] : 배열 수정
    }

    seat.status = seat.status === "selected" ? "available" : "selected";
    // seat.status <- ( 삼항조건식의 결과를 할당 하는 형태 )
  };

  // 공연 상세 정보 Axios.Get
  useEffect(() => {
    axiosBackend
      .get(`/main/detail/${concertID}`)
      .then((response) => {
        setConcertDetail(response.data);
        console.log(response);
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
        console.log(response.data);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, [concertID]);

  const handlePerformanceClick = (performance) => {
    //performance는 달력에서 특정 날짜 선택 -> 특정 시간 선택 시의 이벤트 핸들러
    if (selectedPerformance === performance) {
      setSelectedPerformance(null); // 같은 공연 선택 -> 선택 취소
    } else {
      setSelectedPerformance(performance);

      // 해당 공연의 특정 시간대를 ID로 get 호출 -> 공연 시간대 출력
      axiosBackend
        .get(`/main/detail/${concertID}/calendar/${performance.id}`)
        .then((response) => {
          const seatData = response.data;
          // Api Response를 저장한 이후에
          const updatedSeats = seats.map((row) =>
            // 해당하는 seat를 돌면서 순회 -> seatNumber 와 seatId 매핑
            row.map((seat) => {
              if (seat) {
                const foundSeat = seatData.find(
                  (s) => s.seatNumber === seat.id,
                );
                return foundSeat
                  ? //매핑한 결과를 토대로
                    {
                      ...seat,
                      status: foundSeat.reserved ? "reserved" : "available",
                      //reserved 혹은 available 판단해서 스타일 부여
                    }
                  : seat;
              }
              return seat;
            }),
          );
          setAvailableSeat(seatData);
          setSeats(updatedSeats);
          console.log(response.data);
          console.log(availableSeat);
        })
        .catch((err) => {
          alert("Axios 통신에 실패하였습니다.\n" + err);
        });
    }
    // 특정 시간대 선택 시 -> 해당 공연의 특정 시간대를 ID로 get 호출
    // 특정 시간대의 빈 좌석 조회
  };

  useEffect(() => {
    console.log(availableSeat);
  }, [availableSeat]);

  useEffect(() => {
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
  }, [concertDetail.la, concertDetail.lo]);

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

  function goBack() {
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

  const handleDateChange = (newValue) => {
    setDateChosen(newValue);
    const formattedDate = dayjs(newValue).format("YYYY-MM-DD");

    // 선택된 날짜에 해당하는 공연 시간 가져오기
    const performances = availableDates.filter(
      (dateItem) => dateItem.date === formattedDate,
    );
    setSelectedDatePerformances(performances);
  };

  const handleReservation = () => {
    return {
      concertDate: dayjs(dateChosen).format("YYYY-MM-DD"),
      concertTimeId: selectedPerformance.id,
      concertTime: selectedPerformance.startTime,
      seatNumberList: selectedSeats,
    };
  };

  function paymentKakao() {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const reservationData = handleReservation();
    navigate("/payment/kakao", {
      state: {
        amount: totalPrice,
        name: concertDetail.concertName,
        concertID,
        reservationData,
      },
    });
  }

  function paymentDefault() {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const reservationData = handleReservation();
    navigate("/payment/inosis", {
      state: {
        amount: totalPrice,
        name: concertDetail.concertName,
        concertID,
        reservationData,
      },
    });
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
              className={style.dateCalendar}
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
            <Grid
              container
              spacing={1}
              justifyContent="center"
              className={style.gridContainer}
            >
              {seats.map((row, rowIndex) => (
                <Grid
                  container
                  item
                  spacing={1}
                  justifyContent="center"
                  key={rowIndex}
                >
                  {row.map((seat, seatIndex) => (
                    <Grid item key={seatIndex}>
                      {seat ? (
                        <Paper
                          className={`${style.seat} ${style[seat.status]} ${
                            selectedSeats.includes(seat.id)
                              ? style.selected
                              : ""
                          }`}
                          onClick={() => handleSeatClick(seat)}
                        >
                          {seat.id}
                        </Paper>
                      ) : (
                        <div className={style.spacer}></div>
                      )}
                    </Grid>
                  ))}
                </Grid>
              ))}
            </Grid>
            <div className={style.statusContainer}>
              <div className={style.statusItem}>
                <Paper
                  className={`${style.seat} ${style.statusAvailable}`}
                ></Paper>
                <p className={style.infoText}>선택 가능</p>
              </div>
              <div className={style.statusItem}>
                <Paper
                  className={`${style.seat} ${style.statusReserved}`}
                ></Paper>
                <p className={style.infoText}>예약 불가</p>
              </div>
              <div className={style.statusItem}>
                <Paper
                  className={`${style.seat} ${style.statusSelected}`}
                ></Paper>
                <p className={style.infoText}>선택 좌석</p>
              </div>
            </div>
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
            <p className={style.afterChoose}>총 결제 금액</p>
            <p className={style.totalPrice}>
              {selectedSeats.length}석 일반석 : {totalPrice}원
            </p>
            <p className={style.selectedDate}>
              선택한 날짜 : {dayjs(dateChosen).format("YYYY년 MM월 DD일")} 및{" "}
              {selectedPerformance
                ? formatTime(selectedPerformance.startTime) + "시 공연"
                : ""}
            </p>

            <div className={style.payment}>
              <p className={style.afterChoose}>결제 수단을 선택해주세요</p>
              <div className={style.paymentBtnContainer}>
                <img
                  className={style.kakaoPay}
                  src={kakaoPay}
                  alt="카카오페이 이미지"
                  onClick={paymentKakao}
                />
                <Btn
                  className="reservation"
                  buttonText="일반 결제"
                  onClick={paymentDefault}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ConcertReservation;
