import React, { useEffect, useState } from "react";
import LoginHeader from "../components/LoginHeader";
import style from "../styles/AdminPage.module.scss";
import { useNavigate } from "react-router-dom";
import axiosBackend from "../AxiosConfig";
import Pagination from "../components/Pagination";
import { PiSwordDuotone } from "react-icons/pi"; // 아이콘 import
import { HiMiniXMark } from "react-icons/hi2";

function AdminPageUsers() {
  const navigate = useNavigate();

  const [userList, setUserList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  function goBack() {
    navigate("/mypage");
  }
  function allConcerts() {
    navigate("/adminPage");
  }
  function allUsers() {
    navigate("/adminPage/users");
  }
  function claims() {
    navigate("/adminPage/claims");
  }
  function gotoPick() {
    navigate("/adminPage/pick");
  }

  const allTickets = () => {
    navigate("/adminPage/allTickets");
  };

  useEffect(() => {
    axiosBackend
      .get("/admin/users", { withCredentials: true })
      .then((response) => {
        console.log(response);
        setUserList(response.data || []);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }, []);

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userList.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(userList.length / itemsPerPage);

  const parseCode = (code) => {
    switch (code) {
      case 1:
        return "자사 고객";
      case 2:
        return "소셜로그인";
      case 3:
        return "관리자";
      default:
        return "알 수 없음";
    }
  };

  function grant(username) {
    const confirmGrant = window.confirm(
      `${username} 계정에 관리자 권한을 부여하시겠습니까?`,
    );
    if (confirmGrant) {
      axiosBackend
        .post("/admin/users", { username: username }, { withCredentials: true })
        .then((response) => {
          alert("관리자 권한이 부여되었습니다.");
          alert(0);
        })
        .catch((err) => {
          alert("Axios 통신에 실패하였습니다.\n" + err);
        });
    } else {
      alert("권한 부여가 취소되었습니다.");
    }
  }

  function deleteUser(username) {
    const confirmDelete = window.confirm(
      `${username} 계정을 정말로 삭제하시겠습니까?\n삭제 처리 이후에는 복구되지 않습니다.`,
    );

    if (confirmDelete) {
      axiosBackend
        .post(`/admin/users/delete/${username}`, {}, { withCredentials: true })
        .then(() => {
          alert("계정이 삭제되었습니다.");
          navigate(0);
        })
        .catch((err) => {
          console.log(err);
          alert("Axios 통신에 실패하였습니다.\n" + err);
        });
    } else {
      alert("계정 삭제가 취소되었습니다.");
    }
  }

  return (
    <div className={style.mainContainer}>
      <LoginHeader
        page="관리자 페이지 - 고객 조회"
        className={style.noMarginBottom}
      />
      <div className={style.Category}>
        <p onClick={goBack}>돌아가기 </p>
        <p onClick={allConcerts}>공연 조회 </p>
        <p onClick={allUsers}>고객 조회</p>
        <p onClick={allTickets}>예매 조회</p>
        <p onClick={claims}>환불 처리</p>
        <p onClick={gotoPick}>Md's Pick</p>
      </div>
      <div>
        <h1 className={style.division}>
          총 {userList.length} 개의 계정 정보가 조회되었습니다.
        </h1>
        <h2 className={style.h2Explain}>
          {" "}
          <PiSwordDuotone className={style.grant} color="grey" /> 아이콘을
          클릭해 관리자 권한 부여 및 계정 삭제가 가능합니다.{" "}
        </h2>
      </div>

      <div className={style.mainInner}>
        <p className={style.extraExplain}>
          계정 가입 정보에 따라 특정 Column은 비어있을 수 있습니다. ( 소셜
          로그인 시 )
        </p>
        <p className={style.extraExplain}>
          관리자 권한 부여됨 : ({" "}
          <PiSwordDuotone className={style.grant} color="gold" /> )
        </p>
        <table className={style.outPutTable}>
          <thead>
            <tr>
              <th>순번</th>
              <th>계정 상태</th>
              <th>가입일</th>
              <th>이메일 주소</th>
              <th>구글 이메일</th>
              <th>네이버 아이디</th>
              <th>닉네임</th>
              <th>핸드폰 번호</th>
              <th>아이디</th>
              <th>권한부여</th>
              <th>계정삭제</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((user, index) => (
              <tr key={index}>
                <td>{index + 1}</td> {/* 순번 표시 */}
                <td>{parseCode(user.code)}</td>
                <td>{user.createdate}</td>
                <td>{user.email}</td>
                <td>{user.googleemail}</td>
                <td>{user.naverid}</td>
                <td>{user.nickname}</td>
                <td>{user.phonenumber}</td>
                <td>{user.username}</td>
                <td>
                  {user.code !== 3 ? ( // 자사 고객일 때만 아이콘 표시
                    <PiSwordDuotone
                      className={style.grant}
                      color="black"
                      onClick={() => grant(user.username)}
                    />
                  ) : (
                    <PiSwordDuotone className={style.grant} color="gold" />
                  )}
                </td>
                <td>
                  <HiMiniXMark
                    className={style.deleteIcon}
                    onClick={() => deleteUser(user.username)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          pageCount={pageCount}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default AdminPageUsers;
