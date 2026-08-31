# 작업 진행 기록

Frontend 저장소의 현재 작업과 완료 이력만 요약합니다. 상세 근거는 `docs/project-improvement`와 `EVIDENCE_MAP.md`를 따릅니다.

## 진행 중

### Frontend Issue #10 — 서버 임시 점유·해제 연동

- Issue: [#10](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/10)
- PR: [#11](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/11)
- Branch: `feat/10-seat-hold-integration`
- 상태: PR 검증·Reviewer 대기
- 범위: 점유·해제 API, 내 점유 countdown, 400·401·409 복구, local proxy
- 제외: 실제 PG, 새로고침 복구, polling·WebSocket, Backend·README 변경
- 검증: 35 tests·build 통과, 변경 파일 lint 0 errors·1 기존 warning, 전체 lint 기준선 98 errors·5 warnings 불변

## 완료

| Issue                                                         | 결과                                                        | 검증                                             | PR / squash commit                                                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| [#8](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/8) | 좌석 enum 표시·만료 안내·회차 상태 초기화                   | 16 tests·build·CI, lint 기준선 불변              | [PR #9](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/9) / `46f28bd4d7c20b2ee6e95f0436145c4bc5a241e6` |
| [#6](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/6) | current-major 의존성 호환 upgrade, 운영 audit 11→2 moderate | 3 tests·build·CI, lint 98 errors·5 warnings 불변 | [PR #7](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/7) / `8af49ba8d19cf27bbfea8ca8dfc5403e3fa67151` |
| [#4](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/4) | Vercel Git 연결·레거시 배포 설정 제거                       | test·build·CI, Vercel check 부재                 | [PR #5](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/5) / `7c96eae30f57030f87285fe07a866a1390be96ab` |
| [#2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2) | 협업 template·Vitest·Frontend CI 기준선 구성                | clean install·test·build                         | [PR #3](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/3) / `0b6c49d23f09384bb05e9214a501e9b54091e36d` |
