import { Builder, By, until } from "selenium-webdriver";
import assert from "assert";
import { afterEach, beforeEach, describe, it } from "mocha";
import { title } from "process";

const testEnv = globalThis.process?.env || {};
const baseUrl = testEnv.TEST_BASE_URL || "http://localhost:5173";
const adminEmail = testEnv.TEST_ADMIN_EMAIL || "admin@test.com";
const adminPassword = testEnv.TEST_ADMIN_PASSWORD || "Admin123@";

async function waitForExpensePage(driver) {
  await driver.wait(until.elementLocated(By.css("h1")), 10000);
  await driver.wait(
    until.elementLocated(By.xpath("//h1[normalize-space()='Expense Tracker']")),
    10000,
  );
}

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
  await driver.get(`${baseUrl}/expenses`);
  await waitForExpensePage(driver);
}

async function setInput(driver, name, value) {
  const input = await driver.findElement(By.name(name));
  await input.clear();
  await input.sendKeys(value);
  return input;
}

async function addExpense(
  driver,
  description = `Selenium expense ${Date.now()}`,
) {
  await setInput(driver, "amount", "125.50");
  await setInput(driver, "shortDescription", description);
  await driver.findElement(By.name("category")).sendKeys("Utilities");
  await setInput(driver, "date", "2026-09-27");
  await driver.findElement(By.css("form button[type='submit']")).click();
  await driver.wait(
    until.elementLocated(
      By.xpath("//*[normalize-space()='Expense added successfully.']"),
    ),
    10000,
  );
  return description;
}

async function deleteExpenseByDescription(driver, description) {
  const row = await driver.findElement(
    By.xpath(
      `//tr[@title='Click to edit expense'][.//td[2][normalize-space()='${description}']]`,
    ),
  );
  const deleteButton = await row.findElement(
    By.css("button[aria-label^='Delete']"),
  );
  await driver.executeScript("window.confirm = () => true;");
  await deleteButton.click();
  await driver.wait(
    until.elementLocated(
      By.xpath("//*[normalize-space()='Expense deleted successfully.']"),
    ),
    10000,
  );
}

