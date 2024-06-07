import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  //카카오페이 기준 : 노출되는 정보는 공연명과 가격

  //예매 사이트에서 넘겨받은 데이터
  const { name, amount, reservationData } = location.state;

  const requestPay = () => {
    window.IMP.request_pay(
      {
        pg: "kakaopay.TC0ONETIME", //pg명
        pay_method: "card",
        merchant_uid: `mid_${new Date().getTime()}`,
        name: name,
        amount: amount,
        buyer_email: "gildong@gmail.com",
        buyer_name: "홍길동",
        buyer_tel: "010-4242-4242",
        buyer_addr: "서울특별시 강남구 신사동",
        buyer_postcode: "01181",
      },
      (rsp) => {
        if (rsp.success) {
          // 결제 성공 시 로직
          reservationData
            .forEach((info) => {
              axios
                .post(
                  `http://localhost:8080/main/detail/${info.concertID}/reservation`,
                  //info 객체가 정확히 post에서 요청받는 body의 형태와 동일하다면 그대로 넣음.
                  info,
                )
                .then((response) => {
                  console.log("Reservation successful:", response.data);
                });
            })
            .catch((error) => {
              console.error("Reservation failed:", error);
            });
          navigate("/reservSuccess", {
            state: {
              name: name,
              amount: amount,
            },
          });
        } else {
          // 결제 실패 시 로직
          console.log("Payment failed", rsp.error_msg);
          navigate("/payment-fail");
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
      IMP.init("imp72175255");
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
      <h1>결제 페이지</h1>
      <p>결제를 진행 중입니다...</p>
    </div>
  );
}

export default Payment;
