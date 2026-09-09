# 작업 진행 기록

Frontend 저장소의 현재 작업과 완료 이력만 요약합니다. 상세 근거는 `docs/project-improvement`와 `EVIDENCE_MAP.md`를 따릅니다.

## 진행 중

- 없음

## 완료

| Issue                                                           | 결과                                                        | 검증                                             | PR / squash commit                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [#24](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/24) | 실제 Backend 상세·회차·10구역·200석·hold 화면 계약          | 통합 1개·기존 Checkout·67 tests·build·CI         | [PR #25](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/25) / `c2f5e6be4ad131d2c51d0baa13ac3c0a52ce5e3e` |
| [#21](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/21) | 구역 요약·선택 구역 200석·stale 차단·반응형 좌석 탐색       | 67 tests·build·CI, 로컬 API·3 viewport 측정      | [PR #22](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/22) / `f5a133e126b7b9d1998b013f86de12aeb8aa049c` |
| [#18](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/18) | 24·2,000석 계약 차이·렌더링 기준선·layout ADR               | 56 tests·build·CI, jsdom benchmark 3회           | [PR #19](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/19) / `49a348040c6fa2ec204f42ef457eeaf87ff68685` |
| [#15](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/15) | 실제 로컬 Backend·MariaDB Checkout 통합 계약 검증           | 53 tests·build·CI, 통합 test 독립 2회 통과       | [PR #16](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/16) / `6d4ae2fed77f1686f12dc887281ce30b35543329` |
| [#12](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/12) | Checkout·검증 예약, 멱등 재시도, 결제 불명 상태 재결제 차단 | 53 tests·build·CI, 변경 lint 0                   | [PR #13](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/13) / `a760e060feb8dac54c220c555370300473f1ffe2` |
| [#10](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/10) | 좌석 선택의 서버 hold·해제, 내 점유 countdown·오류 복구     | 35 tests·build·CI, 변경 lint 오류 0              | [PR #11](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/11) / `4a8b1f62f27c9b1c42fbf7e8b79c03fcaa832a20` |
| [#8](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/8)   | 좌석 enum 표시·만료 안내·회차 상태 초기화                   | 16 tests·build·CI, lint 기준선 불변              | [PR #9](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/9) / `46f28bd4d7c20b2ee6e95f0436145c4bc5a241e6`   |
| [#6](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/6)   | current-major 의존성 호환 upgrade, 운영 audit 11→2 moderate | 3 tests·build·CI, lint 98 errors·5 warnings 불변 | [PR #7](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/7) / `8af49ba8d19cf27bbfea8ca8dfc5403e3fa67151`   |
| [#4](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/4)   | Vercel Git 연결·레거시 배포 설정 제거                       | test·build·CI, Vercel check 부재                 | [PR #5](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/5) / `7c96eae30f57030f87285fe07a866a1390be96ab`   |
| [#2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2)   | 협업 template·Vitest·Frontend CI 기준선 구성                | clean install·test·build                         | [PR #3](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/3) / `0b6c49d23f09384bb05e9214a501e9b54091e36d`   |
