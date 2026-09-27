import { Builder, By, until } from "selenium-webdriver";
import assert from "assert";
import { afterEach, beforeEach, describe, it } from "mocha";

const testEnv = globalThis.process?.env || {};
const baseUrl = testEnv.TEST_BASE_URL || "http://localhost:5173";
const adminEmail = testEnv.TEST_ADMIN_EMAIL || "admin@test.com";
const adminPassword = testEnv.TEST_ADMIN_PASSWORD || "Admin123@";
const inventoryTitle = "Inventory | Kannangara Hardwares";

async function waitForInventoryPage(driver) {
  await driver.wait(
    until.elementLocated(By.xpath("//h1[normalize-space()='Inventory']")),
    10000,
  );
  await driver.wait(until.titleIs(inventoryTitle), 10000);
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
  await driver.get(`${baseUrl}/inventory`);
  await waitForInventoryPage(driver);
}

async function productRows(driver) {
  const rows = await driver.findElements(By.css("tbody tr"));
  const actualRows = [];
  for (const row of rows) {
    if (
      (await row.findElements(By.css("button[aria-label*='stock']"))).length > 0
    ) {
      actualRows.push(row);
    }
  }
  return actualRows;
}

describe("Inventory page", function () {
  this.timeout(30000);
  let driver;

  beforeEach(async function () {
    driver = await new Builder().forBrowser("firefox").build();
    await driver.manage().window().setRect({ width: 1280, height: 900 });
    await signInAsAdmin(driver);
  });

  afterEach(async function () {
    if (driver) await driver.quit();
  });

  it("targets the inventory page title", async function () {
    assert.strictEqual(await driver.getTitle(), inventoryTitle);
  });

  it("renders the Inventory heading", async function () {
    assert.strictEqual(
      await driver.findElement(By.css("h1")).getText(),
      "Inventory",
    );
  });

  it("renders the product stock section", async function () {
    assert.strictEqual(
      await driver
        .findElement(By.xpath("//h2[normalize-space()='Product stock']"))
        .getText(),
      "Product stock",
    );
  });

  it("renders all inventory summary cards", async function () {
    const pageText = await driver.findElement(By.css("main")).getText();
    for (const label of [
      "Total products",
      "Low stock",
      "Out of stock",
      "Healthy stock",
    ]) {
      assert.ok(pageText.includes(label));
    }
  });

  it("renders the inventory report button", async function () {
    const button = await driver.findElement(
      By.xpath("//button[normalize-space()='Download report']"),
    );
    assert.ok(await button.isDisplayed());
  });

  it("renders the product search field", async function () {
    const search = await driver.findElement(
      By.css("input[placeholder='Search by product name or category']"),
    );
    assert.ok(await search.isDisplayed());
  });

  it("renders all stock filter options", async function () {
    const filter = await driver.findElement(By.css("select"));
    assert.strictEqual((await filter.findElements(By.css("option"))).length, 4);
    assert.strictEqual(await filter.getAttribute("value"), "all");
  });

  it("filters products by search text", async function () {
    const search = await driver.findElement(
      By.css("input[placeholder='Search by product name or category']"),
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView({ block: 'center' });",
      search,
    );
    await search.sendKeys("no-product-with-this-name");
    await driver.wait(
      until.elementLocated(
        By.xpath("//*[normalize-space()='No products found.']"),
      ),
      10000,
    );
    assert.ok(true);
  });

  it("filters products by stock status", async function () {
    const filter = await driver.findElement(By.css("select"));
    await filter.sendKeys("Low stock");
    assert.strictEqual(await filter.getAttribute("value"), "low-stock");
  });

  it("shows the empty state when no products match", async function () {
    const search = await driver.findElement(
      By.css("input[placeholder='Search by product name or category']"),
    );
    await search.sendKeys("no-product-with-this-name");
    assert.ok(
      (await driver.findElement(By.css("tbody")).getText()).includes(
        "No products found.",
      ),
    );
  });

  it("renders the product table headings", async function () {
    assert.strictEqual(
      (await driver.findElements(By.css("thead th"))).length,
      5,
    );
    const headings = await driver.findElement(By.css("thead")).getText();
    for (const heading of [
      "Product",
      "Price",
      "Main category",
      "Stock status",
      "Quantity",
    ]) {
      assert.ok(headings.includes(heading));
    }
  });

  it("renders pagination controls", async function () {
    assert.ok(
      await driver
        .findElement(By.css("button[aria-label='Previous page']"))
        .isDisplayed(),
    );
    assert.ok(
      await driver
        .findElement(By.css("button[aria-label='Next page']"))
        .isDisplayed(),
    );
    assert.ok(
      (await driver.findElement(By.css("main")).getText()).includes(
        "Page 1 of",
      ),
    );
  });

  it("disables the previous page button on the first page", async function () {
    assert.strictEqual(
      await driver
        .findElement(By.css("button[aria-label='Previous page']"))
        .isEnabled(),
      false,
    );
  });

  it("renders stock quantity controls for products", async function () {
    const rows = await productRows(driver);
    if (rows.length === 0) {
      assert.ok(
        (await driver.findElement(By.css("tbody")).getText()).includes(
          "No products found.",
        ),
      );
      return;
    }
    assert.ok(
      await rows[0]
        .findElement(By.css("button[aria-label*='Increase']"))
        .isDisplayed(),
    );
    assert.ok(
      await rows[0]
        .findElement(By.css("button[aria-label*='Decrease']"))
        .isDisplayed(),
    );
  });

  it("disables decrease stock at zero quantity", async function () {
    const rows = await productRows(driver);
    if (rows.length === 0) {
      assert.ok(
        (await driver.findElement(By.css("tbody")).getText()).includes(
          "No products found.",
        ),
      );
      return;
    }
    const decrease = await rows[0].findElement(
      By.css("button[aria-label*='Decrease']"),
    );
    const quantity = await rows[0]
      .findElement(By.css("td:last-child span"))
      .getText();
    if (quantity === "0") assert.strictEqual(await decrease.isEnabled(), false);
    else assert.strictEqual(await decrease.isEnabled(), true);
  });

  it("opens the categories modal", async function () {
    await driver
      .findElement(By.xpath("//button[normalize-space()='Categories']"))
      .click();
    await driver.wait(
      until.elementLocated(By.id("category-modal-title")),
      10000,
    );
    assert.strictEqual(
      await driver.findElement(By.id("category-modal-title")).getText(),
      "Categories",
    );
  });

  it("switches the categories modal to add mode", async function () {
    await driver
      .findElement(By.xpath("//button[normalize-space()='Categories']"))
      .click();
    await driver
      .findElement(By.xpath("//button[normalize-space()='Add category']"))
      .click();
    assert.ok(
      await driver
        .findElement(By.css("input[placeholder='e.g. Power tools']"))
        .isDisplayed(),
    );
  });

  it("requires a category name before submission", async function () {
    await driver
      .findElement(By.xpath("//button[normalize-space()='Categories']"))
      .click();
    await driver
      .findElement(By.xpath("//button[normalize-space()='Add category']"))
      .click();
    const name = await driver.findElement(
      By.css("input[placeholder='e.g. Power tools']"),
    );
    await driver
      .findElement(
        By.xpath(
          "//section[@role='dialog']//button[normalize-space()='Add category']",
        ),
      )
      .click();
    assert.ok((await name.getAttribute("validationMessage")).length > 0);
  });

  it("closes the categories modal", async function () {
    await driver
      .findElement(By.xpath("//button[normalize-space()='Categories']"))
      .click();
    await driver
      .findElement(By.css("button[aria-label='Close categories']"))
      .click();
    assert.strictEqual(
      (await driver.findElements(By.css("section[role='dialog']"))).length,
      0,
    );
  });
});
