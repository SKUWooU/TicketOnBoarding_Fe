import { useState } from "react";

import LoginHeader from "../components/LoginHeader";
import LoginInput from "../components/LoginInput";
import LoginBtn from "../components/LoginBtn";

import LogoFont from "../assets/logoFont.svg";
import google from "../assets/google.svg";
import kakao from "../assets/kakao.svg";
import naver from "../assets/naver.svg";

import style from "../styles/Login.module.scss";

import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const [error, setError] = useState(false);

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

  function handleLogin(e) {
    e.preventDefault();
    axios
      .post(
        "http://localhost:8080/auth/login",
        {
          username: id,
          password: pw,
        },
        { withCredentials: true },
      )
      .then((response) => {
        console.log(response);
        navigate("/");
      })
      .catch((error) => {
        setError(error.response.data);
      });
  }
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
        />

        <LoginInput
          className="normal"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={pw}
          onChange={handlePwChange}
        />

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
          <img src={google} alt="구글" />
          <img src={kakao} alt="카카오톡" />
          <img src={naver} alt="네이버" />
        </div>

        <p className={style.signUp} onClick={signUp}>
          아직 회원이 아니신가요 ? 회원가입 하기
        </p>
      </div>
    </div>
  );
}

export default Login;
