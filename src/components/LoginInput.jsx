import React from 'react'
import "../styles/LoginInput.scss"

function LoginInput({type, className, placeholder, value, onChange,}){
    return(
        <input className={className} type={type} placeholder={placeholder} value={value} onChange={onChange} />
    );
}

export default LoginInput