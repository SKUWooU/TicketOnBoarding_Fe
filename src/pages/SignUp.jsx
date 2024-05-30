import { useState } from "react";

import LoginHeader from "../components/LoginHeader";
import SignUpItem from "../components/SignUpItem";
import LoginBtn from "../components/LoginBtn";
import SignUpText from "../components/SignUpText";

import style from "../styles/SignUp.module.scss";

import axios from "axios";
import { useNavigate } from "react-router-dom";
// 회원가입 완료 버튼은 각 필드의 입력값이 정규식을 통과해야 enabled 로 변경되게 로직 수정 필요.

function SignUp() {
  const navigate = useNavigate();
  //각 입력에 대한 정규식 사전 정의
  const pwRex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
  const emailRex =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  const phoneNumberRex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

  // 각 Input 입력값에 대한 상태 관리
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumer] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  // onChange 로 해당 부분 정규표현식 검증한 이후, 각 상태의 Error 메세지는 Input 아래에 출력되게 됨.
  const [pwError, setPwError] = useState("");
  const [pwConfirmError, setPwConfirmError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [idConfirmMsg, setIdConfirmMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPhoneNumberSent, setIsPhoneNumberSent] = useState(false);
  const [signUpMsg, setSignUpMsg] = useState("");

  // 해당 입력값을 받았을 때 에러코드 출력
  const pwRexing = (e) => {
    const value = e.target.value;
    setPw(value);

    if (value.length === 0) {
      setPwError("");
    } else if (value.length < 8 || value.length > 15) {
      setPwError("비밀번호는 8자 이상, 15자 이하이어야 합니다.");
    } else if (!pwRex.test(value)) {
      setPwError("영문, 숫자, 특수문자 조합 8~15자 이내로 입력해주세요.");
    } else {
      setPwError("");
    }
  };

  const pwDoubleCheck = (e) => {
    const value = e.target.value;
    setPwConfirm(value);

    if (value.length > 0 && pw != value) {
      setPwConfirmError("두 비밀번호가 일치하지 않습니다.");
    } else {
      setPwConfirmError("");
    }
  };

  const emailRexing = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.length === 0) {
      setEmailError("");
    } else if (!emailRex.test(value)) {
      setEmailError("유효한 이메일 주소를 입력해주세요.");
    } else {
      setEmailError("");
    }
  };

  const phoneNumberRexing = (e) => {
    const value = e.target.value;
    setPhoneNumer(value);

    if (value.length === 0) {
      setPhoneNumberError("");
    } else if (!phoneNumberRex.test(value)) {
      setPhoneNumberError("유효한 휴대폰 번호를 입력해주세요.");
    } else {
      setPhoneNumberError("");
    }
  };

  function idConfirm(e) {
    // 아이디 중복검사 POST Requested
    e.preventDefault();
    axios
      .post("http://localhost:8080/users/signup/check", {
        username: id,
      })
      .then(() => {
        setIsSuccess(true);
        setIdConfirmMsg("사용할 수 있는 아이디입니다."); // 성공 메시지
      })
      .catch(() => {
        setIsSuccess(false);
        setIdConfirmMsg("중복된 아이디입니다."); // 실패 메시지
      });
  }

  function phoneNumberVerify(e) {
    // 인증 번호 받기 Post Requested
    e.preventDefault();
    axios
      .post("http://localhost:8080/users/smscode", {
        to: phoneNumber,
      })
      .then(() => {
        setIsPhoneNumberSent(true);
      })
      .catch(() => {
        setIsSuccess(true);
      });
  }

  function signUp(e) {
    // 회원가입 Post Requested
    e.preventDefault();
    axios
      .post("http://localhost:8080/users/signup", {
        username: id,
        password1: pw,
        password2: pwConfirm,
        email: email,
        nickname: nickname,
        phonenumber: phoneNumber,
        smscode: verifyCode,
      })
      .then(() => {
        navigate("/signed", { state: { nickname: nickname } });
        // 가입 완료 페이지 이동 및 state 전달 (닉네임)
      })
      .catch((error) => {
        setSignUpMsg(error.response.data);
      });
  }

  return (
    <div>
      <LoginHeader page="회원가입" />
      <div className={style.innerContainer}>
        <div className={style.item}>
          <div className={style.tempContainer}>
            <p className={style.tempText}>아이디</p>
            <div className={style.tempInner}>
              <input
                type="text"
                className={style.tempInput}
                placeholder="사용할 아이디를 입력해주세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              {/* ID 중복 체크 BTN */}
              <button className={style.tempBtn} onClick={idConfirm}>
                ID 중복 체크
              </button>
            </div>
            <p
              className={style.apiWarning}
              style={{
                visibility: idConfirmMsg ? "visible" : "hidden",
                color: isSuccess ? "green" : "red", // 성공 시 초록색, 실패 시 빨간색
              }}
            >
              {idConfirmMsg}
            </p>
          </div>
        </div>
        <div className={style.item}>
          <SignUpItem
            type="password"
            className="normal"
            item="비밀번호"
            placeholder="영문, 숫자, 특수문자 조합 8~15자 이내"
            value={pw}
            onChange={pwRexing}
          />
          <SignUpText text={pwError} />
        </div>
        <div className={style.item}>
          <SignUpItem
            type="password"
            className="normal"
            item="비밀번호 재확인"
            placeholder="비밀번호 재입력"
            value={pwConfirm}
            onChange={pwDoubleCheck}
          />
          <SignUpText text={pwConfirmError} />
        </div>
        <div className={style.item}>
          <SignUpItem
            type="text"
            className="normal"
            item="이메일"
            placeholder="example@naver.com"
            value={email}
            onChange={emailRexing}
          />
          <SignUpText text={emailError} />
        </div>
        <div className={style.item}>
          <SignUpItem
            type="text"
            className="normal"
            item="본인의 이름"
            placeholder="사용할 닉네임을 입력하세요"
            onChange={(e) => setNickname(e.target.value)}
            value={nickname}
          />
        </div>
        <div className={style.item}>
          <SignUpItem
            type="text"
            className="normal"
            item="휴대폰 번호 인증"
            placeholder="전화 번호를 입력하세요('-' 제외)"
            value={phoneNumber}
            onChange={phoneNumberRexing}
          />
          <SignUpText text={phoneNumberError} />
        </div>
        {/* 휴대폰 인증번호 받기 Btn */}
        <LoginBtn
          className="blueBtn"
          buttonText="인증 번호 받기"
          onClick={phoneNumberVerify}
        />
        <p
          className={style.afterSent}
          style={{ visibility: isPhoneNumberSent ? "visible" : "hidden" }}
        >
          인증번호가 전송되었습니다.
        </p>
        <div className={style.item}>
          {/* 인증번호 입력 input 태그와 인증 완료 btn은 인증번호 받기 API 요청 이후에 
            동적으로 생성되서 보이는 것으로 로직 수정 필요 - scss */}
          <SignUpItem
            item="인증번호"
            className="normal"
            placeholder="인증번호를 입력해주세요."
            value={verifyCode}
            onChange={(e) => {
              setVerifyCode(e.target.value);
            }}
          />
        </div>
        <LoginBtn
          className="purpleBtn"
          buttonText="인증 및 가입하기"
          onClick={signUp}
        />
        <p
          className={style.afterSent}
          style={{ visibility: signUpMsg ? "visible" : "hidden" }}
        >
          {signUpMsg}
        </p>
      </div>
    </div>
  );
}

export default SignUp;
