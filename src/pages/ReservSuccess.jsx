import LoginHeader from "../components/LoginHeader";
import LogoFont from "../assets/logoFont.svg";
import LoginBtn from "../components/LoginBtn";

import style from "../styles/IdResult.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import confetti from "canvas-confetti";

const CONFETTI_COUNT = 200;
const CONFETTI_DEFAULTS = { origin: { y: 0.7 } };

function fireConfetti(particleRatio, options) {
  confetti({
    ...CONFETTI_DEFAULTS,
    ...options,
    particleCount: Math.floor(CONFETTI_COUNT * particleRatio),
  });
}

function ReservSuccess() {
  const location = useLocation();
  // 회원가입 페이지에서 state를 가져오기 위한 변수 선언
  const { name, amount } = location.state ?? {};

  const navigate = useNavigate();

  function gotoMain() {
    navigate("/");
  }

  useEffect(() => {
    fireConfetti(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fireConfetti(0.2, { spread: 60 });
    fireConfetti(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fireConfetti(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fireConfetti(0.1, { spread: 120, startVelocity: 45 });
  }, []);
  return (
    <div>
      <LoginHeader page="예약 완료" />
      <div className={style.innerContainer}>
        <img src={LogoFont} alt="로고 폰트" />
        <p className={style.emphasize}>
          검증된 결제 결과로 예약이 확정되었습니다.
        </p>
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
