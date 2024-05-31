import { useNavigate } from "react-router-dom";
import style from "../styles/ClassifyBtn.module.scss";

function ClassifyBtn({ buttonText }) {
  const navigate = useNavigate();
  let param = "";

  function Routing() {
    const genres = {
      "연극": "play",
      "복합": "complex",
      "서커스/마술": "circus",
      "무용": "dance",
      "서양음악(클래식)": "westmusic",
      "한국음악(국악)": "koreanmusic",
      "대중음악": "contemporarymusic",
      "뮤지컬": "musical",
    };

    const regions = {
      "서울": "seoul",
      "부산": "busan",
      "인천": "incheon",
      "대구": "daegu",
      "대전": "daejeon",
      "광주": "gwangju",
      "경기": "gyeonggi",
      "강원": "kangwon",
      "충북": "chungbuk",
      "충남": "chungnam",
      "전북": "jeonbuk",
      "전남": "jeonnam",
      "경북": "gyeongbuk",
      "경남": "gyeongnam",
      "제주": "jeju",
    };

    if (genres[buttonText]) {
      param = genres[buttonText];
      navigate(`/genre/${param}`);
    } else if (regions[buttonText]) {
      param = regions[buttonText];
      navigate(`/region/${param}`);
    }
  }

  return (
    <div>
      <button className={style.categoryBtn} onClick={Routing}>
        {buttonText}
      </button>
    </div>
  );
}

export default ClassifyBtn;
