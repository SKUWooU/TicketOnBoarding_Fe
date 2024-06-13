import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NaverCallBack = () => {
  const navigate = useNavigate(); // 최상위 레벨에서 useNavigate 호출

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code) {
      axios
        .post(
          "http://localhost:8080/auth/naver",
          {
            code,
            state,
          },
          { withCredentials: true },
        )
        .then((response) => {
          console.log("Login success:", response.data);
          navigate("/");
        })
        .catch((error) => {
          console.error("Login error:", error);
          // 네이버 누르면 네이버창으로 리다이렉팅 -> 로그인 성공 시 내 콜백 URL로 리다이렉팅해서 정보 전달
        });
    }
  }, [navigate]); // useEffect 훅의 의존성 배열에 navigate 추가

  return <div>네이버 로그인 중...</div>;
};

export default NaverCallBack;
