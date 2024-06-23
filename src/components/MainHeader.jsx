import { useState, useEffect, useContext } from "react";
import Logo from "../assets/logoPic.svg";
import style from "../styles/MainHeader.module.scss";
import { useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import AuthContext from "./AuthContext";

import { IoTicketOutline } from "react-icons/io5";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";

function MainHeader() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { isLoggedIn, setIsLoggedIn, loginInfo, setLoginInfo, resetLoginInfo } =
    useContext(AuthContext);

  useEffect(() => {
    axiosBackend
      .get("/auth/valid", {}, { withCredentials: true })
      .then((response) => {
        if (response.data.valid) {
          setLoginInfo(response.data);
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
    axiosBackend
      .post("/auth/logout", {}, { withCredentials: true })
      .then(() => {
        setIsLoggedIn(false);
        resetLoginInfo();
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
          <div className={style.logoImg} title="홈으로 이동하기">
            <img
              src={Logo}
              alt="로고 이미지"
              onClick={gotoMain}
              className={style.logoImg}
            />
          </div>
          <div className={style.searchContainer}>
            <HiMiniMagnifyingGlass className={style.searchIcon} />
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              className={style.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={search}
            />
          </div>
        </div>
        <div className={style.right}>
          {isLoggedIn ? (
            <div className={style.rightInner}>
              <div>
                <span className={style.navbar} onClick={gotoMypage}>
                  마이페이지
                </span>
                <span className={style.navbar} onClick={logout}>
                  로그아웃
                </span>
                <span className={style.welcome}>
                  <span className={style.nickName}>
                    {loginInfo.nickName}
                    <IoTicketOutline />
                  </span>{" "}
                  님 환영합니다!
                </span>
              </div>
            </div>
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
