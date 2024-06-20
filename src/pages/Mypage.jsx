import LoginHeader from "../components/LoginHeader";
import LogoFont from "../assets/logoFont.svg";

import style from "../styles/IdResult.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

import { FaGear } from "react-icons/fa6";
import { IoTicketOutline } from "react-icons/io5";
import { useContext } from "react";
import AuthContext from "../components/AuthContext";

function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { loginInfo } = useContext(AuthContext);

  function gotoList() {
    navigate("/reservedList");
  }

  function gotoPwChange() {
    navigate("/pwReset");
  }

  function userDelete() {
    return;
  }

  function gotoAdminaPage() {
    navigate("/adminPage");
  }

  return (
    <div>
      <LoginHeader page="마이페이지" />
      <div className={style.innerContainer}>
        <img src={LogoFont} alt="로고 폰트" />
        <p className={style.notice}>누구에게나 쉬운 원클릭 예매 - 티켓온보딩</p>
        <p className={style.emphasize}>
          <span className={style.apiResult}>
            {loginInfo.nickName} <IoTicketOutline />
          </span>{" "}
          님 안녕하세요 !
        </p>
        <div className={style.innerMenu}>
          <p onClick={gotoList}>
            <FaGear /> 예매한 티켓 확인하기
          </p>
          <p>
            <FaGear /> 비밀번호 변경하기
          </p>
          <p>
            {/* <span className={style.delete}> */}
            <FaGear /> 회원 탈퇴하기
            {/* </span> */}
          </p>
          {loginInfo.code === 3 ? (
            <p onClick={gotoAdminaPage}>
              <FaGear /> 관리자 페이지로 이동하기
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
