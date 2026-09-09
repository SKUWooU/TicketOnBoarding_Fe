# 개선 BACKLOG

BACKLOG는 확정 구현 목록이 아니라 조사와 재현이 필요한 후보입니다. 각 Phase는 선행 Issue의 근거를 확인한 뒤 별도 Issue로 나눕니다.

| Phase    | 문제 또는 목적                                                     | 필요한 근거                                                 | 지금 제외할 것                          | 상태                                                                                                                                  |
| -------- | ------------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 0        | FE 협업·테스트·CI 기준선이 없다                                    | template, build·lint·test 결과, 현재 예매 흐름              | 기능 변경·README 전면 개편              | 완료 ([#2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2))                                                                  |
| 0-DEPLOY | 중단한 Vercel 자동 배포와 종료된 도메인 설정이 저장소에 남아 있다  | Dashboard Git disconnect, PR check, local build·test        | 새 hosting·도메인·DNS 변경              | 완료 ([#4](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/4))                                                                  |
| 1-SEC    | 운영 의존성 audit 11건에 critical·high 경로가 있다                 | direct/transitive dependency와 breaking change 영향         | `audit fix --force`, major 일괄 upgrade | 완료 ([#6](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/6))                                                                  |
| 1-LINT   | 기존 lint 98 errors·5 warnings가 CI 차단 gate가 아니다             | 규칙별 오류 분류와 단계별 감소                              | 무관한 일괄 포맷·규칙 전체 비활성화     | 후보                                                                                                                                  |
| 2        | 좌석 조회가 `reserved`만 사용하고 점유·만료 상태를 표현하지 않는다 | Backend 응답 fixture, AVAILABLE·HELD·RESERVED 렌더링 테스트 | WebSocket·실시간 push                   | 완료 ([#8](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/8))                                                                  |
| 3        | 좌석 선택이 FE 메모리에만 있고 서버 소유권·해제·만료 처리가 없다   | 점유·해제 API mock, 400·401·409·TTL·페이지 이탈 시나리오    | Redis·대기열                            | 완료 ([#10](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/10))                                                                |
| 4        | 외부 결제 성공 뒤 legacy 예약 API를 호출한다                       | 검증 결제·멱등 key 계약, 중복 callback·새로고침 fixture     | 실제 PG 실행                            | 완료 ([#12](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/12), [#13](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/13)) |
| 5        | 예매 사용자 흐름의 저장소 간 회귀 검증이 없다                      | 실제 로컬 Backend를 사용하는 FE·BE 통합 계약 테스트         | 전체 UI E2E·운영 배포·운영 SLA          | 완료 ([#15](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/15), [#16](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/16)) |
| 6        | FE·BE 24석 중복 하드코딩과 2,000석 UI 계약 부재                    | 코드 대조, 24·200·500·2,000석 jsdom 렌더링 측정             | 운영 UI·Backend 변경·virtualization     | 완료 ([#18](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/18), [#19](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/19)) |
| 7        | 서버 소유 구역·행 계약을 실제 좌석 선택 화면이 사용하지 않음       | Backend 구역 API, 2,000석 중 선택 구역 200석 fixture         | 실제 좌석도·전체 상세 반응형·실시간 push | 완료 ([#21](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/21), [PR #22](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/22)) |
| 8        | 실제 Backend 공연 상세부터 좌석 점유까지 화면 단위 회귀가 없음      | local fixture·실제 HTTP·10구역·선택 구역 200석·hold 상태     | Playwright·실제 지도·PG·운영 성능         | 완료 ([#24](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/24), [PR #25](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/25)) |

## 후속 후보

- Backend loadtest `runId` 32자 초과가 500으로 노출되는 입력 오류 계약은 별도 Backend Issue에서 판단
- 실제 Chromium CSS·스크롤·시각 회귀가 필요해질 때만 Playwright 도입 검토
