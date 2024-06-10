import { useState } from "react";

import LoginHeader from "../components/LoginHeader";
import SignUpItem from "../components/SignUpItem";
import LoginBtn from "../components/LoginBtn";
import SignUpText from "../components/SignUpText";

import style from "../styles/SignUp.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

import axios from "axios";

function PwReset() {
  const navigate = useNavigate();
  const location = useLocation();

  const phoneNumber = location.state;

  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");

  const pwRex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;

  const [pwError, setPwError] = useState("");
  const [pwConfirmError, setPwConfirmError] = useState("");

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

    if (value.length > 0 && pw !== value) {
      setPwConfirmError("두 비밀번호가 일치하지 않습니다.");
    } else {
      setPwConfirmError("");
    }
  };

  function pwReset() {
    axios
      .post("http://localhost:8080/users/changepwd", {
        phonenumber: phoneNumber.phonenumber,
        password1: pw,
        password2: pwConfirm,
      })
      .then(() => {
        navigate("/afterPwReset");
      })
      .catch((error) => {
        alert("에러가 발생하였습니다.\n" + error.message);
      });
  }

  return (
    <div>
      <LoginHeader page="비밀번호 재설정" />
      <div className={style.innerContainer}>
        <SignUpItem
          type="password"
          className="normal"
          item="새 비밀번호"
          placeholder="영문, 숫자, 특수문자 조합 8~15자 이내"
          value={pw}
          onChange={pwRexing}
        />
        <SignUpText text={pwError} />
        <SignUpItem
          type="password"
          className="normal"
          item="새 비밀번호 재확인"
          placeholder="비밀번호 재입력"
          value={pwConfirm}
          onChange={pwDoubleCheck}
        />
        <SignUpText text={pwConfirmError} />
        <LoginBtn
          className="purpleBtn"
          buttonText="비밀번호 재설정하기"
          onClick={pwReset}
        />
      </div>
    </div>
  );
}

export default PwReset;
