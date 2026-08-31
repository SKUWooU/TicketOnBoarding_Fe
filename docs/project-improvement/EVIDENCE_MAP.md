# 개선 근거 연결표

| 문제 | 확인 근거 | 후속 개선 | 검증 | Issue/PR |
| --- | --- | --- | --- | --- |
| FE에 협업·검증 기준선이 없음 | `.github`, test script, workflow 부재 | Backend 동일 template과 Vitest·CI 구성 | install·build·test 및 legacy lint 실행 | FE #2 / PR #3 |
| 좌석 선택이 서버 점유와 연결되지 않음 | `ConcertReservation.jsx`의 24석·로컬 `selectedSeats` | 점유·해제·만료 UI 연동 | Backend 응답 mock과 409·TTL 테스트 | 후속 Issue |
| 결제 callback이 legacy 예약을 직접 호출 | `Payment.jsx`, `PaymentInosis.jsx` | 검증 결제·멱등 key 흐름으로 전환 | 중복 callback·응답 유실 fixture | 후속 Issue |
| 운영 의존성에 critical·high 경로가 존재 | 2026-08-31 `npm audit --omit=dev`: 11건 | 현재 major 내 direct·transitive 호환 upgrade | 운영 audit 2 moderate·network 없는 호환성 test·build·CI | FE #6 / PR #7 |
| 중단한 Vercel 자동 배포와 종료된 Backend proxy 설정이 남음 | PR #3 Preview check, `vercel.json`, `vercel.config` | Dashboard Git disconnect와 저장소 설정 제거 | PR #5 Vercel check 부재·local test·build·CI | FE #4 / PR #5 |
