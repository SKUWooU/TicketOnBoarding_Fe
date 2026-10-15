import { test, expect } from "@playwright/test";
import {
  ADMISSION_BACKEND,
  ADMISSION_UI,
  loadAdmissionManifest,
  verifyLocalAdmission,
} from "../../scripts/verify-local-admission.mjs";

const SEAT = "R001-S001";
async function selectTime(page, date) {
  const target = new Date(`${date}T00:00:00`);
  const current = new Date();
  const months =
    (target.getFullYear() - current.getFullYear()) * 12 +
    target.getMonth() -
    current.getMonth();
  expect(months >= 0 && months <= 60).toBe(true);
  for (let index = 0; index < months; index++)
    await page.getByRole("button", { name: /next month|다음 달/i }).click();
  await page
    .locator("button.MuiPickersDay-root:not([disabled])")
    .filter({ hasText: new RegExp(`^${target.getDate()}$`) })
    .click();
  await page.getByText("잔여석 : 20", { exact: true }).click();
}

test("two real users queue, hold, cancel Checkout, and reuse the released seat", async ({
  browser,
}) => {
  const manifest = await loadAdmissionManifest();
  await verifyLocalAdmission(manifest);
  const contexts = [];
  const pages = [];
  try {
    for (const user of manifest.users) {
      const context = await browser.newContext({
        baseURL: ADMISSION_UI,
        viewport: { width: 1440, height: 900 },
        timezoneId: "Asia/Seoul",
      });
      contexts.push(context);
      await context.addCookies([
        {
          name: "accessToken",
          value: user.accessToken,
          url: ADMISSION_UI,
          httpOnly: true,
          sameSite: "Lax",
        },
      ]);
      // No API fulfillment/mock. Only the local UI/proxy and local Backend may be contacted.
      await context.route("**/*", (route) =>
        [ADMISSION_UI, ADMISSION_BACKEND].includes(
          new URL(route.request().url()).origin,
        )
          ? route.continue()
          : route.abort(),
      );
      const calendar = await context.request.get(
        `${ADMISSION_BACKEND}/main/detail/${manifest.concertId}/calendar`,
      );
      expect(calendar.ok()).toBe(true);
      const [performance] = await calendar.json();
      const page = await context.newPage();
      pages.push(page);
      await page.goto(`/concertReservation/${manifest.concertId}`);
      await selectTime(page, performance.date);
      await expect(
        page.getByRole("button", { name: `${SEAT}, 선택 가능`, exact: true }),
      ).toBeDisabled();
      await page
        .getByRole("button", { name: "대기 등록", exact: true })
        .click();
      if (pages.length === 1)
        await expect(page.getByText(/구매 입장 완료/)).toBeVisible();
      else await expect(page.getByText(/현재 대기 순번 1번/)).toBeVisible();
    }
    const [first, second] = pages;
    const denied = await contexts[1].request.post(
      `${ADMISSION_BACKEND}/main/detail/${manifest.concertId}/seat-holds`,
      {
        data: { concertTimeId: manifest.concertTimeId, seatNumberList: [SEAT] },
      },
    );
    expect(denied.status()).toBe(403);
    expect((await denied.json()).code).toBe("ADMISSION_REQUIRED");
    const deniedCheckout = await contexts[1].request.post(
      `${ADMISSION_BACKEND}/main/detail/${manifest.concertId}/checkouts`,
      {
        headers: { "Idempotency-Key": `denied-${manifest.runId}` },
        data: { concertTimeId: manifest.concertTimeId, seatNumberList: [SEAT] },
      },
    );
    expect(deniedCheckout.status()).toBe(403);
    expect((await deniedCheckout.json()).code).toBe("ADMISSION_REQUIRED");
    const untouched = await contexts[0].request.get(
      `${ADMISSION_BACKEND}/loadtest/seat-holds/snapshot?runId=${manifest.runId}`,
    );
    expect(untouched.ok()).toBe(true);
    expect(await untouched.json()).toMatchObject({
      activeHeldSeats: 0,
      holdRows: 0,
      remainingSeats: 20,
      bookings: 0,
      payments: 0,
      invariantSatisfied: true,
    });
    await expect(
      second.getByRole("button", { name: `${SEAT}, 선택 가능`, exact: true }),
    ).toBeDisabled();

    const holdRequest = first.waitForRequest(
      (request) =>
        request.method() === "POST" && request.url().endsWith("/seat-holds"),
    );
    await first
      .getByRole("button", { name: `${SEAT}, 선택 가능`, exact: true })
      .click();
    expect(
      /^[a-f0-9-]{36}$/.test(
        (await holdRequest).headers()["x-admission-token"],
      ),
    ).toBe(true);
    await expect(
      first.getByRole("button", {
        name: `${SEAT}, 내가 선택한 좌석`,
        exact: true,
      }),
    ).toBeEnabled();
    const checkoutResponse = first.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().endsWith("/checkouts"),
    );
    await first.getByRole("button", { name: "일반 결제", exact: true }).click();
    const checkout = await checkoutResponse;
    expect(checkout.ok()).toBe(true);
    expect((await checkout.json()).status).toBe("READY");
    await expect(first).toHaveURL(/\/payment$/);
    const cancelResponse = first.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes("/checkouts/"),
    );
    await first
      .getByRole("button", { name: "Checkout 취소 후 좌석 선택" })
      .click();
    const canceled = await cancelResponse;
    expect(canceled.ok()).toBe(true);
    expect((await canceled.json()).status).toBe("CANCELED");
    await expect(first).toHaveURL(
      new RegExp(`/concertReservation/${manifest.concertId}$`),
    );
    const calendar = await contexts[0].request.get(
      `${ADMISSION_BACKEND}/main/detail/${manifest.concertId}/calendar`,
    );
    await selectTime(first, (await calendar.json())[0].date);
    await expect(
      first.getByRole("button", { name: "대기실 나가기" }),
    ).toBeEnabled();
    await expect(first.getByText(/구매 입장 완료/)).toBeVisible();
    // Do not accept a transient WAITING response just after JOIN as proof of a one-slot limit.
    const stillWaiting = await contexts[1].request.get(
      `${ADMISSION_BACKEND}/main/detail/${manifest.concertId}/times/${manifest.concertTimeId}/admission`,
    );
    expect(stillWaiting.ok()).toBe(true);
    expect((await stillWaiting.json()).admission.state).toBe("WAITING");
    await expect(
      second.getByRole("button", { name: `${SEAT}, 선택 가능`, exact: true }),
    ).toBeDisabled();
    await first.getByRole("button", { name: "대기실 나가기" }).click();
    await expect(first.getByText("대기실에서 나왔습니다.")).toBeVisible();
    await expect(second.getByText(/구매 입장 완료/)).toBeVisible();
    await second
      .getByRole("button", { name: `${SEAT}, 선택 가능`, exact: true })
      .click();
    const selected = second.getByRole("button", {
      name: `${SEAT}, 내가 선택한 좌석`,
      exact: true,
    });
    await expect(selected).toBeEnabled();
    const released = second.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().endsWith("/seat-holds"),
    );
    await selected.click();
    expect((await released).status()).toBe(204);
    await expect(
      second.getByRole("button", { name: "대기실 나가기" }),
    ).toBeEnabled();
    await second.getByRole("button", { name: "대기실 나가기" }).click();
    await expect(second.getByText("대기실에서 나왔습니다.")).toBeVisible();
    const inventory = await contexts[0].request.get(
      `${ADMISSION_BACKEND}/loadtest/seat-holds/snapshot?runId=${manifest.runId}`,
    );
    expect(inventory.ok()).toBe(true);
    const snapshot = await inventory.json();
    expect(snapshot).toMatchObject({
      expectedTotalSeats: 20,
      actualSeatCount: 20,
      remainingSeats: 20,
      activeHeldSeats: 0,
      holdRows: 0,
      partialHoldStates: 0,
      reservedSeats: 0,
      reservations: 0,
      bookings: 0,
      payments: 0,
      invariantSatisfied: true,
    });
    console.log(
      JSON.stringify({
        scenario: "local-admission-purchase",
        users: 2,
        seats: 20,
        expectedActive: 1,
        waitingHoldStatus: denied.status(),
        waitingCheckoutStatus: deniedCheckout.status(),
        checkout: "READY->CANCELED",
        finalInvariant: true,
        remainingSeats: 20,
        activeHolds: 0,
        reservations: 0,
        bookings: 0,
        payments: 0,
      }),
    );
  } finally {
    for (const context of contexts) await context.close();
  }
});
