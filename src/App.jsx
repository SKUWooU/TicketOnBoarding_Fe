import "./styles/App.css";

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";

const Main = lazy(() => import("./pages/Main"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Forgot = lazy(() => import("./pages/Forgot"));
const ForgotPw = lazy(() => import("./pages/ForgotPw"));
const IdFound = lazy(() => import("./pages/IdFound"));
const Signed = lazy(() => import("./pages/Signed"));
const PwReset = lazy(() => import("./pages/PwReset"));
const AfterPwReset = lazy(() => import("./pages/AfterPwReset"));
const AfterPwResetValid = lazy(() => import("./pages/AfterPwResetValid"));
const NaverCallBack = lazy(() => import("./pages/NaverCallBack"));
const GoogleCallBack = lazy(() => import("./pages/GoogleCallBack"));
const ConcertDetail = lazy(() => import("./pages/ConcertDetail"));
const MainGenre = lazy(() => import("./pages/MainGenre"));
const MainLocation = lazy(() => import("./pages/MainLocation"));
const SearchResult = lazy(() => import("./pages/SearchResult"));
const Mypage = lazy(() => import("./pages/Mypage"));
const ConcertReservation = lazy(() => import("./pages/ConcertReservation"));
const ReservSuccess = lazy(() => import("./pages/ReservSuccess"));
const ReservFail = lazy(() => import("./pages/ReservFail"));
const Payment = lazy(() => import("./pages/Payment"));
const ReservedList = lazy(() => import("./pages/ReservedList"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminPagePick = lazy(() => import("./pages/AdminPagePick"));
const AdminPageUsers = lazy(() => import("./pages/AdminPageUsers"));
const AdminPageClaim = lazy(() => import("./pages/AdminPageClaim"));
const AdminPageAllTickets = lazy(() => import("./pages/AdminPageAllTickets"));
const DeleteId = lazy(() => import("./pages/DeleteId"));
const PwResetValid = lazy(() => import("./pages/PwResetValid"));
const WatingRefund = lazy(() => import("./pages/WatingRefund"));
const TicketRefunded = lazy(() => import("./pages/TicketRefunded"));

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Suspense fallback={<p role="status">화면을 불러오는 중입니다.</p>}>
          <Routes>
            {/* navBar를 통해 이동 : 정적 라우팅 */}
            <Route path="/" element={<Main />} />

            <Route path="/search" element={<SearchResult />} />

            {/* 동적 라우팅 설정 : 각 공연에 맞는 상세 페이지  */}
            <Route
              path="/concertDetail/:concertID"
              element={<ConcertDetail />}
            />
            <Route
              path="/concertReservation/:concertID"
              element={<ConcertReservation />}
            />
            <Route path="/genre/:genre" element={<MainGenre />} />
            <Route path="/search" element={<SearchResult />} />
            {/*결제 관련 페이지*/}
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/kakao" element={<Payment />} />
            <Route path="/payment/inosis" element={<Payment />} />
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
            <Route path="/mypage/reservedList" element={<ReservedList />} />
            <Route path="/mypage/watingRefund" element={<WatingRefund />} />
            <Route path="/mypage/ticketRefunded" element={<TicketRefunded />} />
            <Route path="/mypage/pwReset" element={<PwResetValid />} />
            <Route
              path="/mypage/pwAfterReset"
              element={<AfterPwResetValid />}
            />
            <Route path="/mypage/deleteId" element={<DeleteId />} />

            {/* 관리자 페이지 관련*/}
            <Route path="/adminPage" element={<AdminPage />} />
            <Route path="/adminPage/pick" element={<AdminPagePick />} />
            <Route path="/adminPage/users" element={<AdminPageUsers />} />
            <Route path="/adminPage/claims" element={<AdminPageClaim />} />
            <Route
              path="/adminPage/allTickets"
              element={<AdminPageAllTickets />}
            />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;
