import type {
  AiDemoRunRequest,
  AiDemoRunResponse,
  AiRunListItem,
  AskRagQuestionRequest,
  AskRagQuestionResponse,
  AuditLogItem,
  CreateRagDocumentRequest,
  DashboardSummary,
  HealthResponse,
  PromptVersionSummary,
  AnalyzeRequirementProjectResponse,
  CreateRequirementProjectRequest,
  GenerateRequirementArtifactsResponse,
  MarkdownExportResponse,
  OpsDashboardResponse,
  OpsRecommendation,
  RagDocumentDetail,
  RagDocumentSummary,
  RequirementProjectDetail,
  RequirementProjectListItem
} from "@ai-ops-studio/shared";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  tagTypes: [
    "AiRuns",
    "AuditLogs",
    "DashboardSummary",
    "RequirementProjects",
    "OpsDashboard",
    "RagDocuments"
  ],
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
    }),
    getOpsDashboard: builder.query<OpsDashboardResponse, void>({
      query: () => "/ops/dashboard",
      providesTags: ["OpsDashboard"]
    }),
    recommendTechnician: builder.mutation<OpsRecommendation, string>({
      query: (jobId) => ({
        url: `/ops/jobs/${jobId}/recommend`,
        method: "POST"
      }),
      invalidatesTags: ["OpsDashboard", "AiRuns", "AuditLogs", "DashboardSummary"]
    }),
    approveRecommendation: builder.mutation<OpsRecommendation, string>({
      query: (recommendationId) => ({
        url: `/ops/recommendations/${recommendationId}/approve`,
        method: "POST"
      }),
      invalidatesTags: ["OpsDashboard", "AuditLogs", "DashboardSummary"]
    }),
    rejectRecommendation: builder.mutation<OpsRecommendation, string>({
      query: (recommendationId) => ({
        url: `/ops/recommendations/${recommendationId}/reject`,
        method: "POST"
      }),
      invalidatesTags: ["OpsDashboard", "AuditLogs", "DashboardSummary"]
    }),
    getRagDocuments: builder.query<RagDocumentSummary[], void>({
      query: () => "/rag/documents",
      providesTags: ["RagDocuments"]
    }),
    getRagDocument: builder.query<RagDocumentDetail, string>({
      query: (documentId) => `/rag/documents/${documentId}`,
      providesTags: (_result, _error, documentId) => [
        "RagDocuments",
        { type: "RagDocuments", id: documentId }
      ]
    }),
    createRagDocument: builder.mutation<RagDocumentDetail, CreateRagDocumentRequest>({
      query: (body) => ({
        url: "/rag/documents",
        method: "POST",
        body
      }),
      invalidatesTags: ["RagDocuments", "AuditLogs", "DashboardSummary"]
    }),
    askRagQuestion: builder.mutation<AskRagQuestionResponse, AskRagQuestionRequest>({
      query: (body) => ({
        url: "/rag/ask",
        method: "POST",
        body
      }),
      invalidatesTags: (_result, _error, body) => [
        "RagDocuments",
        { type: "RagDocuments", id: body.documentId },
        "AiRuns",
        "AuditLogs",
        "DashboardSummary"
      ]
    })
  })
});

export const {
  useAnalyzeRequirementProjectMutation,
  useAskRagQuestionMutation,
  useApproveRecommendationMutation,
  useCreateRequirementProjectMutation,
  useCreateRagDocumentMutation,
  useExportRequirementProposalMarkdownQuery,
  useLazyExportRequirementProposalMarkdownQuery,
  useGenerateRequirementArtifactsMutation,
  useGetAiRunsQuery,
  useGetAuditLogsQuery,
  useGetDashboardSummaryQuery,
  useGetHealthQuery,
  useGetOpsDashboardQuery,
  useGetRagDocumentQuery,
  useGetRagDocumentsQuery,
  useGetRequirementProjectQuery,
  useGetRequirementProjectsQuery,
  useGetPromptVersionsQuery,
  useRecommendTechnicianMutation,
  useRejectRecommendationMutation,
  useRunDemoAiWorkflowMutation
} = api;
