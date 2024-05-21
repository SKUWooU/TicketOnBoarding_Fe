import React from 'react'
import LoginHeader from '../components/LoginHeader'
import LogoFont from "../assets/logoFont.svg"
import LoginBtn from '../components/LoginBtn'

import style from "../styles/IdResult.module.scss"
import { useNavigate } from 'react-router-dom'

function AfterPwReset() {

  const navigate = useNavigate();

  function gotoLogin(){
    navigate("/login")
  }

  return (
    <div>
        <LoginHeader page="비밀번호 재설정"/>
        <div className={style.innerContainer}>
            <img src={LogoFont} alt="로고 폰트" />
            <p className={style.emphasize}>비밀번호 재설정이 완료되었어요 !</p>
            <p className={style.notice}>새로운 비밀번호로 로그인 해주세요.</p>
            <LoginBtn className="purpleBtn" buttonText="로그인 페이지로 이동하기" onClick={gotoLogin}/>
        </div>
    </div>
  )
}

export default AfterPwReset