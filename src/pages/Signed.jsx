import React from 'react'
import LoginHeader from '../components/LoginHeader'
import LogoFont from "../assets/logoFont.svg"
import LoginBtn from '../components/LoginBtn'

import style from "../styles/IdResult.module.scss"
import { useNavigate } from 'react-router-dom'
function Signed() {

  const navigate = useNavigate();
  function gotoLogin(){
    navigate("/login")
  }
  return (
    <div>
        <LoginHeader page="회원가입 완료"/>
        <div className={style.innerContainer}>
            <img src={LogoFont} alt="로고 폰트" />
            <p className={style.emphasize}><span className={style.apiResult}>DummyText</span> 님의 회원가입이 완료되었어요 ! </p>
            <p className={style.notice}>티켓 온보딩만의 다양한 컨텐츠를 이용해보세요</p>

            <LoginBtn className="purpleBtn" buttonText="로그인 페이지로 이동" onClick={gotoLogin}/>
        </div>
    </div>
  )
}

export default Signed