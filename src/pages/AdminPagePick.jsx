import React, { useEffect, useState } from "react";
import LoginHeader from "../components/LoginHeader";
import style from "../styles/AdminPage.module.scss";
import { useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import CardList from "../components/CardList";

function AdminPagePick() {
  const navigate = useNavigate();

  const [onTicketPick, setOnTicketPickList] = useState([]);

  function goBack() {
    navigate("/mypage");
  }
  function allConcerts() {
    navigate("/adminPage");
  }
  function allUsers() {
    navigate("/adminPage/users");
  }
  function claims() {
    navigate("/adminPage/claims");
  }
  function gotoPick() {
    navigate("/adminPage/pick");
  }

  const allTickets = () => {
    navigate("/adminPage/allTickets");
  };

  useEffect(() => {
    axiosBackend
      .get("/main")
      .then((response) => {
        setOnTicketPickList(response.data.onTicketPickList || []);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  return (
    <div className={style.mainContainer}>
      <LoginHeader
        page="관리자 페이지 - Md's Pick"
        className={style.noMarginBottom}
      />
      <div className={style.Category}>
        <p onClick={goBack}>돌아가기 </p>
        <p onClick={allConcerts}>공연 조회 </p>
        <p onClick={allUsers}>고객 조회</p>
        <p onClick={allTickets}>예매 조회</p>
        <p onClick={claims}>환불 처리</p>
        <p onClick={gotoPick}>Md's Pick</p>
      </div>
      <div>
        <h1 className={style.division}>
          총 {onTicketPick.length} 개의 공연이 조회되었습니다.
        </h1>
        <h2 className={style.h2Explain}>
          Md's Pick의 갱신은 공연 조회 탭에서 가능합니다.
        </h2>
      </div>

      <div className={style.mainInner}>
        <div className={style.showCards}>
          {onTicketPick.map((concert, index) => (
            // 메인에는 실시간 4개씩 -> map으로 순회하면서 컴포넌트에 Props 전달
            <CardList
              key={index}
              concertID={concert.concertID}
              concertName={concert.concertName}
              startDate={concert.startDate}
              endDate={concert.endDate}
              averageRating={concert.averageRating}
              price={concert.price}
              sido={concert.sido}
              gugun={concert.gugun}
              posterUrl={concert.posterUrl}
              placename={concert.placeName}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPagePick;
