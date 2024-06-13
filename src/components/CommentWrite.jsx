import { useState } from "react";
import style from "../styles/ConcertComment.module.scss";
import { LuUser2 } from "react-icons/lu";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CommentWrite({ nickName, concertId }) {
  const navigate = useNavigate();

  const [inputValue, setInputValue] = useState("");
  // 댓글 내용을 위한 State 선언
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  // hoverRating : 사용자가 입력한 평점

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
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
          "content": inputValue,
          "starCount": Number.parseFloat(rating),
        },
        { withCredentials: true },
      )
      .then((response) => {
        console.log(response.data);
        navigate(0);
      })
      .catch((err) => {
        alert("Axios 통신에 실패하였습니다.\n" + err);
        console.log(concertId);
      });
  }

  return (
    <div className={style.commentContainer}>
      <div className={style.commentHeader}>
        <LuUser2 size={26} color="#6E30BF" />
        <p className={style.id}>exampleUser</p>
      </div>
      <textarea
        className={style.textarea}
        value={inputValue}
        onChange={handleInputChange}
        rows={3}
        cols={50}
        maxLength={200}
        placeholder="댓글과 평점을 입력하세요"
      />
      <div className={style.bottomContainer}>
        <div className={style.rating}>
          {[1, 2, 3, 4, 5].map((starValue) => (
            <FaStar
              key={starValue}
              size={20}
              color={starValue <= (hoverRating || rating) ? "skyblue" : "gray"}
              onMouseOver={() => handleMouseOver(starValue)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(starValue)}
            />
          ))}

          <p className={style.point}>{hoverRating}</p>
        </div>
        <button className={style.submitBtn} onClick={submit}>
          등록하기
        </button>
      </div>
    </div>
  );
}

CommentWrite.defaultProps = {
  commentText: "로그인이 필요합니다.",
};

export default CommentWrite;
