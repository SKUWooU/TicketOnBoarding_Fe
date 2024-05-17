import logoPic from "../assets/logoPic.svg";
import "../styles/LoginHeader.scss"

function LoginHeader({page}) {
  return (
    <div className="LoginHeader"> 
      <div className="imgContainer">
        <img src={logoPic} alt="로고이미지" />
      </div>
          <p className="pageText">{page}</p>  
    </div>
  );
}

export default LoginHeader;
