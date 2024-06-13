import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loginInfo, setLoginInfo] = useState({
    data: {
      code: null,
      nickName: "",
      valid: false,
    },
  });

  useEffect(() => {
    axios
      .get("http://localhost:8080/auth/valid", { withCredentials: true })
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

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, loginInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
