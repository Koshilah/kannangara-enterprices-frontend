import { Builder, By, until } from "selenium-webdriver";
import assert from "assert";
import { afterEach, beforeEach, describe, it } from "mocha";

const testEnv = globalThis.process?.env || {};
const baseUrl = testEnv.TEST_BASE_URL || "http://localhost:5173";
const adminEmail = testEnv.TEST_ADMIN_EMAIL || "admin@test.com";
const adminPassword = testEnv.TEST_ADMIN_PASSWORD || "Admin123@";
const deliveryTitle = "Delivery | Kannangara Hardwares";
const notFoundTitle = "Not Found | Kannangara Hardwares";

async function waitForDeliveryPage(driver) {
  await driver.wait(
    until.elementLocated(By.xpath("//h1[normalize-space()='Deliveries']")),
    10000,
  );
  await driver.wait(until.titleIs(deliveryTitle), 10000);
}

async function signInAsAdmin(driver) {
  await driver.get(`${baseUrl}/login`);
  await driver.findElement(By.id("Email")).sendKeys(adminEmail);
  await driver.findElement(By.id("Password")).sendKeys(adminPassword);
  await driver.findElement(By.css("form button[type='submit']")).click();
  await driver.wait(
    async () =>
      driver.executeScript(
        "return window.localStorage.getItem('loggedIn') === 'true';",
      ),
    10000,
  );
  await driver.get(`${baseUrl}/delivery`);
  await waitForDeliveryPage(driver);
}

async function deliveryRows(driver) {
  const rows = await driver.findElements(By.css("tbody tr"));
  const deliveryRows = [];
  for (const row of rows) {
    if ((await row.findElements(By.css("select[id^='status-']"))).length > 0) {
      deliveryRows.push(row);
    }
  }
  return deliveryRows;
}

