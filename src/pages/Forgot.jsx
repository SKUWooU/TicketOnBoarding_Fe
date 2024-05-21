import React from 'react'
import LoginHeader from '../components/LoginHeader'
import SignUpItem from '../components/SignUpItem'
import LoginBtn from '../components/LoginBtn'

import style from "../styles/Forgot.module.scss"
import { useNavigate } from 'react-router-dom'

function Forgot() {
    const navigate = useNavigate();

    function forgot(){
        navigate("/forgot")
    }

    function forgotPw(){
        navigate("/forgotPw")
    }

  return (
    <div>
        <LoginHeader page="계정 찾기"/>
        <div className={style.innerContainer}>
            <div className={style.menuContainer}>
                <div className={style.menuInner1}>
                    <p className={style.id} onClick={forgot}>아이디 찾기</p>
                </div>
                <div className={style.menuInner2}>
                    <p className={style.pw} onClick={forgotPw}>비밀번호 찾기</p>
                </div>
            </div>
            <SignUpItem item="휴대폰 번호" type="text" placeholder="가입시 입력한 휴대폰 번호를 입력해주세요"
            className="normal"/>
            <SignUpItem item="이메일 주소" type="email" placeholder="example@naver.com"
            className="normal"/>
            <LoginBtn className="purpleBtn" buttonText="아이디 찾기"/>
        </div> 
    </div>
  )
}

export default Forgot