import LoginHeader from "../components/LoginHeader";
import LogoFont from "../assets/logoFont.svg";

import Gear from "../assets/GearIcon.svg";
import style from "../styles/Login.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  //   useEffect(() => {
  //     axios
  //       .get("http://localhost:8080/auth/user", { withCredetial: true })
  //       .then((response) => {
  //         console.log(response.data);
  //       })
  //       .catch((err) => {
  //         alert("Axios 통신에 실패하였습니다.\n" + err);
  //       });
  //   }, []);

  const goToReservation = () => {
    navigate("/mypage/reservation");
  };
  return (
    <div>
      <LoginHeader page="마이페이지" />
      <div className={style.innerContainer}>
        <img src={LogoFont} alt="로고 폰트" />
        <p className={style.notice}>누구에게나 쉬운 원클릭 예매 티켓온보딩</p>
        <p className={style.emphasize}>안녕하세요</p>
        <div className={style.ticketContainer} onClick={goToReservation}>
          <img src={Gear} className={style.gearIcon} alt="기어 아이콘" />
          <p className={style.emphasize}>예매한 티켓 확인</p>
        </div>
        <div className={style.ticketContainer} onClick={goToReservation}>
          <img src={Gear} className={style.gearIcon} alt="기어 아이콘" />
          <p className={style.emphasize}>비밀번호 변경</p>
        </div>
        <div className={style.ticketContainer} onClick={goToReservation}>
          <img src={Gear} className={style.gearIcon} alt="기어 아이콘" />
          <p className={style.emphasize}>회원 탈퇴</p>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
