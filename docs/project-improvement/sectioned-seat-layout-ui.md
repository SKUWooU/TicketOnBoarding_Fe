# 구역 기반 가상 좌석 탐색 UI

## 1. 문제와 목표

기존 예매 화면은 Frontend와 Backend가 각각 24석 배치를 알고 있었다. 공연 규모가 커지면 Frontend가 좌석 번호 문자열을 해석하거나 2,000개 버튼을 한 번에 그려야 했고, 어느 쪽도 좌석 배치의 단일 원본이 아니었다.

이 작업은 Backend가 소유하는 가상 layout 계약을 화면에 연결한다. 좌석 전체를 제품 규모로 주장하지 않고, **가상 좌석 재고의 구역 탐색 시나리오**로만 검증한다.

## 2. 적용한 계약

회차 선택 후 다음 두 단계로 조회한다.

1. `GET /main/detail/{concertId}/calendar/{timeId}/seat-sections`
   - `layoutVersion`과 구역별 total/available/held/reserved 집계를 받는다.
2. `GET /main/detail/{concertId}/calendar/{timeId}/seat-sections/{sectionCode}`
   - 선택 구역의 `rowLabel`, `rowOrder`, `seatIndex`, availability를 받는다.

Frontend는 `seatNumber`를 파싱하지 않는다. 명시적인 행·좌석 순서로 그룹화하고, 잘못된 집계·빈 응답·요청과 다른 구역 응답은 화면에 사용하지 않는다.

## 3. 화면 상태 흐름

```text
날짜 선택 → 회차 선택
                    ↓
              구역 요약 조회
                    ↓
       기본/사용자 선택 구역 상세 조회
                    ↓
           선택 구역 좌석만 렌더링
                    ↓
         hold·해제 후 같은 경로로 갱신
```

- 회차 또는 구역 요청마다 증가하는 sequence를 기록해 늦게 도착한 이전 응답을 폐기한다.
- 구역을 바꿔도 서버가 소유한 기존 hold 목록은 유지한다.
- 구역 선택기는 잔여/전체 좌석을 표시하고, 좌석 영역은 행 라벨과 가로 탐색을 제공한다.
- AVAILABLE만 새로 선택할 수 있고 HELD·RESERVED는 기존 hold 정책과 동일하게 차단한다.

## 4. legacy 정책

Backend가 layout metadata 부재를 뜻하는 HTTP `409`를 반환한 경우에만 기존 24석 API를 호출한다. `404`, malformed response, 네트워크 실패를 24석으로 숨기지 않는다. 따라서 존재하지 않는 공연·회차나 계약 오류가 가상의 정상 좌석처럼 보이지 않는다.

## 5. 반응형 범위

전체 공연 상세 페이지를 재설계하지 않고 좌석 선택 영역만 조정했다.

- 구역 선택기는 좁은 폭에서 가로 스크롤된다.
- 좌석 버튼은 40px 최소 크기와 한 행 배치를 유지하고 좌석 viewport 안에서 가로 스크롤된다.
- 1,200px 이하에서는 달력·회차·좌석 블록을 줄바꿈하고, 640px 이하에서는 선택 단계를 세로 배치한다.
- 전체 상세·지도·포스터 영역의 반응형 개편은 별도 범위로 남긴다.

## 6. fixture와 검증 결과

측정일: 2026-09-09

환경: Windows 로컬 단일 인스턴스, Backend `local,loadtest`, MariaDB Docker, Frontend Vite/Vitest

외부 호출: KOPIS batch 비활성화, Kakao Map key 미설정, PG 호출 없음

`POST /loadtest/runs?runId=fe-layout-21`로 명시적 fixture를 생성했다.

| 항목 | 결과 |
| --- | ---: |
| 전체 가상 좌석 | 2,000 |
| 구역 | 10 |
| 구역당 좌석 | 200 |
| 선택 구역 행 | 5 |
| 행당 좌석 | 40 |
| 최초 상세 응답·렌더링 대상 | 200 |

로컬 Backend 실응답을 직접 확인한 결과 요약 합계는 2,000석, `S01` 상세는 200석이었다. UI fixture 테스트에서도 10개 구역을 받은 뒤 `S01` 버튼 200개만 렌더링하고, `S02` 전환 시 이전 구역 버튼을 제거했다.

브라우저 검증은 공연 상세·달력 envelope만 명시적 fixture로 고정하고, 구역 요약·상세는 로컬 Backend 실응답을 사용했다. 외부 HTTP 요청은 차단했다.

| viewport | 좌석 영역 client/scroll 폭 | 내부 최대 가로 이동 | 렌더링 버튼 | 문서 client/scroll 폭 |
| --- | ---: | ---: | ---: | ---: |
| 1440×900 | 339 / 1,976px | 1,622px | 200 | 1,440 / 1,440px |
| 768×1024 | 651 / 1,976px | 1,310px | 200 | 768 / 1,090px |
| 390×844 | 321 / 1,976px | 1,640px | 200 | 390 / 1,066px |

세 뷰포트 모두 좌석 영역 자체의 가로 스크롤이 동작했고 좌석 버튼은 40px, 간격을 포함한 이동 단위는 48px였다. `S02` 전환 후에도 DOM 좌석은 200개였고 `S01` 좌석은 남지 않았다. 측정 중 발견한 MUI 중첩 Grid의 과도한 intrinsic width(9,840px)는 단순 flex 행으로 바꿔 1,976px로 줄였다.

검증 결과:

- 전체 Vitest: 15 files, 67 tests 통과
- 페이지 계약: sectioned 2,000/200 분리, 409 legacy fallback, 404 fail-closed, malformed response, 회차·구역·legacy fallback stale 응답 차단, 구역 왕복 hold 유지
- build: 성공
- 변경 JavaScript/JSX lint: 오류·경고 0
- 브라우저 원본: [`evidence/issue-21-browser-viewport.json`](./evidence/issue-21-browser-viewport.json)

## 7. 해석과 한계

- 이 결과는 실제 공연장 좌석 배치나 운영 트래픽 성능이 아니다.
- 이 작업의 개선점은 Backend의 2,000석 재고를 모두 DOM에 펼치지 않고, 명시적인 구역 계약으로 한 번에 200석만 조회·표시한다는 데 있다.
- 태블릿·모바일의 문서 전체 폭은 각각 1,090px·1,066px로 기존 상세·Footer 고정 폭의 overflow가 남았다. 좌석 영역 내부 탐색은 가능하지만 전체 페이지 반응형 완료로 해석하지 않는다.
- 현재 Backend loadtest 공연은 `Place`가 없어 공연 상세 API가 NPE로 500을 반환한다. 이번 브라우저 측정은 상세·달력 envelope를 fixture로 보완했고, 완전한 로컬 FE·BE 브라우저 E2E를 위해 Backend fixture 수정이 필요하다.
- virtualization은 구역당 200석의 실제 브라우저 입력·렌더링 지연이 재현될 때만 검토한다.
- WebSocket, 대기열, Redis, 메시지 브로커는 이 UI 계약만으로 도입 근거가 생기지 않는다.

## 8. 관련 근거

- Frontend Issue #21 / PR #22
- Backend Issue #85 / PR #86
- [가상 좌석 layout 기준선](./virtual-seat-layout-baseline.md)
- [ADR-0003](./adr/0003-server-owned-virtual-seat-layout.md)
