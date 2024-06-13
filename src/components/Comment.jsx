import style from "../styles/ConcertComment.module.scss";
import { LuUser2 } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuPencil } from "react-icons/lu";

import AuthContext from "./AuthContext";
import { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CommentWrite from "./CommentWrite";

function Comment({ reviewList, concertID }) {
  const navigate = useNavigate();
  const { isLoggedIn, loginInfo } = useContext(AuthContext);

  const [editComment, setEditComment] = useState(null);

  function commentDelete(reviewId, author) {
    axios
      .post(
        `http://localhost:8080/main/detail/${concertID}/delete/review`,
        {
          "reviewId": reviewId,
          "author": author,
        },
        { withCredentials: true },
      )
      .then((response) => {
        console.log(response.data);
        alert("댓글이 삭제되었습니다.");
        navigate(0);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
      });
  }

  //로그인 여부 판별
  return (
    <div className={style.commentList}>
      {reviewList.map((comment, index) => (
        // reviewList는 배열형태로 오는데 각각을 호출해서 변환
        <div key={index} className={style.commentContainer}>
          {/* 헤더 부분 : 유저 아이콘, 이름과 날짜 */}
          <div className={style.commentHeader}>
            <LuUser2 size={26} color="#6E30BF" />
            <p className={style.id}>{comment.nickName}</p>
            <p className={style.date}>
              {new Date(comment.date).toLocaleDateString()}
            </p>
          </div>
          {/* 작성된 텍스트 부분 */}
          <p className={style.content}>{comment.content}</p>
          {/* 평점 및 본인이 작성한 댓글이면 수정 및 삭제 아이콘 추가 */}
          <div className={style.bottomContainer}>
            <div className={style.rating}>
              {[1, 2, 3, 4, 5].map((starValue) => (
                <FaStar
                  key={starValue}
                  size={20}
                  color={starValue <= comment.starCount ? "skyblue" : "gray"}
                />
              ))}
              <p className={style.point}>{comment.starCount}</p>
            </div>
            {isLoggedIn && comment.nickName === loginInfo.nickName ? (
              // 내가 작성한 댓글일 경우에만 아이콘 출력
              <div className={style.logginedMenu}>
                <LuPencil size={20} className={style.menu} />
                <FaRegTrashCan
                  size={20}
                  className={style.menu}
                  onClick={() => commentDelete(comment.id, comment.author)}
                />
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Comment;
