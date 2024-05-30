import { useState } from "react";
import style from "../styles/ConcertComment.module.scss";
import { LuUser2 } from "react-icons/lu";
import { FaStar } from "react-icons/fa";

function ConcertComment({ commentText, isInput }) {
  const [inputValue, setInputValue] = useState(commentText || "");
  const [rating, setRating] = useState(4.5); // 기본 평점 4.5로 설정
  const [hoverRating, setHoverRating] = useState(0);

  const handleInputChange = (event) => {
    const value = event.target.value;
    const lines = value.split("\n");
    const maxLines = 3;
    const maxLength = 110;

    if (lines.length <= maxLines && value.length <= maxLength) {
      setInputValue(value);
    } else {
      const truncatedLines = lines.slice(0, maxLines);
      const truncatedValue = truncatedLines.join("\n").slice(0, maxLength);
      setInputValue(truncatedValue);
    }
  };

  const handleMouseOver = (ratingValue) => {
    setHoverRating(ratingValue);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (ratingValue) => {
    setRating(ratingValue);
  };

  return (
    <div className={style.commentContainer}>
      <div className={style.commentHeader}>
        <LuUser2 size={26} color="#6E30BF" />
        <p className={style.id}>exampleUser</p>
        <p className={style.date}>2024.01.03</p>
      </div>
      <div>
        {isInput ? (
          <textarea
            className={style.textarea}
            value={inputValue}
            onChange={handleInputChange}
            rows={3}
            cols={50}
            maxLength={200}
            placeholder="댓글을 입력하세요"
          />
        ) : (
          <p className={style.comment}>{inputValue}</p>
        )}
      </div>
      <div className={style.rating}>
        {isInput ? (
          [1, 2, 3, 4, 5].map((starValue) => (
            <FaStar
              key={starValue}
              size={26}
              color={starValue <= (hoverRating || rating) ? "yellow" : "gray"}
              onMouseOver={() => handleMouseOver(starValue)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(starValue)}
            />
          ))
        ) : (
          <>
            <FaStar size={26} color="yellow" />{" "}
            <p className={style.point}>4.5</p>
          </>
        )}
      </div>
    </div>
  );
}

ConcertComment.defaultProps = {
  commentText: "",
};

export default ConcertComment;
