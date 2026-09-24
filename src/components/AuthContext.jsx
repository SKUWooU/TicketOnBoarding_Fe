import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosBackend from "../AxiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loginInfo, setLoginInfo] = useState({
    code: null,
    nickName: "",
    valid: false,
  });

  useEffect(() => {
    axiosBackend
      .get("/auth/valid", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.data.valid) {
          setIsLoggedIn(true);
          setLoginInfo(response.data);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  const resetLoginInfo = () => {
    //LoginInfo를 초기화하는 로직 추가
    setIsLoggedIn(false);
    setLoginInfo({
      code: null,
      nickName: "",
      valid: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        loginInfo,
        setLoginInfo,
        resetLoginInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
