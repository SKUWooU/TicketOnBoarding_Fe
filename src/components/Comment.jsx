import style from "../styles/ConcertComment.module.scss";
import { LuUser2 } from "react-icons/lu";
import { FaStar } from "react-icons/fa";

function Comment({ reviewList }) {
  return (
    <div className={style.commentList}>
      {reviewList.map((comment, index) => (
        <div key={index} className={style.commentContainer}>
          <div className={style.commentHeader}>
            <LuUser2 size={26} color="#6E30BF" />
            <p className={style.id}>{comment.author}</p>
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
                  color={starValue <= comment.starCount ? "skyblue" : "gray"}
                />
              ))}
              <p className={style.point}>{comment.starCount}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Comment;
