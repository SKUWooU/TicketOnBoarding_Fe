import { fileURLToPath } from "node:url";

export const LOCAL_BACKEND_HEALTH_URL =
  "http://127.0.0.1:18081/actuator/health";

const STARTUP_GUIDE = `
Local Backend Browser E2E를 실행하려면 다음 순서로 local fixture를 준비하세요.

1. cd D:\\project2\\TicketOnBoarding_Be
2. docker compose up -d
3. cd onticket
4. .\\gradlew.bat bootRun --args="--spring.profiles.active=local,loadtest --spring.batch.job.enabled=false"

준비가 끝나면 Frontend에서 npm run test:e2e:local-backend 를 다시 실행하세요.`.trim();

export class LocalBackendPreflightError extends Error {
  constructor(reason) {
    super(`${reason}\n\n${STARTUP_GUIDE}`);
    this.name = "LocalBackendPreflightError";
  }
}

export async function verifyLocalBackend({
  fetchImpl = fetch,
  healthUrl = LOCAL_BACKEND_HEALTH_URL,
} = {}) {
  let response;

  try {
    response = await fetchImpl(healthUrl, {
      method: "GET",
      redirect: "error",
    });
  } catch {
    throw new LocalBackendPreflightError(
      `local Backend health endpoint에 연결할 수 없습니다: ${healthUrl}`,
    );
  }

  if (!response.ok) {
    throw new LocalBackendPreflightError(
      `local Backend health endpoint가 HTTP ${response.status}를 반환했습니다: ${healthUrl}`,
    );
  }

  let health;
  try {
    health = await response.json();
  } catch {
    throw new LocalBackendPreflightError(
      `local Backend health endpoint의 JSON 응답을 읽을 수 없습니다: ${healthUrl}`,
    );
  }

  if (health.status !== "UP") {
    throw new LocalBackendPreflightError(
      `local Backend가 준비되지 않았습니다 (status: ${health.status ?? "unknown"}): ${healthUrl}`,
    );
  }

  return health;
}

async function main() {
  try {
    await verifyLocalBackend();
    console.log(`local Backend preflight passed: ${LOCAL_BACKEND_HEALTH_URL}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
