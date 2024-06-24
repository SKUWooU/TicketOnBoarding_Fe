import Header from "../components/MainHeader";
import Footer from "../components/MainFooter";
import style from "../styles/ConcertDetail.module.scss";
import Btn from "../components/LoginBtn";
import CommentWrite from "../components/CommentWrite";
import Comment from "../components/Comment";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosBackend from "../AxiosConfig";

import Pagination from "../components/Pagination";

function ConcertDetail() {
  const [concertDetail, setConcertDetail] = useState({});
  const { concertID } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const mapServiceKey = import.meta.env.VITE_REACT_APP_KAKAOMAP_SERVICE_KEY;
  useEffect(() => {
    axiosBackend
      .get(`/main/detail/${concertID}`)
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
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${mapServiceKey}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (concertDetail.la && concertDetail.lo) {
          const mapContainer = document.getElementById("map");
          const mapOption = {
            center: new window.kakao.maps.LatLng(
              concertDetail.la,
              concertDetail.lo,
            ),
            level: 3,
          };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);
          const markerPosition = new window.kakao.maps.LatLng(
            concertDetail.la,
            concertDetail.lo,
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
    navigate(`/concertReservation/${concertID}`);
  }

  const reviewList = (concertDetail.reviewList || []).reverse(); // 최신순 정렬 : Reverse
  const pageCount = Math.ceil(reviewList.length / itemsPerPage);

  // 페이지네이션 처리
  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reviewList.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

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
              {/* <th>항목명</th>
              <th>세부 내용</th> */}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>{row[0]}</td>
                <td>{row[1] && row[1].trim() !== "" ? row[1] : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={style.mapContainer}>
          <div>
            <p className={style.mainStyle} title="concertDetail.placeName">
              {concertDetail.placeName}
            </p>
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
      </div>

      <p className={style.mainStyle}>한줄평 작성하기</p>

      <div className={style.commentWrite}>
        <CommentWrite concertId={concertID} />
      </div>

      <div>
        <p className={style.mainStyle}>
          유저 한줄평 ({concertDetail.reviewList.length})
        </p>
        <p className={style.subStyle}>한줄평은 최신순으로 출력됩니다.</p>
      </div>

      <div className={style.commentContainer}>
        <div className={style.showComments}>
          {currentItems.slice(0, 3).map((comment, index) => (
            <Comment key={index} {...comment} concertID={concertID} />
          ))}
        </div>
        <div className={style.showComments}>
          {currentItems.slice(3, 6).map((comment, index) => (
            <Comment key={index} {...comment} concertID={concertID} />
          ))}
        </div>
        <Pagination
          pageCount={pageCount}
          onPageChange={handlePageClick}
          currentPage={currentPage}
        />
      </div>
      <Footer />
    </div>
  );
}

export default ConcertDetail;
