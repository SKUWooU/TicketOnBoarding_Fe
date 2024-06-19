import { useNavigate } from "react-router-dom";
import style from "../styles/cardList.module.scss";
import { FaStar } from "react-icons/fa";

function CardList({
  // 각 카드 랜더링에 필요한 Props 정의
  concertID,
  posterUrl,
  concertName,
  startDate,
  endDate,
  sido,
  gugun,
  placename,
  averageRating,
  price,
}) {
  const navigate = useNavigate();

  function gotoDetail() {
    navigate(`/concertDetail/${concertID}`);
    // 카드 클릭 시 상세 페이지로 이동
  }

  return (
    <div className={style.cardContainer} onClick={gotoDetail}>
      <img className={style.img} src={posterUrl} alt="Concert List" />
      <div>
        <p className={style.concertName}>{concertName}</p>

        {startDate === endDate ? (
          <p className={style.period}> {startDate} (1일)</p>
        ) : (
          <p className={style.period}>
            {" "}
            {startDate} ~ {endDate}
          </p>
        )}
        <p className={style.period}></p>
      </div>

      <div>
        <p className={style.listDetail}>
          {sido} {gugun} / {placename}
        </p>
        <p className={`${style.listDetail} ${style.emphasize}`}>
          평균 평점 : <FaStar /> {averageRating}{" "}
        </p>
        <p className={style.listDetail}>{price}</p>
      </div>
    </div>
  );
}

export default CardList;
