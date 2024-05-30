import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import CardList from "../components/CardList";
import ClassifyBtn from "../components/ClassifyBtn";

import style from "../styles/Main.module.scss";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

function MainLocation() {
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/main/genre/westmusic")
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  function gotoGenre() {
    navigate("/genre");
  }

  function gotoLocation() {
    navigate("/location");
  }

  function gotoHandover() {
    navigate("/");
  }
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
      <div className="mainInner">
        <h1 className={style.division}>지역별 : 서울</h1>
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

export default MainLocation;