describe("Expenses page", function () {
  this.timeout(30000);
  let driver;

  beforeEach(async function () {
    driver = await new Builder().forBrowser("firefox").build();
    await driver.manage().window().setRect({ width: 1280, height: 900 });
    if (!this.currentTest.title.startsWith("redirects unauthenticated")) {
      await signIn(driver);
    }
  });

  afterEach(async function () {
    if (driver) await driver.quit();
  });

  it("redirects unauthenticated users to login", async function () {
    await driver.get(baseUrl);
    await driver.executeScript("window.localStorage.clear();");
    await driver.get(`${baseUrl}/expenses`);
    assert.ok(title.includes("Not Found"));
  });

  it("renders the expense tracker heading", async function () {
    assert.strictEqual(
      await driver.findElement(By.css("h1")).getText(),
      "Expense Tracker",
    );
  });

  it("renders the expense history section", async function () {
    assert.strictEqual(
      await driver
        .findElement(By.xpath("//h2[normalize-space()='Expense history']"))
        .getText(),
      "Expense history",
    );
  });

  it("renders all summary labels", async function () {
    const pageText = await driver.findElement(By.css("main")).getText();
    assert.ok(pageText.includes("This month"));
    assert.ok(pageText.includes("All expenses"));
    assert.ok(pageText.includes("Average this month"));
    assert.ok(pageText.includes("Latest expense"));
  });

  it("renders the add expense form", async function () {
    assert.strictEqual(
      await driver
        .findElement(By.xpath("//h2[normalize-space()='Add expense']"))
        .getText(),
      "Add expense",
    );
    assert.ok(
      await driver
        .findElement(By.css("form button[type='submit']"))
        .isDisplayed(),
    );
  });

  it("defaults the category to other", async function () {
    assert.strictEqual(
      await driver.findElement(By.name("category")).getAttribute("value"),
      "other",
    );
  });

  it("defaults the date to today", async function () {
    const expectedDate = new Date().toISOString().slice(0, 10);
    assert.strictEqual(
      await driver.findElement(By.name("date")).getAttribute("value"),
      expectedDate,
    );
  });

  it("renders every expense category option", async function () {
    const options = await driver.findElements(
      By.css("select[name='category'] option"),
    );
    assert.strictEqual(options.length, 7);
  });

  it("requires an amount before submitting", async function () {
    const amount = await driver.findElement(By.name("amount"));
    await driver.findElement(By.css("form button[type='submit']")).click();
    assert.ok((await amount.getAttribute("validationMessage")).length > 0);
  });

  it("requires a short description before submitting", async function () {
    await setInput(driver, "amount", "20");
    const description = await driver.findElement(By.name("shortDescription"));
    await driver.findElement(By.css("form button[type='submit']")).click();
    assert.strictEqual(
      await description.getAttribute("validationMessage"),
      "Please fill out this field.",
    );
  });

  it("rejects a negative amount through native validation", async function () {
    const amount = await setInput(driver, "amount", "-1");
    assert.strictEqual(
      await driver.executeScript("return arguments[0].validity.valid;", amount),
      false,
    );
  });

  it("limits the description to 120 characters", async function () {
    const description = await driver.findElement(By.name("shortDescription"));
    assert.strictEqual(await description.getAttribute("maxlength"), "120");
  });

  it("allows changing the category", async function () {
    const category = await driver.findElement(By.name("category"));
    await category.sendKeys("Marketing");
    assert.strictEqual(await category.getAttribute("value"), "marketing");
  });

  it("allows changing the expense date", async function () {
    const date = await setInput(driver, "date", "2026-01-15");
    assert.strictEqual(await date.getAttribute("value"), "2026-01-15");
  });

  it("adds an expense and shows a success notice", async function () {
    const description = await addExpense(driver);
    assert.ok(
      await driver
        .findElement(By.xpath(`//td[normalize-space()='${description}']`))
        .isDisplayed(),
    );
    await deleteExpenseByDescription(driver, description);
  });

  it("opens an expense in edit mode and supports cancellation", async function () {
    const description = await addExpense(driver);
    const row = await driver.findElement(
      By.xpath(
        `//tr[@title='Click to edit expense'][.//td[2][normalize-space()='${description}']]`,
      ),
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView({ block: 'center' }); arguments[0].click();",
      row,
    );
    assert.strictEqual(
      await driver
        .findElement(By.xpath("//h2[normalize-space()='Edit expense']"))
        .getText(),
      "Edit expense",
    );
    await driver
      .findElement(By.xpath("//button[normalize-space()='Cancel editing']"))
      .click();
    assert.strictEqual(
      await driver
        .findElement(By.xpath("//h2[normalize-space()='Add expense']"))
        .getText(),
      "Add expense",
    );
    await deleteExpenseByDescription(driver, description);
  });

  it("updates an existing expense", async function () {
    const description = await addExpense(driver);
    const row = await driver.findElement(
      By.xpath(
        `//tr[@title='Click to edit expense'][.//td[2][normalize-space()='${description}']]`,
      ),
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView({ block: 'center' }); arguments[0].click();",
      row,
    );
    await setInput(driver, "amount", "250");
    await setInput(driver, "shortDescription", `${description} updated`);
    await driver.findElement(By.css("form button[type='submit']")).click();
    await driver.wait(
      until.elementLocated(
        By.xpath("//*[normalize-space()='Expense updated successfully.']"),
      ),
      10000,
    );
    assert.ok(
      await driver
        .findElement(
          By.xpath(`//td[normalize-space()='${description} updated']`),
        )
        .isDisplayed(),
    );
    await deleteExpenseByDescription(driver, `${description} updated`);
  });

  it("deletes an expense after confirmation", async function () {
    const description = await addExpense(driver);
    await deleteExpenseByDescription(driver, description);
    assert.strictEqual(
      await driver
        .findElements(
          By.xpath(
            `//tr[@title='Click to edit expense'][.//td[2][normalize-space()='${description}']]`,
          ),
        )
        .then((rows) => rows.length),
      0,
    );
  });
});
