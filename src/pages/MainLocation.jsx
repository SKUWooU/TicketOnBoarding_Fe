import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import CardList from "../components/CardList";
import ClassifyBtn from "../components/ClassifyBtn";

import style from "../styles/Main.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function MainLocation() {
  const navigate = useNavigate();
  const { region } = useParams(); // genre 값 가져오기 (buttonText Props)
  const [regionList, setRegionList] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/main/region/${region}`)
      .then((response) => {
        setRegionList(response.data || []);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, [region]);

  function gotoGenre() {
    navigate("/genre/play");
  }

  function gotoLocation() {
    navigate("/region/seoul");
  }

  function gotoMain() {
    navigate("/");
  }

  return (
    <div className={style.mainContainer}>
      <MainHeader />
      <div className={style.Category}>
        <p onClick={gotoMain}>이 달의 인기 공연</p>
        <p onClick={gotoGenre}>장르별</p>
        <p onClick={gotoLocation}>지역별</p>
      </div>
      <div className={style.btnArea}>
        <div className={style.btnRow1}>
          <ClassifyBtn buttonText="서울" />
          <ClassifyBtn buttonText="부산" />
          <ClassifyBtn buttonText="인천" />
          <ClassifyBtn buttonText="대구" />
          <ClassifyBtn buttonText="대전" />
          <ClassifyBtn buttonText="광주" />
          <ClassifyBtn buttonText="경기" />
        </div>
        <div className={style.btnRow2}>
          <ClassifyBtn buttonText="강원" />
          <ClassifyBtn buttonText="충북" />
          <ClassifyBtn buttonText="충남" />
          <ClassifyBtn buttonText="전북" />
          <ClassifyBtn buttonText="전남" />
          <ClassifyBtn buttonText="경북" />
          <ClassifyBtn buttonText="경남" />
          <ClassifyBtn buttonText="제주" />
        </div>
      </div>
      <div>
        <h1 className={style.division}>지역별 : {region} </h1>
        <p className={style.totalNum}>
          {regionList.length}개의 공연이 존재합니다.
        </p>
      </div>
      <div className="mainInner">
        <div className={style.showCards}>
          {regionList.slice(0, 4).map((concert) => (
            // 메인에는 실시간 4개씩 -> map으로 순회하면서 컴포넌트에 Props 전달
            <CardList
              key={concert.concertID}
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
        <div className={style.showCards}>
          {regionList.slice(4, 8).map((concert) => (
            // 메인에는 실시간 4개씩 -> map으로 순회하면서 컴포넌트에 Props 전달
            <CardList
              key={concert.concertID}
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

export default MainLocation;
