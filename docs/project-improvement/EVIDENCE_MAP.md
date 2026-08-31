# 개선 근거 연결표

| 문제 | 확인 근거 | 후속 개선 | 검증 | Issue/PR |
| --- | --- | --- | --- | --- |
| FE에 협업·검증 기준선이 없음 | `.github`, test script, workflow 부재 | Backend 동일 template과 Vitest·CI 구성 | install·build·test 및 legacy lint 실행 | FE #2 / PR #3 |
| 좌석 선택이 서버 점유와 연결되지 않음 | `ConcertReservation.jsx`의 24석·로컬 `selectedSeats` | 점유·해제·만료 UI 연동 | Backend 응답 mock과 409·TTL 테스트 | 후속 Issue |
| 결제 callback이 legacy 예약을 직접 호출 | `Payment.jsx`, `PaymentInosis.jsx` | 검증 결제·멱등 key 흐름으로 전환 | 중복 callback·응답 유실 fixture | 후속 Issue |
| 의존성 보안 부채가 불명확함 | 2026-08-31 `npm audit --omit=dev`: 11건 | direct/transitive 영향 분석 후 호환 upgrade | audit·build·test 회귀 | 후속 Issue |
