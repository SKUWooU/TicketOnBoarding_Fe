import React from 'react'
import "../styles/signUpText.scss"

function SignUpText({text}) {
  return (
    <p className={text?'text visible' : 'text hidden'}>{text}</p>
    // 조건으로 판별 : text가 존재할 경우 true : text visble / false : text hidden
    // 그 이후 scss 에서 스타일을 .text .visible 로 각각 부여할 수 있다. 
  )
}

export default SignUpText