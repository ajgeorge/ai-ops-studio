import type {
  AiDemoRunRequest,
  AiDemoRunResponse,
  AiRunListItem,
  AuditLogItem,
  DashboardSummary,
  HealthResponse,
  PromptVersionSummary,
  AnalyzeRequirementProjectResponse,
  CreateRequirementProjectRequest,
  GenerateRequirementArtifactsResponse,
  MarkdownExportResponse,
  RequirementProjectDetail,
  RequirementProjectListItem
} from "@ai-ops-studio/shared";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  tagTypes: ["AiRuns", "AuditLogs", "DashboardSummary", "RequirementProjects"],
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
    }),
    getRequirementProjects: builder.query<RequirementProjectListItem[], void>({
      query: () => "/requirements/projects",
      providesTags: ["RequirementProjects"]
    }),
    getRequirementProject: builder.query<RequirementProjectDetail, string>({
      query: (projectId) => `/requirements/projects/${projectId}`,
      providesTags: (_result, _error, projectId) => [
        "RequirementProjects",
        { type: "RequirementProjects", id: projectId }
      ]
    }),
    createRequirementProject: builder.mutation<
      RequirementProjectDetail,
      CreateRequirementProjectRequest
    >({
      query: (body) => ({
        url: "/requirements/projects",
        method: "POST",
        body
      }),
      invalidatesTags: ["RequirementProjects", "AuditLogs", "DashboardSummary"]
    }),
    analyzeRequirementProject: builder.mutation<AnalyzeRequirementProjectResponse, string>({
      query: (projectId) => ({
        url: `/requirements/projects/${projectId}/analyze`,
        method: "POST"
      }),
      invalidatesTags: (_result, _error, projectId) => [
        "RequirementProjects",
        { type: "RequirementProjects", id: projectId },
        "AiRuns",
        "AuditLogs",
        "DashboardSummary"
      ]
    }),
    generateRequirementArtifacts: builder.mutation<GenerateRequirementArtifactsResponse, string>({
      query: (projectId) => ({
        url: `/requirements/projects/${projectId}/generate-artifacts`,
        method: "POST"
      }),
      invalidatesTags: (_result, _error, projectId) => [
        "RequirementProjects",
        { type: "RequirementProjects", id: projectId },
        "AuditLogs",
        "DashboardSummary"
      ]
    }),
    exportRequirementProposalMarkdown: builder.query<MarkdownExportResponse, string>({
      query: (projectId) => `/requirements/projects/${projectId}/export/markdown`
    })
  })
});

export const {
  useAnalyzeRequirementProjectMutation,
  useCreateRequirementProjectMutation,
  useExportRequirementProposalMarkdownQuery,
  useLazyExportRequirementProposalMarkdownQuery,
  useGenerateRequirementArtifactsMutation,
  useGetAiRunsQuery,
  useGetAuditLogsQuery,
  useGetDashboardSummaryQuery,
  useGetHealthQuery,
  useGetRequirementProjectQuery,
  useGetRequirementProjectsQuery,
  useGetPromptVersionsQuery,
  useRunDemoAiWorkflowMutation
} = api;
