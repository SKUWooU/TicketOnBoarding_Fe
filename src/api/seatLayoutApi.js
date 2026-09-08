import axiosBackend from "../AxiosConfig";

export async function getSeatSections(concertId, concertTimeId) {
  const response = await axiosBackend.get(
    `/main/detail/${concertId}/calendar/${concertTimeId}/seat-sections`,
  );
  return response.data;
}

export async function getSeatSection(concertId, concertTimeId, sectionCode) {
  const response = await axiosBackend.get(
    `/main/detail/${concertId}/calendar/${concertTimeId}/seat-sections/${encodeURIComponent(sectionCode)}`,
  );
  return response.data;
}

export async function getLegacySeats(concertId, concertTimeId) {
  const response = await axiosBackend.get(
    `/main/detail/${concertId}/calendar/${concertTimeId}`,
  );
  return response.data;
}
