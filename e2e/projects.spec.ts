import { test, expect, t } from "./fixtures";

test.describe("Projects CRUD Scenarios", () => {
  test("creates, edits, and removes a project", async ({ page }) => {
    // 1. Navigate to Projects page
    await page.goto("/projects");
    await expect(page.getByTestId("create-project-btn")).toBeVisible();

    // 2. CREATE PROJECT
    const timestamp = Date.now();
    const projectName = `E2E Project ${timestamp}`;
    const projectDesc = "Automated E2E testing description";

    await page.getByTestId("create-project-btn").click();
    await expect(page.getByTestId("project-form-dialog")).toBeVisible();

    await page.getByTestId("project-name-input").fill(projectName);
    await page.getByTestId("project-desc-input").fill(projectDesc);
    await page.getByTestId("project-status-select").selectOption("In Progress");
    await page.getByTestId("project-submit-btn").click();

    // Verify dialog closes and newly created project appears in table
    await expect(page.getByTestId("project-form-dialog")).not.toBeVisible();
    await expect(page.getByText(projectName)).toBeVisible();

    // 3. EDIT PROJECT
    const projectRow = page.locator("tr", { hasText: projectName });
    await projectRow.getByTestId("project-edit-btn").click();
    await expect(page.getByTestId("project-form-dialog")).toBeVisible();

    const updatedName = `${projectName} Updated`;
    await page.getByTestId("project-name-input").fill(updatedName);
    await page.getByTestId("project-submit-btn").click();

    // Verify dialog closes and updated name appears in table
    await expect(page.getByTestId("project-form-dialog")).not.toBeVisible();
    await expect(page.getByText(updatedName)).toBeVisible();

    // 4. REMOVE PROJECT
    page.once("dialog", (dialog) => dialog.accept());
    const updatedRow = page.locator("tr", { hasText: updatedName });
    await updatedRow.getByTestId("project-delete-btn").click();

    // Verify project is removed from table
    await expect(page.getByText(updatedName)).not.toBeVisible();
  });

  test("validates date constraints (start date not in past, end date not before start)", async ({ page }) => {
    await page.goto("/projects");
    await page.getByTestId("create-project-btn").click();
    await expect(page.getByTestId("project-form-dialog")).toBeVisible();

    await page.getByTestId("project-name-input").fill("Date Constraint Test");

    // 1. Past start date should show error and disable submit button
    await page.getByTestId("project-start-date-input").fill("2020-01-01");
    await expect(page.getByTestId("error-start-date-past")).toBeVisible();
    await expect(page.getByTestId("project-submit-btn")).toBeDisabled();

    // 2. Fix start date to a future date
    await page.getByTestId("project-start-date-input").fill("2030-01-10");
    await expect(page.getByTestId("error-start-date-past")).not.toBeVisible();

    // 3. End date earlier than start date should show error and disable submit
    await page.getByTestId("project-end-date-input").fill("2030-01-05");
    await expect(page.getByTestId("error-end-date-before-start")).toBeVisible();
    await expect(page.getByTestId("project-submit-btn")).toBeDisabled();

    // 4. Setting end date equal to or after start date clears error and enables submit
    await page.getByTestId("project-end-date-input").fill("2030-01-20");
    await expect(page.getByTestId("error-end-date-before-start")).not.toBeVisible();
    await expect(page.getByTestId("project-submit-btn")).toBeEnabled();
  });

  test("advances project status to next state via row quick action", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByTestId("create-project-btn")).toBeVisible();

    const timestamp = Date.now();
    const projectName = `Status Advance ${timestamp}`;

    // Create a planned project
    await page.getByTestId("create-project-btn").click();
    await page.getByTestId("project-name-input").fill(projectName);
    await page.getByTestId("project-status-select").selectOption("Planned");
    await page.getByTestId("project-submit-btn").click();

    await expect(page.getByTestId("project-form-dialog")).not.toBeVisible();
    const row = page.locator("tr", { hasText: projectName });
    await expect(row).toBeVisible();
    await expect(row).toContainText(t.status["Planned"]);

    // Click quick action to advance to In Progress
    await row.getByTestId("project-next-status-btn").click();
    await expect(row).toContainText(t.status["In Progress"]);

    // Click quick action to advance to Completed
    await row.getByTestId("project-next-status-btn").click();
    await expect(row).toContainText(t.status["Completed"]);

    // Clean up
    page.once("dialog", (dialog) => dialog.accept());
    await row.getByTestId("project-delete-btn").click();
    await expect(page.getByText(projectName)).not.toBeVisible();
  });

  test("advances project status while a status filter is active and keeps filter and table in sync", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByTestId("create-project-btn")).toBeVisible();

    const timestamp = Date.now();
    const projectName = `Filter Sync Project ${timestamp}`;

    // 1. Create a planned project
    await page.getByTestId("create-project-btn").click();
    await page.getByTestId("project-name-input").fill(projectName);
    await page.getByTestId("project-status-select").selectOption("Planned");
    await page.getByTestId("project-submit-btn").click();
    await expect(page.getByTestId("project-form-dialog")).not.toBeVisible();

    // 2. Select Planned filter in the upper toolbar
    await page.getByTestId("status-filter-planned").click();
    await expect(page.getByTestId("status-filter-planned")).toHaveAttribute("aria-pressed", "true");

    const row = page.locator("tr", { hasText: projectName });
    await expect(row).toBeVisible();
    await expect(row).toContainText(t.status["Planned"]);

    // 3. Click move status arrow button
    await row.getByTestId("project-next-status-btn").click();

    // 4. Verify upper filter automatically updated to In Progress and row remains visible with In Progress status
    await expect(page.getByTestId("status-filter-in-progress")).toHaveAttribute("aria-pressed", "true");
    const updatedRow = page.locator("tr", { hasText: projectName });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText(t.status["In Progress"]);

    // 5. Clean up
    page.once("dialog", (dialog) => dialog.accept());
    await updatedRow.getByTestId("project-delete-btn").click();
    await expect(page.getByText(projectName)).not.toBeVisible();
  });
});
