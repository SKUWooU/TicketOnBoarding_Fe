import { useContext, useState } from "react";
import style from "../styles/ConcertComment.module.scss";
import { LuUser2 } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import axios from "axios";

function CommentWrite({ concertId }) {
  const navigate = useNavigate();
  const { isLoggedIn, loginInfo } = useContext(AuthContext);

  const [inputValue, setInputValue] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isWritten, setIsWritten] = useState(false);

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
    axios
      .post(
        `http://localhost:8080/main/detail/${concertId}/register/review`,
        {
          content: inputValue,
          starCount: rating,
        },
        { withCredentials: true },
      )
      .then((response) => {
        console.log(response.data);
        alert("댓글이 등록되었습니다.");
        navigate(0);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
        console.log(concertId);
      });
  }

  function gotoLogin() {
    navigate("/login");
  }

  return (
    <div className={style.commentContainer}>
      <div className={style.commentHeader}>
        <LuUser2 size={26} color="#6E30BF" />
        {isLoggedIn ? (
          <p className={style.id}>{loginInfo.nickName}</p>
        ) : (
          <p className={style.id}>로그인이 필요합니다.</p>
        )}
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
            등록하기
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

export default CommentWrite;
