import React, { useState } from 'react' 

import LoginHeader from '../components/LoginHeader'
import SignUpItem from '../components/SignUpItem'
import LoginBtn from '../components/LoginBtn'
import SignUpText from '../components/SignUpText'
import LoginInput from '../components/LoginInput'

import "../styles/SignUp.scss"

// 회원가입 완료 버튼은 각 필드의 입력값이 정규식을 통과해야 enabled 로 변경되게 로직 수정 필요.

function SignUp() {

  //각 입력에 대한 정규식 사전 정의
  const pwRex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/
  const emailRex =/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/
  const phoneNumberRex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/

  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [pwConfirm,setPwConfirm] = useState('');
  const [email,setEmail] = useState('');
  const [nickname,setNickname] = useState('');
  const [phoneNumber,setPhoneNumer] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const [idError, setIdError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwConfirmError, setPwConfirmError] = useState('');
  const [phoneNumberError,setPhoneNumberError] = useState('');
  const [emailError, setEmailError]=useState('');

  const pwRexing = (e) => {
    const value = e.target.value;
    setPw(value);
  
    if (value.length === 0) {
      setPwError('');
    } else if (value.length < 8 || value.length > 15) {
      setPwError('비밀번호는 8자 이상, 15자 이하이어야 합니다.');
    } else if (!pwRex.test(value)) {
      setPwError('영문, 숫자, 특수문자 조합 8~15자 이내로 입력해주세요.');
    } else {
      setPwError('');
    }
  }

  const pwDoubleCheck = (e)=>{
    const value = e.target.value;
    setPwConfirm(value);

    if(value.length>0&&pw!=value){
      setPwConfirmError('두 비밀번호가 일치하지 않습니다.')
    }
    else{
      setPwConfirmError('');
    }
  }

  const emailRexing = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.length === 0) {
        setEmailError('');
    } else if (!emailRex.test(value)) {
        setEmailError('유효한 이메일 주소를 입력해주세요.');
    } else {
        setEmailError('');
    }
}

const phoneNumberRexing = (e) => {
  const value = e.target.value;
  setPhoneNumer(value);

  if (value.length === 0) {
      setPhoneNumberError('');
  } else if (!phoneNumberRex.test(value)) {
      setPhoneNumberError('유효한 휴대폰 번호를 입력해주세요.');
  } else {
      setPhoneNumberError('');
  }
}

const idValidCheck = (e)=>{

}

  return (
    <div>
        <LoginHeader page="회원가입"/>
        <div className='innerContainer'>
          <div className='item'>
            <p className='itemText'>아이디</p>
            <div className='temp'>
              <LoginInput className="shortForVerify" type="text" placeholder="사용할 아이디를 입력해주세요"
              value={id} onChange={idValidCheck}/>
              <LoginBtn className="verifyBtn" buttonText="ID 중복체크"/>
            </div>
          </div>
          <div className='item'>
           <SignUpItem type="password" className='normal' item="비밀번호" placeholder="영문, 숫자, 특수문자 조합 8~15자 이내"
           value={pw} onChange={pwRexing}/>
           <SignUpText text ={pwError}/>
          </div>
          <div className='item'>
           <SignUpItem type="password" className='normal'item="비밀번호 재확인" placeholder="비밀번호 재입력"
           value={pwConfirm} onChange={pwDoubleCheck}/>
           <SignUpText text ={pwConfirmError}/>
          </div>
          <div className='item'>
            <SignUpItem type="text" className='normal' item="이메일" placeholder="example@naver.com"
            value={email} onChange={emailRexing}/>
            <SignUpText text ={emailError}/>
          </div>
          <div className='item'>
           <SignUpItem type="text" className='normal' item="본인의 이름" placeholder="사용할 닉네임을 입력하세요"/>
          </div>
          <div className='item'>
            <SignUpItem type="text" 
            className='normal'item="휴대폰 번호 인증" placeholder="전화 번호를 입력하세요('-' 제외)"
            value={phoneNumber} onChange={phoneNumberRexing}/>
            <SignUpText text ={phoneNumberError}/>
          </div>
          <LoginBtn className="blueBtn"buttonText="인증 번호 받기"/>
          <div className='item'>
          {/* 인증번호 입력 input 태그와 인증 완료 btn은 인증번호 받기 API 요청 이후에 
            동적으로 생성되서 보이는 것으로 로직 수정 필요 - scss */}
           <SignUpItem item="인증번호" className='normal' placeholder="인증번호를 입력해주세요."/>
          </div>
          <LoginBtn className="purpleBtn "buttonText="인증 및 가입하기"/>
         </div>
    </div>
  )
}

export default SignUp