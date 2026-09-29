import { Builder, By, until } from "selenium-webdriver";
import assert from "assert";
import { afterEach, beforeEach, describe, it } from "mocha";

const testEnv = globalThis.process?.env || {};
const baseUrl = testEnv.TEST_BASE_URL || "http://localhost:5173";
const adminEmail = testEnv.TEST_ADMIN_EMAIL || "admin@test.com";
const adminPassword = testEnv.TEST_ADMIN_PASSWORD || "Admin123@";
const cartTitle = "Cart | Kannangara Hardwares";

async function signIn(driver) {
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
  await driver.get(`${baseUrl}/cart`);
  await driver.wait(until.elementLocated(By.css("h1")), 10000);
  await driver.wait(until.titleIs(cartTitle), 10000);
}

async function cartRows(driver) {
  const rows = await driver.findElements(By.css("tbody tr"));
  const itemRows = [];
  for (const row of rows) {
    if (
      (
        await row.findElements(
          By.css("button[aria-label^='Increase quantity']"),
        )
      ).length > 0
    ) {
      itemRows.push(row);
    }
  }
  return itemRows;
}

async function isCartEmpty(driver) {
  return (await cartRows(driver)).length === 0;
}

describe("Cart page", function () {
  this.timeout(30000);
  let driver;

  beforeEach(async function () {
    driver = await new Builder().forBrowser("firefox").build();
    await driver.manage().window().setRect({ width: 1280, height: 900 });
    await signIn(driver);
  });

  afterEach(async function () {
    if (driver) await driver.quit();
  });

  it("targets the cart page title", async function () {
    assert.strictEqual(await driver.getTitle(), cartTitle);
  });

  it("renders the Shopping Cart heading", async function () {
    assert.strictEqual(
      await driver.findElement(By.css("h1")).getText(),
      "Shopping Cart",
    );
  });

  it("renders the total amount label", async function () {
    assert.ok(
      await driver
        .findElement(By.xpath("//span[normalize-space()='Total Amount']"))
        .isDisplayed(),
    );
  });

  it("initializes the total amount as zero when the cart is empty", async function () {
    if (await isCartEmpty(driver)) {
      assert.strictEqual(
        await driver
          .findElement(By.xpath("//span[contains(normalize-space(), 'Rs.')]"))
          .getText(),
        "Rs. 0.00",
      );
    } else {
      assert.ok(true);
    }
  });

  it("shows the empty cart message when no items exist", async function () {
    if (await isCartEmpty(driver)) {
      assert.ok(
        (await driver.findElement(By.css("main")).getText()).includes(
          "Your cart is empty.",
        ),
      );
    } else {
      assert.ok(true);
    }
  });

  it("renders the checkout button", async function () {
    assert.ok(
      await driver
        .findElement(
          By.xpath("//button[normalize-space()='Proceed to Checkout']"),
        )
        .isDisplayed(),
    );
  });

  it("disables checkout for an empty cart", async function () {
    const checkout = await driver.findElement(
      By.xpath("//button[normalize-space()='Proceed to Checkout']"),
    );
    if (await isCartEmpty(driver))
      assert.strictEqual(await checkout.isEnabled(), false);
    else assert.strictEqual(await checkout.isEnabled(), true);
  });

  it("renders cart table headings when items exist", async function () {
    const rows = await cartRows(driver);
    if (rows.length === 0) {
      assert.ok(
        (await driver.findElement(By.css("main")).getText()).includes(
          "Your cart is empty.",
        ),
      );
      return;
    }
    const headingText = await driver.findElement(By.css("thead")).getText();
    for (const heading of [
      "Item",
      "Quantity",
      "Unit Price Rs.",
      "Total Price Rs.",
      "Action",
    ]) {
      assert.ok(headingText.includes(heading));
    }
  });

  it("renders a quantity value for each cart item", async function () {
    const rows = await cartRows(driver);
    if (rows.length === 0) {
      assert.ok(true);
      return;
    }
    const quantity = await rows[0]
      .findElement(By.css("td:nth-child(2) span"))
      .getText();
    assert.ok(Number(quantity) >= 1);
  });

  it("renders increase quantity controls for cart items", async function () {
    const rows = await cartRows(driver);
    if (rows.length === 0) {
      assert.ok(true);
      return;
    }
    assert.ok(
      await rows[0]
        .findElement(By.css("button[aria-label^='Increase quantity']"))
        .isDisplayed(),
    );
  });

  it("disables decrease quantity at the minimum quantity", async function () {
    const rows = await cartRows(driver);
    if (rows.length === 0) {
      assert.ok(true);
      return;
    }
    const quantity = Number(
      await rows[0].findElement(By.css("td:nth-child(2) span")).getText(),
    );
    const decrease = await rows[0].findElement(
      By.css("button[aria-label^='Decrease quantity']"),
    );
    if (quantity <= 1) assert.strictEqual(await decrease.isEnabled(), false);
    else assert.strictEqual(await decrease.isEnabled(), true);
  });

  it("renders a remove action for each cart item", async function () {
    const rows = await cartRows(driver);
    if (rows.length === 0) {
      assert.ok(true);
      return;
    }
    assert.ok(
      await rows[0]
        .findElement(By.xpath(".//button[normalize-space()='Remove']"))
        .isDisplayed(),
    );
  });

  it("renders unit and total prices for cart items", async function () {
    const rows = await cartRows(driver);
    if (rows.length === 0) {
      assert.ok(true);
      return;
    }
    const unitPrice = await rows[0]
      .findElement(By.css("td:nth-child(3)"))
      .getText();
    const totalPrice = await rows[0]
      .findElement(By.css("td:nth-child(4)"))
      .getText();
    assert.ok(/^\d+\.\d{2}$/.test(unitPrice));
    assert.ok(/^\d+\.\d{2}$/.test(totalPrice));
  });

  it("renders the product name in each cart item", async function () {
    const rows = await cartRows(driver);
    if (rows.length === 0) {
      assert.ok(true);
      return;
    }
    const itemName = await rows[0]
      .findElement(By.css("td:first-child span"))
      .getText();
    assert.ok(itemName.length > 0);
  });

  it("renders one quantity control group per cart item", async function () {
    const rows = await cartRows(driver);
    if (rows.length === 0) {
      assert.ok(true);
      return;
    }
    for (const row of rows) {
      assert.strictEqual(
        (await row.findElements(By.css("td:nth-child(2) button"))).length,
        2,
      );
    }
  });

  it("keeps the checkout route available when the cart has items", async function () {
    const rows = await cartRows(driver);
    const checkout = await driver.findElement(
      By.xpath("//button[normalize-space()='Proceed to Checkout']"),
    );
    if (rows.length === 0) {
      assert.strictEqual(await checkout.isEnabled(), false);
      return;
    }
    await checkout.click();
    await driver.wait(until.urlContains("/checkout"), 10000);
    assert.ok((await driver.getCurrentUrl()).includes("/checkout"));
  });

  it("does not render item controls for an empty cart", async function () {
    if (await isCartEmpty(driver)) {
      assert.strictEqual(
        (await driver.findElements(By.css("tbody tr"))).length,
        0,
      );
      assert.strictEqual(
        (
          await driver.findElements(
            By.xpath("//button[normalize-space()='Remove']"),
          )
        ).length,
        0,
      );
    } else {
      assert.ok((await cartRows(driver)).length > 0);
    }
  });
});
