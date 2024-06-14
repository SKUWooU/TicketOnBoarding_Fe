import React, { useState, useContext } from "react";
import style from "../styles/ConcertComment.module.scss";
import { LuUser2 } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuPencil } from "react-icons/lu";
import AuthContext from "./AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CommentRewrite from "./CommentRewrite";

function Comment({ reviewList, concertID }) {
  const navigate = useNavigate();
  const { isLoggedIn, loginInfo } = useContext(AuthContext);

  const [editCommentId, setEditCommentId] = useState(null);

  function commentDelete(reviewId, author) {
    axios
      .post(
        `http://localhost:8080/main/detail/${concertID}/delete/review`,
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
    <div className={style.commentList}>
      {reviewList.map((comment, index) => (
        <div key={index} className={style.commentContainer}>
          {editCommentId === comment.id ? (
            <CommentRewrite
              concertId={concertID}
              comment={comment}
              setEditCommentId={setEditCommentId}
            />
          ) : (
            <>
              <div className={style.commentHeader}>
                <LuUser2 size={26} color="#6E30BF" />
                <p className={style.id}>{comment.nickName}</p>
                <p className={style.date}>
                  {new Date(comment.date).toLocaleDateString()}
                </p>
              </div>
              <p className={style.content}>{comment.content}</p>
              <div className={style.bottomContainer}>
                <div className={style.rating}>
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <FaStar
                      key={starValue}
                      size={20}
                      color={
                        starValue <= comment.starCount ? "skyblue" : "gray"
                      }
                    />
                  ))}
                  <p className={style.point}>{comment.starCount}</p>
                </div>
                {isLoggedIn && comment.nickName === loginInfo.nickName ? (
                  <div className={style.logginedMenu}>
                    <LuPencil
                      size={20}
                      className={style.menu}
                      onClick={() => handleEdit(comment.id)}
                    />
                    <FaRegTrashCan
                      size={20}
                      className={style.menu}
                      onClick={() => commentDelete(comment.id, comment.author)}
                    />
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default Comment;
