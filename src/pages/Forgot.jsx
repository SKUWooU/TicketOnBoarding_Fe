import LoginHeader from "../components/LoginHeader";
import SignUpItem from "../components/SignUpItem";
import LoginBtn from "../components/LoginBtn";

import style from "../styles/Forgot.module.scss";
import { useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import { useState } from "react";

import { IoIosArrowBack } from "react-icons/io";

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
    axiosBackend
      .post("/users/findid", {
        phonenumber: phoneNumber,
        email: email,
      })
      .then((response) => {
        console.log(response.data);
        const userId = response.data.username;
        const createDate = response.data.createdate;
        navigate("/idFound", {
          state: {
            id: userId,
            date: createDate.slice(0, 10),
          },
        });
      })
      .catch(() => {});
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
          className="blueBtn"
          buttonText="아이디 찾기"
          onClick={idFind}
        />
      </div>
    </div>
  );
}

export default Forgot;
