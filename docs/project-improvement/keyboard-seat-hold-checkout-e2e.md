# 좌석 hold·Checkout 취소 키보드 E2E 계약

## 문제

기존 local Browser E2E는 실제 loopback Backend의 가상 좌석을 hold하고 Checkout을 취소한 뒤 snapshot 수렴을 확인했지만, mouse click만 사용했다. 키보드 `Enter`로 hold를 요청하면 서버 상태 refresh 뒤 선택 좌석 button이 다시 렌더링되며 focus가 사라졌다. 다음 결제 행동으로 자연스럽게 이동할 수 없는 키보드 흐름이었다.

## 범위

- loopback `local,loadtest` Backend와 Docker MariaDB
- 가상 공연 1개·총 2,000석·선택 구역 200석
- `R001-S001`의 keyboard focus·`Enter` hold
- 일반 결제·Checkout 취소의 keyboard `Enter`와 종료 snapshot

KOPIS, OAuth 로그인 UI, Kakao, 실제 PG, 운영 데이터·성능은 포함하지 않는다.

## 개선

`SeatSelectionGrid`가 keyboard focus를 받은 좌석 ID를 보관하고, 좌석 상태 또는 선택 상태 refresh 후 같은 활성 button으로 focus를 복원한다. 서버 응답으로 좌석이 비활성이 된 경우에는 disabled button에 focus를 강제하지 않는다.

이는 전체 tab 순서 재설계나 접근성 전수 감사를 대신하지 않는다. hold를 요청한 사용자가 상태 갱신 후에도 현재 선택 좌석을 인지하고 keyboard로 다음 동작을 이어갈 수 있게 하는 최소 범위다.

## 검증

| 항목 | 결과 |
| --- | --- |
| component contract | focus한 `AVAILABLE` 좌석이 refresh 뒤 `내가 선택한 좌석`으로 갱신돼도 focus 유지 |
| local Chromium E2E | 기존 mouse 흐름 1건 + keyboard `Enter` hold·결제·취소 흐름 1건 통과 |
| 종료 snapshot | actual/expected 2,000, hold·reservation·booking·payment 0, invariant true |
| 정적 검증 | lint 0 warnings, production build 통과 |

## 한계

- fixture 결과는 실제 공연장 키보드 UX나 운영 접근성 인증이 아니다.
- 날짜·회차 선택의 전체 keyboard navigation, screen reader 전수 검증, 실제 모바일 기기 테스트는 별도 근거가 필요하다.
- focus 보존 근거만으로 virtualization, WebSocket, 신규 상태 관리 라이브러리를 도입하지 않는다.
