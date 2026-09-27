import { Builder, By, until } from "selenium-webdriver";
import assert from "assert";
import { afterEach, beforeEach, describe, it } from "mocha";

const testEnv = globalThis.process?.env || {};
const baseUrl = testEnv.TEST_BASE_URL || "http://localhost:5173";
const adminEmail = testEnv.TEST_ADMIN_EMAIL || "admin@test.com";
const adminPassword = testEnv.TEST_ADMIN_PASSWORD || "Admin123@";

async function waitForSupplierPage(driver) {
  await driver.wait(
    until.elementLocated(
      By.xpath("//h1[normalize-space()='Supplier Management']"),
    ),
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
  await driver.get(`${baseUrl}/suppliers`);
  await waitForSupplierPage(driver);
}

async function setInput(driver, name, value) {
  const input = await driver.findElement(By.name(name));
  await input.clear();
  await input.sendKeys(value);
  return input;
}

async function openAddSupplierModal(driver) {
  await driver
    .findElement(By.xpath("//button[normalize-space()='Add supplier']"))
    .click();
  await driver.wait(
    until.elementLocated(
      By.xpath(
        "//h2[@id='supplier-modal-title' and normalize-space()='Add supplier']",
      ),
    ),
    10000,
  );
}

async function fillSupplierForm(driver, supplier) {
  await setInput(driver, "representativeName", supplier.representativeName);
  await setInput(driver, "companyName", supplier.companyName);
  await setInput(driver, "phoneNumber", supplier.phoneNumber);
  await setInput(driver, "email", supplier.email);
  await setInput(driver, "address", supplier.address);
}

async function addSupplier(driver, suffix = Date.now()) {
  const supplier = {
    representativeName: `Selenium Representative ${suffix}`,
    companyName: `Selenium Company ${suffix}`,
    phoneNumber: "0771234567",
    email: `selenium.${suffix}@example.com`,
    address: "123 Selenium Street",
  };
  await openAddSupplierModal(driver);
  await fillSupplierForm(driver, supplier);
  await driver
    .findElement(
      By.xpath("//*[@role='dialog']//button[normalize-space()='Add supplier']"),
    )
    .click();
  await driver.wait(
    until.elementLocated(
      By.xpath(
        "//*[@role='status' and contains(normalize-space(), 'Supplier added successfully')]",
      ),
    ),
    10000,
  );
  return supplier;
}

async function deleteSupplier(driver, companyName) {
  const row = await driver.findElement(
    By.xpath(`//tbody/tr[td[normalize-space()='${companyName}']]`),
  );
  await driver.executeScript("window.confirm = () => true;");
  await driver.executeScript(
    "arguments[0].scrollIntoView({ block: 'center' });",
    row,
  );
  await row.findElement(By.css("button[aria-label^='Delete']")).click();
  await driver.wait(
    until.elementLocated(
      By.xpath("//*[normalize-space()='Supplier deleted successfully.']"),
    ),
    10000,
  );
}

describe("Supplier page", function () {
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

  it("renders the supplier management heading", async function () {
    assert.strictEqual(
      await driver.findElement(By.css("h1")).getText(),
      "Supplier Management",
    );
  });

  it("sets the suppliers document title", async function () {
    assert.strictEqual(
      await driver.getTitle(),
      "Suppliers | Kannangara Hardwares",
    );
  });

  it("renders the supplier directory section", async function () {
    assert.strictEqual(
      await driver
        .findElement(By.xpath("//h2[normalize-space()='Supplier directory']"))
        .getText(),
      "Supplier directory",
    );
  });

  it("renders the supplier network summary", async function () {
    assert.ok(
      await driver
        .findElement(By.xpath("//p[normalize-space()='Supplier network']"))
        .isDisplayed(),
    );
    assert.ok(
      await driver
        .findElement(
          By.xpath(
            "//p[contains(normalize-space(), 'suppliers in directory')]",
          ),
        )
        .isDisplayed(),
    );
  });

  it("renders the supplier table headings", async function () {
    assert.strictEqual(
      (await driver.findElements(By.css("thead th"))).length,
      5,
    );
  });

  it("renders the download report button", async function () {
    const reportButton = await driver.findElement(
      By.xpath("//button[normalize-space()='Download Report']"),
    );
    assert.ok(await reportButton.isDisplayed());
  });

  it("renders the add supplier button", async function () {
    assert.ok(
      await driver
        .findElement(By.xpath("//button[normalize-space()='Add supplier']"))
        .isDisplayed(),
    );
  });

  it("renders the supplier search controls", async function () {
    const search = await driver.findElement(
      By.css("form input[type='search']"),
    );
    assert.strictEqual(
      await search.getAttribute("placeholder"),
      "Search by product, company or representative name",
    );
    assert.ok(
      await driver
        .findElement(By.xpath("//button[normalize-space()='Search suppliers']"))
        .isDisplayed(),
    );
  });

  it("filters the directory with a search term", async function () {
    const search = await driver.findElement(
      By.css("form input[type='search']"),
    );
    await search.sendKeys("no-supplier-with-this-name");
    await driver
      .findElement(By.xpath("//button[normalize-space()='Search suppliers']"))
      .click();
    await driver.wait(
      until.elementLocated(
        By.xpath("//*[normalize-space()='No suppliers match this search.']"),
      ),
      10000,
    );
    assert.ok(true);
  });

  it("shows and clears the search filter", async function () {
    const search = await driver.findElement(
      By.css(
        "input[placeholder='Search by product, company or representative name']",
      ),
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView({ block: 'center' });",
      search,
    );
    await driver.wait(until.elementIsVisible(search), 5000);
    await search.click();
    await search.sendKeys("temporary-filter");
    assert.ok(
      await driver
        .findElement(By.xpath("//button[normalize-space()='Clear']"))
        .isDisplayed(),
    );
    await driver
      .findElement(By.xpath("//button[normalize-space()='Clear']"))
      .click();
    assert.strictEqual(await search.getAttribute("value"), "");
  });

  it("opens the add supplier modal", async function () {
    await openAddSupplierModal(driver);
    assert.ok(
      await driver.findElement(By.css("[role='dialog']")).isDisplayed(),
    );
  });

  it("renders all supplier form fields", async function () {
    await openAddSupplierModal(driver);
    for (const field of [
      "representativeName",
      "companyName",
      "phoneNumber",
      "email",
      "address",
    ]) {
      assert.ok(await driver.findElement(By.name(field)).isDisplayed());
    }
  });

  it("shows the empty product selection state", async function () {
    await openAddSupplierModal(driver);
    await driver.wait(
      until.elementLocated(
        By.xpath("//*[normalize-space()='No products selected yet.']"),
      ),
      10000,
    );
    assert.ok(
      (await driver.findElement(By.css("[role='dialog']")).getText()).includes(
        "No products selected yet.",
      ),
    );
  });

  it("requires supplier fields before submission", async function () {
    await openAddSupplierModal(driver);
    await driver
      .findElement(
        By.xpath(
          "//*[@role='dialog']//button[normalize-space()='Add supplier']",
        ),
      )
      .click();
    const representative = await driver.findElement(
      By.name("representativeName"),
    );
    assert.ok(
      (await representative.getAttribute("validationMessage")).length > 0,
    );
  });

  it("closes the supplier modal with Cancel", async function () {
    await openAddSupplierModal(driver);
    await driver
      .findElement(
        By.xpath("//*[@role='dialog']//button[normalize-space()='Cancel']"),
      )
      .click();
    assert.strictEqual(
      await driver
        .findElements(By.css("[role='dialog']"))
        .then((dialogs) => dialogs.length),
      0,
    );
  });

  it("adds a supplier and displays a success notice", async function () {
    const supplier = await addSupplier(driver);
    assert.ok(
      await driver
        .findElement(
          By.xpath(`//td[normalize-space()='${supplier.companyName}']`),
        )
        .isDisplayed(),
    );
    await deleteSupplier(driver, supplier.companyName);
  });

  it("edits an existing supplier", async function () {
    const supplier = await addSupplier(driver);
    const row = await driver.findElement(
      By.xpath(`//tbody/tr[td[normalize-space()='${supplier.companyName}']]`),
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView({ block: 'center' }); arguments[0].click();",
      row,
    );
    await driver.wait(
      until.elementLocated(By.xpath("//h2[normalize-space()='Edit supplier']")),
      10000,
    );
    const updatedCompany = `${supplier.companyName} Updated`;
    await setInput(driver, "companyName", updatedCompany);
    await driver
      .findElement(
        By.xpath(
          "//*[@role='dialog']//button[normalize-space()='Save changes']",
        ),
      )
      .click();
    await driver.wait(
      until.elementLocated(
        By.xpath("//*[normalize-space()='Supplier updated successfully.']"),
      ),
      10000,
    );
    assert.ok(
      await driver
        .findElement(By.xpath(`//td[normalize-space()='${updatedCompany}']`))
        .isDisplayed(),
    );
    await deleteSupplier(driver, updatedCompany);
  });

  it("deletes a supplier after confirmation", async function () {
    const supplier = await addSupplier(driver);
    await deleteSupplier(driver, supplier.companyName);
    assert.strictEqual(
      (
        await driver.findElements(
          By.xpath(
            `//tbody/tr[td[normalize-space()='${supplier.companyName}']]`,
          ),
        )
      ).length,
      0,
    );
  });
});
