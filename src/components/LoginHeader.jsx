import { useNavigate } from "react-router-dom";

import logoPic from "../assets/logoPic.svg";
import style from "../styles/LoginHeader.module.scss";

function LoginHeader({ page }) {
  const navigate = useNavigate();

  // useNavigate 호출 -> navigate 함수를 반환

  const pageShift = (e) => {
    navigate("/");
  };

  return (
    <div className={style.LoginHeader}>
      <div className={style.imgContainer}>
        <img src={logoPic} alt="로고이미지" onClick={pageShift} />
      </div>
      <div className={style.textContainer}>
        <p className={style.pageText}>{page}</p>
      </div>
    </div>
  );
}

export default LoginHeader;
