import LoginHeader from "../components/LoginHeader";
import ReservedCard from "../components/ReservedCard";
import style from "../styles/ReservedList.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

import { useContext, useEffect, useState } from "react";
import AuthContext from "../components/AuthContext";
import axiosBackend from "../AxiosConfig";

function TicketRefunded() {
  const navigate = useNavigate();
  const location = useLocation();

  const [reservedList, setReservedList] = useState([]);

  useEffect(() => {
    axiosBackend
      .get("/mypage/reservationlist", { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        const filteredList = response.data.filter(
          (concert) => concert.status === "취소완료",
        );
        setReservedList(filteredList);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  function goBack() {
    navigate("/mypage");
  }

  function gotoReserved() {
    navigate("/mypage/reservedList");
  }

  function gotoWaiting() {
    navigate("/mypage/watingRefund");
  }

  function gotoRefunded() {
    navigate("/mypage/ticketRefunded");
  }
  return (
    <div className={style.mainContainer}>
      <LoginHeader page="환불 완료 티켓" />
      <div className={style.Category}>
        <p onClick={goBack}>뒤로가기</p>
        <p onClick={gotoReserved}>예매한 티켓</p>
        <p onClick={gotoWaiting}>취소 신청</p>
        <p onClick={gotoRefunded}>환불 완료</p>
      </div>
      <h1 className={style.division}>
        환불 완료된 티켓은 총 {reservedList.length} 장 입니다.
        <p className={style.notice}>
          환불 신청을 할 경우 관리자 승인 이후 자동 환불처리 됩니다.
        </p>
      </h1>
      <div className={style.mainInner}>
        <div className={style.showCards}>
          {reservedList.map((concert, index) => (
            <ReservedCard
              key={index}
              posterUrl={concert.posterUrl}
              concertName={concert.concertName}
              concertDate={concert.concertDate}
              concertTime={concert.concertTime}
              createdAt={concert.createdAt}
              seatNumber={concert.seatNumber}
              reservationId={concert.id}
              status={concert.status}
              concertId={concert.concertId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TicketRefunded;
