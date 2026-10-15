import { beforeEach, expect, it, vi } from "vitest";
import axiosBackend from "../AxiosConfig";
import {
  getAdmissionPolicy,
  getAdmission,
  joinAdmission,
  leaveAdmission,
} from "./admissionApi";
import { holdSeats, releaseSeats } from "./seatHoldApi";
import {
  prepareCheckout,
  cancelCheckout,
  confirmVerifiedReservation,
} from "./checkoutApi";
vi.mock("../AxiosConfig", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
beforeEach(() => {
  vi.clearAllMocks();
  axiosBackend.get.mockResolvedValue({ data: {} });
  axiosBackend.post.mockResolvedValue({ data: {} });
  axiosBackend.delete.mockResolvedValue({ data: {} });
});

it("uses owner cookies and an explicit generation/entry ID only for queue leave", async () => {
  await getAdmissionPolicy("concert", 7);
  await getAdmission("concert", 7);
  await joinAdmission("concert", 7);
  await leaveAdmission("concert", 7, "g1", "entry");
  expect(axiosBackend.get).toHaveBeenCalledWith(
    "/main/detail/concert/times/7/admission",
    { withCredentials: true, signal: undefined },
  );
  expect(axiosBackend.post).toHaveBeenCalledWith(
    "/main/detail/concert/times/7/admission",
    null,
    { withCredentials: true, signal: undefined },
  );
  expect(axiosBackend.delete).toHaveBeenCalledWith(
    "/main/detail/concert/times/7/admission",
    {
      withCredentials: true,
      params: { generation: "g1", queueEntryId: "entry" },
      signal: undefined,
    },
  );
});
it("adds admission token only to new Hold/Checkout, never cleanup or payment confirmation", async () => {
  await holdSeats("concert", 7, ["A1"], "token");
  await prepareCheckout("concert", {}, "key", "token");
  expect(
    axiosBackend.post.mock.calls.map(
      (call) => call[2].headers["X-Admission-Token"],
    ),
  ).toEqual(["token", "token"]);
  axiosBackend.post.mockClear();
  await releaseSeats("concert", 7, ["A1"]);
  await cancelCheckout("concert", "merchant");
  await confirmVerifiedReservation("concert", "merchant", {}, "payment", "key");
  expect(axiosBackend.post.mock.calls[0][2].headers).toEqual({
    "Idempotency-Key": "key",
  });
  expect(axiosBackend.delete.mock.calls.every((call) => !call[1].headers)).toBe(
    true,
  );
});
