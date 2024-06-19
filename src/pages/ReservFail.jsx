import LoginHeader from "../components/LoginHeader";
import LoginBtn from "../components/LoginBtn";

import style from "../styles/IdResult.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

import { CiWarning } from "react-icons/ci";

function ReservFail() {
  const location = useLocation();

  const { name, amount, concertID } = location.state;

  const navigate = useNavigate();

  function goBack() {
    navigate(`/concertReservation/${concertID}`);
  }

  return (
    <div>
      <LoginHeader page="결제 취소" />
      <div className={style.innerContainer}>
        <CiWarning size={200} />
        <p className={style.emphasize}>결제가 정상 처리 되지 않았습니다.</p>
        <p className={style.notice}>
          결제를 다시 진행해주세요.
          <br />
          <span>
            <span className={style.noWrapText} title={name}>
              공연명 : {name}
            </span>
          </span>
          <br />
          결제 금액: {amount} 원
        </p>

        <LoginBtn
          className="blueBtn"
          buttonText="결제 페이지로 돌아가기 "
          onClick={goBack}
        />
      </div>
    </div>
  );
}

export default ReservFail;
