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

1. Backend 저장소 루트에서 `docker compose up -d`를 실행한다.
2. `onticket` 디렉터리에서 `./gradlew.bat bootRun --args="--spring.profiles.active=local,loadtest --spring.batch.job.enabled=false"`를 실행한다.
3. Frontend 저장소에서 `npm run test:e2e:local-backend`를 실행한다. 이 명령은 Chromium 시작 전에 `127.0.0.1:18081/actuator/health`의 `UP` 상태를 읽기 전용으로 검사한다.

Backend·MariaDB를 npm script가 자동 기동하지는 않는다. 실행 중인 로컬 자원을 임의로 변경하지 않고, 준비되지 않았을 때 필요한 명령만 안내한다.

## 불변식

브라우저가 좌석 1개를 hold하고 Checkout을 준비한 뒤 취소하면, 해당 fixture run의 활성 hold·hold row·예약·booking·payment는 모두 0이고 총 2,000석 재고가 복원되어야 한다.

## 실제 대기 입장·구매 연결 (FE #55)

기존 2,000석 opt-in 테스트와 별도로 `npm.cmd run test:e2e:local-admission`을 추가했다. 20석·두 사용자·입장 한도 1명으로 **규모가 아니라 구매 진입 경계**를 검증한다. [요약 원자료](evidence/local-admission-purchase.json)는 환경·정책·실제 snapshot 결과와 제외 범위만 남기고 token/원시 HTTP/trace는 포함하지 않는다.

### 실행 경계와 흐름

- UI 127.0.0.1:4175 → Vite `/api` proxy → 실제 Backend 18080 → Redis worker/MariaDB 서비스. API 응답을 mock/fulfill하지 않는다.
- 별도 Chromium context 두 개에 local fixture JWT를 주입한다. 로그인/OAuth 화면 자체를 검증하는 것은 아니며 `/auth/valid`는 실제 서버가 처리한다.
- 첫 사용자는 대기 등록 후 worker/polling으로 입장하고, 두 번째 사용자는 순번 1에서 신규 좌석 버튼이 비활성임을 확인한다. 두 번째 사용자의 직접 Hold/Checkout API 호출 모두 403 `ADMISSION_REQUIRED`로 거절되고, 그 직후 snapshot에서도 Hold/Booking/Payment 0·잔여 20을 확인한다.
- 첫 사용자가 실제 Hold·Checkout `READY` 준비·`CANCELED` 취소를 완료한다. **첫 사용자가 여전히 ADMITTED인 이탈 직전에도 두 번째 사용자의 서버 상태가 WAITING이고 버튼이 비활성인지 다시 확인**해, JOIN 직후의 일시적 WAITING만 한도 검증으로 받아들이지 않는다. 이후 첫 사용자가 나가고 worker가 다음 사용자를 입장시키면 같은 좌석을 Hold·DELETE 해제한다. 결제 페이지까지 이동하지만 PG 결제 실행 버튼은 누르지 않는다.
- 최종 snapshot은 총/잔여 20, activeHeldSeats·holdRows·partialHoldStates·예약·Booking·Payment 모두 0, invariantSatisfied true다. UI의 취소 안내만으로 성공을 판단하지 않는다.

### 사전 준비와 실행

이 npm 명령은 서버/컨테이너 생성이나 활성 fixture reset을 수행하지 않는다. 기본 CI/mock browser 테스트에서도 제외한다. 준비되지 않은 경우 새 데이터 생성으로 복구하지 않고 읽기 전용 preflight에서 중단한다.

