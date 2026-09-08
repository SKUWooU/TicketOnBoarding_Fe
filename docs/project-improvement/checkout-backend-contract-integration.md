# 실제 로컬 Backend를 사용하는 Checkout 통합 계약 테스트

## 1. 검증 목적

Frontend Issue #12는 Checkout·검증 예약 화면을 mock HTTP로 검증했다. 하지만 Frontend가 작성한 endpoint·header·body가 실제 Backend에서 예약 완료까지 이어지는지는 저장소 사이에서 확인하지 않았다.

이번 테스트는 실제 로컬 Backend와 MariaDB를 사용해 다음 경계를 검증한다.

`Frontend seatHoldApi → Backend 좌석 hold → Frontend checkoutApi → Backend Checkout → Frontend Payment 화면 → Backend 검증 예약 → Backend snapshot`

결제 제공자만 명시적인 로컬 fixture로 대체한다. Backend의 예약·Checkout·결제 검증·트랜잭션·DB 저장 코드는 실제 애플리케이션 코드를 통과한다.

## 2. E2E라고 과장하지 않는 이유

현재 Frontend 좌석 화면은 `A1~C8`의 고정 24석 layout이고, Backend 부하 fixture는 `R001-S001` 형식의 2,000석이다. 이번 테스트는 2,000석 중 한 좌석을 API로 hold한 뒤 결제 화면부터 렌더링한다. 따라서 브라우저에서 날짜·회차·좌석을 클릭하는 전체 UI E2E가 아니다.

정확한 분류는 **FE·BE Checkout 통합 계약 테스트**다. 다음 항목은 검증하지 않는다.

- 2,000석 전체의 Frontend 렌더링
- 실제 공연장의 좌석 배치
- 사용자가 좌석 선택 화면을 클릭하는 전체 브라우저 흐름
- 고경합 처리량·p95·DB lock wait
- 실제 PG 승인·취소·환불·webhook

KOPIS는 실제 공연장의 좌석 배치를 제공하지 않으므로 2,000석을 모든 공연 UI의 기본값으로 사용하지 않는다. 동적 좌석 layout·구역·virtualization은 별도 Issue에서 가상 좌석 모델을 먼저 정한 뒤 다룬다.

## 3. 재사용한 Backend fixture

검증한 Backend 기준 commit은 `9a5356e981720fd298b91bcab6ec644fac548873`이다. Backend 소스는 변경하지 않았다.

`local,loadtest` profile은 다음 기능을 이미 제공한다.

- loopback bind: 애플리케이션 `127.0.0.1:18080`, 관리 포트 `127.0.0.1:18081`
- run별 50행 × 40석, 총 2,000석 가상 fixture
- run 사용자와 JWT 발급
- `LT:{username}:{amount}:{merchantUid}` 형식의 로컬 결제 검증 adapter
- run별 Reservation·Booking·Payment·재고 snapshot
- KOPIS 주소 `example.invalid`, PG·SMS placeholder

새로운 fake adapter나 Backend endpoint를 만들지 않고 이 기반을 재사용했다.

## 4. 테스트 격리와 안전장치

통합 테스트는 `vitest.integration.config.js`에서 `integration/**/*.integration.jsx`만 찾는다. 기본 `npm.cmd test -- --run`은 이 파일을 발견하지 않으므로 실행 중인 Backend가 없어도 기존 53개 테스트와 CI가 그대로 동작한다.

통합 테스트가 허용하는 Backend 주소는 다음 두 종류뿐이다.

- `http://127.0.0.1:*`
- `http://localhost:*`

HTTPS, 원격 hostname, 운영 주소를 전달하면 실행 전에 실패한다. 결제 provider는 테스트 모듈 안에서만 fixture로 바뀌며 애플리케이션 기본 provider는 계속 fail-closed다.

## 5. 실제 검증 순서

