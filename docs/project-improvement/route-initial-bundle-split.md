# 라우트 단위 초기 번들 분리

연결: [Issue #35](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/35)

## 문제

`App.jsx`가 모든 화면을 정적 import했다. 홈 화면 진입에서도 관리자·계정 복구·결제·예매 화면과 그 의존성이 하나의 production entry에 포함됐다.

동일 환경의 build 기준 초기 `index-*.js`는 577.00 kB(gzip 187.78 kB)였다. 이는 Vite build artifact 크기이며 실제 네트워크 전송 시간이나 Core Web Vitals 수치가 아니다.

## 결정

각 page를 `React.lazy`로 전환하고 `Routes`를 `Suspense` fallback으로 감싼다.

- URL과 기존 route component mapping은 유지한다.
- loading 중에는 `role="status"` 메시지를 표시한다.
- 예매 화면은 자체 `LocalizationProvider`를 이미 보유하므로, 기존 `App`의 자식 없는 전역 provider는 제거한다.
- shared dependency를 인위적으로 manual chunk로 고정하지 않는다. Vite가 실제 import graph 기준으로 async chunk를 구성하게 둔다.

## 측정과 검증

환경: Windows 로컬, Vite 5.4.21 production build. 외부 API 호출·운영 CDN 측정 없음.

| 항목 | eager baseline | route lazy 적용 후 |
| --- | ---: | ---: |
| 초기 entry `index-*.js` | 577.00 kB / gzip 187.78 kB | 223.10 kB / gzip 74.97 kB |
| 홈 route `Main` async chunk | entry에 포함 | 68.57 kB / gzip 18.64 kB |
| 예매 route `ConcertReservation` async chunk | entry에 포함 | 184.53 kB / gzip 63.39 kB |

홈 화면 초기 JavaScript는 entry와 `Main` chunk를 함께 요청하므로, gzip artifact 합계는 93.61 kB다. 초기 entry만의 감소율을 실제 LCP·네트워크 개선으로 해석하지 않는다.

다음 검증을 통과했다.

- `npm test`: 15 files, 72 tests
- `npm run build`: async page chunk 생성
- `npx playwright test --config playwright.local-backend.config.js --reporter=list`: local Backend 인증·hold·Checkout 취소·2,000석 snapshot 불변식 E2E 1건
- CI mock Browser E2E는 fixture 날짜와 Chromium timezone을 모두 `Asia/Seoul`로 고정해 자정 부근 UTC·KST 불일치를 제거한다.

## 한계

- 실제 기기, 느린 네트워크, CDN cache, Core Web Vitals와 운영 사용자 행동은 측정하지 않았다.
- 모든 route를 한 번에 미리 가져오거나 manual chunk 규칙을 추가하지 않았다.
- 이 변경은 page code 전달 시점을 분리한 것이며, 2,000석 화면 내부 렌더링 비용의 재측정은 별도 근거가 필요하다.
