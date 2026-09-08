# 작업 진행 기록

Frontend 저장소의 현재 작업과 완료 이력만 요약합니다. 상세 근거는 `docs/project-improvement`와 `EVIDENCE_MAP.md`를 따릅니다.

## 진행 중

### Frontend Issue #18 — 가상 공연장 좌석 layout 기준선

- Issue: [#18](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/18)
- Branch: `research/18-seat-layout-baseline`
- PR: [#19](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/19)
- 상태: FE·BE 계약 조사·규모별 렌더링 3회 측정·회귀 검증 완료, Reviewer 검토 대기
- 범위: 24·2,000석 하드코딩 대조, 24·200·500·2,000석 로컬 측정, 후속 layout 계약 제안
- 제외: 운영 UI·Backend 코드, 외부 API, WebSocket·대기열·실제 PG
- 결과: 24→2,000석 initial 20.36→492.98ms, 상태 rerender 포함 23.03→880.06ms(jsdom 독립 3회 중앙)
- 검증: 12 files·56 tests·build 통과, 측정 파일 lint 0, 전체 lint 기존 95 errors·2 warnings 유지

## 완료

| Issue                                                           | 결과                                                        | 검증                                             | PR / squash commit                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [#15](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/15) | 실제 로컬 Backend·MariaDB Checkout 통합 계약 검증           | 53 tests·build·CI, 통합 test 독립 2회 통과       | [PR #16](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/16) / `6d4ae2fed77f1686f12dc887281ce30b35543329` |
| [#12](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/12) | Checkout·검증 예약, 멱등 재시도, 결제 불명 상태 재결제 차단 | 53 tests·build·CI, 변경 lint 0                   | [PR #13](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/13) / `a760e060feb8dac54c220c555370300473f1ffe2` |
| [#10](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/10) | 좌석 선택의 서버 hold·해제, 내 점유 countdown·오류 복구     | 35 tests·build·CI, 변경 lint 오류 0              | [PR #11](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/11) / `4a8b1f62f27c9b1c42fbf7e8b79c03fcaa832a20` |
| [#8](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/8)   | 좌석 enum 표시·만료 안내·회차 상태 초기화                   | 16 tests·build·CI, lint 기준선 불변              | [PR #9](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/9) / `46f28bd4d7c20b2ee6e95f0436145c4bc5a241e6`   |
| [#6](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/6)   | current-major 의존성 호환 upgrade, 운영 audit 11→2 moderate | 3 tests·build·CI, lint 98 errors·5 warnings 불변 | [PR #7](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/7) / `8af49ba8d19cf27bbfea8ca8dfc5403e3fa67151`   |
| [#4](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/4)   | Vercel Git 연결·레거시 배포 설정 제거                       | test·build·CI, Vercel check 부재                 | [PR #5](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/5) / `7c96eae30f57030f87285fe07a866a1390be96ab`   |
| [#2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2)   | 협업 template·Vitest·Frontend CI 기준선 구성                | clean install·test·build                         | [PR #3](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/3) / `0b6c49d23f09384bb05e9214a501e9b54091e36d`   |
