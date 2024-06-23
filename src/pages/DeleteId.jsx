import LoginHeader from "../components/LoginHeader";
import LogoFont from "../assets/logoFont.svg";

import style from "../styles/IdResult.module.scss";
import { useNavigate } from "react-router-dom";

import AuthContext from "../components/AuthContext";

import axiosBackend from "../AxiosConfig";
import { useContext } from "react";

function DeleteId() {
  const navigate = useNavigate();
  const { loginInfo } = useContext(AuthContext);
  const goBack = () => {
    navigate("/mypage");
  };

  function deleteId() {
    const confirmDelete = window.confirm(
      `${loginInfo.nickName}님의 계정을 정말로 삭제하시겠습니까?\n삭제 처리 이후에는 계정 정보가 복구되지 않습니다.`,
    );
    if (confirmDelete) {
      axiosBackend
        .post("/users/deleteid", {}, { withCredentials: true })
        .then(() => {
          alert("회원 탈퇴가 완료되었습니다.");
          navigate("/"); // 메인 페이지로 이동
        })
        .catch((err) => {
          alert("Axios 통신에 실패하였습니다.\n" + err);
        });
    }
  }

  return (
    <div>
      <LoginHeader page="회원 탈퇴" />
      <div className={style.innerContainer}>
        <img src={LogoFont} alt="로고 폰트" />
        <p className={style.notice}>
          정말로 탈퇴하시겠어요? <br />
          회원 탈퇴 시 계정은 삭제되며, 복구되지 않습니다.
        </p>
        <div className={style.innerMenu}>
          <div className={style.buttonArea}>
            <button className={style.backButton} onClick={goBack}>
              뒤로가기
            </button>
            <button className={style.deleteButton} onClick={deleteId}>
              탈퇴하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteId;
