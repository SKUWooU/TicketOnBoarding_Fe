import React from "react";
import PropTypes from "prop-types";
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

SignUpItem.propTypes = {
  item: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default SignUpItem;
