import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import axios from "axios";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = import.meta.env
  .VITE_REACT_APP_GOOGLE_CLIENT_SERCRET;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_REACT_APP_GOOGLE_REDIRECT_URI;

const GoogleCallBack = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    console.log(code);
    if (code) {
      const fetchAccessToken = async () => {
        try {
          // 액세스 토큰을 가져오는 요청
          const tokenResponse = await axios.post(
            "https://oauth2.googleapis.com/token",
            {},
            {
              params: {
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
              },
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            },
          );

          const { access_token } = tokenResponse.data;
          // 사용자 정보를 가져오는 요청
          const userInfoResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            },
          );

          const userInfo = userInfoResponse.data;

          // 사용자 정보를 서버로 보내는 요청
          await axiosBackend.post(
            "/auth/google",
            {
              user: userInfo,
            },
            { withCredentials: true },
          );

          // 로그인 성공 후 처리
          console.log("Login success");
          navigate("/");
        } catch (error) {
          console.error("Login error:", error);
          navigate("/login");
        }
      };

      fetchAccessToken();
    }
  }, [location, navigate]);

  return <div>구글 로그인 중...</div>;
};

export default GoogleCallBack;
