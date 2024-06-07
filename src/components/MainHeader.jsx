import { useState, useEffect } from "react";
import Logo from "../assets/logoPic.svg";
import style from "../styles/MainHeader.module.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import AuthContext from "./AuthContext";

function MainHeader() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get("http://localhost:8080/auth/valid", { withCredentials: true })
      .then((response) => {
        if (response.data.valid) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  const search = (event) => {
    if (event.key === "Enter") {
      navigate(`/search?concertname=${query}`);
    }
  };

  const login = () => {
    navigate("/login");
  };

  const logout = () => {
    axios
      .post("http://localhost:8080/auth/logout", {}, { withCredentials: true })
      .then(() => {
        setIsLoggedIn(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout failed", error);
      });
  };

  const signUp = () => {
    navigate("/signUp");
  };

  const gotoMain = () => {
    navigate("/");
  };

  const gotoMypage = () => {
    navigate("/mypage");
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
            onKeyDown={search}
          />
        </div>
        <div className={style.right}>
          {isLoggedIn ? (
            <>
              <span className={style.navbar} onClick={logout}>
                로그아웃
              </span>
              <span className={style.navbar} onClick={gotoMypage}>
                마이페이지
              </span>
            </>
          ) : (
            <>
              <span className={style.navbar} onClick={login}>
                로그인
              </span>
              <span className={style.navbar} onClick={signUp}>
                회원가입
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainHeader;
