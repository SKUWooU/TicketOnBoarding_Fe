import React, { useState, useContext } from "react";
import style from "../styles/ConcertComment.module.scss";
import { LuUser2 } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuPencil } from "react-icons/lu";
import AuthContext from "./AuthContext";
import axiosBackend from "../AxiosConfig";
import { useNavigate } from "react-router-dom";
import CommentRewrite from "./CommentRewrite";

function Comment({
  id,
  nickName,
  date,
  content,
  starCount,
  author,
  concertID,
}) {
  const navigate = useNavigate();
  const { isLoggedIn, loginInfo } = useContext(AuthContext);

  const [editCommentId, setEditCommentId] = useState(null);

  function commentDelete(reviewId, author) {
    axiosBackend
      .post(
        `/main/detail/${concertID}/delete/review`,
        {
          reviewId: reviewId,
          author: author,
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

  function handleEdit(commentId) {
    setEditCommentId(commentId);
  }

  return (
    <div className={style.commentContainer}>
      {editCommentId === id ? (
        <CommentRewrite
          concertId={concertID}
          comment={{ id, nickName, date, content, starCount, author }}
          setEditCommentId={setEditCommentId}
        />
      ) : (
        <>
          <div className={style.commentHeader}>
            <LuUser2 size={26} color="#6E30BF" />
            <p className={style.id}>{nickName}</p>
            <p className={style.date}>{new Date(date).toLocaleDateString()}</p>
          </div>
          <p className={style.content}>{content}</p>
          <div className={style.bottomContainer}>
            <div className={style.rating}>
              {[1, 2, 3, 4, 5].map((starValue) => (
                <FaStar
                  key={starValue}
                  size={20}
                  color={starValue <= starCount ? "#fff200" : "gray"}
                />
              ))}
              <p className={style.point}>{starCount}점</p>
            </div>
            {isLoggedIn && nickName === loginInfo.nickName ? (
              <div className={style.logginedMenu}>
                <div title="수정하기">
                  <LuPencil
                    size={20}
                    className={style.menu}
                    onClick={() => handleEdit(id)}
                  />
                </div>
                <div title="삭제하기">
                  <FaRegTrashCan
                    size={20}
                    className={style.menu}
                    onClick={() => commentDelete(id, author)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

export default Comment;
