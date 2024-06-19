import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import CardList from "../components/CardList"; // CardList 컴포넌트를 사용하려면 추가 코드를 작성해야 할 수도 있습니다.
import style from "../styles/Main.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResult() {
  const [result, setResult] = useState([]);
  const query = useQuery();
  const keyword = query.get("concertname");

  // useLocation().search에서 추출한 쿼리 문자열에는 ?concertname=검색어와 같은 형태로 전체 쿼리 문자열 포함
  // URLSearchParams를 사용하여 concertname 값 추출

  useEffect(() => {
    axios
      .get(`http://localhost:8080/main/search?concertname=${keyword}`)
      .then((response) => {
        console.log(response.data);
        setResult(response.data); // 결과를 상태에 설정합니다.
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, [keyword]);

  return (
    <div className={style.mainContainer}>
      <MainHeader />
      <div className={style.mainInner}>
        <h1 className={style.division}>
          {result.length > 0
            ? `${result.length}개의 공연이 존재합니다.`
            : "검색 결과가 없습니다."}
        </h1>
        <div className={style.showCards}>
          {result.slice(0, 4).map((concert) => (
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

export default SearchResult;
