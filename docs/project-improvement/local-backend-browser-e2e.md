# Local Backend Browser E2E

## 목적

기존 mock Chromium E2E는 화면 상호작용을, jsdom 통합 테스트는 local Backend 계약을 각각 검증한다. 이 검증은 실제 Chromium에서 React UI → Vite `/api` proxy → local Backend → MariaDB fixture 흐름을 확인한다.

## 실행 경계

```text
Chromium (127.0.0.1:4174)
  → Vite /api proxy
  → Backend local,loadtest (127.0.0.1:18080)
  → Docker MariaDB
```

- Backend 주소는 loopback HTTP만 허용한다.
- test run마다 가상 공연 1개·회차 1개·10구역·2,000석 fixture와 테스트 JWT를 만든다.
- Browser cookie로 fixture JWT를 주입한다. Backend loadtest fixture가 같은 username의 `SiteUser`를 만들므로 AuthContext의 `/auth/valid`도 Vite proxy를 거쳐 실제 Backend에서 검증한다. 로그인 화면·OAuth 흐름은 테스트하지 않는다.
- 인증 확인·좌석 hold·Checkout·취소 요청은 대체하지 않으며, Backend가 fixture JWT를 실제로 검증한다.
- `https` 요청은 browser에서 차단한다. 실제 PG·KOPIS·Kakao는 호출하지 않는다.
- 일반 CI에는 포함하지 않는다. Docker와 Spring Boot가 필요한 opt-in local 검증이다.

## 실행

1. Backend 저장소에서 `docker compose up -d` 후 `./gradlew bootRun --args="--spring.profiles.active=local,loadtest"`를 실행한다.
2. Frontend 저장소에서 `npm run test:e2e:local-backend`를 실행한다.

## 불변식

브라우저가 좌석 1개를 hold하고 Checkout을 준비한 뒤 취소하면, 해당 fixture run의 활성 hold·hold row·예약·booking·payment는 모두 0이고 총 2,000석 재고가 복원되어야 한다.
