# 작업 진행 기록

Frontend 저장소의 현재 작업과 완료 이력만 요약합니다. 상세 근거는 `docs/project-improvement`와 `EVIDENCE_MAP.md`를 따릅니다.

## 진행 중

### Frontend Issue #8 — 좌석 상태 표시

- Issue: [#8](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/8)
- PR: [#9](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/9)
- Branch: `feat/8-seat-availability-display`
- 상태: 구현·로컬 fixture 검증·PR #9 Frontend CI 완료, Reviewer 검토 중
- 범위: `AVAILABLE`·`HELD`·`RESERVED` 표시, 만료 안내, 선택 방지와 회차 전환 초기화
- 제외: 점유 POST/DELETE, 결제 연동, polling·WebSocket, Backend·README 변경
- 검증: Vitest 5 files·16 tests, production build·Frontend CI 통과, lint 98 errors·5 warnings 불변

## 완료

| Issue                                                         | 결과                                                        | 검증                                             | PR / squash commit                                                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| [#6](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/6) | current-major 의존성 호환 upgrade, 운영 audit 11→2 moderate | 3 tests·build·CI, lint 98 errors·5 warnings 불변 | [PR #7](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/7) / `8af49ba8d19cf27bbfea8ca8dfc5403e3fa67151` |
| [#4](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/4) | Vercel Git 연결·레거시 배포 설정 제거                       | test·build·CI, Vercel check 부재                 | [PR #5](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/5) / `7c96eae30f57030f87285fe07a866a1390be96ab` |
| [#2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2) | 협업 template·Vitest·Frontend CI 기준선 구성                | clean install·test·build                         | [PR #3](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/3) / `0b6c49d23f09384bb05e9214a501e9b54091e36d` |
