import axiosBackend from "../AxiosConfig";

const prefix = (concertId, timeId) =>
  `/main/detail/${encodeURIComponent(concertId)}/times/${encodeURIComponent(timeId)}`;

export async function getAdmissionPolicy(concertId, timeId, signal) {
  return (
    await axiosBackend.get(`${prefix(concertId, timeId)}/admission-policy`, {
      withCredentials: true,
      signal,
    })
  ).data;
}

export async function getAdmission(concertId, timeId, signal) {
  return (
    await axiosBackend.get(`${prefix(concertId, timeId)}/admission`, {
      withCredentials: true,
      signal,
    })
  ).data;
}

export async function joinAdmission(concertId, timeId, signal) {
  return (
    await axiosBackend.post(`${prefix(concertId, timeId)}/admission`, null, {
      withCredentials: true,
      signal,
    })
  ).data;
}

export async function leaveAdmission(
  concertId,
  timeId,
  generation,
  queueEntryId,
  signal,
) {
  await axiosBackend.delete(`${prefix(concertId, timeId)}/admission`, {
    withCredentials: true,
    params: { generation, queueEntryId },
    signal,
  });
}

export const admissionHeaders = (token) =>
  token ? { "X-Admission-Token": token } : {};
