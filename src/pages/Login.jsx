import LoginHeader from "../components/LoginHeader";
import LoginInput from "../components/LoginInput";
import LoginBtn from "../components/LoginBtn";

import LogoFont from "../assets/logoFont.svg";
import google from "../assets/google.svg";
import kakao from "../assets/kakao.svg";
import naver from "../assets/naver.svg";

import style from "../styles/Login.module.scss";

import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = new useNavigate();

  function forgot(){
    navigate("/forgot");
  }

  function signUp(){
    navigate("/signUp")
  }
  return (
    <div>
      <LoginHeader page="로그인" />
      <div className={style.innerContainer}>
        <img className={style.logoFont} src={LogoFont} alt="로고 벡터이미지" />

        <div className={style.introduce}>
          <p className={style.summary}>
            여러 예매처로 이동하고
            <br />
            별도의 회원가입은 그만!
          </p>
          <p className={style.emphasize}>누구에게나 쉬운 원클릭 예매 서비스</p>
        </div>

        <LoginInput
          className="normal"
          type="text"
          placeholder="아이디를 입력하세요"
        />

        <LoginInput
          className="normal"
          type="password"
          placeholder="비밀번호를 입력하세요"
        />

        <p className={style.forgot} onClick={forgot}>아이디 / 비밀번호 찾기</p>

        <LoginBtn className="blueBtn" buttonText="로그인" />

        <div className={style.socialImgs}>
          <img src={google} alt="구글" />
          <img src={kakao} alt="카카오톡" />
          <img src={naver} alt="네이버" />
        </div>

        <p className={style.signUp} onClick={signUp}>아직 회원이 아니신가요 ? 회원가입 하기</p>
      </div>
    </div>
  );
}

export default Login;
