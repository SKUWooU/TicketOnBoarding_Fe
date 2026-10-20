import { beforeEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validateAdmissionManifest,
  verifyLocalAdmission,
} from "./verify-local-admission.mjs";
const manifest = {
  backendUrl: "http://127.0.0.1:18080",
  runId: "local-e2e",
  concertId: "LOAD-TEST-local-e2e",
  concertTimeId: 7,
  generation: "g1",
  opensAt: "2030-01-01T00:00:00Z",
  databaseFingerprint: "a".repeat(64),
  totalSeats: 20,
  expectedActive: 1,
  users: [1, 2].map((n) => ({
    username: `load-user-local-e2e.00${n}`,
    accessToken: `${"a".repeat(24)}.payload.signature${n}`,
  })),
};
let fetchImpl;
const json = (data, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => data,
});
beforeEach(() => {
  fetchImpl = vi.fn(async (url, options) => {
    if (url.includes("actuator/health")) return json({ status: "UP" });
    if (url.endsWith("database-identity"))
      return json({ fingerprint: manifest.databaseFingerprint });
    if (url.includes("/fixture?")) return json({ ...manifest });
    if (url.endsWith("admission-policy"))
      return json({
        enabled: true,
        generation: "g1",
        opensAt: manifest.opensAt,
        pollIntervalMillis: 5000,
      });
    if (url.endsWith("/auth/valid"))
      return json({
        valid: true,
        userName: manifest.users.find((user) =>
          options.headers.Cookie.endsWith(user.accessToken),
        ).username,
      });
    if (url.endsWith("/admission"))
      return json({ code: "ADMISSION_NOT_JOINED" }, 404);
    return json({
      expectedTotalSeats: 20,
      actualSeatCount: 20,
      remainingSeats: 20,
      invariantSatisfied: true,
      reservedSeats: 0,
      activeHeldSeats: 0,
      holdRows: 0,
      partialHoldStates: 0,
      reservations: 0,
      bookings: 0,
      payments: 0,
    });
  });
});
it("checks only prepared loopback reads before any mutation", async () => {
  await expect(
    verifyLocalAdmission(manifest, fetchImpl),
  ).resolves.toMatchObject({ preflight: "PASS", users: 2 });
  expect(
    fetchImpl.mock.calls.every(
      ([url, options]) =>
        url.startsWith("http://127.0.0.1:") &&
        options.method === "GET" &&
        options.redirect === "error",
    ),
  ).toBe(true);
});
it("rejects remote/malformed/wrong-owner manifests before network access", async () => {
  for (const value of [
    { ...manifest, backendUrl: "https://example.com" },
    { ...manifest, totalSeats: 2000 },
    {
      ...manifest,
      users: [{ ...manifest.users[0], username: "other" }, manifest.users[1]],
    },
  ]) {
    expect(() => validateAdmissionManifest(value)).toThrow(
      "invalid prepared local manifest",
    );
  }
  expect(fetchImpl).not.toHaveBeenCalled();
});
it("stops on a different database before auth or queue reads", async () => {
  fetchImpl
    .mockResolvedValueOnce(json({ status: "UP" }))
    .mockResolvedValueOnce(json({ fingerprint: "wrong" }));
  await expect(verifyLocalAdmission(manifest, fetchImpl)).rejects.toThrow(
    "database identity mismatch",
  );
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});
it("does not expose raw network failures or tokens", async () => {
  fetchImpl.mockRejectedValueOnce(new Error(manifest.users[0].accessToken));
  await expect(verifyLocalAdmission(manifest, fetchImpl)).rejects.toThrow(
    "local read failed (no mutation performed)",
  );
});

it("rejects dirty inventory and unhealthy Backend with reads only", async () => {
  const normal = fetchImpl.getMockImplementation();
  fetchImpl.mockImplementation((url, options) =>
    url.includes("seat-holds/snapshot")
      ? json({ invariantSatisfied: false })
      : normal(url, options),
  );
  await expect(verifyLocalAdmission(manifest, fetchImpl)).rejects.toThrow(
    "fixture inventory not clean",
  );
  fetchImpl.mockResolvedValueOnce(json({ status: "DOWN" }));
  await expect(verifyLocalAdmission(manifest, fetchImpl)).rejects.toThrow(
    "Backend health not UP",
  );
  expect(
    fetchImpl.mock.calls.every(([, options]) => options.method === "GET"),
  ).toBe(true);
});
it("rejects nonmatching generation and an already registered actor", async () => {
  const normal = fetchImpl.getMockImplementation();
  fetchImpl.mockImplementation((url, options) =>
    url.endsWith("admission-policy")
      ? json({ enabled: true, generation: "old", opensAt: manifest.opensAt })
      : normal(url, options),
  );
  await expect(verifyLocalAdmission(manifest, fetchImpl)).rejects.toThrow(
    "policy mismatch",
  );
  fetchImpl.mockImplementation((url, options) =>
    url.endsWith("/admission")
      ? json({ admission: { state: "WAITING" } })
      : normal(url, options),
  );
  await expect(verifyLocalAdmission(manifest, fetchImpl)).rejects.toThrow(
    "fixture already joined",
  );
});

it("matches an explicit 2s policy and rejects a wrong server interval with reads only", async () => {
  const normal = fetchImpl.getMockImplementation();
  const expected = { ...manifest, pollIntervalMillis: 2000 };
  await expect(verifyLocalAdmission(expected, fetchImpl)).rejects.toThrow(
    "policy mismatch",
  );
  fetchImpl.mockImplementation((url, options) =>
    url.endsWith("admission-policy")
      ? json({
          enabled: true,
          generation: manifest.generation,
          opensAt: manifest.opensAt,
          pollIntervalMillis: 2000,
        })
      : normal(url, options),
  );
  await expect(
    verifyLocalAdmission(expected, fetchImpl),
  ).resolves.toMatchObject({ preflight: "PASS" });
  expect(() =>
    validateAdmissionManifest({ ...manifest, pollIntervalMillis: 1 }),
  ).toThrow("invalid prepared local manifest");
  expect(
    fetchImpl.mock.calls.every(([, options]) => options.method === "GET"),
  ).toBe(true);
});

it("keeps published local polling evidence bounded and free of credentials", () => {
  const text = readFileSync(
    resolve(
      "docs/project-improvement/evidence/local-admission-poll-policy.json",
    ),
    "utf8",
  );
  const evidence = JSON.parse(text);
  expect(evidence.fixture.policyPollIntervalMillis).toBe(2000);
  expect(evidence.fixture.maxActive).toBe(1);
  expect(evidence.results.observedAutomaticPollGapMs).toBeGreaterThanOrEqual(
    1900,
  );
  expect(evidence.results.observedAutomaticPollGapMs).toBeLessThan(4500);
  expect(evidence.results.totalJoinRequests).toBe(2);
  expect(evidence.results.runtimeCleanup).toBe("COMPLETE");
  expect(evidence.results.finalInventory).toMatchObject({
    remainingSeats: 20,
    activeHeldSeats: 0,
    bookings: 0,
    payments: 0,
    invariantSatisfied: true,
  });
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      expect(key).not.toMatch(
        /^(accessToken|token|cookie|password|users|username)$/i,
      );
      visit(child);
    }
  };
  // Numeric users count is intentional; no user objects or identifying values are published.
  const sanitized = structuredClone(evidence);
  expect(sanitized.fixture.users).toBe(2);
  delete sanitized.fixture.users;
  visit(sanitized);
  expect(text).not.toMatch(
    /[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  );
});
