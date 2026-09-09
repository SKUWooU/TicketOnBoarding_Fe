# 가상 2,000석 공연의 로컬 FE–BE 예매 화면 계약

연결: [Frontend Issue #24](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/24), Backend [Issue #88](https://github.com/SKUWooU/TicketOnBoarding_Be/issues/88)·[PR #89](https://github.com/SKUWooU/TicketOnBoarding_Be/pull/89)

## 검증 목적

기존 화면 단위 테스트는 공연 상세와 좌석 API를 mock으로 주입했다. Backend Issue #88에서 loadtest 공연 상세 계약을 복구한 뒤, 실제 로컬 Backend가 만든 단일 가상 공연을 `ConcertReservation` 화면이 소비하는 경로를 자동 회귀로 고정한다.

## 데이터와 화면 흐름

1. `POST /loadtest/runs`가 공연 1개·회차 1개·가상 좌석 2,000개를 생성한다.
2. 화면은 실제 Backend의 공연 상세와 달력 API를 호출한다.
3. 회차 선택 후 구역 요약 API에서 10개 구역을 표시한다.
4. 기본 선택된 첫 구역의 상세 API에서 200석만 DOM에 렌더링한다.
5. fixture 사용자 쿠키로 `R001-S001`을 점유하고 화면을 `내가 선택한 좌석`으로 갱신한다.

전체 2,000석을 한 번에 DOM에 만들거나 모든 공연을 2,000석으로 고정하지 않는다. 이 구조는 실제 공연장 도면이 아니라 구역 단위 탐색 계약을 검증하는 가상 layout이다.

## 자동 검증

```powershell
npm.cmd run test:integration:reservation-page
```

테스트는 loopback HTTP(`127.0.0.1` 또는 `localhost`)만 허용한다. `local,loadtest` Backend와 Docker MariaDB가 먼저 실행되어야 하며 KOPIS·PG·SMS를 호출하지 않는다.

검증 항목:

- 가상 공연명·장소·회차가 실제 Backend 응답으로 화면에 표시됨
- 전체 fixture 재고 2,000석
- 구역 버튼 10개와 첫 구역 선택 상태
- 선택 구역의 선택 가능 좌석 버튼 200개
- 실제 hold API 성공 후 `R001-S001`의 선택 상태 반영

추가로 Vite `/api` 프록시를 통해 상세·달력·구역 요약·구역 상세 응답과 cookie jar 기반 hold·release를 직접 확인했다.

## 발견한 경계

- Backend loadtest `runId`는 영문·숫자·하이픈 1~32자다. 이보다 긴 ID는 현재 공통 오류 응답에서 500으로 보이므로 테스트 ID는 짧게 유지한다.
- 이 자동 테스트는 Vitest·jsdom의 React 화면 통합 계약이다. 실제 Chromium의 CSS 배치·스크롤·시각 회귀나 Playwright E2E 결과가 아니다.
- 외부 지도 key를 주입하지 않아 Kakao Map script를 호출하지 않는다.
- 측정 결과는 로컬 가상 fixture의 기능 계약이며 실제 예매처 데이터·성능을 뜻하지 않는다.
