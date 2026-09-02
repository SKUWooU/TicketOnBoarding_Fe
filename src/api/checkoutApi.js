import axiosBackend from "../AxiosConfig";

const requestOptions = (idempotencyKey) => ({
  withCredentials: true,
  headers: { "Idempotency-Key": idempotencyKey },
});

export async function prepareCheckout(
  concertId,
  reservationData,
  idempotencyKey,
) {
  const response = await axiosBackend.post(
    `/main/detail/${concertId}/checkouts`,
    reservationData,
    requestOptions(idempotencyKey),
  );

  return response.data;
}

export async function confirmVerifiedReservation(
  concertId,
  merchantUid,
  reservationData,
  paymentId,
  idempotencyKey,
) {
  const response = await axiosBackend.post(
    `/main/detail/${concertId}/checkouts/${merchantUid}/verified-reservation`,
    { ...reservationData, paymentId },
    requestOptions(idempotencyKey),
  );

  return response.data;
}
