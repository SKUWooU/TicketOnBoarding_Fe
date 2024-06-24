import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import CardList from "../components/CardList";

import style from "../styles/Main.module.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosBackend from "../AxiosConfig";

// React-slick 을 위한 Import
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { NextArrow, PrevArrow } from "../components/CustomArrow";

function Main() {
  const navigate = useNavigate();

  function gotoGenre() {
    navigate("/genre/play");
  }

  function gotoLocation() {
    navigate("/region/seoul");
  }

  function gotoMain() {
    navigate("/");
  }

  //api reponse를 담을 배열 state 빈 배열선언 (인기공연 및 MD's Pick)
  const [mostPopularConcertList, setMostPopularConcertList] = useState([]);
  const [onTicketPickList, setOnTicketPickList] = useState([]);

  useEffect(() => {
    axiosBackend
      .get("/main")
      .then((response) => {
        setMostPopularConcertList(response.data.MostPopularConcertList || []);
        setOnTicketPickList(response.data.onTicketPickList || []);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    draggable: false,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div className={style.mainContainer}>
      <MainHeader />
      <div className={style.Category}>
        <p onClick={gotoMain}>이 달의 인기 공연</p>
        <p onClick={gotoGenre}>장르별</p>
        <p onClick={gotoLocation}>지역별</p>
      </div>
      <h1 className={style.division}>이 달의 인기 공연</h1>
      <div className={style.sliderContainer}>
        <Slider {...settings}>
          {mostPopularConcertList.map((concert, index) => (
            <div key={index}>
              <CardList
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
            </div>
          ))}
        </Slider>
      </div>
      <h1 className={style.division}>MD's Pick</h1>
      <div className={style.mainInner}>
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
