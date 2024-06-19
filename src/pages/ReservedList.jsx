import LoginHeader from "../components/LoginHeader";
import LogoFont from "../assets/logoFont.svg";

import style from "../styles/IdResult.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

import { FaGear } from "react-icons/fa6";
import { IoTicketOutline } from "react-icons/io5";
import { useContext, useEffect } from "react";
import AuthContext from "../components/AuthContext";
import axios from "axios";

function ReservedList() {
  const navigate = useNavigate();
  const location = useLocation();

  const { loginInfo } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get("http://localhost:8080/mypage/reservationlist")
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  return (
    <div>
      <LoginHeader page="예매한 티켓 확인" />
      <div className={style.innerContainer}>
        <img src={LogoFont} alt="로고 폰트" />
        <p className={style.emphasize}>
          <span className={style.apiResult}>
            {loginInfo.nickName} <IoTicketOutline />
          </span>{" "}
          님 안녕하세요 !
        </p>
        <p className={style.notice}>현재 보유한 티켓은 n 장 입니다.</p>
      </div>
    </div>
  );
}

export default ReservedList;
