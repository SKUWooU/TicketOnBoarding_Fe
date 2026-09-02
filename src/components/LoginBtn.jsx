import style from "../styles/LoginBtn.module.scss";
import PropTypes from "prop-types";

function LoginBtn({ className, buttonText, onClick, disabled = false }) {
  return (
    <button className={style[className]} onClick={onClick} disabled={disabled}>
      {buttonText}
    </button>
  );
}

LoginBtn.propTypes = {
  className: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default LoginBtn;
