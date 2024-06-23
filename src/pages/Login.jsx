import { useState, useContext, useEffect } from "react";

import LoginHeader from "../components/LoginHeader";
import LoginInput from "../components/LoginInput";
import LoginBtn from "../components/LoginBtn";
import AuthContext from "../components/AuthContext";
import LogoFont from "../assets/logoFont.svg";
import google from "../assets/google.svg";
import naver from "../assets/naver.svg";

import style from "../styles/Login.module.scss";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

import { useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";

function Login() {
  const { isLoggedIn, setIsLoggedIn, setLoginInfo } = useContext(AuthContext);

  const [id, setId] = useState("");

  const [pw, setPw] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(AiFillEye);
  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = () => {
    setShowPassword(!showPassword);
    setType(showPassword ? "password" : "text");
  };

  const [error, setError] = useState("");

  const handleIdChange = (e) => {
    setId(e.target.value);
  };

  const handlePwChange = (e) => {
    setPw(e.target.value);
  };

  const navigate = useNavigate();

  function forgot() {
    navigate("/forgot");
  }

  function signUp() {
    navigate("/signup");
  }

  const handleLogin = (e) => {
    e.preventDefault();

    if (e.type === "keydown" && e.key !== "Enter") {
      return;
      // 키 입력 이벤트 && 키 입력이 엔터가 아니라고 한다면 Return (함수 중단)
    }

    // 엔터 키 입력했을 때 아래 post요청 처리
    axiosBackend
      .post(
        "/auth/login",
        {
          username: id,
          password: pw,
        },
        { withCredentials: true },
      )
      //로그인했을시 닉네임 저장
      .then((response) => {
        if (response.data.valid) {
          setIsLoggedIn(true);
          setLoginInfo(response.data);
        }
        console.log(response);
        navigate("/");
      })
      .catch(() => {
        setError(true);
      });
  };

  const submit = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      axiosBackend
        .post(
          "/auth/login",
          {
            username: id,
            password: pw,
          },
          { withCredentials: true },
        )
        .then((response) => {
          if (response.data.valid) {
            setIsLoggedIn(true);
            setLoginInfo(response.data);
          }
          console.log(response);
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
          setError(error.response.data);
        });
    }
  };

  // 소셜 로그인 - 네이버 관련

  const NAVER_CLIENT_ID = import.meta.env.VITE_REACT_APP_NAVER_CLIENT_ID;
  const NAVER_REDIRECT_URI = import.meta.env.VITE_REACT_APP_NAVER_REDIRECT_URI;
  const STATE = "false";
  const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${NAVER_REDIRECT_URI}`;

  // 소셜 로그인 - 구글 관련
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = import.meta.env
    .VITE_REACT_APP_GOOGLE_REDIRECT_URI;
  const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code
  &scope=email profile`;

  const GoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };
  const NaverLogin = () => {
    window.location.href = NAVER_AUTH_URL;
  };

  return (
    <div>
      <LoginHeader page="로그인" />
      <div className={style.innerContainer}>
        <img className={style.logoFont} src={LogoFont} alt="로고 벡터이미지" />

        <div className={style.introduce}>
          <p className={style.summary}>
            여러 예매처로 이동하고 별도의 회원가입은 그만!
          </p>
          <p className={style.emphasize}>
            누구에게나 쉬운 원클릭 예매 <span>티켓 온보딩</span>
          </p>
        </div>

        <LoginInput
          className="normal"
          type="text"
          placeholder="아이디를 입력하세요"
          value={id}
          onChange={handleIdChange}
          onKeyDown={submit}
        />

        <div className={style.eyeCombined}>
          <LoginInput
            className="normal"
            type={type}
            placeholder="비밀번호를 입력하세요"
            value={pw}
            onChange={handlePwChange}
            onKeyDown={submit}
          />
          {showPassword ? (
            <AiFillEyeInvisible
              className={style.pwIcon}
              onClick={handleToggle}
            />
          ) : (
            <AiFillEye className={style.pwIcon} onClick={handleToggle} />
          )}
        </div>

        <p className={style.forgot} onClick={forgot}>
          아이디 / 비밀번호 찾기
        </p>

        <LoginBtn
          className="blueBtn"
          buttonText="로그인"
          onClick={handleLogin}
        />
        <p
          className={style.apiWarning}
          style={{ visibility: error ? "visible" : "hidden" }}
          // style 인라인으로 설정 : error가 true일 때만 보이도록 설정
          // error ? true : false 의 순서.
        >
          {error}
        </p>
        <div className={style.socialImgs}>
          <img src={google} alt="구글" onClick={GoogleLogin} />
          <img src={naver} alt="네이버" onClick={NaverLogin} />
        </div>

        <p className={style.signUp} onClick={signUp}>
          아직 회원이 아니신가요 ? 회원가입 하기
        </p>
      </div>
    </div>
  );
}

export default Login;
