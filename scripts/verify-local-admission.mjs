import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const ADMISSION_BACKEND = "http://127.0.0.1:18080";
export const ADMISSION_UI = "http://127.0.0.1:4175";
const fail = (reason) => {
  throw new Error(`LOCAL_ADMISSION_PREFLIGHT: ${reason}`);
};

export function validateAdmissionManifest(value) {
  const validToken = (token) =>
    typeof token === "string" &&
    token.length >= 32 &&
    token.length <= 2048 &&
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
  if (
    !value ||
    value.backendUrl !== ADMISSION_BACKEND ||
    typeof value.runId !== "string" ||
    !/^[A-Za-z0-9-]{1,32}$/.test(value.runId) ||
    value.concertId !== `LOAD-TEST-${value.runId}` ||
    !Number.isSafeInteger(value.concertTimeId) ||
    value.concertTimeId <= 0 ||
    typeof value.generation !== "string" ||
    !/^[A-Za-z0-9-]{1,32}$/.test(value.generation) ||
    typeof value.opensAt !== "string" ||
    !Number.isFinite(Date.parse(value.opensAt)) ||
    typeof value.databaseFingerprint !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.databaseFingerprint) ||
    value.totalSeats !== 20 ||
    value.expectedActive !== 1 ||
    !Array.isArray(value.users) ||
    value.users.length !== 2 ||
    value.users.some(
      (user, index) =>
        !user ||
        user.username !==
          `load-user-${value.runId}.${String(index + 1).padStart(3, "0")}` ||
        !validToken(user.accessToken),
    ) ||
    value.users[0].accessToken === value.users[1].accessToken
  )
    fail("invalid prepared local manifest");
  return value;
}

export async function loadAdmissionManifest(
  path = process.env.ONTICKET_ADMISSION_MANIFEST,
) {
  if (!path) fail("set ONTICKET_ADMISSION_MANIFEST to a prepared local file");
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch {
    fail("cannot read prepared local manifest");
  }
  if (text.length > 16384) fail("manifest too large");
  let data;
  try {
    data = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    fail("invalid manifest JSON");
  }
  return validateAdmissionManifest(data);
}

export async function verifyLocalAdmission(manifest, fetchImpl = fetch) {
  validateAdmissionManifest(manifest);
  async function get(url, token, allowMissing = false) {
    let response;
    try {
      response = await fetchImpl(url, {
        method: "GET",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
        ...(token ? { headers: { Cookie: `accessToken=${token}` } } : {}),
      });
    } catch {
      fail("local read failed (no mutation performed)");
    }
    let data;
    try {
      data = await response.json();
    } catch {
      fail("local read returned invalid JSON");
    }
    if (
      allowMissing &&
      response.status === 404 &&
      data.code === "ADMISSION_NOT_JOINED"
    )
      return null;
    if (!response.ok) fail("local read rejected (no mutation performed)");
    return data;
  }
  if ((await get("http://127.0.0.1:18081/actuator/health")).status !== "UP")
    fail("Backend health not UP");
  const identity = await get(`${ADMISSION_BACKEND}/loadtest/database-identity`);
  if (identity.fingerprint !== manifest.databaseFingerprint)
    fail("database identity mismatch");
  const fixture = await get(
    `${ADMISSION_BACKEND}/loadtest/fixture?runId=${manifest.runId}`,
  );
  if (
    fixture.concertId !== manifest.concertId ||
    fixture.concertTimeId !== manifest.concertTimeId ||
    fixture.totalSeats !== 20
  )
    fail("fixture mismatch");
  const prefix = `${ADMISSION_BACKEND}/main/detail/${manifest.concertId}/times/${manifest.concertTimeId}`;
  const policy = await get(`${prefix}/admission-policy`);
  if (
    policy.enabled !== true ||
    policy.generation !== manifest.generation ||
    Date.parse(policy.opensAt) !== Date.parse(manifest.opensAt)
  )
    fail("policy mismatch");
  for (const user of manifest.users) {
    const auth = await get(`${ADMISSION_BACKEND}/auth/valid`, user.accessToken);
    if (auth.valid !== true || auth.userName !== user.username)
      fail("fixture authentication mismatch");
    if ((await get(`${prefix}/admission`, user.accessToken, true)) !== null)
      fail("fixture already joined; use a fresh run");
  }
  const snapshot = await get(
    `${ADMISSION_BACKEND}/loadtest/seat-holds/snapshot?runId=${manifest.runId}`,
  );
  if (
    snapshot.expectedTotalSeats !== 20 ||
    snapshot.actualSeatCount !== 20 ||
    snapshot.remainingSeats !== 20 ||
    snapshot.invariantSatisfied !== true ||
    [
      "reservedSeats",
      "activeHeldSeats",
      "holdRows",
      "partialHoldStates",
      "reservations",
      "bookings",
      "payments",
    ].some((key) => snapshot[key] !== 0)
  )
    fail("fixture inventory not clean");
  return {
    users: 2,
    totalSeats: 20,
    generation: manifest.generation,
    preflight: "PASS",
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    console.log(
      JSON.stringify(await verifyLocalAdmission(await loadAdmissionManifest())),
    );
  } catch (error) {
    console.error(
      error.message.startsWith("LOCAL_ADMISSION_PREFLIGHT:")
        ? error.message
        : "LOCAL_ADMISSION_PREFLIGHT: failed",
    );
    process.exitCode = 1;
  }
}
