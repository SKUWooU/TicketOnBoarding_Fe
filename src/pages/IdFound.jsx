import LoginHeader from "../components/LoginHeader";
import LogoFont from "../assets/logoFont.svg";
import LoginBtn from "../components/LoginBtn";

import style from "../styles/IdResult.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
function IdFound() {
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state.id || "아이디를 찾을 수 없습니다";
  const date = location.state.date;

  function forgotPw() {
    navigate("/forgotPw");
  }

  return (
    <div>
      <LoginHeader page="아이디 찾기" />
      <div className={style.innerContainer}>
        <img src={LogoFont} alt="로고 폰트" />
        <p className={style.notice}>입력하신 정보의 아이디를 찾았어요 !</p>
        <p className={style.emphasize}>
          아이디 : <span className={style.apiResult}>{userId}</span>
        </p>
        <p className={style.emphasize}>가입 일시 : {date} </p>

        <LoginBtn
          className="blueBtn"
          buttonText="비밀번호 찾기"
          onClick={forgotPw}
        />
      </div>
    </div>
  );
}

export default IdFound;
