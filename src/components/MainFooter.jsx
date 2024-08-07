import style from "../styles/MainFooter.module.scss";

function MainFooter() {
  const agentId = import.meta.env.VITE_REACT_APP_DIALOGFLOW_ID;
  return (
    <div className={style.Container}>
      <p className={style.introduce}>
        여러 예매처로 이동하고, 별도의 회원가입은 그만 !
      </p>

      <div>
        <p className={style.slogan}>누구에게나 쉬운 원클릭 예매 서비스 </p>
        <p className={style.service}>티켓 온보딩</p>
      </div>

      <p className={style.copyRight}>
        2024-1 서경대 SW 인재양성 <br /> 프론트엔드 (기획 및 디자인) : 김온유 /
        백엔드 (DB 및 인프라 구축) : 박건우
      </p>

      {/* © 2024 All Rights Reserved */}
      <div className={style.bottomNav}>
        {/* <p>회사 소개</p>
        <p>이용 약관</p>
        <p>개인정보 처리 방침</p>
        <p>공지사항</p>
        <p>사이트맵</p> */}
      </div>
      <df-messenger
        intent="WELCOME"
        chat-title="편리한 원클릭 예매 - 티켓온보딩 "
        agent-id={agentId}
        language-code="ko"
      ></df-messenger>
    </div>
  );
}

export default MainFooter;
