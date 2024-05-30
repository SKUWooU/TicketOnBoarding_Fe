import style from "../styles/LoginBtn.module.scss";

function LoginBtn({ className, buttonText, onClick }) {
  return (
    <button className={style[className]} onClick={onClick}>
      {buttonText}
    </button>
  );
}

export default LoginBtn;
