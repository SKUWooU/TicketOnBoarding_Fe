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
    vi.spyOn(Math, "random").mockReturnValue(0);
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
    vi.restoreAllMocks();
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
    getAdmission.mockResolvedValue({
      ...snapshot(),
      serverNow: "2030-01-01T00:00:06Z",
    });
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
  it.each([5000, 2000])(
    "does not overlap polling or discard admission during slow reads at %ims",
    async (interval) => {
      getAdmissionPolicy.mockResolvedValue({
        ...policy,
        pollIntervalMillis: interval,
      });
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
    },
  );
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
  it.each([5000, 2000])(
    "explicit leave and unmount stop polling at %ims",
    async (interval) => {
      getAdmissionPolicy.mockResolvedValue({
        ...policy,
        pollIntervalMillis: interval,
      });
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
    },
  );

  it.each([1000, 2000, 5000, 30000])(
    "uses the server interval %ims rather than a fixed minimum",
    async (interval) => {
      getAdmissionPolicy.mockResolvedValue({
        ...policy,
        pollIntervalMillis: interval,
      });
      getAdmission.mockResolvedValue(snapshot("ADMITTED", 60000));
      await mount();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(interval - 1);
      });
      expect(getAdmission).toHaveBeenCalledTimes(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(getAdmission).toHaveBeenCalledTimes(2);
      expect(joinAdmission).not.toHaveBeenCalled();
    },
  );

  it("keeps the legacy 5s fallback and positive jitter without silently overriding server guidance", async () => {
    getAdmissionPolicy.mockResolvedValue({
      ...policy,
      pollIntervalMillis: undefined,
    });
    getAdmission.mockResolvedValue(snapshot("ADMITTED", 60000));
    const first = await mount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4999);
    });
    expect(getAdmission).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(getAdmission).toHaveBeenCalledTimes(2);
    first.unmount();
    getAdmissionPolicy.mockResolvedValue({
      ...policy,
      pollIntervalMillis: 2000,
    });
    vi.mocked(Math.random).mockReturnValue(0.999);
    await mount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2998);
    });
    expect(getAdmission).toHaveBeenCalledTimes(3);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(getAdmission).toHaveBeenCalledTimes(4);
  });

  it.each([null, "2000", 0, 999, 30001, -1, NaN, Infinity, 2000.5])(
    "rejects an invalid interval %s before reading admission",
    async (interval) => {
      getAdmissionPolicy.mockResolvedValue({
        ...policy,
        pollIntervalMillis: interval,
      });
      const { result } = await mount();
      expect(result.current.status).toBe("ERROR");
      expect(result.current.canPurchase).toBe(false);
      expect(getAdmission).not.toHaveBeenCalled();
    },
  );

  it("restores a waiting entry on remount without auto-joining or retaining an old timer", async () => {
    getAdmissionPolicy.mockResolvedValue({
      ...policy,
      pollIntervalMillis: 2000,
    });
    getAdmission.mockResolvedValue(snapshot("WAITING", 60000));
    const first = await mount();
    expect(first.result.current.status).toBe("WAITING");
    first.unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(getAdmission).toHaveBeenCalledTimes(1);
    const second = await mount();
    expect(second.result.current.status).toBe("WAITING");
    expect(getAdmission).toHaveBeenCalledTimes(2);
    expect(joinAdmission).not.toHaveBeenCalled();
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
