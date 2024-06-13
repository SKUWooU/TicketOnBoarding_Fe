import LoginHeader from "../components/LoginHeader";
import LogoFont from "../assets/logoFont.svg";
import LoginBtn from "../components/LoginBtn";

import style from "../styles/IdResult.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

import confetti from "canvas-confetti";
function ReservSuccess() {
  const location = useLocation();
  // 회원가입 페이지에서 state를 가져오기 위한 변수 선언
  const { name, amount } = location.state;

  const navigate = useNavigate();

  function gotoMain() {
    navigate("/");
  }

  // Confetti 효과 부여를 위한 변수 및 함수 선언
  var count = 200;
  var defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
  return (
    <div>
      <LoginHeader page="결제 완료" />
      <div className={style.innerContainer}>
        <img src={LogoFont} alt="로고 폰트" />
        <p className={style.emphasize}>결제가 완료되었습니다. </p>
        <p className={style.notice}>공연명 : {name}</p>
        <p className={style.notice}>결제 금액 : {amount}</p>
        <p className={style.notice}>
          티켓 온보딩만의 편리한 예매를 이용해보세요
        </p>

        <LoginBtn
          className="purpleBtn"
          buttonText="메인 페이지로 이동"
          onClick={gotoMain}
        />
      </div>
    </div>
  );
}

export default ReservSuccess;
