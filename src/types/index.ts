/**
 * Unified application types derived directly from the OpenAPI schema (api-schema.ts).
 */

import type { components, paths } from "./api-schema";

export type { paths };
export type Schemas = components["schemas"];

// Domain Entity Models exported from OpenAPI
export type ProjectStatus = Schemas["ProjectStatus"];
export type FilterStatus = ProjectStatus | "All";
export type TeamSimple = Schemas["TeamSimple"];
export type PersonSimple = Schemas["PersonSimple"];
export type ProjectSimple = Schemas["ProjectSimple"];
export type Participant = Schemas["Participant"];
export type ProjectDetail = Schemas["ProjectDetail"];
export type PersonDetail = Schemas["PersonDetail"];
export type TeamDetail = Schemas["TeamDetail"];

// System & Health Status
export type HealthStatus = Schemas["HealthStatus"];

// Form / Mutation Inputs
export type ProjectInput = Schemas["ProjectInput"];
export type PersonInput = Schemas["PersonInput"];
export type TeamInput = Schemas["TeamInput"];
export type ApiErrorResponse = Schemas["ApiErrorResponse"];

// Generic API response envelope wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
  errors?: Record<string, string>;
}
