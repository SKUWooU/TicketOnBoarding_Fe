import React, { useEffect, useState } from "react";
import LoginHeader from "../components/LoginHeader";
import style from "../styles/AdminPage.module.scss";
import { useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import Pagination from "../components/Pagination";
import { FaStar } from "react-icons/fa";

function AdminPage() {
  const navigate = useNavigate();
  const [concertList, setAllConcerts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

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

  useEffect(() => {
    axiosBackend
      .get("/admin/concerts", { withCredentials: true })
      .then((response) => {
        setAllConcerts(response.data);
        console.log(response.data);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const toggleMdPick = (concertId, currentPick) => {
    const newPick = currentPick === 0 ? 1 : 0;
    axiosBackend
      .post(
        `/admin/mdspick/${concertId}`,
        { pick: newPick },
        { withCredentials: true },
      )
      .then(() => {
        setAllConcerts((prevConcerts) =>
          prevConcerts.map((concert) =>
            concert.concertId === concertId
              ? { ...concert, onTicketPick: newPick }
              : concert,
          ),
        );
        alert("Md's Pick 이 갱신되었습니다.");
        navigate(0);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = concertList.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(concertList.length / itemsPerPage);

  function gotoDetail(concertId) {
    navigate(`/concertDetail/${concertId}`);
  }
  return (
    <div className={style.mainContainer}>
      <LoginHeader
        page="관리자 페이지 - 공연 조회"
        className={style.noMarginBottom}
      />
      <div className={style.Category}>
        <p onClick={goBack}>돌아가기 </p>
        <p onClick={allConcerts}>공연 조회 </p>
        <p onClick={allUsers}>고객 조회</p>
        <p onClick={claims}>환불 처리</p>
        <p onClick={gotoPick}>Md's Pick</p>
      </div>
      <div>
        <h1 className={style.division}>
          총 {concertList.length} 개의 데이터가 조회되었습니다.
        </h1>
        <h2 className={style.h2Explain}>
          별 아이콘을 클릭해 Md's Pick 선정 및 해제가 가능합니다.{" "}
          <FaStar color={"gold"} />
        </h2>
      </div>
      <div className={style.mainInner}>
        <p className={style.extraExplain}>
          공연 이름 클릭 시, 공연 상세 페이지로 이동합니다.
        </p>
        <table className={style.outPutTable}>
          <thead>
            <tr>
              <th>순번</th>
              <th>공연 ID</th>
              <th>공연 이름</th>
              <th>시작일</th>
              <th>종료일</th>
              <th>상태</th>
              <th>장르</th>
              <th>평점</th>
              <th>장소</th>
              <th>가격</th>
              <th>Md'sPick</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((concert, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td title={concert.concertId}>{concert.concertId}</td>
                <td
                  title={concert.concertName}
                  className={style.concertName}
                  onClick={() => gotoDetail(concert.concertId)}
                >
                  {concert.concertName}
                </td>
                <td title={concert.startDate}>{concert.startDate}</td>
                <td title={concert.endDate}>{concert.endDate}</td>
                <td title={concert.status}>{concert.status}</td>
                <td title={concert.genre}>{concert.genre}</td>
                <td title={concert.concertDetail.averageRating}>
                  {concert.concertDetail.averageRating}
                </td>
                <td title={concert.concertDetail.place}>
                  {concert.concertDetail.place}
                </td>
                <td title={concert.concertDetail.price}>
                  {concert.concertDetail.price}
                </td>
                <td
                  onClick={() =>
                    toggleMdPick(concert.concertId, concert.onTicketPick)
                  }
                >
                  <FaStar
                    color={concert.onTicketPick ? "gold" : "gray"}
                    className={style.starEmoji}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          pageCount={pageCount}
          onPageChange={handlePageClick}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}

export default AdminPage;
