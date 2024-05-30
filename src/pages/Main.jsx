import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import CardList from "../components/CardList";

import style from "../styles/Main.module.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Main() {
  const navigate = useNavigate();

  function gotoGenre() {
    navigate("/genre/musical");
  }

  function gotoLocation() {
    navigate("/location/seoul");
  }

  function gotoHandover() {
    navigate("/");
  }

  //api reponse를 담을 배열 state 빈 배열선언 (인기공연 및 MD's Pick)
  const [mostPopularConcertList, setMostPopularConcertList] = useState([]);
  const [onTicketPickList, setOnTicketPickList] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/main")
      .then((response) => {
        console.log(response.data);
        setMostPopularConcertList(response.data.MostPopularConcertList || []);
        setOnTicketPickList(response.data.onTicketPickList || []);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  return (
    <div className={style.mainContainer}>
      <MainHeader />
      <div className={style.Category}>
        <p onClick={gotoHandover}>이 달의 인기 공연</p>
        <p onClick={gotoGenre}>장르별</p>
        <p onClick={gotoLocation}>지역별</p>
        <p onClick={gotoHandover}>티켓 양도</p>
      </div>
      <div className="mainInner">
        <h1 className={style.division}>이 달의 인기 공연</h1>
        <div className={style.showCards}>
          {mostPopularConcertList.map((concert, index) => (
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
      <div className="mainInner">
        <h1 className={style.division}>MDs Pick</h1>
        <div className={style.showCards}>
          {onTicketPickList.map((concert, index) => (
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
      <MainFooter />
    </div>
  );
}

export default Main;
