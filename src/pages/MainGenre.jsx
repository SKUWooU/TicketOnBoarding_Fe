import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import CardList from "../components/CardList";
import ClassifyBtn from "../components/ClassifyBtn";
import Pagination from "../components/Pagination"; // Pagination 컴포넌트 import

import style from "../styles/Main.module.scss";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosBackend from "../AxiosConfig";
import { useParams } from "react-router-dom";

import "../styles/Pagination.css"; // Pagination.css import

function MainGenre() {
  const genres = {
    "play": "연극",
    "musical": "뮤지컬",
    "westmusic": "서양음악(클래식)",
    "koreanmusic": "한국음악(국악)",
    "circus": "서커스/마술",
    "complex": "복합",
    "contemporarymusic": "대중음악",
    "dance": "무용",
  };

  const navigate = useNavigate();
  const { genre } = useParams(); // genre 값 가져오기 (buttonText Props)
  const [genreList, setGenreList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태 추가
  const itemsPerPage = 8; // 페이지당 항목 수

  function gotoGenre() {
    navigate("/genre/play");
  }

  function gotoLocation() {
    navigate("/region/seoul");
  }

  function gotoMain() {
    navigate("/");
  }

  useEffect(() => {
    axiosBackend
      .get(`/main/genre/${genre}`)
      .then((response) => {
        console.log(response.data);
        setGenreList(response.data || []);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, [genre]);

  // 페이지네이션 관련 함수
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = genreList.slice(indexOfFirstItem, indexOfLastItem);

  // 총 페이지 수 계산
  const pageCount = Math.ceil(genreList.length / itemsPerPage);

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
          <ClassifyBtn buttonText="연극" />
          <ClassifyBtn buttonText="뮤지컬" />
          <ClassifyBtn buttonText="서양음악(클래식)" />
          <ClassifyBtn buttonText="한국음악(국악)" />
          <ClassifyBtn buttonText="서커스/마술" />
          <ClassifyBtn buttonText="복합" />
          <ClassifyBtn buttonText="대중음악" />
          <ClassifyBtn buttonText="무용" />
        </div>
      </div>
      <div>
        <h1 className={style.division}>장르별 : {genres[genre]}</h1>
        <p className={style.totalNum}>
          {genreList.length}개의 공연이 존재합니다.
        </p>
      </div>

      <div className="mainInner">
        <div className={style.showCards}>
          {currentItems.slice(0, 4).map((concert) => (
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
          {currentItems.slice(4, 8).map((concert) => (
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
      <Pagination
        pageCount={pageCount}
        onPageChange={handlePageClick}
        currentPage={currentPage}
      />
      <MainFooter />
    </div>
  );
}

export default MainGenre;
