# 작업 진행 기록

이 문서는 Frontend 저장소의 완료·진행 중 Issue와 검증 상태를 기록하는 단일 진행 상태 원본입니다. Backend 작업은 Backend 저장소의 문서를 원본으로 사용하고 필요한 링크만 교차 기록합니다.

## 저장소 기준선

| 저장소 | 기준 Branch | 조사 기준 commit |
| --- | --- | --- |
| [TicketOnBoarding_Fe](https://github.com/SKUWooU/TicketOnBoarding_Fe) | `main` | `1f9678be7a3a66ec610c6ef4ea335e9d6f5cbafd` |
| [TicketOnBoarding_Be](https://github.com/SKUWooU/TicketOnBoarding_Be) | `main` | `5e09a830ba1f81d12417f7c9952cd5d22c8a8e66` |

## 진행 중

### Frontend Issue #4 — Vercel 자동 배포와 레거시 도메인 설정 정리

- Issue: [#4](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/4)
- Branch: `chore/4-remove-legacy-vercel-config`
- PR: [#5](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/5)
- 상태: 저장소 설정 제거·로컬 검증·Frontend CI·Vercel check 부재 확인 완료, Reviewer Blocking 수정·재검토 준비
- 계획 승인: 완료
- 외부 조치: 사용자가 Vercel Dashboard에서 Frontend 프로젝트의 Git repository 연결을 해제했다. Vercel 프로젝트·배포 기록·도메인 계정·환경변수 삭제는 수행하지 않았다.
- 범위: `vercel.json`, `vercel.config` 제거, 로컬 test·build·CI, 새 PR의 Vercel check 부재 확인, 배포 보류와 재도입 조건 기록
- 제외: 도메인 자동 갱신·DNS, Backend 인프라, README 전면 개편, 새 배포 환경
- 검증: Vitest 1 file·1 test, production build와 PR #5 Frontend CI 통과. 애플리케이션 코드는 변경하지 않았고 PR #3과 달리 PR #5 check 목록에 Vercel Preview·deployment가 생성되지 않아 Git disconnect 반영을 확인했다.

## 완료

### Frontend Issue #2 — 개선 기준선과 검증 환경 구성

- Issue: [#2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2)
- Branch: `chore/2-frontend-improvement-baseline`
- PR: [#3](https://github.com/SKUWooU/TicketOnBoarding_Fe/pull/3)
- squash commit: `0b6c49d23f09384bb05e9214a501e9b54091e36d`
- 상태: 완료
- 계획 승인: 완료
- 확인된 사실: production build는 성공하지만 단일 JS chunk 552.07kB 경고가 있고, 기존 lint는 98 errors·5 warnings로 실패한다. 테스트·CI·`.github` 템플릿은 없었다.
- 예매 흐름: 24석을 화면에 하드코딩하고 선택 상태를 React 메모리에만 보관한다. 외부 결제 성공 callback 이후 legacy 예약 API를 호출하며 Backend의 점유·만료·검증 결제·멱등 계약은 사용하지 않는다.
- 범위: Backend와 동일한 Issue/PR 템플릿, 최소 테스트·CI, 빌드·lint·dependency audit와 예매 흐름 기준선, 후속 BACKLOG
- 제외: 실제 결제·지도·Backend 호출, 좌석 점유 연동, 결제 흐름 교체, 기존 lint 전체 수정, dependency 강제 upgrade, README 전면 개편
- 검증: clean `npm.cmd ci`, Vitest 1 file·1 test, production build 통과. 기존 lint는 수정 전후 동일한 98 errors·5 warnings이며 CI에서 non-blocking 기준선으로 실행한다. `npm audit --omit=dev`는 11건을 보고해 후속 호환 upgrade 대상으로 분리했다.
- Reviewer: 최종 HEAD `e402d1de918eb8a50a2cdc9ffb7ae22844b7c8be`, Blocking 없음, `MERGE_READY: YES`
