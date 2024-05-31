import "./styles/App.css";

import { Route, Routes } from "react-router-dom";

// 로그인 사이드
import Main from "./pages/Main";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Forgot from "./pages/Forgot";
import ForgotPw from "./pages/ForgotPw";
import IdFound from "./pages/IdFound";
import Signed from "./pages/Signed";
import PwReset from "./pages/PwReset";
import AfterPwReset from "./pages/AfterPwReset";

// 메인사이드
import ConcertDetail from "./pages/ConcertDetail";
import MainGenre from "./pages/MainGenre";
import MainLocation from "./pages/MainLocation";
import SearchResult from "./pages/SearchResult";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* navBar를 통해 이동 : 정적 라우팅 */}
        <Route path="/" element={<Main />} />

        {/* 동적 라우팅 설정 : 각 공연에 맞는 상세 페이지  */}
        <Route path="/concertDetail/:concertID" element={<ConcertDetail />} />

        {/* 동적 라우팅 : 지역별 / 장르별에 맞는 버튼 클릭시 분기  */}
        <Route path="/genre/:genre" element={<MainGenre />} />
        <Route path="/region/:region" element={<MainLocation />} />

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

        <Route path="/search" element={<SearchResult />} />
      </Routes>
    </div>
  );
}

export default App;
