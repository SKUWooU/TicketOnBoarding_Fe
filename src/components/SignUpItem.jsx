import React from 'react'
import LoginInput from './LoginInput'

import "../styles/SignUpItem.scss"

function SignUpItem({item, type, placeholder, value, onChange, className}) {
  return (
    <div className='itemContainer'>
        <p className='itemName'>{item}</p>
        <LoginInput className={className} type={type} placeholder={placeholder} value={value} onChange={onChange}/>
    </div>
  )
}

export default SignUpItem