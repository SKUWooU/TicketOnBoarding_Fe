import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import LoginHeader from "../components/LoginHeader";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // 카카오페이 기준 : 노출되는 정보는 공연명과 가격
  // 예매 사이트에서 넘겨받은 데이터
  const { name, amount, reservationData, concertID } = location.state;

  const paymentKey = import.meta.env.VITE_REACT_APP_PAYMENT_KEY;

  const requestPay = () => {
    window.IMP.request_pay(
      {
        pg: "html5_inicis.INIpayTest",
        pay_method: "card",
        merchant_uid: `mid_${new Date().getTime()}`,
        name: name,
        amount: 100,
        buyer_email: "gildong@gmail.com",
        buyer_name: "홍길동",
        buyer_tel: "010-4242-4242",
        buyer_addr: "서울특별시 강남구 신사동",
        buyer_postcode: "01181",
      },
      (rsp) => {
        if (rsp.success) {
          // 결제 성공 시 로직
          axiosBackend
            .post(`/main/detail/${concertID}/reservation`, reservationData, {
              withCredentials: true, // 쿠키를 포함하기 위해 추가
            })
            .then((response) => {
              console.log("Reservation successful:", response.data);
              navigate("/reservSuccess", {
                state: {
                  name: name,
                  amount: amount,
                },
              });
            })
            .catch((error) => {
              console.error("Reservation failed:", error);
            });
        } else {
          // 결제 실패 시 로직
          console.log("Payment failed", rsp.error_msg);
          navigate("/reservFail", {
            state: {
              concertID: concertID,
              name: name,
              amount: amount,
            },
          });
        }
      },
    );
  };

  useEffect(() => {
    // 외부 스크립트 로드 함수
    const loadScript = (src, callback) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      script.onload = callback;
      document.head.appendChild(script);
    };

    // 스크립트 로드 후 실행
    loadScript("https://cdn.iamport.kr/v1/iamport.js", () => {
      const IMP = window.IMP;
      // 가맹점 식별코드
      IMP.init(paymentKey);
      requestPay();
    });

    // 컴포넌트가 언마운트될 때 스크립트를 제거하기 위한 정리 함수
    return () => {
      const scripts = document.querySelectorAll('script[src^="https://"]');
      scripts.forEach((script) => script.remove());
    };
  }, []);

  return (
    <div>
      <LoginHeader page="결제 페이지" />
    </div>
  );
}

export default Payment;
