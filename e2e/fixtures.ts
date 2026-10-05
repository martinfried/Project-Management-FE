import { test as base, expect, type Page, type Locator } from "@playwright/test";
import { translations, type TranslationsSchema } from "../src/i18n/translations";

export const t: TranslationsSchema = translations.cs;

export function format(template: string, values: Record<string, string | number>): string {
  let result = template;
  for (const [key, val] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
  }
  return result;
}

export class ProjectsPageHelper {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto("/projects");
    await expect(this.page.getByTestId("create-project-btn")).toBeVisible();
  }

  async createProject(data: { name: string; description?: string; status?: "Planned" | "In Progress" | "Completed" | "On Hold"; startDate?: string; endDate?: string }) {
    await this.page.getByTestId("create-project-btn").click();
    await expect(this.page.getByTestId("project-form-dialog")).toBeVisible();

    await this.page.getByTestId("project-name-input").fill(data.name);
    if (data.description) {
      await this.page.getByTestId("project-desc-input").fill(data.description);
    }
    if (data.status) {
      await this.page.getByTestId("project-status-select").selectOption(data.status);
    }
    if (data.startDate) {
      await this.page.getByTestId("project-start-date-input").fill(data.startDate);
    }
    if (data.endDate) {
      await this.page.getByTestId("project-end-date-input").fill(data.endDate);
    }

    await this.page.getByTestId("project-submit-btn").click();
    await expect(this.page.getByTestId("project-form-dialog")).not.toBeVisible();
  }

  getRow(projectName: string): Locator {
    return this.page.locator("tr", { hasText: projectName });
  }

  async advanceStatus(projectName: string) {
    const row = this.getRow(projectName);
    await row.getByTestId("project-next-status-btn").click();
  }

  async openDetails(projectName: string) {
    const row = this.getRow(projectName);
    await row.getByTestId("project-view-btn").click();
    await expect(this.page.locator("[role='dialog']")).toBeVisible();
  }

  async closeDetails() {
    await this.page.keyboard.press("Escape");
  }

  async assignTeam(teamName: string) {
    const dialog = this.page.locator("[role='dialog']");
    const select = dialog.getByTestId("assign-team-select");
    const option = select.locator("option", { hasText: teamName });
    await expect(option).toBeAttached();
    const val = await option.getAttribute("value");
    if (val) {
      await select.selectOption(val);
    }
    await dialog.getByTestId("assign-team-btn").click();
  }

  getAssignedTeamRow(teamName: string): Locator {
    return this.page.locator("[role='dialog']").locator("[data-testid^='assigned-team-row-']", { hasText: teamName });
  }

  async removeTeam(teamName: string) {
    const teamRow = this.getAssignedTeamRow(teamName);
    await teamRow.locator("[data-testid^='remove-team-btn-']").click();
  }

  async assignPerson(personName: string) {
    const dialog = this.page.locator("[role='dialog']");
    const select = dialog.getByTestId("assign-person-select");
    const option = select.locator("option", { hasText: personName });
    await expect(option).toBeAttached();
    const val = await option.getAttribute("value");
    if (val) {
      await select.selectOption(val);
    }
    await dialog.getByTestId("assign-person-btn").click();
  }

  async removePerson(personName: string) {
    const dialog = this.page.locator("[role='dialog']");
    const personRow = dialog.locator("[data-testid^='participant-row-']", { hasText: personName });
    await personRow.locator("[data-testid^='remove-person-btn-']").click();
  }

  getParticipantRow(personName: string): Locator {
    return this.page.locator("[role='dialog'] [data-testid^='participant-row-']", { hasText: personName });
  }

  async editProject(projectName: string, data: { name?: string; description?: string }) {
    const row = this.getRow(projectName);
    await row.getByTestId("project-edit-btn").click();
    await expect(this.page.getByTestId("project-form-dialog")).toBeVisible();

    if (data.name) {
      await this.page.getByTestId("project-name-input").fill(data.name);
    }
    if (data.description) {
      await this.page.getByTestId("project-desc-input").fill(data.description);
    }
    await this.page.getByTestId("project-submit-btn").click();
    await expect(this.page.getByTestId("project-form-dialog")).not.toBeVisible();
  }

  async filterByStatus(status: "All" | "Planned" | "In Progress" | "Completed" | "On Hold" | string) {
    if (status === "All") {
      await this.page.getByTestId("status-filter-all").click();
    } else {
      const testId = `status-filter-${status.toLowerCase().replace(/\s+/g, "-")}`;
      await this.page.getByTestId(testId).click();
    }
  }

  async search(query: string) {
    await this.page.getByTestId("project-search-input").fill(query);
  }

  async deleteProject(projectName: string) {
    this.page.once("dialog", (dialog) => dialog.accept());
    const row = this.getRow(projectName);
    await row.getByTestId("project-delete-btn").click();
    await expect(this.page.getByText(projectName)).not.toBeVisible();
  }
}

