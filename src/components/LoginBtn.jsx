import React from 'react'
import "../styles/LoginBtn.scss"

function LoginBtn({className, buttonText}){
    return(
        <button className={className}>{buttonText}</button>
    );
}

export default LoginBtn;