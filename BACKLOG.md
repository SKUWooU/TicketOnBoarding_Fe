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
| 6        | FE·BE 24석 중복 하드코딩과 2,000석 UI 계약 부재                    | 코드 대조, 24·200·500·2,000석 jsdom 렌더링 측정             | 운영 UI·Backend 변경·virtualization     | 조사·측정 중 ([#18](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/18))                                                        |

## 다음 기술 Issue 후보

`✨ [FEAT/BE] 가상 공연장 layout·구역별 좌석 API 계약`

- Backend가 layout version·구역·행·열·표시 순서를 명시적으로 제공
- 구역별 전체·잔여 좌석 요약과 선택 구역 상세 좌석 응답 분리
- 일반 가상 좌석과 2,000석 loadtest fixture의 목적·profile 격리
- 변경된 계약을 기준으로 Frontend 구역 UI를 별도 Issue에서 연결
