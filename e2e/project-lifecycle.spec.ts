import { test, expect, t, format } from "./fixtures";

test.describe("Real-World Project Lifecycle & Cross-Entity Workflows", () => {
  test("complete end-to-end lifetime of a project: setup team, initiate project, advance stages, audit, and decommission", async ({
    page,
    projectsPage,
    teamsPage,
    personsPage,
  }) => {
    const timestamp = Date.now();
    const teamName = `E2E Special Ops ${timestamp}`;
    const personName = `Specialist Smith ${timestamp}`;
    const personEmail = `spec.smith.${timestamp}@defense.gov`;
    const directPersonName = `Commander Vance ${timestamp}`;
    const directPersonEmail = `vance.${timestamp}@defense.gov`;
    const projectName = `Operation Citadel ${timestamp}`;
    const projectDesc = "Critical infrastructure modernization and defense readiness";

    // -------------------------------------------------------------
    // PHASE 1: Organization Setup (Team & Personnel)
    // -------------------------------------------------------------
    await teamsPage.goto();
    await teamsPage.createTeam({
      name: teamName,
      description: "Dedicated rapid reaction cyber unit",
    });
    await expect(teamsPage.getRow(teamName)).toBeVisible();

    // Create a person assigned to the new team
    await personsPage.goto();
    await personsPage.createPerson({
      name: personName,
      email: personEmail,
      role: "Chief Security Architect",
      teamLabel: teamName,
    });
    await personsPage.search(personName);
    await expect(personsPage.getRow(personName)).toBeVisible();
    await personsPage.search("");

    // Create a person without a team for direct assignment
    await personsPage.createPerson({
      name: directPersonName,
      email: directPersonEmail,
      role: "Strategic Commander",
    });
    await personsPage.search(directPersonName);
    await expect(personsPage.getRow(directPersonName)).toBeVisible();

    // -------------------------------------------------------------
    // PHASE 2: Project Initiation & Planning
    // -------------------------------------------------------------
    await projectsPage.goto();
    await projectsPage.createProject({
      name: projectName,
      description: projectDesc,
      status: "Planned",
      startDate: "2030-01-01",
      endDate: "2030-12-31",
    });

    const projectRow = projectsPage.getRow(projectName);
    await expect(projectRow).toBeVisible();
    await expect(projectRow).toContainText(t.status["Planned"]);

    // Test status filtering in planning phase
    await projectsPage.filterByStatus("Planned");
    await expect(projectsPage.getRow(projectName)).toBeVisible();

    await projectsPage.filterByStatus("In Progress");
    await expect(projectsPage.getRow(projectName)).not.toBeVisible();

    await projectsPage.filterByStatus("All");
    await expect(projectsPage.getRow(projectName)).toBeVisible();

    // -------------------------------------------------------------
    // PHASE 3: Detail Audit, Team & Direct Staffing, Scope Refinement
    // -------------------------------------------------------------
    await projectsPage.openDetails(projectName);
    const detailDialog = page.locator("[role='dialog']");
    await expect(detailDialog).toContainText(projectName);
    await expect(detailDialog).toContainText(projectDesc);
    await expect(detailDialog).toContainText("2030");

    // 3a. Assign team to project -> members become participants via team
    await projectsPage.assignTeam(teamName);
    await expect(detailDialog).toContainText(teamName);
    const teamMemberRow = projectsPage.getParticipantRow(personName);
    await expect(teamMemberRow).toBeVisible();
    await expect(teamMemberRow).toContainText(format(t.projects.assignmentTeam, { team: teamName }));

    // 3b. Assign independent person directly to project
    await projectsPage.assignPerson(directPersonName);
    const directMemberRow = projectsPage.getParticipantRow(directPersonName);
    await expect(directMemberRow).toBeVisible();
    await expect(directMemberRow).toContainText(t.projects.assignmentDirect);

    // 3c. Also assign the team member directly -> badge advances to "Direct & Team"
    await projectsPage.assignPerson(personName);
    await expect(teamMemberRow).toContainText(t.projects.assignmentBoth);

    // 3d. Remove direct assignment -> member reverts to "Via {teamName}"
    await projectsPage.removePerson(personName);
    await expect(teamMemberRow).toContainText(format(t.projects.assignmentTeam, { team: teamName }));

    await projectsPage.closeDetails();

    // Verify row displays updated total participants count (2 participants: 1 team member + 1 direct)
    await expect(projectRow).toContainText("2");

    // Edit project description during planning review
    const updatedDesc = `${projectDesc} - Phase 1 Approved`;
    await projectsPage.editProject(projectName, { description: updatedDesc });
    await expect(projectsPage.getRow(projectName)).toContainText(updatedDesc);

    // -------------------------------------------------------------
    // PHASE 4: Execution - Progression from Planned to In Progress
    // -------------------------------------------------------------
    await projectsPage.advanceStatus(projectName);
    await expect(projectRow).toContainText(t.status["In Progress"]);

    // Verify filter reflects the new state
    await projectsPage.filterByStatus("In Progress");
    await expect(projectsPage.getRow(projectName)).toBeVisible();

    await projectsPage.filterByStatus("Planned");
    await expect(projectsPage.getRow(projectName)).not.toBeVisible();

    // -------------------------------------------------------------
    // PHASE 5: Completion - Final Delivery
    // -------------------------------------------------------------
    await projectsPage.filterByStatus("All");
    await projectsPage.advanceStatus(projectName);
    await expect(projectRow).toContainText(t.status["Completed"]);

    await projectsPage.filterByStatus("Completed");
    await expect(projectsPage.getRow(projectName)).toBeVisible();

    // -------------------------------------------------------------
    // PHASE 6: Search & Targeted Lookup
    // -------------------------------------------------------------
    await projectsPage.filterByStatus("All");
    await projectsPage.search(projectName);
    await expect(projectRow).toBeVisible();

    // -------------------------------------------------------------
    // PHASE 7: Decommissioning & Cleanup
    // -------------------------------------------------------------
    await projectsPage.deleteProject(projectName);
    await expect(page.getByText(projectName)).not.toBeVisible();

    await personsPage.goto();
    await personsPage.search(personName);
    await personsPage.deletePerson(personName);
    await personsPage.search(directPersonName);
    await personsPage.deletePerson(directPersonName);

    await teamsPage.goto();
    await teamsPage.search(teamName);
    await teamsPage.deleteTeam(teamName);
  });

  test("team staffing lifecycle: forms team, adds members, verifies detail roster, and cleans up", async ({ page, teamsPage, personsPage }) => {
    const timestamp = Date.now();
    const teamName = `Alpha Tactical Team ${timestamp}`;
    const leadName = `Captain Miller ${timestamp}`;
    const devName = `Engineer Davis ${timestamp}`;

    // 1. Create team
    await teamsPage.goto();
    await teamsPage.createTeam({
      name: teamName,
      description: "Tactical software response team",
    });

    // 2. Add two members to team
    await personsPage.goto();
    await personsPage.createPerson({
      name: leadName,
      email: `miller.${timestamp}@mil.cz`,
      role: "Team Lead",
      teamLabel: teamName,
    });

    await personsPage.createPerson({
      name: devName,
      email: `davis.${timestamp}@mil.cz`,
      role: "Systems Specialist",
      teamLabel: teamName,
    });

    // 3. Verify in Teams page detail modal
    await teamsPage.goto();
    await teamsPage.search(teamName);
    const teamRow = teamsPage.getRow(teamName);
    await expect(teamRow).toBeVisible();
    await expect(teamRow).toContainText("2"); // 2 members count

    await teamsPage.openDetails(teamName);
    const detailDialog = page.locator("[role='dialog']");
    await expect(detailDialog).toContainText(teamName);
    await expect(detailDialog).toContainText(leadName);
    await expect(detailDialog).toContainText(devName);
    await teamsPage.closeDetails();

    // 4. Cleanup
    await personsPage.goto();
    await personsPage.search(leadName);
    await personsPage.deletePerson(leadName);
    await personsPage.search(devName);
    await personsPage.deletePerson(devName);

    await teamsPage.goto();
    await teamsPage.search(teamName);
    await teamsPage.deleteTeam(teamName);
  });

  test("cross-entity assignment lifecycle: adds and removes teams and persons from project, verifies presence/absence across team and project", async ({
    page,
    projectsPage,
    teamsPage,
    personsPage,
  }) => {
    const timestamp = Date.now();
    const teamName = `Strike Group ${timestamp}`;
    const teamPersonName = `Officer Ray ${timestamp}`;
    const directPersonName = `Specialist Cole ${timestamp}`;
    const projectName = `Joint Task Force ${timestamp}`;

    // 1. Setup: Create Team and 2 Persons (one in team, one unassigned)
    await teamsPage.goto();
    await teamsPage.createTeam({
      name: teamName,
      description: "Air Defense and Rapid Strike Support",
    });

    await personsPage.goto();
    await personsPage.createPerson({
      name: teamPersonName,
      email: `ray.${timestamp}@airforce.gov`,
      role: "Flight Controller",
      teamLabel: teamName,
    });

    await personsPage.createPerson({
      name: directPersonName,
      email: `cole.${timestamp}@defense.gov`,
      role: "Signal Intelligence",
    });

    // 2. Setup: Create Project
    await projectsPage.goto();
    await projectsPage.createProject({
      name: projectName,
      status: "Planned",
    });

    // Open project details
    await projectsPage.openDetails(projectName);

    // 3. Assign Team to Project -> teamPersonName becomes participant via team
    await projectsPage.assignTeam(teamName);
    await expect(projectsPage.getAssignedTeamRow(teamName)).toBeVisible();
    const teamMemberRow = projectsPage.getParticipantRow(teamPersonName);
    await expect(teamMemberRow).toBeVisible();
    await expect(teamMemberRow).toContainText(format(t.projects.assignmentTeam, { team: teamName }));
    // directPersonName is not yet in project
    await expect(projectsPage.getParticipantRow(directPersonName)).not.toBeVisible();

    // 4. Assign directPersonName directly to Project
    await projectsPage.assignPerson(directPersonName);
    const directMemberRow = projectsPage.getParticipantRow(directPersonName);
    await expect(directMemberRow).toBeVisible();
    await expect(directMemberRow).toContainText(t.projects.assignmentDirect);

    // 5. Remove Team from Project
    // -> teamPersonName should disappear from Project
    // -> directPersonName must REMAIN in Project
    await projectsPage.removeTeam(teamName);
    await expect(projectsPage.getAssignedTeamRow(teamName)).not.toBeVisible();
    await expect(teamMemberRow).not.toBeVisible();
    await expect(directMemberRow).toBeVisible();

    // 6. Verify teamPersonName is STILL in the team!
    await projectsPage.closeDetails();
    await teamsPage.goto();
    await teamsPage.search(teamName);
    await teamsPage.openDetails(teamName);
    const teamDetailDialog = page.locator("[role='dialog']");
    await expect(teamDetailDialog).toContainText(teamPersonName);
    await teamsPage.closeDetails();

    // 7. Re-assign Team to Project + Dual-assign teamPersonName directly
    await projectsPage.goto();
    await projectsPage.openDetails(projectName);
    await projectsPage.assignTeam(teamName);
    await expect(teamMemberRow).toBeVisible();
    await expect(teamMemberRow).toContainText(format(t.projects.assignmentTeam, { team: teamName }));

    // Assign team member directly too
    await projectsPage.assignPerson(teamPersonName);
    await expect(teamMemberRow).toContainText(t.projects.assignmentBoth);

    // 8. Remove Team from Project while person has dual assignment
    // -> teamPersonName should REMAIN in project, transitioning from "Direct & Team" to "Direct"!
    await projectsPage.removeTeam(teamName);
    await expect(projectsPage.getAssignedTeamRow(teamName)).not.toBeVisible();
    await expect(teamMemberRow).toBeVisible();
    await expect(teamMemberRow).toContainText(t.projects.assignmentDirect);

    // 9. Remove teamPersonName directly from Project
    // -> now teamPersonName is completely gone from Project
    await projectsPage.removePerson(teamPersonName);
    await expect(teamMemberRow).not.toBeVisible();

    // 10. Re-assign Team to Project, then remove teamPersonName from Team on Persons page
    // -> Verify teamPersonName is automatically removed from Project participants
    await projectsPage.assignTeam(teamName);
    await expect(teamMemberRow).toBeVisible();
    await projectsPage.closeDetails();

    // Go to Persons page and remove teamPersonName from team
    await personsPage.goto();
    await personsPage.search(teamPersonName);
    await personsPage.editPerson(teamPersonName, { clearTeam: true });

    // Re-check Project: teamPersonName should no longer be in project because they left the team
    await projectsPage.goto();
    await projectsPage.search(projectName);
    await projectsPage.openDetails(projectName);
    await expect(projectsPage.getAssignedTeamRow(teamName)).toBeVisible();
    await expect(projectsPage.getParticipantRow(teamPersonName)).not.toBeVisible();
    // directPersonName is still in project
    await expect(projectsPage.getParticipantRow(directPersonName)).toBeVisible();

    // 11. Remove directPersonName directly from project
    await projectsPage.removePerson(directPersonName);
    await expect(projectsPage.getParticipantRow(directPersonName)).not.toBeVisible();
    await projectsPage.closeDetails();

    // 12. Cleanup
    await projectsPage.deleteProject(projectName);
    await personsPage.goto();
    await personsPage.search(teamPersonName);
    await personsPage.deletePerson(teamPersonName);
    await personsPage.search(directPersonName);
    await personsPage.deletePerson(directPersonName);
    await teamsPage.goto();
    await teamsPage.search(teamName);
    await teamsPage.deleteTeam(teamName);
  });
});
