import Header from "../components/MainHeader";
import Footer from "../components/MainFooter";
import style from "../styles/ConcertDetail.module.scss";
import Btn from "../components/LoginBtn";
import ConcertComment from "../components/ConcertComment";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ConcertDetail() {
  const [concertDetail, setConcertDetail] = useState({});
  const { concertID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/main/detail/${concertID}`)
      .then((response) => {
        setConcertDetail(response.data);
        console.log(response);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, [concertID]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=5cbb84bd0dca9e92a68c8821c55a7666&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (concertDetail.la && concertDetail.lo) {
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: new window.kakao.maps.LatLng(
              concertDetail.la,
              concertDetail.lo
            ),
            level: 3,
          };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);
          const markerPosition = new window.kakao.maps.LatLng(
            concertDetail.la,
            concertDetail.lo
          );
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
          });
          marker.setMap(map);
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [concertDetail.la, concertDetail.lo]);

  if (!concertDetail.concertName) return <div>Loading...</div>; // 로딩 페이지 추가하기

  const rows = [
    ["공연 장소", concertDetail.placeName],
    ["공연 시간", concertDetail.startTime],
    ["관람 연령", concertDetail.age],
    ["티켓 가격", concertDetail.price],
    ["출연진", concertDetail.performers],
    ["제작진", concertDetail.crew],
    ["공연 장르명", concertDetail.genre],
  ];

  function reservation() {
    navigate("/reservation");
  }

  return (
    <div className={style.mainContainer}>
      <Header />
      <div className={style.concertName}>
        <h1>{concertDetail.concertName}</h1>
      </div>
      <div className={style.detailContainer}>
        <img
          className={style.poster}
          src={concertDetail.posterUrl}
          alt="공연포스터"
        />
        <table className={style.table}>
          <thead>
            <tr>
              <th>항목명</th>
              <th>세부 내용</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={style.mapContainer}>
          <div>
            <p className={style.mainStyle}>{concertDetail.placeName}</p>
            <p className={style.subStyle}>{concertDetail.addr}</p>
          </div>
          <div id="map" className={style.kakaoMap}></div>
        </div>
      </div>
      <div className={style.btnContainer}>
        <Btn
          className="reservation"
          buttonText="예매하기"
          onClick={reservation}
        />
        <Btn
          className="seeDetail"
          buttonText="상세 정보"
          onClick={reservation}
        />
      </div>
      <div>
        <p className={style.mainStyle}>유저 한줄평</p>
        <p className={style.subStyle}>최신순 댓글이 출력됩니다.</p>
      </div>
      <div className={style.commentContainer}>
        <div className={style.commentArea}>
          <ConcertComment isInput={true} />
          {concertDetail.comments &&
            concertDetail.comments.map((comment, index) => (
              <ConcertComment key={index} commentText={comment.text} />
            ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ConcertDetail;
