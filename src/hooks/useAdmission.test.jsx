import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useAdmission from "./useAdmission";
import {
  getAdmissionPolicy,
  getAdmission,
  joinAdmission,
  leaveAdmission,
} from "../api/admissionApi";

vi.mock("../api/admissionApi", () => ({
  getAdmissionPolicy: vi.fn(),
  getAdmission: vi.fn(),
  joinAdmission: vi.fn(),
  leaveAdmission: vi.fn(),
}));
const policy = {
  enabled: true,
  generation: "g1",
  opensAt: "2030-01-01T00:00:00Z",
  pollIntervalMillis: 5000,
};
const token = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const missing = {
  response: { status: 404, data: { code: "ADMISSION_NOT_JOINED" } },
};
const unavailable = {
  response: { status: 503, data: { code: "ADMISSION_UNAVAILABLE" } },
};
const snapshot = (state = "WAITING", duration = 10000) => ({
  generation: "g1",
  serverNow: "2030-01-01T00:00:00Z",
  admission: {
    state,
    queueEntryId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    position: 1,
    expiresAt: new Date(
      Date.parse("2030-01-01T00:00:00Z") + duration,
    ).toISOString(),
    token: state === "ADMITTED" ? token : null,
  },
});
const props = { concertId: "concert", timeId: 7, isLoggedIn: true };
async function mount(overrides = {}) {
  let hook;
  await act(async () => {
    hook = renderHook((input) => useAdmission(input), {
      initialProps: { ...props, ...overrides },
    });
  });
  return hook;
}
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe("useAdmission", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({
      toFake: [
        "Date",
        "performance",
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
      ],
    });
    getAdmissionPolicy.mockResolvedValue(policy);
    getAdmission.mockRejectedValue(missing);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("only explicit disabled policy permits legacy purchases; failures fail closed", async () => {
    getAdmissionPolicy.mockResolvedValueOnce({ enabled: false });
    const { result } = await mount();
    expect(result.current.canPurchase).toBe(true);
    expect(getAdmission).not.toHaveBeenCalled();
    getAdmissionPolicy.mockRejectedValueOnce(unavailable);
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.canPurchase).toBe(false);
    expect(result.current.status).toBe("ERROR");
  });
  it("never joins from policy loading or polling; explicit join records ownership", async () => {
    const { result } = await mount();
    expect(result.current.status).toBe("NOT_JOINED");
    expect(joinAdmission).not.toHaveBeenCalled();
    joinAdmission.mockResolvedValue(snapshot());
    await act(async () => {
      await result.current.join();
    });
    expect(result.current.status).toBe("WAITING");
    expect(result.current.canPurchase).toBe(false);
    getAdmission.mockResolvedValue({ ...snapshot(), serverNow: "2030-01-01T00:00:06Z" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(joinAdmission).toHaveBeenCalledTimes(1);
    expect(getAdmission).toHaveBeenCalledTimes(2);
    expect(result.current.seconds).toBeLessThanOrEqual(4);
  });
  it("restores own admitted entry and expires using server duration, not local wall clock", async () => {
    vi.setSystemTime(new Date("2040-01-01T00:00:00Z"));
    getAdmission.mockResolvedValue(snapshot("ADMITTED", 2000));
    const { result } = await mount();
    expect(result.current.token).toBe(token);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.status).toBe("EXPIRED");
    expect(result.current.token).toBeUndefined();
    expect(result.current.canPurchase).toBe(false);
  });
  it("does not overlap polling or temporarily discard a valid admission during slow reads", async () => {
    getAdmission.mockResolvedValueOnce(snapshot("ADMITTED", 30000));
    const { result } = await mount();
    const pending = deferred();
    getAdmission.mockReturnValueOnce(pending.promise);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(getAdmission).toHaveBeenCalledTimes(2);
    expect(result.current.canPurchase).toBe(true);
    await act(async () => pending.resolve(snapshot("ADMITTED", 10000)));
    expect(result.current.status).toBe("ADMITTED");
  });
  it("discards old admission/token on time change and ignores a late previous join", async () => {
    const { result, rerender } = await mount();
    const pending = deferred();
    joinAdmission.mockReturnValueOnce(pending.promise);
    let joining;
    act(() => {
      joining = result.current.join();
    });
    await act(async () => rerender({ ...props, timeId: 8 }));
    await act(async () => {
      pending.resolve(snapshot("ADMITTED"));
      await joining;
    });
    expect(result.current.status).toBe("NOT_JOINED");
    expect(result.current.token).toBeUndefined();
    expect(leaveAdmission).not.toHaveBeenCalled();
  });
  it("explicit leave uses generation and entry ID, and unmount stops all polling", async () => {
    getAdmission.mockResolvedValue(snapshot("ADMITTED", 30000));
    const { result, unmount } = await mount();
    await act(async () => {
      await result.current.leave();
    });
    expect(leaveAdmission).toHaveBeenCalledWith(
      "concert",
      7,
      "g1",
      snapshot().admission.queueEntryId,
      expect.any(AbortSignal),
    );
    expect(result.current.canPurchase).toBe(false);
    expect(result.current.status).toBe("LEFT");
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });
    expect(getAdmission).toHaveBeenCalledTimes(1);
  });
  it("handles 401 and 429 without automatic join retries", async () => {
    const { result } = await mount({ isLoggedIn: false });
    expect(result.current.status).toBe("AUTH_REQUIRED");
    expect(getAdmission).not.toHaveBeenCalled();
    const second = await mount();
    joinAdmission.mockRejectedValue({ response: { status: 429 } });
    await act(async () => {
      await second.result.current.join();
    });
    expect(second.result.current.status).toBe("FULL");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000);
    });
    expect(joinAdmission).toHaveBeenCalledTimes(1);
  });
  it("rejects malformed/generation-mismatched responses and server gate failures", async () => {
    getAdmission.mockResolvedValueOnce({
      ...snapshot("ADMITTED"),
      generation: "old",
    });
    const { result } = await mount();
    expect(result.current.status).toBe("ERROR");
    getAdmission.mockResolvedValue(snapshot("ADMITTED"));
    await act(async () => {
      await result.current.refresh();
    });
    act(() => result.current.onPurchaseError(unavailable));
    expect(result.current.canPurchase).toBe(false);
    expect(result.current.token).toBeUndefined();
  });
});
