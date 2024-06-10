import style from "../styles/LoginInput.module.scss";

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

export default LoginInput;
