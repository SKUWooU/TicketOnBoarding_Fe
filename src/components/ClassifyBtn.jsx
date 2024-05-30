import { useNavigate } from "react-router-dom";
import style from "../styles/ClassifyBtn.module.scss";

function ClassifyBtn({ buttonText }) {
  const navigate = useNavigate();
  let param = "";

  function gotoGenre() {
    if (buttonText === "연극") param = "play";
    if (buttonText === "복합") param = "complex";
    if (buttonText === "서커스/마술") param = "circus";
    if (buttonText === "무용") param = "dance";
    if (buttonText === "서양음악(클래식)") param = "westmusic";
    if (buttonText === "한국음악(국악)") param = "koreanmusic";
    if (buttonText === "대중음악") param = "contemporarymusic";
    if (buttonText === "뮤지컬") param = "musical";
    navigate(`/genre/${param}`);
  }

  return (
    <div>
      <button className={style.categoryBtn} onClick={gotoGenre}>
        {buttonText}
      </button>
    </div>
  );
}

export default ClassifyBtn;
