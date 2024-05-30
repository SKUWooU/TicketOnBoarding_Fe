import style from "../styles/signUpText.module.scss";

function SignUpText({ text }) {
  return (
    <p className={`${style.text} ${text ? style.visible : style.hidden}`}>
      {text}
    </p>
    // 조건으로 판별 : text가 존재할 경우 true : text visble / false : text hidden
    // 그 이후 scss 에서 스타일을 .text .visible 로 각각 부여할 수 있다.

    // 클래스 이름이 2개 이상 적용 시 `${값} ${값}` 과 같은 형태로 사용.
  );
}

export default SignUpText;
