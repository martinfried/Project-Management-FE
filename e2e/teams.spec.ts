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

  test("assigns and removes a team member in team detail dialog", async ({ page }) => {
    // 1. Create a person first
    await page.goto("/persons");
    await expect(page.getByTestId("create-person-btn")).toBeVisible();
    const timestamp = Date.now();
    const personName = `Team Member ${timestamp}`;
    await page.getByTestId("create-person-btn").click();
    await page.getByTestId("person-name-input").fill(personName);
    await page.getByTestId("person-email-input").fill(`member.${timestamp}@example.com`);
    await page.getByTestId("person-role-input").fill("QA Engineer");
    await page.getByTestId("person-submit-btn").click();
    await expect(page.getByTestId("person-form-dialog")).not.toBeVisible();

    // 2. Create a team
    await page.goto("/teams");
    await expect(page.getByTestId("create-team-btn")).toBeVisible();
    const teamName = `Member Team ${timestamp}`;
    await page.getByTestId("create-team-btn").click();
    await page.getByTestId("team-name-input").fill(teamName);
    await page.getByTestId("team-submit-btn").click();
    await expect(page.getByTestId("team-form-dialog")).not.toBeVisible();

    // 3. Open team details
    const row = page.locator("tr", { hasText: teamName });
    await row.getByTestId("team-view-btn").click();
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // 4. Assign the person to the team
    const select = dialog.getByTestId("assign-person-select");
    const option = select.locator("option", { hasText: personName });
    await expect(option).toBeAttached();
    const val = await option.getAttribute("value");
    if (val) {
      await select.selectOption(val);
    }
    await dialog.getByTestId("assign-person-btn").click();

    // 5. Verify member is listed in dialog
    const memberRow = dialog.locator("[data-testid^='team-member-row-']", { hasText: personName });
    await expect(memberRow).toBeVisible();

    // 6. Remove member from team
    await memberRow.locator("[data-testid^='remove-member-btn-']").click();
    await expect(memberRow).not.toBeVisible();

    // 7. Close dialog and clean up
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await row.getByTestId("team-delete-btn").click();
    await expect(page.getByText(teamName)).not.toBeVisible();

    // Delete person
    await page.goto("/persons");
    await expect(page.getByTestId("create-person-btn")).toBeVisible();
    await page.getByTestId("person-search-input").fill(personName);
    const personRow = page.locator("tr", { hasText: personName });
    page.once("dialog", (dialog) => dialog.accept());
    await personRow.getByTestId("person-delete-btn").click();
    await expect(page.getByText(personName)).not.toBeVisible();
  });

  test("assigns and removes a project in team detail dialog", async ({ page }) => {
    // 1. Create a project first
    await page.goto("/projects");
    await expect(page.getByTestId("create-project-btn")).toBeVisible();
    const timestamp = Date.now();
    const projectName = `Team Test Project ${timestamp}`;
    await page.getByTestId("create-project-btn").click();
    await page.getByTestId("project-name-input").fill(projectName);
    await page.getByTestId("project-submit-btn").click();
    await expect(page.getByTestId("project-form-dialog")).not.toBeVisible();

    // 2. Create a team
    await page.goto("/teams");
    await expect(page.getByTestId("create-team-btn")).toBeVisible();
    const teamName = `Project Team ${timestamp}`;
    await page.getByTestId("create-team-btn").click();
    await page.getByTestId("team-name-input").fill(teamName);
    await page.getByTestId("team-submit-btn").click();
    await expect(page.getByTestId("team-form-dialog")).not.toBeVisible();

    // 3. Open team details
    const row = page.locator("tr", { hasText: teamName });
    await row.getByTestId("team-view-btn").click();
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // 4. Assign the project to the team
    const select = dialog.getByTestId("assign-project-select");
    const option = select.locator("option", { hasText: projectName });
    await expect(option).toBeAttached();
    const val = await option.getAttribute("value");
    if (val) {
      await select.selectOption(val);
    }
    await dialog.getByTestId("assign-project-btn").click();

    // 5. Verify project is listed in dialog
    const projectRow = dialog.locator("[data-testid^='assigned-project-row-']", { hasText: projectName });
    await expect(projectRow).toBeVisible();

    // 6. Remove project from team
    await projectRow.locator("[data-testid^='remove-project-btn-']").click();
    await expect(projectRow).not.toBeVisible();

    // 7. Close dialog and clean up
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await row.getByTestId("team-delete-btn").click();
    await expect(page.getByText(teamName)).not.toBeVisible();

    // Delete project
    await page.goto("/projects");
    const pRow = page.locator("tr", { hasText: projectName });
    page.once("dialog", (dialog) => dialog.accept());
    await pRow.getByTestId("project-delete-btn").click();
    await expect(page.getByText(projectName)).not.toBeVisible();
  });

  test("empties team members, adds one, then adds another and sees all members properly in the list", async ({ page }) => {
    const timestamp = Date.now();
    const person1Name = `Person A ${timestamp}`;
    const person2Name = `Person B ${timestamp}`;

    // 1. Create Person A
    await page.goto("/persons");
    await expect(page.getByTestId("create-person-btn")).toBeVisible();
    await page.getByTestId("create-person-btn").click();
    await page.getByTestId("person-name-input").fill(person1Name);
    await page.getByTestId("person-email-input").fill(`personA.${timestamp}@example.com`);
    await page.getByTestId("person-role-input").fill("Developer");
    await page.getByTestId("person-submit-btn").click();
    await expect(page.getByTestId("person-form-dialog")).not.toBeVisible();

    // 2. Create Person B
    await page.getByTestId("create-person-btn").click();
    await page.getByTestId("person-name-input").fill(person2Name);
    await page.getByTestId("person-email-input").fill(`personB.${timestamp}@example.com`);
    await page.getByTestId("person-role-input").fill("Designer");
    await page.getByTestId("person-submit-btn").click();
    await expect(page.getByTestId("person-form-dialog")).not.toBeVisible();

    // 3. Create a team
    await page.goto("/teams");
    await expect(page.getByTestId("create-team-btn")).toBeVisible();
    const teamName = `Multi Member Team ${timestamp}`;
    await page.getByTestId("create-team-btn").click();
    await page.getByTestId("team-name-input").fill(teamName);
    await page.getByTestId("team-submit-btn").click();
    await expect(page.getByTestId("team-form-dialog")).not.toBeVisible();

    // 4. Open team details
    const row = page.locator("tr", { hasText: teamName });
    await row.getByTestId("team-view-btn").click();
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // 5. Add Person A
    const select = dialog.getByTestId("assign-person-select");
    const optA = select.locator("option", { hasText: person1Name });
    await expect(optA).toBeAttached();
    await select.selectOption((await optA.getAttribute("value")) || "");
    await dialog.getByTestId("assign-person-btn").click();

    // Verify Person A is in member list
    const memberARow = dialog.locator("[data-testid^='team-member-row-']", { hasText: person1Name });
    await expect(memberARow).toBeVisible();

    // 6. Remove Person A (now team is empty)
    await memberARow.locator("[data-testid^='remove-member-btn-']").click();
    await expect(memberARow).not.toBeVisible();

    // 7. Add Person A back to the empty team
    const selectAfterEmpty = dialog.getByTestId("assign-person-select");
    const optA2 = selectAfterEmpty.locator("option", { hasText: person1Name });
    await expect(optA2).toBeAttached();
    await selectAfterEmpty.selectOption((await optA2.getAttribute("value")) || "");
    await dialog.getByTestId("assign-person-btn").click();

    // Verify Person A is immediately visible in the list
    await expect(dialog.locator("[data-testid^='team-member-row-']", { hasText: person1Name })).toBeVisible();

    // 8. Add Person B
    const optB = dialog.getByTestId("assign-person-select").locator("option", { hasText: person2Name });
    await expect(optB).toBeAttached();
    await dialog.getByTestId("assign-person-select").selectOption((await optB.getAttribute("value")) || "");
    await dialog.getByTestId("assign-person-btn").click();

    // Verify BOTH Person A and Person B are visible in the list
    await expect(dialog.locator("[data-testid^='team-member-row-']", { hasText: person1Name })).toBeVisible();
    await expect(dialog.locator("[data-testid^='team-member-row-']", { hasText: person2Name })).toBeVisible();

    // Clean up
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    page.once("dialog", (d) => d.accept());
    await row.getByTestId("team-delete-btn").click();
    await expect(page.getByText(teamName)).not.toBeVisible();

    await page.goto("/persons");
    await expect(page.getByTestId("create-person-btn")).toBeVisible();
    await page.getByTestId("person-search-input").fill(person1Name);
    page.once("dialog", (d) => d.accept());
    await page.locator("tr", { hasText: person1Name }).getByTestId("person-delete-btn").click();
    await expect(page.getByText(person1Name)).not.toBeVisible();

    await page.getByTestId("person-search-input").fill(person2Name);
    page.once("dialog", (d) => d.accept());
    await page.locator("tr", { hasText: person2Name }).getByTestId("person-delete-btn").click();
    await expect(page.getByText(person2Name)).not.toBeVisible();
  });
});