1. 충돌 없는 임시 MariaDB·Redis를 준비한다. 이번 실행은 이름 `ticket-admission-e2e-db55`/`ticket-admission-e2e-redis55`, default bridge·loopback 13307/17379, 각각 512/128MiB 제한, volume 없는 `--rm` 컨테이너를 썼다. 기존 compose 데이터/볼륨은 변경하지 않았다.
2. 최신 BE main의 bootJar를 사용한다. `local,loadtest`, DB host 127.0.0.1/port 13307/schema `onticket_admission_e2e`, **별도 테스트 DB 계정·JWT secret**, fixture rows=2/seats-per-row=10, admission 비활성으로 준비용 서버를 시작한다. 이번 Java max heap 384MiB·Hikari pool 4였다. KOPIS batch는 비활성이고 loadtest PG adapter를 사용한다.
3. 새 runId로 `POST /loadtest/runs`, `GET /loadtest/tokens?runId=...&count=2`를 호출하고, 실제 concertId/timeId와 `/loadtest/database-identity` fingerprint를 읽는다. 기존 데이터에서 쓸 runId를 재활용하지 않는다.
4. BE 정책 예제를 **UTF-8 BOM 없는 별도 파일**로 복사·수정한다. 실제 fixture ID·새 generation·오픈 시각(이번에는 현재 UTC보다 1분 전), maxActive=1/maxWaiting=4/batchSize=1, waiting TTL 5m/admission TTL 2m, Redis port 17379를 지정한다. 기존 namespace/부분 데이터는 CLI가 거절한다. 준비 서버를 종료한 뒤 BE `bootstrapAdmission --args="--policy-file=<정책 파일> --confirm-new-generation=<새 generation>"`로 초기화하고 동일 정책의 활성 서버를 재시작한다. 공개 API/테스트가 bootstrap/tick을 실행하지 않는다.
5. 추적되지 않는 임시 manifest JSON을 준비하고 `$env:ONTICKET_ADMISSION_MANIFEST="<절대 경로>"`를 지정한다. 필드는 `backendUrl`(정확히 http://127.0.0.1:18080), `runId`, `concertId`, `concertTimeId`, `generation`, `opensAt`, `databaseFingerprint`, `totalSeats:20`, `expectedActive:1`, `users:[{username,accessToken},{username,accessToken}]`이다. usernames는 해당 run의 `.001`, `.002` fixture 사용자여야 한다. 실제 token을 문서/터미널 공유/커밋에 넣지 않는다.
6. FE에서 `npm.cmd run test:e2e:local-admission` 실행. preflight는 health `UP`, DB identity·fixture·공개 정책 generation/opensAt·각 JWT 주체·아직 등록되지 않은 본인 queue·깨끗한 재고를 GET으로만 확인한다. 정책 API는 maxActive를 공개하지 않으므로 preflight가 한도 1을 증명한다고 주장하지 않는다. 두 번째 사용자 WAITING과 첫 사용자 이탈 뒤 승격으로 실제 동작을 확인한다.
7. trace/video/screenshot은 끄고 외부 origin 브라우저 요청을 차단한다. 종료 후 이 실행이 소유한 프로세스/컨테이너만 확인·정리하고 JWT manifest와 정책 파일을 제거한다. 실패/재실행은 재고 reset·namespace 덮어쓰기가 아니라 새 fixture/generation을 준비한다.

### 결과와 한계

2026-10-15 실제 Chromium 시나리오 1건이 통과했다. 첫 사용자 구매 준비 취소와 다음 사용자 동일 좌석 재사용, 대기 중 UI/API 이중 차단, 최종 DB 불변식을 확인했다. 브라우저 실행 시간에는 미래 fixture 날짜로의 달력 이동·polling 대기가 포함되므로 TPS/p95나 성능 개선 수치로 사용하지 않는다. 환경/정책/상태는 원자료 JSON을 참조한다.

이번 실행 후 실제 ID/PID를 확인해 검증용 Backend·volume 없는 두 임시 컨테이너를 종료했고 해당 20석 fixture 데이터는 자동 제거했다. JWT manifest·정책 임시 파일도 삭제했다. 기존 DB/Redis 컨테이너·볼륨과 Backend 소스는 변경하지 않았다.

이 결과는 단일 Backend·단일 Redis의 로컬 합성 fixture다. 실제 PG 승인·KOPIS 적재·로그인 UI·다중 Backend·Redis 장애/유실 복구·고부하·입장 제어 전후 부하 감소는 검증하지 않았다. 다음은 이 흐름을 유지한 제한된 공유/장애 경계와 점진 부하 비교다.

최종 검증은 신규 Checkout 거절/DB 무변경과 이탈 직전 WAITING 조건을 보강한 뒤 새 DB·Redis·fixture/generation에서 다시 통과했다. 전체 unit 20파일/98개, 새 사전검사 6개, lint·build·diff --check 통과. 기본 mock browser 목록은 기존 6개뿐임을 `playwright test --config playwright.config.js --list`로 확인했다. 초기 smoke와 보강 후 최종 실행을 동일 코드의 반복 부하 시험으로 집계하지 않는다. CI·독립 리뷰는 FE #55의 연결 PR에서 확인한다.

## 서버 polling 안내와 실제 UI 연결 (FE #57 / BE #244)

BE #242의 k6 실험은 active 4에서 클라이언트 polling 5/2/1초를 비교했지만 실제 FE는 최소 5초로 보정해 2초를 소비하지 못했다. BE #244가 `onticket.admission.poll-interval-millis`를 설정화하고 FE #57이 같은 범위(1000~30000ms 정수)를 검증해 소비하도록 연결했다. 미설정 시 기본 5초, jitter 0~999ms, 직전 요청 완료 후 다음 요청 예약은 유지한다. 잘못된 응답은 짧은 주기로 보정하지 않고 신규 구매를 차단한다.

### 재현과 실제 확인 범위

위 FE #55 준비 순서를 재사용하되 최신 BE #244 코드의 JAR와 FE #57을 사용한다. bootstrap 파일에는 기존 allowlist 키만 넣고, **서버 전용 additional properties 또는 실행 인자**에 `onticket.admission.poll-interval-millis=2000`을 추가한다. UI 안내 주기는 Redis 원자 정책 fingerprint에 포함되지 않으며 CLI에 새 키를 통과시키지 않는다. 임시 manifest에는 `pollIntervalMillis:2000`을 추가한다. 생략 시 preflight는 기존 5000을 기대한다. `npm.cmd run test:e2e:local-admission`은 서버 안내와 manifest를 GET으로 대조한 뒤 기존 실제 브라우저 시나리오를 실행한다.

2026-10-20 실행은 새 전용 MariaDB/Redis(default bridge·loopback 13307/17379, 512/128MiB·Redis maxmemory 64MiB), Java heap 384MiB/metaspace 192MiB·Hikari 4, fixture 20석·두 사용자·active 1·worker 1초·batch 1·waiting TTL 5분/입장 TTL 2분을 사용했다. active 1은 두 사용자의 대기와 승격을 확실히 확인하기 위한 기능 검증 조건이며, 앞선 active 4 부하 실험과 혼합하지 않는다. 브라우저는 Chromium headless 1440×900이며 외부 origin·trace/video/screenshot을 차단했다.

- 실제 서버 2000ms 안내를 확인하고 WAITING 사용자의 연속 자동 조회 한 구간 **2,581ms**를 관측했다. 단위 테스트는 2000ms+jitter를 정확히 검증하고, 실제 브라우저는 느슨한 1900~4500ms 범위로 과거 최소 5초 보정이 남지 않았는지 확인한다. 한 구간은 p95/성능 개선 수치가 아니다.
- ADMITTED/WAITING 사용자를 각각 새로고침하고 회차를 다시 선택해 상태 복원·대기 entry ID 유지를 확인했다. 전체 JOIN은 사용자당 1회, 총 2회로 자동 재등록이 없었다.
- 명시적 이탈 후 3.5초 동안 해당 페이지의 추가 입장 GET이 없었다. 회차 전환/unmount의 abort·느린 조회 비중첩·잘못된 정책과 5초 기본값은 fake timer 회귀로 함께 확인했다. 이동 자체가 서버 entry를 자동 삭제하는 정책으로 바뀐 것은 아니다.
- 대기 중 Hold/Checkout 403·첫 사용자 Checkout READY→CANCELED·이탈 뒤 다음 사용자의 같은 좌석 점유/해제와 최종 총/잔여 20·Hold/예약/Booking/Payment 0·재고 불변식을 통과했다.

[요약 원자료](evidence/local-admission-poll-policy.json)에 실행 코드 commit·조건·검증 결과·cleanup COMPLETE를 보존했다. 전용 Backend·컨테이너와 임시 JWT/정책 파일은 정리했고 기존 DB/Redis·볼륨은 건드리지 않았다. 이 단계는 실제 로컬 UI 계약 검증이며 k6 개선율을 UI 수치로 옮기거나 운영 최적값으로 확정하지 않는다. 실 PG 승인·KOPIS·로그인 화면·고부하·다중 Backend·장애복구는 제외했다. 입장 제어의 비용 비교→설정 계약→실제 구매 흐름 연결 단계는 여기서 정리하고 추가 증량을 필수 후속으로 두지 않는다.
