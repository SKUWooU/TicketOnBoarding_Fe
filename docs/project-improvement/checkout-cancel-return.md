# Checkout 취소 후 좌석 선택 복귀

## 문제

좌석을 임시 점유한 뒤 Checkout을 준비하면, 결제 화면의 기존 “좌석 선택으로 돌아가기” 동작은 서버 Checkout을 취소하지 않고 화면만 이동했다. 이 경우 `READY` Checkout과 활성 좌석 귀속이 만료 전까지 남으며, 사용자가 명시적으로 결제를 포기한 의도와 서버 상태가 일치하지 않았다.

## 결정

좌석 선택 복귀는 `READY` 상태에서만 Backend의 Checkout 취소 API를 호출한다.

```text
Payment 화면
  → DELETE /main/detail/{concertId}/checkouts/{merchantUid}
  → Backend가 Checkout을 CANCELED로 전이하고 활성 좌석 귀속·hold 해제
  → FE가 sessionStorage Checkout을 제거
  → 좌석 선택 화면으로 이동
```

`CANCELED` 응답은 Backend에서 멱등적으로 처리한다. 따라서 사용자가 취소를 재시도해도 별도 좌석 해제 요청을 만들지 않는다.

## 실패 정책

- 취소 성공을 `status: CANCELED`로 확인하기 전에는 session을 지우거나 좌석 선택 화면으로 이동하지 않는다.
- 네트워크 오류는 결과를 알 수 없으므로 결제 화면과 Checkout session을 유지한다. 사용자는 재시도하거나 상태를 확인해야 한다.
- `409`는 결제 검증 진행 또는 상태 변경 가능성이므로 재결제를 유도하지 않는다.
- `401`은 session을 보존한 채 로그인으로 이동한다.
- `410`은 서버가 만료를 확정한 경우로 기록하고, 이후 좌석 선택 화면으로 복귀할 수 있게 한다.
- `PAYMENT_*`처럼 결과가 미확정인 상태에서는 취소·복귀를 막는다. 결제 결과를 확인하기 전에 점유를 풀면 안 되기 때문이다.
- 취소 요청이 진행 중인 동안에는 결제 확정 버튼과 handler를 함께 차단한다. 같은 `READY` Checkout에 취소와 결제 검증 요청이 경합하면 안 된다.

## 검증 범위

- API client: 인증 cookie를 포함한 `DELETE` 경로 확인
- Payment: `READY → CANCELED → session 제거 → 좌석 선택 이동`
- Payment: 네트워크 오류 시 session과 화면 유지
- Payment: 결제 결과 미확정 상태에서 취소 호출 차단
- local Backend·MariaDB fixture: 가상 2,000석에서 hold → Checkout → Payment 취소 후 hold·예약·결제 row가 모두 0인 snapshot 확인

실제 PG·KOPIS 호출은 포함하지 않는다. Backend의 기존 Checkout 취소 계약과 frontend fixture를 검증 대상으로 한다.
