# ADR-0003: 가상 좌석 layout을 서버 계약으로 소유하고 구역 단위로 표시한다

- 상태: Accepted
- 일자: 2026-09-08

## 배경

KOPIS는 공연 일정·장소·시간 정보를 제공하지만 현재 프로젝트가 필요로 하는 실제 좌석 배치를 제공하지 않는다. 현재 Backend와 Frontend는 각각 24석을 하드코딩하고, 부하 측정은 별도의 2,000석 fixture를 사용한다.

Backend 좌석 응답에는 상태와 문자열 번호만 있어 Frontend가 실제 배치를 안정적으로 구성할 수 없다. 현재 MUI grid에 2,000석을 모두 렌더링한 로컬 jsdom 측정은 24석보다 initial 약 24.2배, 상태 rerender 포함 약 38.2배의 중앙 비용을 보였다.

## 결정

1. 좌석의 존재·상태·표시 순서와 가상 layout version은 Backend 계약이 source of truth로 소유한다.
2. Frontend는 `seatNumber` 문자열을 암묵적으로 파싱해 도면을 추론하지 않는다. Backend가 명시적인 구역·행·열·순서 메타데이터를 제공한다.
3. 큰 공연장은 전체 좌석 button을 한번에 렌더링하지 않고, 구역별 잔여석 요약 후 선택 구역의 좌석만 제공한다.
4. 첫 구현은 구역당 약 200석 이하를 권장 단위로 삼고, 실제 브라우저 측정 후 조정한다.
5. virtualization은 구역 분리 후에도 렌더링·입력 지연 문제가 재현될 때 도입한다.
6. Backend k6 2,000석 fixture는 고경합 DB 측정용으로 유지하고, 제품 UI의 실제 좌석 배치로 표현하지 않는다.

## 결과

- Frontend와 Backend에 좌석 목록을 중복 하드코딩하는 구조를 후속 Issue에서 제거한다.
- Backend API에 layout metadata와 구역 요약·상세 계약이 필요하다.
- Frontend는 선택한 구역만 렌더링하여 DOM 규모를 제한한다.
- 좌석 번호만으로 layout을 추론하는 임시 구현은 빠르지만 계약이 숨겨지므로 선택하지 않는다.
- 구역 추가와 layout version 변경은 Backend contract test와 Frontend fixture test를 함께 변경해야 한다.

## 보류한 대안

- Frontend에서 `A1` 또는 `R001-S001`을 regex로 파싱해 자동 layout 생성
- 2,000석 전체 DOM 렌더링
- 근거 없는 virtualization·WebSocket·Redis·대기열 도입
- loadtest profile을 제품 UI의 일반 실행 환경으로 사용
