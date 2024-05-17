import LoginHeader from '../components/LoginHeader'
import LoginInput from '../components/LoginInput';
import LoginBtn from '../components/LoginBtn';


import LogoFont from "../assets/logoFont.svg"
import google from "../assets/google.svg"
import kakao from "../assets/kakao.svg"
import naver from "../assets/naver.svg"

import "../styles/Login.scss"

function Login() {
  return (
    <div>
      <LoginHeader page="로그인"/>
        <div className='innerContainer'>
          <img  className="logoFont" src={LogoFont} alt="로고 벡터이미지" />

          <div className='introduce'>
            <p className='summary'>여러 예매처로 이동하고<br />
                                   별도의 회원가입은 그만!</p>
            <p className='emphasize'>누구에게나 쉬운 원클릭 예매 서비스</p>
          </div>

          <LoginInput className='normal' type="text" placeholder="아이디를 입력하세요"/>
          
          <LoginInput className='normal'type="text" placeholder="비밀번호를 입력하세요"/>
          
          <p className='forgot'>아이디 / 비밀번호 찾기</p>

          <LoginBtn className="blueBtn" buttonText="로그인"/>

          <div className='socialImgs'>
            <img src={google} alt="구글" />
            <img src={kakao} alt="카카오톡" />
            <img src={naver} alt="네이버" />
          </div>

          <p className='signUp'>아직 회원이 아니신가요 ? 회원가입 하기</p>
        </div>
    </div>
  )
}

export default Login;
