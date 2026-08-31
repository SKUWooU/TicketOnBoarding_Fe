# ADR-0001: 로컬 우선 검증과 공개 배포 보류

- 상태: Accepted
- 결정일: 2026-08-31
- 관련 Issue: Frontend #4

## 맥락

2024년 시연을 위해 Frontend는 Vercel, Backend는 별도 도메인과 인프라에 연결됐다. 현재 공개 서비스 운영이 목적이 아니며, 로컬 MariaDB·Backend·Frontend에서 좌석 점유·예약·결제 정합성과 부하 근거를 만드는 것이 우선이다.

Frontend 저장소에는 Vercel SPA fallback용 `vercel.json`과 종료된 `nginx.onboardingticket.shop`으로 모든 경로를 전달하는 `vercel.config`가 남아 있었다. Vercel Git 연결도 PR마다 Preview deployment를 생성해 현재 검증 범위와 관계없는 외부 상태와 알림을 만들었다.

## 결정

- 사용자가 Vercel Dashboard에서 Frontend 프로젝트의 Git repository 연결을 해제한다.
- 저장소의 Vercel 전용 rewrite와 종료된 Backend proxy 설정을 제거한다.
- 개발·회귀 검증은 로컬 실행과 GitHub Actions를 기준으로 한다.
- Vercel 프로젝트, 과거 deployment, 계정 domain과 환경변수를 삭제했다고 간주하지 않는다.
- 도메인 자동 갱신·DNS와 Backend 인프라 정리는 소유권·비용을 확인한 별도 외부 작업으로 둔다.

## 결과

- push와 PR이 Vercel Preview 또는 production deployment를 자동 생성하지 않는다.
- 로컬 build 결과와 GitHub Actions만 필수 검증 신호로 남는다.
- 현재 저장소만으로 과거 Vercel 배포를 즉시 재현할 수는 없다.

## 재도입 조건

다음 조건이 생기면 별도 Issue와 승인 후 hosting을 다시 선택한다.

- 외부 사용자가 접근할 시연 환경이 필요하다.
- 로컬 E2E만으로 검증할 수 없는 HTTPS·cookie·OAuth callback 요구가 생긴다.
- Backend 공개 endpoint와 CORS·domain·secret 관리 계획이 확정된다.
- 비용 한도, 자동 배포 branch, Preview 공개 범위와 rollback 정책을 정의할 수 있다.

Vercel을 다시 선택한다면 React Router deep link가 404가 되지 않도록 SPA fallback 설정을 새 환경에 맞게 복원해야 한다. 과거 `nginx.onboardingticket.shop` 주소는 재사용하지 않는다.
