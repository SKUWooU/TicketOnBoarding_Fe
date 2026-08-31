# Frontend 운영 의존성 취약점 호환 업그레이드

## 1. 목적

Frontend 최초 기준선에서 운영 dependency graph에 moderate 4·high 6·critical 1, 전체 graph에 moderate 6·high 15·critical 2가 보고됐다. 전체 최신화나 `npm audit fix --force`를 사용하지 않고 현재 React 18·Router 6·Vite 5 구조를 유지하는 범위에서 제거 가능한 경로를 먼저 정리한다.

audit 결과는 2026-08-31 npm advisory DB와 현재 lockfile 기준이다. 개수만으로 실제 브라우저 악용 가능성이나 운영 침해를 단정하지 않으며, package 경로와 실행 조건을 함께 본다.

## 2. 변경 버전

| Direct dependency | 변경 전 lock | 변경 후 | major 유지 |
| --- | ---: | ---: | --- |
| Axios | 1.7.2 | 1.20.0 | Yes |
| React Router DOM | 6.23.1 | 6.30.6 | Yes |
| styled-components | 6.1.11 | 6.5.3 | Yes |
| Vite | 5.2.12 | 5.4.21 | Yes |

non-force fix로 `@babel/runtime`, `@remix-run/router`, `follow-redirects`, `form-data`, PostCSS, nanoid, yaml 등 lockfile의 transitive dependency도 안전 버전으로 갱신했다. 애플리케이션 API·화면·라우트 정의는 변경하지 않았다.

## 3. audit 전후

| 범위 | 변경 전 | 변경 후 |
| --- | --- | --- |
| `npm audit --omit=dev` | 11: moderate 4·high 6·critical 1 | 2: moderate 2 |
| 전체 `npm audit` | 23: moderate 6·high 15·critical 2 | 6: moderate 4·high 1·critical 1 |

운영 graph의 critical·high 경로는 제거됐다. 남은 운영 moderate 2건은 React Router 6.x 전체에 대한 advisory이며 npm이 제시하는 fix는 Router 7.18.3 major 전환이다.

전체 graph의 잔여 package는 다음과 같다.

- `react-router`, `react-router-dom`: Router 7 전환 필요
- `esbuild`, `vite`: Vite 8 전환 필요
- `vite-node`, `vitest`: Vitest 4 전환 필요

Vitest는 CI의 `vitest run`과 로컬 단발 테스트에만 사용하며 UI server를 열지 않는다. Vite 개발 서버도 공개 network에 배포하지 않는다. 이것이 취약점을 해결한다는 뜻은 아니며, 노출 범위를 제한한 상태에서 major migration을 후속 판단으로 보류한 것이다.

## 4. 검증 경계

- Axios는 custom adapter fixture를 사용해 실제 network 없이 request·response 호환성을 확인한다.
- React Router 6는 `MemoryRouter`에서 styled `Link` 이동과 route render를 확인한다.
- styled-components는 테스트 DOM에서 Router Link wrapping이 유지되는지 함께 확인한다.
- 기존 `LoginBtn` smoke test를 유지한다.
- clean install 이후 test·production build·lint 기준선과 CI를 확인한다.

React Router 6.30.6은 테스트에서 v7의 `startTransition`·relative splat 동작 변경을 알리는 future flag warning을 출력한다. 이번 Issue는 Router 6의 현재 동작을 보존하므로 flag를 선제 활성화하지 않고 Router 7 migration 근거로 남긴다.

production JS bundle은 clean install 기준 552.11kB(gzip 178.24kB)에서 567.56kB(gzip 183.23kB)로 증가했다. test dependency가 production bundle에 들어간 결과는 아니며 runtime dependency 갱신 뒤 생성된 차이다. 보안 호환 업그레이드를 되돌릴 근거로 사용하지 않되, 이후 route code splitting 기준선에 포함한다.

실제 Backend, OAuth, 아임포트, Kakao Map, KOPIS는 호출하지 않는다.

## 5. 보류한 major 전환 조건

Router 7·Vite 8·Vitest 4는 다음 조건에서 별도 Issue로 검토한다.

- 좌석·결제 Frontend 회귀 테스트가 주요 route와 async 상태를 충분히 보호한다.
- Node engine, Vite plugin, Vitest config와 React Router migration 영향을 조사한다.
- 개발 서버를 외부 network에 열거나 Vitest UI를 사용할 요구가 생긴다.
- 현재 moderate 잔여 위험보다 migration 회귀 위험을 낮출 수 있다.

React 19·MUI 9 전환은 이번 보안 경로의 필수 조건이 아니므로 포함하지 않는다.

## 6. 한계

- audit는 dependency metadata 기반이며 실제 사용 경로의 정적·동적 도달 가능성 분석이 아니다.
- 단순 호환성 test와 build 성공은 전체 화면 회귀를 증명하지 않는다.
- advisory DB가 갱신되면 같은 lockfile의 건수와 severity가 달라질 수 있다.
- 기존 lint 98 errors·5 warnings는 별도 품질 Issue 대상이다.
- 기존과 동일하게 500kB를 넘는 단일 JS chunk 경고가 남아 있으며 이번 Issue에서 code splitting은 수행하지 않는다.

## 7. 연결

- [Frontend Issue #2](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/2)
- [Frontend Issue #6](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/6)
- [개선 근거 연결표](EVIDENCE_MAP.md)
