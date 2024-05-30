import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import CardList from "../components/CardList";
import ClassifyBtn from "../components/ClassifyBtn";

import style from "../styles/Main.module.scss";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

function MainGenre() {
  const navigate = useNavigate();

  function gotoGenre() {
    navigate("/genre");
  }

  function gotoLocation() {
    navigate("/location");
  }

  function gotoHandover() {
    navigate("/");
  }

  useEffect(() => {
    axios
      .get("http://localhost:8080/main/region/seoul")
      .then((response) => {
        console.log(response.data);
        // setMostPopularConcertList(response.data.MostPopularConcertList || []);
        // setOnTicketPickList(response.data.onTicketPickList || []);
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
      <div className={style.btnArea}>
        <div className={style.btnRow1}>
          <ClassifyBtn buttonText="연극" />
          <ClassifyBtn buttonText="뮤지컬" />
          <ClassifyBtn buttonText="서양음악(클래식)" />
          <ClassifyBtn buttonText="한국음악(국악)" />
          <ClassifyBtn buttonText="대중음악" />
          <ClassifyBtn buttonText="무용" />
        </div>
        <div className={style.btnRow2}>
          <ClassifyBtn buttonText="대중무용" />
          <ClassifyBtn buttonText="서커스/마술" />
          <ClassifyBtn buttonText="복합" />
          <ClassifyBtn buttonText="아동" />
          <ClassifyBtn buttonText="대학로" />
          <ClassifyBtn buttonText="내한" />
          <ClassifyBtn buttonText="베리어프리" />
          <ClassifyBtn buttonText="축제" />
        </div>
      </div>
      <div className="mainInner">
        <h1 className={style.division}>카테고리 : 연극</h1>
        <div className={style.showCards}>
          <CardList />
          <CardList />
          <CardList />
          <CardList />
        </div>
      </div>
      <div className="mainInner">
        <div className={style.showCards}>
          <CardList />
          <CardList />
          <CardList />
          <CardList />
        </div>
      </div>
      <MainFooter />
    </div>
  );
}

export default MainGenre;
