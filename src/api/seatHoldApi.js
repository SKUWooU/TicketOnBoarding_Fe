import axiosBackend from "../AxiosConfig";

function seatHoldRequest(concertTimeId, seatNumberList) {
  return {
    concertTimeId,
    seatNumberList,
  };
}

export async function holdSeats(concertId, concertTimeId, seatNumberList) {
  const response = await axiosBackend.post(
    `/main/detail/${concertId}/seat-holds`,
    seatHoldRequest(concertTimeId, seatNumberList),
    { withCredentials: true },
  );

  return response.data;
}

export async function releaseSeats(concertId, concertTimeId, seatNumberList) {
  await axiosBackend.delete(`/main/detail/${concertId}/seat-holds`, {
    withCredentials: true,
    data: seatHoldRequest(concertTimeId, seatNumberList),
  });
}
