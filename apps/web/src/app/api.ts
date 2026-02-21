import type {
  AiDemoRunRequest,
  AiDemoRunResponse,
  AiRunListItem,
  AuditLogItem,
  DashboardSummary,
  HealthResponse,
  PromptVersionSummary
} from "@ai-ops-studio/shared";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  tagTypes: ["AiRuns", "AuditLogs", "DashboardSummary"],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => "/health"
    }),
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => "/dashboard/summary",
      providesTags: ["DashboardSummary"]
    }),
    getAiRuns: builder.query<AiRunListItem[], void>({
      query: () => "/ai/runs",
      providesTags: ["AiRuns"]
    }),
    getPromptVersions: builder.query<PromptVersionSummary[], void>({
      query: () => "/ai/prompts"
    }),
    getAuditLogs: builder.query<AuditLogItem[], void>({
      query: () => "/audit-logs",
      providesTags: ["AuditLogs"]
    }),
    runDemoAiWorkflow: builder.mutation<AiDemoRunResponse, AiDemoRunRequest>({
      query: (body) => ({
        url: "/ai/demo-runs",
        method: "POST",
        body
      }),
      invalidatesTags: ["AiRuns", "AuditLogs", "DashboardSummary"]
    })
  })
});

export const {
  useGetAiRunsQuery,
  useGetAuditLogsQuery,
  useGetDashboardSummaryQuery,
  useGetHealthQuery,
  useGetPromptVersionsQuery,
  useRunDemoAiWorkflowMutation
} = api;
