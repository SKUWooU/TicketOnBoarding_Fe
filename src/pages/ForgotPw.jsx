import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import LoginHeader from "../components/LoginHeader";
import SignUpItem from "../components/SignUpItem";
import LoginBtn from "../components/LoginBtn";
import SignUpText from "../components/SignUpText"; // 이 부분을 signUpText로 되어 있던 것을 수정
import style from "../styles/ForgotPw.module.scss";

import { IoIosArrowBack } from "react-icons/io";

function ForgotPw() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isPhoneNumberSent, setIsPhoneNumberSent] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const phoneNumberRex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

  function forgot() {
    navigate("/forgot");
  }

  function forgotPw() {
    navigate("/forgotPw");
  }

  const phoneNumberRexing = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    if (value.length === 0) {
      setPhoneNumberError("");
    } else if (!phoneNumberRex.test(value)) {
      setPhoneNumberError("유효한 휴대폰 번호를 입력해주세요.");
    } else {
      setPhoneNumberError("");
    }
  };

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
        // 에러 처리 필요 시 추가
      });
  }

  function verifyCodeConfirm(e) {
    //인증번호 확인
    e.preventDefault();
    axios
      .post("http://localhost:8080/users/issmscode", {
        smscode: verifyCode,
      })
      .then(() => {
        // 인증번호가 맞다면, then: 비밀번호 재설정 페이지 이동
        navigate("/pwReset", {
          state: {
            phonenumber: phoneNumber,
          },
        });
      })
      .catch((error) => {
        //인증번호가 맞지 않는 에러 핸들링 블록
        alert("에러가 발생하였습니다.\n" + error.message);
      });
  }

  function goBack() {
    navigate("/login");
  }

  return (
    <div>
      <LoginHeader page="계정 찾기" />
      <div className={style.innerContainer}>
        <div className={style.arrowContainer}>
          <IoIosArrowBack
            size={30}
            onClick={goBack}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className={style.menuContainer}>
          <div className={style.menuInner1}>
            <p className={style.id} onClick={forgot}>
              아이디 찾기
            </p>
          </div>
          <div className={style.menuInner2}>
            <p className={style.pw} onClick={forgotPw}>
              비밀번호 찾기
            </p>
          </div>
        </div>
        <SignUpItem
          type="text"
          className="normal"
          item="휴대폰 번호 인증"
          placeholder="전화 번호를 입력하세요('-' 제외)"
          value={phoneNumber}
          onChange={phoneNumberRexing}
        />
        <SignUpText text={phoneNumberError} /> {/* SignUpText 컴포넌트 사용 */}
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
        {isPhoneNumberSent && (
          <>
            <SignUpItem
              item="인증번호"
              className="normal"
              placeholder="인증번호를 입력해주세요."
              value={verifyCode}
              onChange={(e) => {
                setVerifyCode(e.target.value);
              }}
            />
            <LoginBtn
              className="purpleBtn"
              buttonText="인증하기"
              onClick={verifyCodeConfirm}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPw;
