import Header from "../components/MainHeader";
import Footer from "../components/MainFooter";
import style from "../styles/ConcertDetail.module.scss";
import Btn from "../components/LoginBtn";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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

function ConcertReservation() {
  const [concertDetail, setConcertDetail] = useState({});
  // 상단 공연 정보를 받아오는 API response 저장
  const [availableDates, setAvailableDates] = useState([]);
  // 선택된 날짜의 예매 가능한 시간대 API response 저장

  /*
  1. date**: "2024-06-15"
  2. dayOfWeek: "토요일"
  3. id: 1 / 특정 공연의 특정 시간대의 ID 
  4. seatAmount: 16
  5. seatList: null
  6. startTime: "17:00:00"
  이러한 형태로 Response가 옴.
  */
  const [availableSeat, setAvailableSeat] = useState([]);
  // 예매 가능한 시간대의 좌석 정보 API response를 저장

  /* 
  array의 형태 
  E.G ) [0] 번 index = A1

  reserved : false
  seatId : 27
  seatNumber : 'A1'
  */

  const [selectedDatePerformances, setSelectedDatePerformances] = useState([]);

  const [dateChosen, setDateChosen] = useState(null);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const { concertID } = useParams();
  const navigate = useNavigate();

  const { isLoggedIn } = useContext(AuthContext);

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
      { id: "A8", status: "available" },
      { id: "A9", status: "available" },
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

  const price = 30000;
  const totalPrice = price * selectedSeats.length;

  const handleSeatClick = (seat) => {
    if (!dateChosen || !selectedPerformance) return; // 날짜와 시간이 선택되지 않았으면 클릭 무시

    if (seat.status === "reserved") return; // 예약된 자리일 경우 좌석 선택 불가

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat.id]);
    }

    seat.status = seat.status === "selected" ? "available" : "selected";
  };

  // 공연 상세 정보 Axios.Get
  useEffect(() => {
    axios
      .get(`http://localhost:8080/main/detail/${concertID}`)
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
    axios
      .get(`http://localhost:8080/main/detail/${concertID}/calendar`)
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
      axios
        .get(
          `http://localhost:8080/main/detail/${concertID}/calendar/${performance.id}`,
        )
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
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5cbb84bd0dca9e92a68c8821c55a7666&autoload=false`;
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

  if (!concertDetail.concertName) return <div>Loading...</div>; // 로딩 페이지

  const tableRows = [
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

  const formatTime = (time) => {
    return time.slice(0, 5);
  };

  const handleReservation = () => {
    const seatInfo = selectedSeats.map((seatId) => {
      //기존의 좌석 정보와 seatId를 매핑
      const seat = availableSeat.find((s) => s.seatNumber === seatId);

      return {
        // post 요청에 필요한 정보 Return
        concertDate: dayjs(dateChosen).format("YYYY-MM-`DD"),
        concertTimeId: selectedPerformance.id,
        concertTime: selectedPerformance.startTime,
        seatId: seat.seatId,
        seatNumber: seat.seatNumber,
      };
    });
    return seatInfo;
  };
  function payment() {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const reservationData = handleReservation();
    navigate("/payment", {
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
              <th>항목명</th>
              <th>세부 내용</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr key={index}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
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
        <p className={style.subStyle}>API 로 받아온 공연 기간 출력</p>
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
        {selectedSeats.length !== 0 && ( //해당 부분 : 좌석을 골랐을때 < > 를 통해서 동적으로 생성되는 영역
          <>
            <p className={style.afterChoose}>총 결제 금액</p>
            <p className={style.totalPrice}>
              {selectedSeats.length}석 일반석 : {totalPrice}원
            </p>
            <p className={style.selectedDate}>
              선택한 날짜 :{" "}
              {dayjs(dateChosen).format("YYYY년 MM월 DD일") +
                " " +
                (selectedPerformance
                  ? formatTime(selectedPerformance.startTime) + "시 공연"
                  : "")}
            </p>
            <Btn
              className="reservation"
              buttonText="결제하기"
              onClick={payment}
            />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ConcertReservation;
