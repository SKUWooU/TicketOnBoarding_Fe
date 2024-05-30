import LoginHeader from "../components/LoginHeader";
import LogoFont from "../assets/logoFont.svg";
import LoginBtn from "../components/LoginBtn";

import style from "../styles/IdResult.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
function Signed() {
  const location = useLocation;
  // 회원가입 페이지에서 state를 가져오기 위한 변수 선언
  const nickname = location.state.nickname;

  const navigate = useNavigate();
  function gotoLogin() {
    navigate("/login");
  }
  return (
    <div>
      <LoginHeader page="회원가입 완료" />
      <div className={style.innerContainer}>
        <img src={LogoFont} alt="로고 폰트" />
        <p className={style.emphasize}>
          <span className={style.apiResult}>{nickname}</span> 님의 회원가입이
          완료되었어요 !{" "}
        </p>
        <p className={style.notice}>
          티켓 온보딩만의 다양한 컨텐츠를 이용해보세요
        </p>

        <LoginBtn
          className="purpleBtn"
          buttonText="로그인 페이지로 이동"
          onClick={gotoLogin}
        />
      </div>
    </div>
  );
}

export default Signed;
