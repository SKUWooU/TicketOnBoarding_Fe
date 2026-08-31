# 좌석 가용 상태 Frontend 계약

## 1. 문제

기존 `ConcertReservation`은 좌석 조회 응답의 `reserved` boolean만 읽었다. 이 방식에서는 결제가 끝난 `RESERVED`와 결제 전 다른 사용자가 잠시 소유한 `HELD`가 모두 같은 `reserved=true`로 축약된다. 사용자는 좌석을 선택할 수 없는 이유와 임시 점유가 만료될 수 있다는 사실을 알 수 없었다.

화면의 24석 배치는 고정되어 있었고 API 응답에 없는 좌석은 이전 `available` 상태가 유지됐다. 날짜·회차를 바꿔도 `selectedSeats`가 남을 수 있었으며, 좌석 객체의 `status`를 직접 변경해 React state와 표시 상태가 분리될 가능성도 있었다.

## 2. Backend가 제공하는 원본

좌석 조회 `GET /main/detail/{concertId}/calendar/{timeId}`의 좌석 항목은 다음 필드를 제공한다.

| 필드            | 의미                                                      |
| --------------- | --------------------------------------------------------- |
| `seatNumber`    | 회차 안의 가상 좌석 번호                                  |
| `reserved`      | 구 Frontend 호환 boolean. `HELD`와 `RESERVED` 모두 `true` |
| `availability`  | `AVAILABLE`, `HELD`, `RESERVED` 중 하나                   |
| `holdExpiresAt` | 활성 `HELD`일 때의 서버 기준 만료 시각                    |

`heldBy`는 사용자 정보이므로 응답하지 않는다. 따라서 조회 화면은 임시 점유가 현재 사용자 소유인지 판단하지 않으며, 이번 단계에서는 모든 `HELD`를 선택 불가로 표현한다.

## 3. 상태 정규화

Frontend는 enum을 우선하고 레거시 응답을 다음 순서로 보완한다.

| 입력                        | UI 상태       | 선택 가능 |
| --------------------------- | ------------- | --------- |
| `availability=AVAILABLE`    | `AVAILABLE`   | Yes       |
| `availability=HELD`         | `HELD`        | No        |
| `availability=RESERVED`     | `RESERVED`    | No        |
| enum 없음, `reserved=false` | `AVAILABLE`   | Yes       |
| enum 없음, `reserved=true`  | `RESERVED`    | No        |
| 알 수 없는 enum·응답 누락   | `UNAVAILABLE` | No        |

알 수 없는 값을 `AVAILABLE`로 추정하지 않는다. 좌석 재고 화면에서는 잘못된 선택 허용보다 보수적인 선택 차단이 안전하기 때문이다. API 목록에 없는 고정 배치 좌석도 `UNAVAILABLE`로 둔다.

## 4. 화면 표현

| 상태          | 표현   | 안내                          |
| ------------- | ------ | ----------------------------- |
| `AVAILABLE`   | 흰색   | 선택 가능                     |
| 로컬 선택     | 보라색 | 선택 좌석                     |
| `HELD`        | 주황색 | 임시 점유와 `HH:mm` 만료 시각 |
| `RESERVED`    | 회색   | 예약 완료                     |
| `UNAVAILABLE` | 연회색 | 상태 확인 불가                |

색상만으로 상태를 전달하지 않는다. 각 좌석은 실제 `button`이며 상태 텍스트가 포함된 `aria-label`, `disabled`, `aria-pressed`를 사용한다. 임시 점유 좌석에는 만료 시각을 좌석 안과 title에 함께 표시한다.

Frontend는 로컬 시각이 만료 시각을 지났다는 이유만으로 `HELD`를 `AVAILABLE`로 바꾸지 않는다. 클라이언트 시계 차이와 경쟁 요청을 고려해 Backend 재조회 결과만 가용 상태의 원본으로 사용한다.

## 5. 선택과 회차 전환

- `AVAILABLE`만 `selectedSeats`에 추가할 수 있다.
- 선택 여부는 서버 가용 상태와 분리된 React state로 관리하며 좌석 객체를 직접 변경하지 않는다.
- 날짜 변경, 회차 선택 해제, 다른 회차 선택, 좌석 조회 실패 시 이전 선택을 제거한다.
- 빠르게 두 회차를 선택했을 때는 요청 순번을 비교해 늦게 도착한 이전 회차 응답을 버린다.

이 단계에서는 선택이 아직 서버 점유를 만들지 않는다. 선택 후 `POST /seat-holds`, 해제·이탈 시 `DELETE /seat-holds`, 409 처리와 만료 재조회는 후속 Issue의 범위다.

## 6. 검증

실제 Backend·KOPIS·Kakao Map·결제 API를 호출하지 않고 fixture로 검증한다.

- enum 우선순위와 레거시 `reserved` fallback
- 알 수 없는 상태와 응답 누락의 선택 차단
- `AVAILABLE` 클릭과 `HELD`·`RESERVED`·`UNAVAILABLE` disabled 상태
- 임시 점유 만료 시각과 접근성 문구
- 실제 `ConcertReservation`에서 회차 변경 후 선택·결제 요약 초기화
- 뒤늦게 완료된 이전 회차 응답이 현재 좌석 상태를 덮지 않는지 검증
- 전체 Vitest, production build, 기존 lint 기준선 비교

로컬 검증 결과는 Vitest 5 files·16 tests 통과, Vite 5.4.21 production build 통과다. 전체 lint는 기존과 동일한 98 errors·5 warnings이며 새 파일의 오류는 없다. production JS는 569.75kB(gzip 184.66kB)로 기존 단일 chunk 경고가 유지된다. 이번 상태 표시가 Issue #6 직후 기준 567.56kB(gzip 183.23kB)보다 2.19kB(gzip 1.43kB) 증가했으며, 이는 후속 route code splitting 기준선에 포함한다.

이는 가상 좌석 상태의 Frontend 계약 검증이며 실시간 좌석 동기화, 실제 공연장 데이터 또는 운영 예매처 동작을 의미하지 않는다.

## 7. 후속 조건

다음 단계는 조회 표현이 아니라 서버 소유권을 만드는 작업이다. 점유 API 연동 시에는 다음을 별도 검증한다.

- 선택 추가·해제와 다좌석 점유 요청의 원자적 UI 처리
- HTTP 401·409와 stale 화면 복구
- 점유 성공 응답의 공통 만료 시각 관리
- 결제 화면 이동·뒤로가기·페이지 이탈 시 해제 정책
- 만료 후 서버 재조회와 결제 시점 소유권 재검증

## 8. 연결

- [Frontend Issue #8](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/8)
- [개선 근거 연결표](EVIDENCE_MAP.md)
- Backend `docs/project-improvement/seat-hold-expiration-state-transition.md`
