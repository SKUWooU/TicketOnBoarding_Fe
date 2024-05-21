import "./styles/App.css";

import { Route, Routes } from "react-router-dom";

import Main from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Forgot from "./pages/Forgot";
import ForgotPw from "./pages/ForgotPw";
import IdFound from "./pages/IdFound";
import Signed from "./pages/Signed";
import PwReset from "./pages/PwReset";
import AfterPwReset from "./pages/AfterPwReset";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* 메인 -> 동적 라우팅 필요  */}
        <Route path="/" element={<Main />} />

        {/* 로그인 관련 사이드  */}
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/signed" element={<Signed />} /> 

        {/* 계정 정보 찾기 */}
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/forgotPw" element={<ForgotPw />} />
        <Route path="/idFound" element={<IdFound />} />
        <Route path="/pwReset" element={<PwReset />} />
        <Route path="/afterPwReset" element={<AfterPwReset />} />
        
        
      </Routes>
    </div>
  );
}

export default App;
