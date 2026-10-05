import { test, expect } from "@playwright/test";

test.describe("Teams CRUD Scenarios", () => {
  test("creates, edits, and removes a team", async ({ page }) => {
    // 1. Navigate to Teams page
    await page.goto("/teams");
    await expect(page.getByTestId("create-team-btn")).toBeVisible();

    // 2. CREATE TEAM
    const timestamp = Date.now();
    const teamName = `E2E Team ${timestamp}`;
    const teamDesc = "Automated E2E team description";

    await page.getByTestId("create-team-btn").click();
    await expect(page.getByTestId("team-form-dialog")).toBeVisible();

    await page.getByTestId("team-name-input").fill(teamName);
    await page.getByTestId("team-desc-input").fill(teamDesc);
    await page.getByTestId("team-submit-btn").click();

    // Verify dialog closes and newly created team appears in table
    await expect(page.getByTestId("team-form-dialog")).not.toBeVisible();
    await expect(page.getByText(teamName)).toBeVisible();

    // 3. EDIT TEAM
    const teamRow = page.locator("tr", { hasText: teamName });
    await teamRow.getByTestId("team-edit-btn").click();
    await expect(page.getByTestId("team-form-dialog")).toBeVisible();

    const updatedTeamName = `${teamName} Updated`;
    await page.getByTestId("team-name-input").fill(updatedTeamName);
    await page.getByTestId("team-submit-btn").click();

    // Verify dialog closes and updated team name appears in table
    await expect(page.getByTestId("team-form-dialog")).not.toBeVisible();
    await expect(page.getByText(updatedTeamName)).toBeVisible();

    // 4. REMOVE TEAM
    page.once("dialog", (dialog) => dialog.accept());
    const updatedRow = page.locator("tr", { hasText: updatedTeamName });
    await updatedRow.getByTestId("team-delete-btn").click();

    // Verify team is removed from table
    await expect(page.getByText(updatedTeamName)).not.toBeVisible();
  });
});
