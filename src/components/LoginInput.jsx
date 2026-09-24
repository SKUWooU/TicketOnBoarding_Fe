import style from "../styles/LoginInput.module.scss";
import PropTypes from "prop-types";

function LoginInput({
  type,
  className,
  placeholder,
  value,
  onChange,
  onKeyDown,
}) {
  return (
    <input
      className={style[className]}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
    // module.scss 적용시, style.className 이 디폴트지만, 동적으로 className을 정하는 경우 style[className]
  );
}

LoginInput.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
};

export default LoginInput;
