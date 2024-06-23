import React, { useEffect, useState } from "react";
import LoginHeader from "../components/LoginHeader";
import style from "../styles/AdminPage.module.scss";
import { useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import Pagination from "../components/Pagination";
import { HiMiniXMark } from "react-icons/hi2";

function AdminPageAllTickets() {
  const navigate = useNavigate();

  const [ticketList, setTicketList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    axiosBackend
      .get("/admin/reservationlist", { withCredentials: true })
      .then((response) => {
        console.log(response);
        setTicketList(response.data || []);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
        console.log(err);
      });
  }, []);

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ticketList.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(ticketList.length / itemsPerPage);

  const goBack = () => {
    navigate("/mypage");
  };

  const allConcerts = () => {
    navigate("/adminPage");
  };

  const allUsers = () => {
    navigate("/adminPage/users");
  };

  const claims = () => {
    navigate("/adminPage/claims");
  };

  const gotoPick = () => {
    navigate("/adminPage/pick");
  };

  const allTickets = () => {
    navigate("/adminPage/allTickets");
  };

  // function refund(reservationId) {
  //   axiosBackend
  //     .post(`/admin/cancel/${reservationId}`, null, { withCredentials: true })
  //     .then((response) => {
  //       console.log(response);
  //       alert("환불 처리 되었습니다.");
  //       navigate(0);
  //     })
  //     .catch((err) => {
  //       alert("Axios 통신에 실패하였습니다.\n" + err);
  //       console.log(err);
  //     });
  // }

  function gotoDetail(concertId) {
    navigate(`/concertDetail/${concertId}`);
  }

  return (
    <div className={style.mainContainer}>
      <LoginHeader
        page="관리자 페이지 - 예매 조회"
        className={style.noMarginBottom}
      />
      <div className={style.Category}>
        <p onClick={goBack}>돌아가기 </p>
        <p onClick={allConcerts}>공연 조회 </p>
        <p onClick={allUsers}>고객 조회</p>
        <p onClick={allTickets}>예매 조회</p>
        <p onClick={claims}>환불 처리</p>
        <p onClick={gotoPick}>Md's Pick</p>
      </div>
      <div>
        <h1 className={style.division}>
          총 {ticketList.length} 개의 예매 내역이 조회되었습니다.
        </h1>
        <h2 className={style.h2Explain}>더미텍스트입니다.</h2>
      </div>

      <div className={style.mainInner}>
        <p className={style.extraExplain}>
          예매된 모든 내역들을 출력합니다. 공연명 클릭시 공연 상세페이지로
          이동합니다.
        </p>
        <table className={style.outPutTable}>
          <thead>
            <tr>
              <th>순번</th>
              <th>공연 ID</th>
              <th>공연 이름</th>
              <th>결제일</th>
              <th>결제 시각</th>
              <th>좌석 번호</th>
              <th>상태</th>
              <th>아이디</th>
              <th>환불 처리</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.concertId}</td>
                <td
                  title={item.concertName}
                  className={style.concertName}
                  onClick={() => gotoDetail(item.concertId)}
                >
                  {item.concertName}
                </td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>{new Date(item.createdAt).toLocaleTimeString()}</td>
                <td>{item.seatNumber}</td>
                <td>{item.status}</td>
                <td>{item.username}</td>
                <td>
                  {item.status === "취소신청" ? (
                    <HiMiniXMark
                      className={style.deleteIcon}
                      onClick={() => refund(item.id)}
                    />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          pageCount={pageCount}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default AdminPageAllTickets;
