# Frontend 예매 흐름과 검증 기준선

## 1. 목적

Backend에서 좌석 점유·만료, 검증 결제와 멱등성 계약을 구현했지만 현재 Frontend는 2024년의 화면·결제 흐름을 유지한다. 기능을 곧바로 연결하기 전에 현재 코드와 실행 결과를 기준선으로 고정하고, 외부 연동 없이 회귀 검증할 수 있는 최소 환경을 만든다.

## 2. 현재 기술 구성

- React 18, React Router 6, Vite 5, JavaScript
- Axios, MUI·MUI X, Sass, styled-components
- Context API 기반 로그인 상태
- 브라우저에서 Kakao Map과 아임포트 스크립트를 동적 로드
- Vercel SPA rewrite 설정은 남아 있으나 현재 배포는 중단된 상태

## 3. 현재 예매 흐름

1. `ConcertReservation.jsx`가 공연·달력·회차 좌석을 Backend에서 조회한다.
2. 화면 좌석 배치는 A1~C8의 24석으로 하드코딩되어 있고 API의 `seatNumber`를 여기에 매핑한다.
3. `reserved=true`만 예약 불가로 표시하며 `availability`, `holdExpiresAt`은 사용하지 않는다.
4. 좌석 클릭은 `selectedSeats`와 로컬 seat status만 바꾸며 서버 점유를 만들지 않는다.
5. 결제 수단을 고르면 route state로 가격·공연명·예약 payload를 결제 페이지에 전달한다.
6. `Payment.jsx`와 `PaymentInosis.jsx`는 아임포트 callback이 성공하면 legacy `/main/detail/{concertId}/reservation`을 호출한다.

따라서 다른 사용자가 같은 좌석을 선택 중이라는 상태, 점유 만료, 409 충돌, 검증된 결제 금액과 멱등 key가 사용자 흐름에 연결되지 않는다.

## 4. 수정 전 실행 기준선

| 항목 | 명령 | 결과 |
| --- | --- | --- |
| 의존성 설치 | `npm.cmd ci` | 성공 |
| production build | `npm.cmd run build` | 수정 전 성공·JS chunk 552.07kB, 테스트 도구 구성 후 clean install 기준 552.11kB 경고 |
| lint | `npm.cmd run lint` | 실패, 98 errors·5 warnings |
| test | 해당 없음 | script·runner·test 모두 부재 |
| 운영 의존성 audit | `npm.cmd audit --omit=dev` | 11건: moderate 4·high 6·critical 1 |

lint 오류는 prop validation, 미사용 import·변수, Hook dependency, JSX 문자 규칙 등에 넓게 분산돼 있다. 이번 기준선 Issue에서 일괄 수정하면 기능 변경 검토와 섞이므로 별도 품질 Issue로 분리한다.

audit 결과에는 axios·react-router 계열과 transitive dependency가 포함된다. 자동 `npm audit fix --force`는 호환성과 기존 동작을 깨뜨릴 수 있으므로 실행하지 않고 direct/transitive 영향과 upgrade 경로를 별도로 검증한다.

## 5. 이번 검증 환경

- Node 20과 `npm ci`로 lockfile을 재현한다.
- Vitest·jsdom·React Testing Library를 고정 버전의 개발 의존성으로 사용한다.
- 첫 smoke test는 외부 I/O가 없는 `LoginBtn`의 label과 click 위임만 검증한다.
- CI는 test와 production build를 필수로 실행한다.
- lint도 실행하지만 기존 98건이 정리되기 전까지는 명시적인 non-blocking 기준선으로 둔다.

테스트는 아임포트, Kakao Map, 실제 Backend, KOPIS를 호출하지 않는다. 후속 예매 테스트에서는 Axios와 외부 SDK를 명시적으로 mock해야 한다.

## 6. 후속 전환 순서

1. 좌석 조회에서 `AVAILABLE`, `HELD`, `RESERVED`와 만료 시각을 표현한다.
2. 선택·선택 해제·페이지 이탈을 점유·해제 API와 연결한다.
3. TTL countdown과 409 충돌 후 좌석 새로고침을 연결한다.
4. 외부 결제 callback 뒤 검증 결제·멱등 예약 계약을 사용한다.
5. FE 전환 완료 뒤 Backend의 legacy 무점유 예약 허용 제거를 검토한다.
6. mock 기반 FE 회귀 후 로컬 Backend·Frontend 통합 E2E를 구성한다.

## 7. 한계

- 이번 Issue는 테스트 가능한 경계를 만드는 작업이며 좌석 점유 기능 자체를 연결하지 않는다.
- build 성공은 예매 기능의 정상 동작이나 브라우저 호환성을 증명하지 않는다.
- audit 건수는 2026-08-31의 advisory DB 기준이며 실제 사용 경로·브라우저 노출 여부 분석 전에는 취약점 해결 완료 또는 직접 악용 가능하다고 단정하지 않는다.
- README 화면과 프로젝트 소개는 보존하며 Phase가 정리된 뒤 실제 코드에 맞춰 갱신한다.

## 8. 연결

- [Frontend Issue #2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2)
- [Backend Issue #63](https://github.com/SKUWooU/TicketOnBoarding_Be/issues/63)
- [Backend Issue #65](https://github.com/SKUWooU/TicketOnBoarding_Be/issues/65)
- [개선 근거 연결표](EVIDENCE_MAP.md)
