# 작업 진행 기록

Frontend 저장소의 현재 작업과 완료 이력만 요약합니다. 상세 근거는 `docs/project-improvement`와 `EVIDENCE_MAP.md`를 따릅니다.

## 진행 중

### Frontend Issue #15 — Checkout FE·BE 통합 계약 테스트

- Issue: [#15](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/15)
- Branch: `test/15-checkout-backend-e2e`
- PR: [#16](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/16)
- 상태: 구현·실제 로컬 Backend 연속 2회 검증 완료, Reviewer 검토 대기
- 범위: 실제 로컬 Backend의 hold·Checkout·검증 예약과 Payment 화면 계약
- 제외: 실제 PG·외부 API, 24석 UI 변경, 2,000석 전체 렌더링, Backend 코드 변경
- 검증: 기본 53 tests·build 통과, 통합 계약 test 독립 2회 통과, 변경 lint 0

## 완료

| Issue                                                           | 결과                                                        | 검증                                             | PR / squash commit                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [#12](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/12) | Checkout·검증 예약, 멱등 재시도, 결제 불명 상태 재결제 차단 | 53 tests·build·CI, 변경 lint 0                   | [PR #13](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/13) / `a760e060feb8dac54c220c555370300473f1ffe2` |
| [#10](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/10) | 좌석 선택의 서버 hold·해제, 내 점유 countdown·오류 복구     | 35 tests·build·CI, 변경 lint 오류 0              | [PR #11](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/11) / `4a8b1f62f27c9b1c42fbf7e8b79c03fcaa832a20` |
| [#8](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/8)   | 좌석 enum 표시·만료 안내·회차 상태 초기화                   | 16 tests·build·CI, lint 기준선 불변              | [PR #9](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/9) / `46f28bd4d7c20b2ee6e95f0436145c4bc5a241e6`   |
| [#6](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/6)   | current-major 의존성 호환 upgrade, 운영 audit 11→2 moderate | 3 tests·build·CI, lint 98 errors·5 warnings 불변 | [PR #7](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/7) / `8af49ba8d19cf27bbfea8ca8dfc5403e3fa67151`   |
| [#4](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/4)   | Vercel Git 연결·레거시 배포 설정 제거                       | test·build·CI, Vercel check 부재                 | [PR #5](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/5) / `7c96eae30f57030f87285fe07a866a1390be96ab`   |
| [#2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2)   | 협업 template·Vitest·Frontend CI 기준선 구성                | clean install·test·build                         | [PR #3](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/3) / `0b6c49d23f09384bb05e9214a501e9b54091e36d`   |
