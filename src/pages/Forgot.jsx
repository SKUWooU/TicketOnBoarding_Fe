import LoginHeader from "../components/LoginHeader";
import SignUpItem from "../components/SignUpItem";
import LoginBtn from "../components/LoginBtn";

import style from "../styles/Forgot.module.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

function Forgot() {
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  function forgot() {
    navigate("/forgot");
  }

  function forgotPw() {
    navigate("/forgotPw");
  }

  function idFind(e) {
    // ID 찾기 Post request
    e.preventDefault();
    axios
      .post("http://localhost:8080/users/findid", {
        phonenumber: phoneNumber,
        email: email,
      })
      .then((response) => {
        navigate("/idFound");
        // 전달해야할 State : Id 및 가입 일자
        console.log(response);
      })
      .catch(() => {});
  }
  return (
    <div>
      <LoginHeader page="계정 찾기" />
      <div className={style.innerContainer}>
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
          item="휴대폰 번호"
          type="text"
          placeholder="가입시 입력한 휴대폰 번호를 입력해주세요"
          className="normal"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <SignUpItem
          item="이메일 주소"
          type="email"
          placeholder="example@naver.com"
          className="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <LoginBtn
          className="purpleBtn"
          buttonText="아이디 찾기"
          onClick={idFind}
        />
      </div>
    </div>
  );
}

export default Forgot;
