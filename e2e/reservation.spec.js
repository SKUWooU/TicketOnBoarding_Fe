import { expect, test } from "@playwright/test";

const CONCERT_ID = "browser-fixture-concert";
const CONCERT_TIME_ID = 101;
const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
}).format(new Date());
const HOLD_EXPIRY = "2030-01-01T00:10:00Z";

function sectionSummary() {
  return {
    layoutVersion: "browser-e2e-v1",
    sections: Array.from({ length: 10 }, (_, index) => ({
      sectionCode: `S${String(index + 1).padStart(2, "0")}`,
      sectionName: `${index + 1}구역`,
      sectionOrder: index + 1,
      totalSeats: 200,
      availableSeats: 200,
      heldSeats: 0,
      reservedSeats: 0,
    })),
  };
}

function sectionDetail(sectionCode) {
  return {
    sectionCode,
    seats: Array.from({ length: 200 }, (_, index) => {
      const rowOrder = Math.floor(index / 40) + 1;
      const seatIndex = (index % 40) + 1;
      return {
        seatNumber: `R${String(rowOrder).padStart(3, "0")}-S${String(seatIndex).padStart(3, "0")}`,
        rowLabel: `R${String(rowOrder).padStart(3, "0")}`,
        rowOrder,
        seatIndex,
        availability: "AVAILABLE",
      };
    }),
  };
}

async function installReservationFixture(page) {
  await page.route("https://**/*", (route) => route.abort());
  await page.route("http://127.0.0.1:4173/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, "");
    const json = (body, status = 200) =>
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

    if (request.method() === "GET" && path === "/auth/valid") {
      return json({ valid: true, code: 1, nickName: "fixture" });
    }
    if (request.method() === "GET" && path === `/main/detail/${CONCERT_ID}`) {
      return json({
        concertName: "가상 고경합 부하 공연",
        placeName: "로컬 가상 공연장",
        startDate: TODAY,
        endDate: TODAY,
        startTime: "17:00:00",
        age: "전체 관람가",
        price: "30000",
        performers: "fixture",
        crew: "fixture",
        genre: "테스트",
        posterUrl: "/vite.svg",
      });
    }
    if (request.method() === "GET" && path === `/main/detail/${CONCERT_ID}/calendar`) {
      return json([{ date: TODAY, dayOfWeek: "테스트", id: CONCERT_TIME_ID, seatAmount: 2000, startTime: "17:00:00" }]);
    }
    if (request.method() === "GET" && path === `/main/detail/${CONCERT_ID}/calendar/${CONCERT_TIME_ID}/seat-sections`) {
      return json(sectionSummary());
    }
    const sectionMatch = path.match(new RegExp(`^/main/detail/${CONCERT_ID}/calendar/${CONCERT_TIME_ID}/seat-sections/(S\\d{2})$`));
    if (request.method() === "GET" && sectionMatch) {
      return json(sectionDetail(sectionMatch[1]));
    }
    if (request.method() === "POST" && path === `/main/detail/${CONCERT_ID}/seat-holds`) {
      const requestBody = request.postDataJSON();
      if (requestBody.seatNumberList.includes("R001-S002")) {
        return json({ code: "SEAT_ALREADY_HELD" }, 409);
      }
      return json({ seats: requestBody.seatNumberList.map((seatNumber) => ({ seatNumber, expiresAt: HOLD_EXPIRY })) });
    }
    if (request.method() === "DELETE" && path === `/main/detail/${CONCERT_ID}/seat-holds`) {
      return json({});
    }
    return json({ code: "UNEXPECTED_BROWSER_FIXTURE_REQUEST", path }, 404);
  });
}

test.beforeEach(async ({ page }) => {
  await installReservationFixture(page);
  await page.goto(`/concertReservation/${CONCERT_ID}`);
  await expect(page.getByRole("heading", { name: "가상 고경합 부하 공연" })).toBeVisible();
});

test("renders one server-owned section, scrolls its 200 seats, and keeps a 409 at hold", async ({ page }, testInfo) => {
  await page.locator(".MuiPickersDay-today").click();
  await page.getByText("잔여석 : 2000").click();

  if (testInfo.project.name === "mobile") {
    const detailDirection = await page
      .locator('div[class*="detailContainer"]')
      .evaluate((element) => getComputedStyle(element).flexDirection);
    expect(detailDirection).toBe("column");
  }

  const selector = page.getByLabel("좌석 구역 선택");
  await expect(selector.getByRole("button")).toHaveCount(10);
  await expect(selector.getByRole("button", { name: /1구역/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /R001-S001, 선택 가능/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /선택 가능$/ })).toHaveCount(200);

  const viewport = page.locator('div[class*="seatGridViewport"]');
  const dimensions = await viewport.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  await viewport.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  await page.getByRole("button", { name: "R001-S001, 선택 가능" }).click();
  await expect(page.getByRole("button", { name: "R001-S001, 내가 선택한 좌석" })).toBeVisible();
  await expect(page.getByText("좌석을 결제 전까지 임시 점유했습니다.")).toBeVisible();

  await page.getByRole("button", { name: "R001-S001, 내가 선택한 좌석" }).click();
  await expect(page.getByRole("button", { name: "R001-S001, 선택 가능" })).toBeVisible();
  await page.getByRole("button", { name: "R001-S002, 선택 가능" }).click();
  await expect(page.getByText("다른 사용자가 먼저 선택한 좌석입니다. 최신 좌석 상태를 불러왔습니다.")).toBeVisible();
  await expect(page.getByRole("button", { name: "R001-S002, 선택 가능" })).toBeVisible();
});
