# Hook dependency lint baseline

## Change

`MainHeader`의 인증 유효성 effect가 읽는 `setIsLoggedIn`, `setLoginInfo`와 `ConcertDetail` 지도 script effect가 읽는 `mapServiceKey`를 dependency array에 명시했다.

React Context state setter는 안정적인 참조이고, Vite 환경 키는 build-time 문자열이다. 따라서 이 선언은 숨은 의존성을 드러내며 기존 인증 요청·지도 초기화 조건을 확대하지 않는다.

## Result and limits

- `npm run lint`: 0 errors, 0 warnings, exit 0
- `npm test`: 72 tests passed
- `npm run build`: production build passed
- Kakao Maps는 외부 API이므로 실제 script/network 호출은 실행하지 않았다.

## Related

- [Issue #43](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/43)
