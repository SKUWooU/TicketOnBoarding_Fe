# 🎫 공공 데이터를 이용한 공연 티켓팅 서비스 – 티켓온보딩 (FE)

특정한 공연을 예매하기 위해, 사용자들은 11번가, Yes24, 나눔티켓, G마켓 등 다양한 예매처에서의 별도의 회원가입을 요구받습니다.  
이런 불편함을 KOPIS Open Api 를 이용하여 (문화체육관광부) 해결하려 하였습니다.
Kopis 와 연계된 141개의 예매처, 공연시설 및 기획제작사들이 제공하는 데이터를 기반으로 가상의 결제 통합 플랫폼을 제작하였습니다.  



## ✔ 개요 

* 프로젝트 이름 : 티켓 온보딩  
* 프로젝트 개발 기간 : 2024.04.19 ~ 2024.06.25  
* 배포된 프론트 서버 : ~~https://www.onboardingticket.shop~~  
* 역할분배  
    컴퓨터공학과 19 김온유 : 기획/디자인 및 프론트엔드  
    컴퓨터공학과 18 박건우 : 백엔드 및 인프라 구축


## 시작 가이드
#### Frontend Requirements

* Node.js ( v20.13.0 LTS )
* Npm (10.5.2 ) 
```
$ git clone https://github.com/SKUWooU/TicketOnBoarding_Fe.git
$ cd TicketOnBoarding_Fe
$ npm install
$ npm run dev 
```

## 기술 스택 
### Design (UI/UX) 
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)
![SASS](https://img.shields.io/badge/SASS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

### Development
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-4B32C3?style=for-the-badge&logo=vite&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
![axios](https://img.shields.io/badge/axios-007ACC?style=for-the-badge&logo=axios&logoColor=white)
![Dialogflow](https://img.shields.io/badge/Dialogflow-FF9800?style=for-the-badge&logo=dialogflow&logoColor=white)

### Communication
![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)


## 📺 화면 구성 및 주요 기능
[티켓 온보딩 시연 영상](https://www.youtube.com/watch?v=QWxK0tgqDms)

* **로그인 페이지**
![login](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/ee338976-1ef5-47b1-b05a-a06534bd2de4)  
OAuth 기반 소셜 로그인 지원 및 회원가입, 계정 정보 찾기  

* **메인페이지, 장르별, 지역별 상세 탐색 (Nav Bar)**
![landing](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/aa7b7039-6912-44f1-9143-30d27b2fa761)  
Card Design Component를 통한 공연 정보 전달  
유저들이 부여한 평점 기반 상위 8 개의 공연 (Horizontal Scroll) 정보 제공  
Md's Pick 으로 선정된 4 개의 공연 정보 제공

* **공연 상세** 
![detail](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/c81a5b64-68aa-4879-89de-091ce311bf49)  
실제 공연의 데이터 ( 포스터, 상세 정보, 실제 공연 장소 - kakaopMap 기반) 제공  
![detail2](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/f2756d60-745b-4275-8f10-19a91327a2cd)  
사용자들의 평점 및 한줄평  작성 및 조회 기능 제공 

* **결제 관련**  
![payment](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/174c4691-595b-49fb-ab8e-8a675c395658)  
![process](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/d5bc2dc9-4f36-41de-93f5-38ee25dce116)  
실제 공연의 공연일 기반, 좌석 선택 및 결제 기능 제공.  
( 예매 좌석 가능 실시간 업데이트 - MaterialUi DatePicker / Grid )  
아임포트 Api - 카카오 및 네이버 페이 가상 결제 동작 확인   


* **마이 페이지**  
![mypage](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/7d3e16c3-0ca9-4161-bf05-46a99a715011)  
로그인 상태 판별 이후 (Context API 를 통한 전역 State 관리) 간단한 기능 제공

* **마이 페이지 : 티켓 관련 클레임 핸들링**   
![handling](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/06575e8a-de47-4a51-9848-3746735d856e)  
 예매한 티켓 조회, 환불 신청 및 환불 완료된 티켓 정보 제공 

* **관리자 페이지**  
![adminpage](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/bb66c0ea-6574-469d-b193-faabcaa7f83b)  
DB에 적재된 공연 데이터의 전체 조회 및 삭제 기능 구현(Md's Pick 선정 및 평균 평점 확인 가능)  
Input Value Onchange 를 통한 특정 공연 검색  
가입된 전체 사용자의 정보 조회  
플랫폼 내부의 전체 예매 조회 및 유저의 환불 요청에 관한 핸들링 가능 

* **그 외**  
 ➕ Google DialogFlow를 이용한 사용자 클레임 핸들링 및 기본적인 정보 전달의 Chatbot 구현 

## 시스템 구성도 
![김온유_박건우_공공 데이터를 이용한 공연 티켓팅 서비스_시스템구성도](https://github.com/SKUWooU/TicketOnBoarding_Fe/assets/108880488/96c6820f-dd89-4a69-9cbd-5f4d004533b3)
