# 가상 공연장 좌석 layout과 렌더링 기준선

## 1. 조사 목적

Frontend의 좌석 선택 화면은 24석을 미리 정의하고 Backend 응답을 그 틀에 매핑한다. Backend 부하 측정은 2,000석 가상 fixture를 사용하지만, 이 숫자를 그대로 Frontend UI에 대입할 근거는 없었다.

이 문서는 두 fixture의 목적을 분리하고, 현재 렌더러에 규모별 좌석을 주었을 때의 로컬 비용을 측정해 후속 구현 순서를 결정한다.

## 2. 현재 코드의 source of truth

### 일반 KOPIS 적재 경로

Backend `KopisService`가 회차별 `seatAmount=24`를 설정하고 `A1~C8`을 생성한다. KOPIS에서 실제 공연장 좌석 배치를 받은 결과가 아니라, 해커톤 당시 정한 가상 재고다.

Frontend `ConcertReservation`도 별도로 `A1~C8` 24석과 통로 spacer를 하드코딩한다. API 좌석을 그대로 그리지 않고 `mapSeatResponseToLayout`이 API `seatNumber`를 이 24석 틀에 대입한다.

### 부하 측정 경로

Backend `loadtest` profile은 회차당 50행 × 40석으로 `R001-S001~R050-S040` 2,000석을 생성한다. 이 fixture는 DB query plan·lock·connection·TPS·p95를 측정하기 위한 가상 재고이며, 실제 공연장 배치나 Frontend 화면 사양이 아니다.

### API 계약의 한계

Backend `SeatDto`는 `seatId`, `seatNumber`, `reserved`, `availability`, `holdExpiresAt`를 반환한다. 구역·행·열·표시 순서·layout version은 없고 `findByConcertTimeId` 결과에 명시적 정렬도 없다. Frontend가 임의의 `seatNumber` 문자열을 파싱해 실제 배치로 간주하면 좌석 표현 계약이 숨겨진다.

## 3. 현재 매퍼의 2,000석 유실 재현

`R001-S001~R050-S040` 2,000석을 모두 `AVAILABLE`로 만들어 현재 `mapSeatResponseToLayout`에 전달했다.

| 항목                                      |  결과 |
| ----------------------------------------- | ----: |
| API 좌석                                  | 2,000 |
| 화면 layout에 남은 좌석                   |    24 |
| 선택 가능으로 매핑된 좌석                 |     0 |
| `UNAVAILABLE`로 남은 좌석                 |    24 |
| 틀에 식별자가 없어 사용되지 않은 API 좌석 | 2,000 |

이 결과는 Backend 2,000석이 잘못되었다는 뜻이 아니다. 24석 UI와 부하 fixture의 식별자·목적이 다르며, Frontend가 API 좌석 목록을 source of truth로 사용하지 않는다는 계약 차이를 보여준다.

## 4. 로컬 렌더링 측정

### 조건

- 측정일: 2026-09-08
- Frontend commit: `1e67d768c5666b2576012b2fc54d54d97f2d1d10`
- Backend 참조 commit: `9a5356e981720fd298b91bcab6ec644fac548873`
- Node.js `25.1.0`, npm `11.6.2`, React `18.0.0`, Vitest `1.6.1`, jsdom `24.1.3`
- 8GB Windows 로컬 환경
- `SeatSelectionGrid`와 MUI `Grid`·`Paper`를 그대로 사용
- 24·200·500·2,000석, 모두 `AVAILABLE`
- task별 warmup 1회 후 5 sample, 전체 benchmark 3회 독립 실행
- 아래 수치는 각 실행의 sample 평균 3개에 대한 중앙값과 범위

Vitest benchmark는 1.6.1에서 실험적 기능이므로 버전을 정확히 pin했다. jsdom 수치는 브라우저 paint·layout·GPU 비용을 포함하지 않으며 운영 성능이나 SLA가 아니다.

### 결과

