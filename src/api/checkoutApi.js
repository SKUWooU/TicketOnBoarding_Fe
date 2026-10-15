import axiosBackend from "../AxiosConfig";
import { admissionHeaders } from "./admissionApi";

const requestOptions = (idempotencyKey) => ({
  withCredentials: true,
  headers: { "Idempotency-Key": idempotencyKey },
});

export async function prepareCheckout(
  concertId,
  reservationData,
  idempotencyKey,
  admissionToken,
) {
  const response = await axiosBackend.post(
    `/main/detail/${concertId}/checkouts`,
    reservationData,
    { ...requestOptions(idempotencyKey), headers: { ...requestOptions(idempotencyKey).headers, ...admissionHeaders(admissionToken) } },
  );

  return response.data;
}

export async function cancelCheckout(concertId, merchantUid) {
  const response = await axiosBackend.delete(
    `/main/detail/${concertId}/checkouts/${merchantUid}`,
    { withCredentials: true },
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
