import Logo from "../assets/logoPic.svg";

import style from "../styles/MainHeader.module.scss";
import { useNavigate } from "react-router-dom";

function MainHeader() {
  const navigate = useNavigate();

  function login() {
    navigate("/login");
  }

  function signUp() {
    navigate("/signUp");
  }
  function gotoMain() {
    navigate("/");
  }
  return (
    <div>
      <div className={style.headerContainer}>
        <div className={style.left}>
          <img src={Logo} alt="로고 이미지" onClick={gotoMain} />
          <input
            type="text"
            placeholder="검색어를 입력해주세요"
            className={style.search}
          />
        </div>
        <div className={style.right}>
          <span className={style.navbar} onClick={login}>
            로그인
          </span>
          <span className={style.navbar} onClick={signUp}>
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}

export default MainHeader;
