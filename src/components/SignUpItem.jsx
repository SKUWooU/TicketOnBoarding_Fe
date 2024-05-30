import React from "react";
import LoginInput from "./LoginInput";

import style from "../styles/SignUpItem.module.scss";

function SignUpItem({ item, type, placeholder, value, onChange, className }) {
  return (
    <div className={style.itemContainer}>
      <p className={style.itemName}>{item}</p>
      <LoginInput
        className={className}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default SignUpItem;
