# 개선 BACKLOG

BACKLOG는 확정 구현 목록이 아니라 조사와 재현이 필요한 후보입니다. 각 Phase는 선행 Issue의 근거를 확인한 뒤 별도 Issue로 나눕니다.

| Phase | 문제 또는 목적 | 필요한 근거 | 지금 제외할 것 | 상태 |
| --- | --- | --- | --- | --- |
| 0 | FE 협업·테스트·CI 기준선이 없다 | template, build·lint·test 결과, 현재 예매 흐름 | 기능 변경·README 전면 개편 | 완료 ([#2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2)) |
| 0-DEPLOY | 중단한 Vercel 자동 배포와 종료된 도메인 설정이 저장소에 남아 있다 | Dashboard Git disconnect, PR check, local build·test | 새 hosting·도메인·DNS 변경 | 진행 중 ([#4](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/4)) |
| 1 | 기존 lint 98 errors·5 warnings와 운영 의존성 audit 11건이 남아 있다 | 규칙별 오류 분류, direct/transitive dependency와 breaking change 영향 | `audit fix --force`, 무관한 일괄 포맷 | 후보 |
| 2 | 좌석 조회가 `reserved`만 사용하고 점유·만료 상태를 표현하지 않는다 | Backend 응답 fixture, AVAILABLE·HELD·RESERVED 렌더링 테스트 | WebSocket·실시간 push | 후보 |
| 3 | 좌석 선택이 FE 메모리에만 있고 서버 소유권·해제·만료 처리가 없다 | 점유·해제 API mock, 409·TTL·페이지 이탈 시나리오 | Redis·대기열 | 후보 |
| 4 | 외부 결제 성공 뒤 legacy 예약 API를 호출한다 | 검증 결제·멱등 key 계약, 중복 callback·새로고침 fixture | 실제 PG 실행 | 후보 |
| 5 | 예매 사용자 흐름의 저장소 간 회귀 검증이 없다 | mock E2E 후 로컬 BE/FE 통합 E2E | 운영 배포·운영 SLA | 후보 |

## 다음 기술 Issue 후보

`✨ [FEAT] 좌석 조회의 점유·만료 상태 표시`

- Backend `availability`, `holdExpiresAt` 응답 fixture
- AVAILABLE·HELD·RESERVED 표시와 클릭 가능 여부
- 현재 사용자의 점유 여부를 노출하지 않는 서버 계약 유지
- 외부 결제·지도·실제 Backend 호출 없이 컴포넌트 테스트
