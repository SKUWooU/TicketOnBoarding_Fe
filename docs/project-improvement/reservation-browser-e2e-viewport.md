# 예약 화면 Chromium E2E·viewport 회귀 기준선

## 문제

기존 예매 화면 검증은 Vitest·jsdom과 local Backend 통합 계약에 한정됐다. 따라서 실제 Chromium에서 CSS 배치, 가로 탐색, 클릭 좌표, 409 피드백이 함께 동작하는지는 확인할 수 없었다.

## 범위와 fixture

- Playwright Chromium에서 1440×900, 768×1024, 390×844 viewport를 실행한다.
- 브라우저 네트워크 단계에서 `/api/` 요청만 명시적인 fixture로 처리한다. 인증, 공연·회차, 10개 구역, 선택 구역 200석, hold 성공·409 응답을 제공한다.
- KOPIS, 실제 PG, Kakao Map, 실제 Backend는 호출하지 않는다. 따라서 이 결과는 외부 연동 E2E나 운영 성능 측정이 아니다.

## 검증 계약

1. 로그인된 fixture 사용자가 공연·회차를 선택한다.
2. 서버 소유 구역 버튼 10개와 선택 구역의 선택 가능 좌석 200개만 렌더링된다.
3. 좌석 viewport는 내부 가로 스크롤을 제공한다.
4. hold 성공 뒤 `내가 선택한 좌석`과 countdown을 표시한다.
5. 다음 hold의 HTTP 409은 `다른 사용자가 먼저 선택한 좌석` 피드백으로 끝나며 선택 상태를 만들지 않는다.
6. mobile viewport에서는 상세 영역이 세로 배치가 되어 달력 클릭을 가로채지 않는다.

## 발견·수정

첫 mobile Chromium 실행에서 `detailContainer`의 고정 행 배치와 poster/table/map 폭이 화면을 가로질러, 달력의 오늘 버튼 클릭이 상단 상세 영역에 가로막혔다.

640px 이하에서만 상세 영역을 세로로 전환하고 poster·table·map을 유동 폭으로 바꿨다. 좌석 40px 버튼과 구역·좌석 viewport 내부의 가로 탐색은 유지한다. 전체 사이트를 반응형으로 재설계하거나 실제 공연장 좌석도를 만들지는 않는다.

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| Chromium E2E | desktop·tablet·mobile 3/3 통과 |
| 구역·좌석 계약 | 10개 구역, 선택 구역 200석 |
| hold 흐름 | 성공 후 소유 좌석 표시, 409 후 선택 상태 미생성 |
| 기존 단위 테스트 | `e2e/`를 Vitest 탐색에서 분리해 runner 경계 유지 |
| production build | 성공 |
| 변경 JavaScript lint | 성공 |

## 실행

```powershell
npm.cmd run test:e2e:reservation
```

처음 한 번은 `npx.cmd playwright install chromium`으로 로컬 Chromium을 내려받아야 한다. Playwright 결과물은 저장소에 커밋하지 않는다.

## 한계

- fixture는 HTTP 계약과 화면 반응을 재현할 뿐, local Backend·MariaDB를 포함한 실제 FE–BE E2E는 아니다. 해당 경로는 Frontend #24 통합 테스트가 별도로 다룬다.
- 이 테스트는 실제 모바일 기기·네트워크 품질·접근성 전수 검사·운영 성능을 주장하지 않는다.
- WebSocket, virtualization, queue, 실제 PG는 이 근거만으로 도입하지 않는다.
