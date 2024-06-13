import React from "react";
import style from "../styles/MainFooter.module.scss";
function MainFooter() {
  return (
    <div className={style.Container}>
      <p className={style.introduce}>
        여러 예매처로 이동하고, 별도의 회원가입은 그만 !
      </p>

      <div>
        <p className={style.slogan}>누구에게나 쉬운 원클릭 예매 서비스 </p>
        <p className={style.service}>티켓 온보딩</p>
      </div>

      <p className={style.copyRight}>© 2024 All Rights Reserved</p>

      <div className={style.bottomNav}>
        <p>회사 소개</p>
        <p>이용 약관</p>
        <p>개인정보 처리 방침</p>
        <p>공지사항</p>
        <p>사이트맵</p>
      </div>
      <df-messenger
        intent="WELCOME"
        chat-title="onticket"
        agent-id="d88e6107-8dda-44a2-a91e-7b17b8c58242"
        language-code="ko"
      ></df-messenger>
    </div>
  );
}

export default MainFooter;
