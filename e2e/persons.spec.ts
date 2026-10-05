import { test, expect } from "@playwright/test";

test.describe("Persons CRUD Scenarios", () => {
  test("creates, edits, and removes a person", async ({ page }) => {
    // 1. Navigate to Persons page
    await page.goto("/persons");
    await expect(page.getByTestId("create-person-btn")).toBeVisible();

    // 2. CREATE PERSON
    const timestamp = Date.now();
    const personName = `E2E Person ${timestamp}`;
    const personEmail = `e2e.person.${timestamp}@example.com`;
    const personRole = "QA Automation Lead";

    await page.getByTestId("create-person-btn").click();
    await expect(page.getByTestId("person-form-dialog")).toBeVisible();

    await page.getByTestId("person-name-input").fill(personName);
    await page.getByTestId("person-email-input").fill(personEmail);
    await page.getByTestId("person-role-input").fill(personRole);
    await page.getByTestId("person-submit-btn").click();

    // Verify dialog closes and newly created person appears in table
    await expect(page.getByTestId("person-form-dialog")).not.toBeVisible();
    await expect(page.getByText(personName)).toBeVisible();
    await expect(page.getByText(personEmail)).toBeVisible();

    // 3. EDIT PERSON
    const personRow = page.locator("tr", { hasText: personName });
    await personRow.getByTestId("person-edit-btn").click();
    await expect(page.getByTestId("person-form-dialog")).toBeVisible();

    const updatedPersonName = `${personName} Updated`;
    await page.getByTestId("person-name-input").fill(updatedPersonName);
    await page.getByTestId("person-submit-btn").click();

    // Verify dialog closes and updated person name appears in table
    await expect(page.getByTestId("person-form-dialog")).not.toBeVisible();
    await expect(page.getByText(updatedPersonName)).toBeVisible();

    // 4. REMOVE PERSON
    page.once("dialog", (dialog) => dialog.accept());
    const updatedRow = page.locator("tr", { hasText: updatedPersonName });
    await updatedRow.getByTestId("person-delete-btn").click();

    // Verify person is removed from table
    await expect(page.getByText(updatedPersonName)).not.toBeVisible();
  });
});
