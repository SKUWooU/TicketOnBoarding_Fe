import { describe, expect, it, vi } from "vitest";

import {
  LOCAL_BACKEND_HEALTH_URL,
  LocalBackendPreflightError,
  verifyLocalBackend,
} from "./verify-local-backend.mjs";

describe("local Backend Browser E2E preflight", () => {
  it("accepts an UP health response from the loopback management endpoint", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "UP" }),
    });

    await expect(verifyLocalBackend({ fetchImpl })).resolves.toEqual({
      status: "UP",
    });
    expect(fetchImpl).toHaveBeenCalledWith(LOCAL_BACKEND_HEALTH_URL, {
      method: "GET",
      redirect: "error",
    });
  });

  it("explains how to prepare the fixture when the Backend is unreachable", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

    await expect(verifyLocalBackend({ fetchImpl })).rejects.toEqual(
      expect.objectContaining({
        name: "LocalBackendPreflightError",
        message: expect.stringContaining("docker compose up -d"),
      }),
    );
  });

  it("does not follow a health endpoint redirect", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValue(new TypeError("redirect mode is set to error"));

    await expect(verifyLocalBackend({ fetchImpl })).rejects.toBeInstanceOf(
      LocalBackendPreflightError,
    );
    expect(fetchImpl).toHaveBeenCalledWith(LOCAL_BACKEND_HEALTH_URL, {
      method: "GET",
      redirect: "error",
    });
  });

  it("rejects a reachable but unhealthy Backend before Chromium starts", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "DOWN" }),
    });

    await expect(verifyLocalBackend({ fetchImpl })).rejects.toBeInstanceOf(
      LocalBackendPreflightError,
    );
  });
});