`initial`은 처음 render와 button 개수 검증·unmount를 포함한다. `status rerender`는 initial render 후 첫 좌석을 `HELD`로 바꾸어 rerender하고 button 개수 검증·unmount하는 전체 비용이다.

| 좌석 수 | initial ms 중앙값 (범위) | status rerender ms 중앙값 (범위) | 24석 대비 initial | 24석 대비 rerender |
| ------: | -----------------------: | -------------------------------: | ----------------: | -----------------: |
|      24 |      20.36 (10.63~42.83) |              23.03 (11.63~41.22) |              1.0× |               1.0× |
|     200 |     79.39 (42.36~107.18) |              64.16 (60.75~77.95) |              3.9× |               2.8× |
|     500 |    102.46 (92.71~116.77) |           180.00 (141.39~273.22) |              5.0× |               7.8× |
|   2,000 |   492.98 (360.68~582.98) |         880.06 (580.05~1,371.03) |             24.2× |              38.2× |

200석 rerender 중앙값이 initial보다 작은 것과 실행 간 범위 차이는 로컬 jsdom microbenchmark의 편차를 보여준다. 절대 수치나 작은 차이를 제품 성능으로 해석하지 않고, 2,000 DOM button의 비용과 변동성이 명확히 커진다는 방향성만 사용한다.

### 재현 명령

```powershell
npm.cmd run measure:seat-grid
```

기본 test와 CI는 benchmark를 실행하지 않는다. 장비 부하와 편차가 있는 측정을 합격 gate로 사용하지 않기 위함이다.

## 5. 판정

### 2,000석을 한 화면에 모두 그리는 것은 과하다

Backend k6의 2,000석은 DB 재고·경합 조건이며 Frontend DOM 요구사항이 아니다. 2,000개 button을 한번에 렌더링하면 Backend TPS가 아니라 브라우저 비용이 사용자 흐름을 지배한다.

### 24석 이중 하드코딩은 제거할 가치가 있다

좌석의 존재·상태는 Backend가 source of truth여야 한다. Frontend에 같은 목록을 별도로 고정하면 Backend fixture가 변경될 때 좌석이 누락되거나 상태 확인 불가로 표시된다.

### 권장 후속 순서

1. Backend가 가상 공연장 layout version과 구역·행·열·표시 순서를 명시적으로 제공한다.
2. 전체 좌석 상태는 구역별 요약으로 보여주고, 선택한 구역의 좌석만 조회·렌더링한다.
3. 첫 구현은 구역당 약 200석 이하를 목표로 하되, 이 숫자는 로컬 jsdom 결과에 따른 휴리스틱이지 운영 SLA가 아니다.
4. 실제 브라우저 profiling에서 선택 구역의 DOM·long task·상태 갱신 비용을 다시 측정한다.
5. 구역 분리 후에도 한 화면의 좌석 수와 상태 갱신 비용이 크다는 근거가 있을 때만 virtualization을 도입한다.

WebSocket·대기열·Redis·메시지 브로커는 좌석 layout 문제의 해결책이 아니며, 현재 규모와 측정 근거에서는 도입하지 않는다.

## 6. 한계

- jsdom은 실제 Chromium의 paint·layout·GPU·입력 지연을 재현하지 않는다.
- 5 sample·3회는 로컬 방향성을 확인하는 작은 표본이며 운영 성능 주장에 사용하지 않는다.
- 좌석 상태 1건을 바꾸어도 현재 배열·component 구조에서는 전체 grid rerender를 수행한다.
- 실제 공연장 도면·가격 등급·장애인석·시야제한석은 아직 모델링하지 않았다.

## 7. 회귀 검증

- 기본 Frontend: 12 files·56 tests 통과
- production build 통과
- 측정 관련 JS·JSX lint: 오류·경고 0
- 저장소 전체 lint: 기존 95 errors·2 warnings 유지
- 기존 500 kB 초과 bundle 경고 유지
- `git diff --check` 통과
- 외부 KOPIS·PG·SMS·운영 DB 호출 없음
