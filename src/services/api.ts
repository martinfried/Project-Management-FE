import createClient from "openapi-fetch";
import type {
  paths,
  ApiResponse,
  HealthStatus,
  PersonDetail,
  PersonSimple,
  ProjectDetail,
  ProjectSimple,
  TeamDetail,
  TeamSimple,
  ProjectInput,
  PersonInput,
  TeamInput,
  FilterStatus,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, "");

/**
 * Fully typed OpenAPI fetch client.
 */
export const apiClient = createClient<paths>({
  baseUrl: SERVER_BASE,
});

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || (data?.errors ? Object.values(data.errors).join(", ") : `Server error: ${response.statusText}`);
    throw new Error(errorMessage);
  }

  return data as T;
}

/**
 * Convenient typed API helpers mapped to the backend endpoints.
 */
export const api = {
  // Underlying openapi-fetch client for direct access
  client: apiClient,

  // Health & DB init
  getHealth: () => request<HealthStatus>("/health"),
  initDatabase: () =>
    request<{ success: boolean; message: string }>("/database/init", {
      method: "POST",
    }),

  // Projects
  getProjects: (search?: string, status?: FilterStatus) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status && status !== "All") params.append("status", status);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return request<ApiResponse<ProjectSimple[]>>(`/projects${queryString}`);
  },
  getProject: (id: number) => request<ApiResponse<ProjectDetail>>(`/projects/${id}`),
  createProject: (data: ProjectInput) =>
    request<ApiResponse<ProjectDetail>>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id: number, data: Partial<ProjectInput>) =>
    request<ApiResponse<ProjectDetail>>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: number) =>
    request<ApiResponse<null>>(`/projects/${id}`, {
      method: "DELETE",
    }),
  assignPersonToProject: (projectId: number, personId: number) => request<ApiResponse<ProjectDetail>>(`/projects/${projectId}/persons/${personId}`, { method: "POST" }),
  removePersonFromProject: (projectId: number, personId: number) => request<ApiResponse<ProjectDetail>>(`/projects/${projectId}/persons/${personId}`, { method: "DELETE" }),
  assignTeamToProject: (projectId: number, teamId: number) => request<ApiResponse<ProjectDetail>>(`/projects/${projectId}/teams/${teamId}`, { method: "POST" }),
  removeTeamFromProject: (projectId: number, teamId: number) => request<ApiResponse<ProjectDetail>>(`/projects/${projectId}/teams/${teamId}`, { method: "DELETE" }),

  // Persons
  getPersons: (search?: string, role?: string, teamId?: number) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (role) params.append("role", role);
    if (teamId) params.append("teamId", teamId.toString());
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return request<ApiResponse<PersonSimple[]>>(`/persons${queryString}`);
  },
  getPerson: (id: number) => request<ApiResponse<PersonDetail>>(`/persons/${id}`),
  createPerson: (data: PersonInput) =>
    request<ApiResponse<PersonDetail>>("/persons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePerson: (id: number, data: Partial<PersonInput>) =>
    request<ApiResponse<PersonDetail>>(`/persons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePerson: (id: number) =>
    request<ApiResponse<null>>(`/persons/${id}`, {
      method: "DELETE",
    }),

  // Teams
  getTeams: (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return request<ApiResponse<TeamSimple[]>>(`/teams${queryString}`);
  },
  getTeam: (id: number) => request<ApiResponse<TeamDetail>>(`/teams/${id}`),
  createTeam: (data: TeamInput) =>
    request<ApiResponse<TeamDetail>>("/teams", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTeam: (id: number, data: Partial<TeamInput>) =>
    request<ApiResponse<TeamDetail>>(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTeam: (id: number) =>
    request<ApiResponse<null>>(`/teams/${id}`, {
      method: "DELETE",
    }),
};
