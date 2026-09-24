# 작업 진행 기록

Frontend 저장소의 현재 작업과 완료 이력만 요약합니다. 상세 근거는 `docs/project-improvement`와 `EVIDENCE_MAP.md`를 따릅니다.

## 진행 중

- 없음

## 완료

| Issue                                                           | 결과                                                        | 검증                                             | PR / squash commit                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [#45](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/45) | keyboard hold refresh 뒤 선택 좌석 focus 복원·Checkout 취소 E2E | local Chromium 2건·component 4건·lint·build | PR 대기 |
| [#43](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/43) | Hook 의존성 선언·lint quality gate 통과                    | lint·72 tests·build·CI                          | [PR #44](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/44) / `818cf066b26f156c4d51e3f71fbd8baa584bc1b9` |
| [#41](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/41) | JSX·정규식 lint errors 제거                                | 72 tests·build·CI                               | [PR #42](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/42) / `0f00784693398f69ea8e515f72d9be8ef7893cf6` |
| [#39](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/39) | 미사용 선언 제거·lint 기준선 감소                          | 72 tests·build·CI                               | [PR #40](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/40) / `bd6419394ab30a41acfd235a60ff7cebb7593a03` |
| [#37](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/37) | 공용 컴포넌트 13개 props 계약·lint 기준선 감소              | 72 tests·build·CI                               | [PR #38](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/38) / `438a8c00d2c22962926c4302e37b195b625115d4` |
| [#35](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/35) | route lazy loading·초기 entry 전달 범위 분리               | 72 tests·mock Browser 3건·local Browser 1건·CI  | [PR #36](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/36) / `cc3dccccc0bdc85b3c3f12c1f93255f627740a17` |
| [#33](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/33) | fixture JWT의 실제 `/auth/valid`·Chromium 취소 흐름 검증    | local Chromium 1건·72 tests·build·CI            | [PR #34](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/34) / `e977f8231445faa77cf55565ce1b1242366f20cc` |
| [#31](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/31) | local Chromium hold·Checkout 취소·fixture 불변식 E2E        | Chromium 1건·mock Chromium 3건·72 tests·CI      | [PR #32](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/32) / `4d2ac7a3e323732c7f976642a2edcbb42b3493ec` |
| [#29](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/29) | `READY` Checkout 취소·점유 해제·검증 중 경합 차단          | 72 tests·local 2,000석 통합 2건·build·CI        | [PR #30](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/30) / `0d35e1e8233e30d966e11b5ea79b2c62a6d1628d` |
| [#27](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/27) | Chromium E2E·mobile 상세 유동 폭·외부 호출 차단            | Chromium 3 viewport·CI·build·변경 lint          | [PR #28](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/28) / `53a1f447c4f2f991006a467e358a896e25bc3227` |
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
