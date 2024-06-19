import { useContext, useState } from "react";
import style from "../styles/ConcertComment.module.scss";
import { LuUser2 } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import axios from "axios";

function CommentRewrite({ concertId, comment, setEditCommentId }) {
  const navigate = useNavigate();
  const { isLoggedIn, loginInfo } = useContext(AuthContext);

  const [inputValue, setInputValue] = useState(comment ? comment.content : "");
  const [rating, setRating] = useState(comment ? comment.starCount : 0);
  const [hoverRating, setHoverRating] = useState(
    comment ? comment.starCount : 0,
  );
  const [isWritten, setIsWritten] = useState(!!comment);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    setIsWritten(value.length > 0);
  };

  const handleMouseOver = (ratingValue) => {
    setHoverRating(ratingValue);
  };

  const handleMouseLeave = () => {
    setHoverRating(rating);
  };

  const handleClick = (ratingValue) => {
    setRating(ratingValue);
  };

  function submit() {
    console.log(
      `Submitting to URL: http://localhost:8080/main/detail/${concertId}/rewrite/review`,
    );
    axios
      .post(
        `http://localhost:8080/main/detail/${concertId}/rewrite/review`,
        {
          reviewId: comment.id,
          author: comment.author,
          content: inputValue,
          starCount: rating,
        },
        { withCredentials: true },
      )
      .then((response) => {
        console.log(response.data);
        alert("댓글이 수정되었습니다.");
        setEditCommentId(null); // 수정 모드 종료
        navigate(0); // 페이지 새로고침
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
        console.log(`Error: ${err}`);
        console.log(`concertId: ${concertId}`);
      });
  }

  function gotoLogin() {
    navigate("/login");
  }

  function quit() {
    setEditCommentId(null); // 수정 모드 종료
  }

  return (
    <div className={style.commentContainer}>
      <div className={style.commentHeader}>
        <div className={style.userInfo}>
          <LuUser2 size={26} color="#6E30BF" />
          {isLoggedIn ? (
            <p className={style.id}>{loginInfo.nickName}</p>
          ) : (
            <p className={style.id}>로그인이 필요합니다.</p>
          )}
        </div>
        <FaXmark size={15} className={style.closeIcon} onClick={quit} />
      </div>
      {isLoggedIn ? (
        <textarea
          className={style.textarea}
          value={inputValue}
          onChange={handleInputChange}
          rows={3}
          cols={50}
          maxLength={200}
          placeholder="댓글과 평점을 입력하세요"
        />
      ) : (
        <textarea
          className={style.textarea}
          value={inputValue}
          onChange={handleInputChange}
          rows={3}
          cols={50}
          maxLength={200}
          placeholder="댓글과 평점을 입력하세요"
          readOnly
        />
      )}

      <div className={style.bottomContainer}>
        <div className={style.rating}>
          {[1, 2, 3, 4, 5].map((starValue) => (
            <FaStar
              key={starValue}
              size={20}
              color={starValue <= (hoverRating || rating) ? "#fff200" : "gray"}
              onMouseOver={isLoggedIn ? () => handleMouseOver(starValue) : null}
              onMouseLeave={isLoggedIn ? handleMouseLeave : null}
              onClick={isLoggedIn ? () => handleClick(starValue) : null}
            />
          ))}
          <p className={style.point}>{hoverRating}점</p>
        </div>
        {isLoggedIn ? (
          <button
            className={style.submitBtn}
            onClick={submit}
            disabled={!isWritten}
          >
            수정하기
          </button>
        ) : (
          <button className={style.submitBtn} onClick={gotoLogin}>
            로그인
          </button>
        )}
      </div>
    </div>
  );
}

export default CommentRewrite;