describe("Delivery page", function () {
  this.timeout(30000);
  let driver;

  beforeEach(async function () {
    driver = await new Builder().forBrowser("firefox").build();
    await driver.manage().window().setRect({ width: 1280, height: 900 });
    if (this.currentTest.title.startsWith("shows Not Found")) {
      return;
    }
    await signInAsAdmin(driver);
  });

  afterEach(async function () {
    if (driver) await driver.quit();
  });

  it("shows Not Found title for unauthorized access", async function () {
    await driver.get(baseUrl);
    await driver.executeScript("window.localStorage.clear();");
    await driver.get(`${baseUrl}/delivery`);
    await driver.wait(until.titleIs(notFoundTitle), 10000);
    assert.strictEqual(await driver.getTitle(), notFoundTitle);
  });

  it("targets the authorized delivery page title", async function () {
    assert.strictEqual(await driver.getTitle(), deliveryTitle);
  });

  it("renders the Deliveries heading", async function () {
    assert.strictEqual(
      await driver.findElement(By.css("h1")).getText(),
      "Deliveries",
    );
  });

  it("renders the delivery records section", async function () {
    assert.strictEqual(
      await driver
        .findElement(By.xpath("//h2[normalize-space()='Delivery records']"))
        .getText(),
      "Delivery records",
    );
  });

  it("renders the showing delivery count", async function () {
    assert.ok(
      await driver
        .findElement(By.xpath("//p[normalize-space()='Showing']"))
        .isDisplayed(),
    );
    assert.ok(
      (await driver.findElement(By.css("main")).getText()).includes("of"),
    );
  });

  it("defaults the status filter to all statuses", async function () {
    const statusFilter = await driver.findElement(By.css("select"));
    assert.strictEqual(await statusFilter.getAttribute("value"), "all");
  });

  it("renders all delivery status options", async function () {
    const options = await driver.findElements(
      By.css("select:first-of-type option"),
    );
    assert.strictEqual(options.length, 6);
  });

  it("renders the due date filter", async function () {
    const dateFilters = await driver.findElements(
      By.css("main > div section input[type='date']"),
    );
    assert.ok(dateFilters.length >= 1);
    assert.strictEqual(await dateFilters[0].getAttribute("value"), "");
  });

  it("renders all delivery table headings", async function () {
    const headings = await driver.findElements(By.css("thead th"));
    assert.strictEqual(headings.length, 5);
  });

  it("renders either delivery rows or the empty state", async function () {
    const rows = await deliveryRows(driver);
    if (rows.length === 0) {
      assert.ok(
        (await driver.findElement(By.css("tbody")).getText()).includes(
          "No deliveries match",
        ),
      );
    } else {
      assert.ok(await rows[0].isDisplayed());
    }
  });

  it("renders the download report button", async function () {
    const reportButton = await driver.findElement(
      By.xpath("//button[normalize-space()='Download Report']"),
    );
    assert.ok(await reportButton.isDisplayed());
  });

  it("disables report download when there are no deliveries", async function () {
    const rows = await deliveryRows(driver);
    const reportButton = await driver.findElement(
      By.xpath("//button[normalize-space()='Download Report']"),
    );
    if (rows.length === 0) {
      assert.strictEqual(await reportButton.isEnabled(), false);
    } else {
      assert.strictEqual(await reportButton.isEnabled(), true);
    }
  });

  it("filters deliveries by status", async function () {
    const statusFilter = await driver.findElement(By.css("section select"));
    await statusFilter.sendKeys("Delivered");
    assert.strictEqual(await statusFilter.getAttribute("value"), "delivered");
  });

  it("filters deliveries by due date", async function () {
    const dateFilter = (
      await driver.findElements(By.css("main > div section input[type='date']"))
    )[0];
    await dateFilter.sendKeys("2026-09-27");
    assert.strictEqual(await dateFilter.getAttribute("value"), "2026-09-27");
  });

  it("shows the empty state for a non-matching status and date filter", async function () {
    const statusFilter = await driver.findElement(By.css("section select"));
    await statusFilter.sendKeys("Cancelled");
    const dateFilter = (
      await driver.findElements(By.css("main > div section input[type='date']"))
    )[0];
    await dateFilter.sendKeys("2000-01-01");
    assert.ok(
      (await driver.findElement(By.css("tbody")).getText()).includes(
        "No deliveries match",
      ),
    );
  });

  it("exposes status controls for delivery rows", async function () {
    const rows = await deliveryRows(driver);
    if (rows.length === 0) {
      assert.ok(
        (await driver.findElement(By.css("tbody")).getText()).includes(
          "No deliveries match",
        ),
      );
      return;
    }
    const statusSelect = await rows[0].findElement(By.css("select"));
    assert.strictEqual(
      (await statusSelect.findElements(By.css("option"))).length,
      5,
    );
  });

  it("exposes due date controls for delivery rows", async function () {
    const rows = await deliveryRows(driver);
    if (rows.length === 0) {
      assert.ok(
        (await driver.findElement(By.css("tbody")).getText()).includes(
          "No deliveries match",
        ),
      );
      return;
    }
    const dueDateInput = await rows[0].findElement(
      By.css("input[type='date']"),
    );
    assert.ok(await dueDateInput.isDisplayed());
    assert.ok(
      (await dueDateInput.getAttribute("aria-label")).startsWith(
        "Due date for order",
      ),
    );
  });

  it("keeps delete actions disabled for non-delivered rows", async function () {
    const rows = await deliveryRows(driver);
    if (rows.length === 0) {
      assert.ok(
        (await driver.findElement(By.css("tbody")).getText()).includes(
          "No deliveries match",
        ),
      );
      return;
    }
    const status = await rows[0]
      .findElement(By.css("select"))
      .getAttribute("value");
    const deleteButton = await rows[0].findElement(
      By.css("button[aria-label^='Delete delivery']"),
    );
    if (status !== "delivered") {
      assert.strictEqual(await deleteButton.isEnabled(), false);
    } else {
      assert.strictEqual(await deleteButton.isEnabled(), true);
    }
  });

  it("opens the delivery report modal when deliveries exist", async function () {
    const rows = await deliveryRows(driver);
    const reportButton = await driver.findElement(
      By.xpath("//button[normalize-space()='Download Report']"),
    );
    if (rows.length === 0) {
      assert.strictEqual(await reportButton.isEnabled(), false);
      return;
    }
    await reportButton.click();
    await driver.wait(
      until.elementLocated(By.xpath("//h2[@id='report-modal-title']")),
      10000,
    );
    assert.strictEqual(
      await driver.findElement(By.id("report-modal-title")).getText(),
      "Download Delivery Report",
    );
  });
});
