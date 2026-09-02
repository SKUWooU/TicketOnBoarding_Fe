import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginHeader from "../components/LoginHeader";
import LoginBtn from "../components/LoginBtn";
import style from "../styles/IdResult.module.scss";
import {
  confirmVerifiedReservation,
  prepareCheckout,
} from "../api/checkoutApi";
import {
  clearCheckoutSession,
  loadCheckoutSession,
  saveCheckoutSession,
} from "../utils/checkoutSession";
import {
  PaymentProviderUnavailableError,
  requestPayment,
} from "../payment/paymentProvider";

const CHECKOUT_MESSAGE = {
  READY: "결제 준비가 완료되었습니다.",
  PAYMENT_VERIFYING:
    "결제 확인이 진행 중입니다. 결과가 확정될 때까지 다시 결제하지 마세요.",
  PAYMENT_VERIFICATION_UNKNOWN:
    "결제 결과를 확인할 수 없습니다. 다시 결제하지 말고 관리자에게 확인을 요청해 주세요.",
  PAYMENT_ATTEMPT_UNKNOWN:
    "결제 요청 결과를 확인할 수 없습니다. 다시 결제하지 말고 관리자에게 확인을 요청해 주세요.",
  RESERVATION_CONFIRMED: "예약이 이미 확정되었습니다.",
  EXPIRED: "좌석 임시 점유가 만료되었습니다. 좌석을 다시 선택해 주세요.",
};

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutSession] = useState(() => {
    const locationCheckout = location.state?.checkout?.merchantUid
      ? location.state
      : null;
    return locationCheckout ?? loadCheckoutSession();
  });
  const sessionSnapshot = useRef(checkoutSession);
  const initialCheckoutStatus = checkoutSession?.paymentAttemptStarted
    ? "PAYMENT_ATTEMPT_UNKNOWN"
    : checkoutSession?.checkout?.status ?? null;
  const [checkoutStatus, setCheckoutStatus] = useState(initialCheckoutStatus);
  const [message, setMessage] = useState(
    CHECKOUT_MESSAGE[initialCheckoutStatus] ??
      "진행 중인 Checkout 정보를 찾을 수 없습니다.",
  );
  const [paymentResult, setPaymentResult] = useState(
    checkoutSession?.paymentResult ?? null,
  );
  const [pending, setPending] = useState(false);
  const requestInFlight = useRef(false);

  const persistSession = (updates) => {
    sessionSnapshot.current = { ...sessionSnapshot.current, ...updates };
    saveCheckoutSession(sessionSnapshot.current);
  };

  const reconcileCheckout = async () => {
    try {
      const checkout = await prepareCheckout(
        checkoutSession.concertId,
        checkoutSession.reservationData,
        checkoutSession.checkoutKey,
      );
      setCheckoutStatus(checkout.status);
      persistSession({ checkout });
      setMessage(
        CHECKOUT_MESSAGE[checkout.status] ??
          "Checkout 상태를 확인할 수 없습니다.",
      );

      if (checkout.status === "RESERVATION_CONFIRMED") {
        clearCheckoutSession();
        navigate("/reservSuccess", {
          state: {
            name: checkoutSession.concertName,
            amount: checkout.amount,
          },
        });
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        navigate("/login");
      } else if (status === 410) {
        setCheckoutStatus("EXPIRED");
        setMessage(CHECKOUT_MESSAGE.EXPIRED);
        persistSession({
          checkout: { ...checkoutSession.checkout, status: "EXPIRED" },
        });
      } else {
        setMessage(
          "결제 결과를 확인하지 못했습니다. 다시 결제하지 말고 잠시 후 상태를 확인해 주세요.",
        );
      }
    }
  };

  const confirmPayment = async () => {
    if (
      requestInFlight.current ||
      !checkoutSession ||
      checkoutStatus !== "READY"
    ) {
      return;
    }

    requestInFlight.current = true;
    setPending(true);
    setMessage("결제 결과를 확인하고 있습니다.");

    let payment = paymentResult;

    try {
      if (!payment) {
        persistSession({ paymentAttemptStarted: true });
        payment = await requestPayment({
          merchantUid: checkoutSession.checkout.merchantUid,
          amount: checkoutSession.checkout.amount,
          name: checkoutSession.concertName,
          paymentMethod: checkoutSession.paymentMethod,
        });
        setPaymentResult(payment);
        persistSession({
          paymentAttemptStarted: false,
          paymentResult: payment,
        });
      }

      await confirmVerifiedReservation(
        checkoutSession.concertId,
        checkoutSession.checkout.merchantUid,
        checkoutSession.reservationData,
        payment.paymentId,
        checkoutSession.reservationKey,
      );

      clearCheckoutSession();
      navigate("/reservSuccess", {
        state: {
          name: checkoutSession.concertName,
          amount: checkoutSession.checkout.amount,
        },
      });
    } catch (error) {
      if (error instanceof PaymentProviderUnavailableError) {
        persistSession({ paymentAttemptStarted: false });
        setMessage(
          "실제 결제 연동은 비활성 상태입니다. 테스트에서는 결제 어댑터를 fixture로 대체합니다.",
        );
      } else if (!payment) {
        setCheckoutStatus("PAYMENT_ATTEMPT_UNKNOWN");
        setMessage(CHECKOUT_MESSAGE.PAYMENT_ATTEMPT_UNKNOWN);
      } else if ([409, 410, 422, 503].includes(error.response?.status)) {
        await reconcileCheckout();
      } else {
        await reconcileCheckout();
      }
    } finally {
      requestInFlight.current = false;
      setPending(false);
    }
  };

  const returnToSeats = () => {
    if (!checkoutSession) {
      navigate("/");
      return;
    }

    navigate(`/concertReservation/${checkoutSession.concertId}`);
  };

  if (!checkoutSession) {
    return (
      <div>
        <LoginHeader page="결제" />
        <div className={style.innerContainer}>
          <p className={style.emphasize}>{message}</p>
          <LoginBtn
            className="purpleBtn"
            buttonText="메인으로 이동"
            onClick={() => navigate("/")}
          />
        </div>
      </div>
    );
  }

  const canRequestPayment = checkoutStatus === "READY" && !pending;

  return (
    <div>
      <LoginHeader page="결제 확인" />
      <div className={style.innerContainer}>
        <p className={style.emphasize}>{checkoutSession.concertName}</p>
        <p className={style.notice}>
          서버 확인 금액: {checkoutSession.checkout.amount}원
        </p>
        <p className={style.notice}>
          Checkout: {checkoutSession.checkout.merchantUid}
        </p>
        <p className={style.notice}>
          좌석 점유 만료: {checkoutSession.checkout.expiresAt}
        </p>
        <p className={style.notice} role="status">
          {pending ? "처리 중입니다." : message}
        </p>
        <LoginBtn
          className="purpleBtn"
          buttonText="결제 후 예약 확정"
          onClick={confirmPayment}
          disabled={!canRequestPayment}
        />
        <LoginBtn
          className="blueBtn"
          buttonText="좌석 선택으로 돌아가기"
          onClick={returnToSeats}
          disabled={pending}
        />
      </div>
    </div>
  );
}

export default Payment;
