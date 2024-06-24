import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "../styles/cardList.module.scss";
import axiosBackend from "../AxiosConfig";

function ReservedCard({
  concertId,
  posterUrl,
  concertName,
  concertDate,
  concertTime,
  createdAt,
  seatNumber,
  reservationId,
  status,
}) {
  const navigate = useNavigate();
  const [refundRequested, setRefundRequested] = useState(false);

  const gotoDetail = (concertID) => {
    navigate(`/concertDetail/${concertID}`);
  };

  function formatDate(input) {
    if (!input) return "";
    const [date, time] = input.split("T");
    const [year, month, day] = date.split("-");
    const [hour, minute] = time.split(":");
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일 ${parseInt(hour)}시 ${parseInt(minute)}분`;
  }

  function formatTime(input) {
    if (!input) return "";
    return input.substring(0, 5);
  }

  function handleRefund(reservationId, event) {
    event.stopPropagation();
    axiosBackend
      .post(`/mypage/cancel/reservation/${reservationId}`, null, {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response);
        alert("환불 신청이 완료되었습니다.");
        setRefundRequested(true);
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert("환불 신청 중 오류가 발생했습니다.");
      });
  }

  return (
    <div className={style.cardContainer}>
      <img
        className={style.img}
        src={posterUrl}
        onClick={() => gotoDetail(concertId)}
        alt="Concert List"
      />
      <div>
        <p className={style.concertName}>{concertName}</p>
        <p className={style.period}>공연 날짜 : {concertDate}</p>
      </div>
      <div>
        <p className={style.listDetail}>{formatTime(concertTime)}</p>
        <p className={`${style.listDetail} ${style.emphasize}`}>
          예약한 좌석 : {seatNumber}
        </p>
        <p className={style.listDetail}>결제일 : {formatDate(createdAt)}</p>
        {status === "결제완료" && !refundRequested && (
          <button
            className={style.refundButton}
            onClick={(event) => handleRefund(reservationId, event)}
          >
            환불 신청하기
          </button>
        )}
        {status === "취소신청" && (
          <button className={`${style.refundButton} ${style.disabled}`}>
            환불 대기중
          </button>
        )}
      </div>
    </div>
  );
}

export default ReservedCard;
