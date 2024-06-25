import LoginHeader from "../components/LoginHeader";
import ReservedCard from "../components/ReservedCard";
import style from "../styles/ReservedList.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../components/AuthContext";
import axiosBackend from "../AxiosConfig";
import Pagination from "../components/Pagination"; // Import Pagination component
import MainFooter from "../components/MainFooter";

function ReservedList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginInfo } = useContext(AuthContext);

  const [reservedList, setReservedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Initialize currentPage state
  const itemsPerPage = 8; // Number of items per page

  useEffect(() => {
    axiosBackend
      .get("/mypage/reservationlist", { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        const filteredList = response.data.filter(
          (concert) => concert.status === "결제완료",
        );
        setReservedList(filteredList);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  function goBack() {
    navigate("/mypage");
  }

  function gotoReserved() {
    navigate("/mypage/reservedList");
  }

  function gotoWaiting() {
    navigate("/mypage/watingRefund");
  }

  function gotoRefunded() {
    navigate("/mypage/ticketRefunded");
  }

  // Pagination related functions
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reservedList.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(reservedList.length / itemsPerPage);

  return (
    <div className={style.mainContainer}>
      <LoginHeader page="구매한 티켓 조회" />
      <div className={style.Category}>
        <p onClick={goBack}>뒤로가기</p>
        <p onClick={gotoReserved}>예매한 티켓</p>
        <p onClick={gotoWaiting}>취소 신청</p>
        <p onClick={gotoRefunded}>환불 완료</p>
      </div>
      <h1 className={style.division}>
        예약된 티켓은 총 {reservedList.length} 장 입니다.
        <p className={style.notice}>
          환불 신청 시, 관리자 승인 이후 자동 환불처리 됩니다.
        </p>
      </h1>
      <div className={style.mainInner}>
        <div className={style.showCards}>
          {currentItems.slice(0, 4).map((concert) => (
            <ReservedCard
              key={concert.concertId}
              posterUrl={concert.posterUrl}
              concertName={concert.concertName}
              concertDate={concert.concertDate}
              concertTime={concert.concertTime}
              createdAt={concert.createdAt}
              seatNumber={concert.seatNumber}
              reservationId={concert.id}
              status={concert.status}
              concertId={concert.concertId}
            />
          ))}
        </div>
      </div>
      <div className={style.mainInner}>
        <div className={style.showCards}>
          {currentItems.slice(4, 8).map((concert) => (
            // 메인에는 실시간 4개씩 -> map으로 순회하면서 컴포넌트에 Props 전달
            <ReservedCard
              key={concert.concertId}
              posterUrl={concert.posterUrl}
              concertName={concert.concertName}
              concertDate={concert.concertDate}
              concertTime={concert.concertTime}
              createdAt={concert.createdAt}
              seatNumber={concert.seatNumber}
              reservationId={concert.id}
              status={concert.status}
              concertId={concert.concertId}
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

export default ReservedList;
