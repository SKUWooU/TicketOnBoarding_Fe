import "./styles/App.css";

import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";

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

// 소셜 사이드
import NaverCallBack from "./pages/NaverCallBack";
import GoogleCallBack from "./pages/GoogleCallBack";

// 메인사이드
import ConcertDetail from "./pages/ConcertDetail";
import MainGenre from "./pages/MainGenre";
import MainLocation from "./pages/MainLocation";
import SearchResult from "./pages/SearchResult";

import Mypage from "./pages/Mypage";

// 예매 관련
import ConcertReservation from "./pages/ConcertReservation";
import ReservSuccess from "./pages/ReservSuccess";
import ReservFail from "./pages/ReservFail";

//DatePicker 관련
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Payment from "./pages/Payment";
import ReservedList from "./pages/ReservedList";
import AdminPage from "./pages/AdminPage";
import AdminPagePick from "./pages/AdminPagePick";
import AdminPageUsers from "./pages/AdminPageUsers";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* navBar를 통해 이동 : 정적 라우팅 */}
          <Route path="/" element={<Main />} />

          <Route path="/search" element={<SearchResult />} />

          {/* 동적 라우팅 설정 : 각 공연에 맞는 상세 페이지  */}
          <Route path="/concertDetail/:concertID" element={<ConcertDetail />} />
          <Route
            path="/concertReservation/:concertID"
            element={<ConcertReservation />}
          />
          <Route path="/genre/:genre" element={<MainGenre />} />
          <Route path="/search" element={<SearchResult />} />
          {/*결제 관련 페이지*/}
          <Route path="/payment" element={<Payment />} />
          <Route path="/reservSuccess" element={<ReservSuccess />} />
          <Route path="/reservFail" element={<ReservFail />} />

          {/* 동적 라우팅 : 지역별 / 장르별에 맞는 버튼 클릭시 분기  */}
          <Route path="/genre/:genre" element={<MainGenre />} />
          <Route path="/region/:region" element={<MainLocation />} />

          {/* 로그인 관련 사이드  */}
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/signed" element={<Signed />} />

          {/* 소셜 관련 */}
          <Route path="/auth/naver" element={<NaverCallBack />} />
          <Route path="/auth/google" element={<GoogleCallBack />} />

          {/* 계정 정보 찾기 */}
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/forgotPw" element={<ForgotPw />} />
          <Route path="/idFound" element={<IdFound />} />
          <Route path="/pwReset" element={<PwReset />} />
          <Route path="/afterPwReset" element={<AfterPwReset />} />

          {/* 마이페이지 관련 */}
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/reservedList" element={<ReservedList />} />

          {/* 관리자 페이지 관련*/}
          <Route path="/adminPage" element={<AdminPage />} />
          <Route path="/adminPage/pick" element={<AdminPagePick />} />
          <Route path="/adminPage/users" element={<AdminPageUsers />} />
        </Routes>
        <LocalizationProvider dateAdapter={AdapterDayjs} />
      </div>
    </AuthProvider>
  );
}

export default App;
