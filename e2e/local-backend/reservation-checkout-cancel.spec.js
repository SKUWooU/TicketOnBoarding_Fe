import { expect, test } from "@playwright/test";

const BACKEND_BASE_URL = "http://127.0.0.1:18080";
const RUN_ID = `browser-local-${Date.now()}`;
const SEAT_NUMBER = "R001-S001";
let fixture;
let accessToken;
let calendarDate;

function assertLoopbackUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(url.hostname)) {
    throw new Error("Local Backend Browser E2E only permits a loopback HTTP Backend.");
  }
}

async function selectFixtureDate(page, date) {
  const target = new Date(`${date}T00:00:00`);
  const current = new Date();
  const monthCount =
    (target.getFullYear() - current.getFullYear()) * 12 +
    target.getMonth() -
    current.getMonth();

  if (monthCount < 0) {
    throw new Error("Local fixture date must not precede the browser month.");
  }

  const nextMonth = page.getByRole("button", { name: /next month|다음 달/i });
  for (let index = 0; index < monthCount; index += 1) {
    await nextMonth.click();
  }

  await page
    .locator("button.MuiPickersDay-root:not([disabled])")
    .filter({ hasText: new RegExp(`^${target.getDate()}$`) })
    .click();
}

test.beforeAll(async ({ request }) => {
  assertLoopbackUrl(BACKEND_BASE_URL);
  const fixtureResponse = await request.post(
    `${BACKEND_BASE_URL}/loadtest/runs?runId=${RUN_ID}`,
  );
  expect(fixtureResponse.ok()).toBeTruthy();
  fixture = await fixtureResponse.json();

  const tokenResponse = await request.get(
    `${BACKEND_BASE_URL}/loadtest/tokens?runId=${RUN_ID}&count=1`,
  );
  expect(tokenResponse.ok()).toBeTruthy();
  [accessToken] = await tokenResponse.json();

  const calendarResponse = await request.get(
    `${BACKEND_BASE_URL}/main/detail/${fixture.concertId}/calendar`,
  );
  expect(calendarResponse.ok()).toBeTruthy();
  [calendarDate] = await calendarResponse.json();
});

test.beforeEach(async ({ context, page }) => {
  await page.route("https://**/*", (route) => route.abort());
  await context.addCookies([
    {
      name: "accessToken",
      value: accessToken.accessToken,
      url: "http://127.0.0.1:4174",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const authResponsePromise = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/api/auth/valid",
  );
  await page.goto(`/concertReservation/${fixture.concertId}`);
  const authResponse = await authResponsePromise;
  expect(authResponse.ok()).toBeTruthy();
  await expect(authResponse.json()).resolves.toMatchObject({
    valid: true,
    userName: accessToken.username,
  });
  await expect(
    page.getByRole("heading", { name: new RegExp(`가상 고경합 부하 공연 ${RUN_ID}`) }),
  ).toBeVisible();
});

test("holds a local virtual seat, cancels its Checkout, and restores the fixture invariant", async ({ page, request }) => {
  await selectFixtureDate(page, calendarDate.date);
  await page.getByText("잔여석 : 2000").click();

  const selector = page.getByLabel("좌석 구역 선택");
  await expect(selector.getByRole("button")).toHaveCount(10);
  await expect(page.getByRole("button", { name: `${SEAT_NUMBER}, 선택 가능` })).toBeVisible();

  await page.getByRole("button", { name: `${SEAT_NUMBER}, 선택 가능` }).click();
  await expect(
    page.getByRole("button", { name: `${SEAT_NUMBER}, 내가 선택한 좌석` }),
  ).toBeVisible();

  await page.getByRole("button", { name: "일반 결제" }).click();
  await expect(page).toHaveURL(/\/payment$/);
  await expect(page.getByText(/Checkout:/)).toBeVisible();

  await page.getByRole("button", { name: "Checkout 취소 후 좌석 선택" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/concertReservation/${fixture.concertId}$`),
  );

  const snapshotResponse = await request.get(
    `${BACKEND_BASE_URL}/loadtest/seat-holds/snapshot?runId=${RUN_ID}`,
  );
  expect(snapshotResponse.ok()).toBeTruthy();
  await expect(snapshotResponse.json()).resolves.toMatchObject({
    expectedTotalSeats: 2000,
    actualSeatCount: 2000,
    remainingSeats: 2000,
    reservedSeats: 0,
    activeHeldSeats: 0,
    holdRows: 0,
    reservations: 0,
    bookings: 0,
    payments: 0,
    invariantSatisfied: true,
  });
});

test("selects a local virtual seat and cancels its Checkout with keyboard activation", async ({ page, request }) => {
  await selectFixtureDate(page, calendarDate.date);
  await page.getByText("잔여석 : 2000").click();

  const seat = page.getByRole("button", { name: `${SEAT_NUMBER}, 선택 가능` });
  await seat.focus();
  await expect(seat).toBeFocused();
  await page.keyboard.press("Enter");

  const selectedSeat = page.getByRole("button", {
    name: `${SEAT_NUMBER}, 내가 선택한 좌석`,
  });
  await expect(selectedSeat).toBeVisible();
  await expect(selectedSeat).toBeFocused();

  const paymentButton = page.getByRole("button", { name: "일반 결제" });
  await paymentButton.focus();
  await expect(paymentButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/payment$/);

  const cancelButton = page.getByRole("button", {
    name: "Checkout 취소 후 좌석 선택",
  });
  await cancelButton.focus();
  await expect(cancelButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(
    new RegExp(`/concertReservation/${fixture.concertId}$`),
  );

  const snapshotResponse = await request.get(
    `${BACKEND_BASE_URL}/loadtest/seat-holds/snapshot?runId=${RUN_ID}`,
  );
  expect(snapshotResponse.ok()).toBeTruthy();
  await expect(snapshotResponse.json()).resolves.toMatchObject({
    expectedTotalSeats: 2000,
    actualSeatCount: 2000,
    remainingSeats: 2000,
    reservedSeats: 0,
    activeHeldSeats: 0,
    holdRows: 0,
    reservations: 0,
    bookings: 0,
    payments: 0,
    invariantSatisfied: true,
  });
});