export class TeamsPageHelper {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto("/teams");
    await expect(this.page.getByTestId("create-team-btn")).toBeVisible();
  }

  async createTeam(data: { name: string; description?: string }) {
    await this.page.getByTestId("create-team-btn").click();
    await expect(this.page.getByTestId("team-form-dialog")).toBeVisible();

    await this.page.getByTestId("team-name-input").fill(data.name);
    if (data.description) {
      await this.page.getByTestId("team-desc-input").fill(data.description);
    }

    await this.page.getByTestId("team-submit-btn").click();
    await expect(this.page.getByTestId("team-form-dialog")).not.toBeVisible();
  }

  getRow(teamName: string): Locator {
    return this.page.locator("tr", { hasText: teamName });
  }

  async openDetails(teamName: string) {
    const row = this.getRow(teamName);
    await row.getByTestId("team-view-btn").click();
    await expect(this.page.locator("[role='dialog']")).toBeVisible();
  }

  async closeDetails() {
    await this.page.keyboard.press("Escape");
  }

  async search(query: string) {
    await this.page.getByTestId("team-search-input").fill(query);
  }

  async deleteTeam(teamName: string) {
    this.page.once("dialog", (dialog) => dialog.accept());
    const row = this.getRow(teamName);
    await row.getByTestId("team-delete-btn").click();
    await expect(this.page.getByText(teamName)).not.toBeVisible();
  }
}

export class PersonsPageHelper {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto("/persons");
    await expect(this.page.getByTestId("create-person-btn")).toBeVisible();
  }

  async createPerson(data: { name: string; email: string; role: string; teamLabel?: string }) {
    await this.page.getByTestId("create-person-btn").click();
    await expect(this.page.getByTestId("person-form-dialog")).toBeVisible();

    await this.page.getByTestId("person-name-input").fill(data.name);
    await this.page.getByTestId("person-email-input").fill(data.email);
    await this.page.getByTestId("person-role-input").fill(data.role);

    if (data.teamLabel) {
      await this.page.getByTestId("person-team-select").selectOption({ label: data.teamLabel });
    }

    await this.page.getByTestId("person-submit-btn").click();
    await expect(this.page.getByTestId("person-form-dialog")).not.toBeVisible();
  }

  getRow(personName: string): Locator {
    return this.page.locator("tr", { hasText: personName });
  }

  async search(query: string) {
    await this.page.getByTestId("person-search-input").fill(query);
  }

  async editPerson(personName: string, data: { name?: string; email?: string; role?: string; teamLabel?: string; clearTeam?: boolean }) {
    const row = this.getRow(personName);
    await row.getByTestId("person-edit-btn").click();
    await expect(this.page.getByTestId("person-form-dialog")).toBeVisible();

    if (data.name) {
      await this.page.getByTestId("person-name-input").fill(data.name);
    }
    if (data.email) {
      await this.page.getByTestId("person-email-input").fill(data.email);
    }
    if (data.role) {
      await this.page.getByTestId("person-role-input").fill(data.role);
    }
    if (data.teamLabel) {
      await this.page.getByTestId("person-team-select").selectOption({ label: data.teamLabel });
    } else if (data.clearTeam) {
      await this.page.getByTestId("person-team-select").selectOption("");
    }

    await this.page.getByTestId("person-submit-btn").click();
    await expect(this.page.getByTestId("person-form-dialog")).not.toBeVisible();
  }

  async deletePerson(personName: string) {
    this.page.once("dialog", (dialog) => dialog.accept());
    const row = this.getRow(personName);
    await row.getByTestId("person-delete-btn").click();
    await expect(this.page.getByText(personName)).not.toBeVisible();
  }
}

export const test = base.extend<{
  projectsPage: ProjectsPageHelper;
  teamsPage: TeamsPageHelper;
  personsPage: PersonsPageHelper;
}>({
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPageHelper(page));
  },
  teamsPage: async ({ page }, use) => {
    await use(new TeamsPageHelper(page));
  },
  personsPage: async ({ page }, use) => {
    await use(new PersonsPageHelper(page));
  },
});

export { expect };
