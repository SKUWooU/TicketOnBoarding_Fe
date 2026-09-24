# Local Backend Browser E2E 사전조건 계약

## 문제

`test:e2e:local-backend`는 Vite와 Chromium을 먼저 시작한 뒤 fixture API에 연결한다. Backend가 꺼져 있으면 Playwright의 요청 실패(`ECONNREFUSED`)로만 원인이 드러나며, 문서의 Gradle wrapper 경로도 현재 Backend 저장소 구조와 달랐다.

## 결정

Frontend는 Browser E2E 전에 loopback management endpoint `http://127.0.0.1:18081/actuator/health`만 `GET` 요청한다. redirect는 `error`로 거부하므로 loopback endpoint가 다른 주소로 유도하더라도 후속 요청을 보내지 않는다. JSON의 `status`가 `UP`일 때만 Playwright를 시작한다.

이 검사는 다음을 의도적으로 하지 않는다.

- Docker, MariaDB, Spring Boot를 자동 기동하거나 중지하지 않는다.
- KOPIS, PG, OAuth 등 외부 API를 호출하지 않는다.
- fixture를 생성하거나 좌석·예약·결제 데이터를 변경하지 않는다.

## 실행 순서

```powershell
cd D:\project2\TicketOnBoarding_Be
docker compose up -d
cd onticket
.\gradlew.bat bootRun --args="--spring.profiles.active=local,loadtest --spring.batch.job.enabled=false"

cd D:\project2\TicketOnBoarding_Fe
npm run test:e2e:local-backend
```

사전조건 실패 시에는 위 명령과 health URL을 출력하고 종료한다. 따라서 Chromium trace를 열기 전에 로컬 의존성 누락을 구분할 수 있다.

## 검증 범위와 한계

- `UP`, 연결 실패, `DOWN` health 응답과 `GET`·redirect 거부 옵션을 단위 테스트한다.
- 준비된 `local,loadtest` Backend와 Docker MariaDB에서 기존 Chromium hold·Checkout 취소 E2E를 실행한다.
- 이는 local fixture 실행성 계약이다. 운영 배포 상태, 실제 PG/KOPIS/OAuth, 실제 기기 성능을 보장하거나 측정하지 않는다.