1. 고유한 `runId`로 2,000석 fixture를 생성한다.
2. fixture 사용자 한 명의 JWT를 발급받아 로컬 HTTP cookie로 설정한다.
3. `seatHoldApi.holdSeats`로 `R001-S001`을 hold한다.
4. `checkoutApi.prepareCheckout`으로 Checkout을 만들고 상태 `READY`, 서버 금액 30,000원을 확인한다.
5. Backend loadtest 형식의 `paymentId`를 결제 provider fixture가 한 번 반환한다.
6. 실제 `Payment` 컴포넌트에서 결제 버튼을 눌러 `checkoutApi.confirmVerifiedReservation`을 호출한다.
7. 같은 `paymentId`·예약 멱등 키로 검증 예약을 두 번 더 호출해 같은 결과가 반환되는지 확인한다.
8. Backend snapshot으로 중복 저장과 재고 방정식을 확인한다.

최종 기대값은 다음과 같다.

| 항목                       | 기대값 |
| -------------------------- | -----: |
| 전체 가상 좌석             |  2,000 |
| 잔여 좌석                  |  1,999 |
| 예약 좌석                  |      1 |
| Reservation                |      1 |
| Booking                    |      1 |
| Payment                    |      1 |
| 재고 불변식                |   충족 |
| 결제 provider fixture 호출 |      1 |

## 6. 실행 방법

### Terminal 1: Backend와 MariaDB

Backend 저장소 루트에서 MariaDB를 시작한다.

```powershell
docker compose up -d mariadb
```

`onticket` 디렉터리에서 외부 연동이 없는 profile로 Backend를 시작한다.

```powershell
.\gradlew.bat bootRun --args="--spring.profiles.active=local,loadtest --spring.batch.job.enabled=false"
```

### Terminal 2: Frontend 통합 테스트

Frontend 저장소 루트에서 실행한다.

```powershell
npm.cmd run test:integration:checkout
```

다른 loopback port를 사용할 때만 다음 환경변수를 지정한다.

```powershell
$env:ONTICKET_INTEGRATION_BASE_URL='http://127.0.0.1:18080'
npm.cmd run test:integration:checkout
```

검증 뒤 Backend를 종료하고 필요하면 MariaDB를 중지한다.

```powershell
docker compose stop mariadb
```

## 7. 실행 결과와 발견 사항

2026-09-08 같은 Backend 프로세스에서 고유 run으로 2회 연속 실행했고 모두 통과했다.

- 실행 1: 1 test 통과, 테스트 본문 약 3.09초
- 실행 2: 1 test 통과, 테스트 본문 약 2.88초
- 각 run: 전체 2,000·잔여 1,999·예약 좌석 1
- 각 run: Reservation·Booking·Payment 각 1
- 같은 결제 검증 요청을 반복해도 row 수 증가 없음
- 외부 PG·KOPIS·SMS·운영 DB 호출 없음

첫 실행에서는 예약과 Payment가 1건인데 snapshot의 Booking이 0으로 집계됐다. Backend snapshot이 run별 Booking을 `lt-{runId}.` 멱등 키 prefix로 구분하는 반면 최초 Frontend fixture 키는 `fe-...`였기 때문이다. 예약 도메인 실패가 아니라 관측 fixture의 run 귀속 불일치였으며, 예약 키를 기존 run prefix 계약에 맞춘 뒤 불변식이 통과했다.

이 결과는 로컬 단일 사용자·단일 좌석의 저장소 간 기능 계약 근거다. 실제 예매처 성능, 전체 UI E2E, 운영 네트워크 신뢰성 또는 실제 결제 성공을 의미하지 않는다.

또한 테스트는 Node Axios adapter에서 JWT를 `Cookie` header로 전달한다. endpoint·인증 token·controller 계약은 통과하지만 실제 브라우저의 cookie domain·SameSite·Secure와 CORS 동작까지 검증한 결과는 아니다.

기본 Frontend 53 tests와 production build는 통과했고, 변경 파일 lint는 오류·경고 0건이다. 저장소 전체 lint의 기존 95 errors·2 warnings와 500 kB 초과 bundle 경고는 이번 Issue 범위 밖 기준선으로 유지한다.
