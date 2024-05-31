import { useState } from "react";
import Logo from "../assets/logoPic.svg";
import style from "../styles/MainHeader.module.scss";
import { useNavigate } from "react-router-dom";

function MainHeader() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const search = (event) => {
    if (event.key === "Enter") {
      navigate(`/search?concertname=${query}`);
      //navigate("/search");
    }
  };

  const login = () => {
    navigate("/login");
  };

  const signUp = () => {
    navigate("/signUp");
  };

  const gotoMain = () => {
    navigate("/");
  };

  return (
    <div>
      <div className={style.headerContainer}>
        <div className={style.left}>
          <img src={Logo} alt="로고 이미지" onClick={gotoMain} />
          <input
            type="text"
            placeholder="검색어를 입력해주세요"
            className={style.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={search} // onKeyDown : 해당 키를 입력했을 때의 이벤트 처리
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
